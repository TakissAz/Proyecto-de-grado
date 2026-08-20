<?php

namespace Tests\Feature\Paciente;

use App\Models\ComidaPlanAlimentario;
use App\Models\ComponenteComidaPlan;
use App\Models\DiaPlanAlimentario;
use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Models\Receta;
use App\Models\Role;
use App\Models\SeguimientoComida;
use App\Models\User;
use App\Models\UserRole;
use App\Services\Paciente\SeguimientoComidaPacienteService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SeguimientoComidaPacienteTest extends TestCase
{
    use RefreshDatabase;

    public function test_paciente_registra_y_actualiza_seguimiento_completo(): void
    {
        [$user,,,$comida]=$this->escenario();
        $this->actingAs($user)->postJson(route('paciente.comidas.seguimiento.guardar',$comida),$this->datos())->assertOk();
        $this->assertDatabaseHas('seguimientos_comidas',['id_comida_plan_alimentario'=>$comida->getKey(),'estado_cumplimiento'=>'completada','nivel_agrado'=>'me_gusto']);
        $this->actingAs($user)->postJson(route('paciente.comidas.seguimiento.guardar',$comida),$this->datos(['estado_cumplimiento'=>'parcial','porcentaje_consumido'=>60]))->assertOk();
        $this->assertDatabaseCount('seguimientos_comidas',1); $this->assertSame(60,SeguimientoComida::first()->porcentaje_consumido);
    }

    public function test_no_puede_registrar_comida_de_otro_paciente(): void
    {
        [$user]=$this->escenario(); [,,$planOtro,$comidaOtro]=$this->escenario();
        $this->actingAs($user)->postJson(route('paciente.comidas.seguimiento.guardar',$comidaOtro),$this->datos())->assertForbidden();
    }

    public function test_no_puede_registrar_en_plan_no_publicado(): void
    {
        foreach(['sugerido','rechazado','en_revision','finalizado'] as $estado){[$user,,$plan,$comida]=$this->escenario($estado);$this->actingAs($user)->postJson(route('paciente.comidas.seguimiento.guardar',$comida),$this->datos())->assertForbidden();}
    }

    public function test_usuario_sin_rol_y_anonimo_no_acceden(): void
    {
        [,,,$comida]=$this->escenario();
        $this->actingAs($this->usuarioConRol('nutricionista'))->postJson(route('paciente.comidas.seguimiento.guardar',$comida),$this->datos())->assertForbidden();
        auth()->logout(); $this->post(route('paciente.comidas.seguimiento.guardar',$comida),$this->datos())->assertRedirect(route('login'));
    }

    public function test_validacion_rechaza_estado_y_porcentaje_invalidos(): void
    {
        [$user,,,$comida]=$this->escenario();
        $this->actingAs($user)->postJson(route('paciente.comidas.seguimiento.guardar',$comida),$this->datos(['estado_cumplimiento'=>'inventado']))->assertUnprocessable()->assertJsonValidationErrors('estado_cumplimiento');
        $this->postJson(route('paciente.comidas.seguimiento.guardar',$comida),$this->datos(['estado_cumplimiento'=>'parcial','porcentaje_consumido'=>101]))->assertUnprocessable()->assertJsonValidationErrors('porcentaje_consumido');
    }

    public function test_dashboard_muestra_seguimiento_y_calcula_adherencia_parcial(): void
    {
        [$user,$paciente,$plan,$comida]=$this->escenario();
        $this->actingAs($user)->postJson(route('paciente.comidas.seguimiento.guardar',$comida),$this->datos(['estado_cumplimiento'=>'parcial','porcentaje_consumido'=>50]));
        $this->get(route('paciente.dashboard'))->assertInertia(fn(Assert $p)=>$p
            ->where('planAlimentario.dias.0.comidas.0.seguimiento.estado_cumplimiento','parcial')
            ->where('resumenAdherencia.porcentaje_adherencia',50));
    }

    public function test_indicadores_detectan_aceptacion_molestias_e_ingredientes(): void
    {
        [$user,$paciente,$plan,$comida]=$this->escenario();
        $this->actingAs($user)->postJson(route('paciente.comidas.seguimiento.guardar',$comida),$this->datos());
        $service=app(SeguimientoComidaPacienteService::class);$plan->load('dias.comidas');
        $bien=$service->calcularIndicadoresParaSiguientePlan($plan,$paciente);
        $this->assertContains('Avena saludable',$bien['recetas_bien_aceptadas']);
        $this->actingAs($user)->postJson(route('paciente.comidas.seguimiento.guardar',$comida),$this->datos(['presento_molestia'=>true,'tipo_molestia'=>'hinchazon','intensidad_molestia'=>'moderada','consiguio_ingredientes'=>false,'motivo_no_cumplimiento'=>'no_tenia_ingredientes']));
        $indicadores=$service->calcularIndicadoresParaSiguientePlan($plan,$paciente);
        $this->assertContains('Avena saludable',$indicadores['recetas_a_evitar']);
        $this->assertContains('Avena saludable',$indicadores['alimentos_o_preparaciones_problematicas']);
        $this->assertContains('Revisar disponibilidad de ingredientes para el siguiente plan.',$indicadores['recomendaciones_para_nutricionista']);
    }

    private function escenario(string $estado='aprobado'): array
    {
        $user=$this->usuarioConRol('paciente');$paciente=Paciente::query()->create(['user_id'=>$user->getKey(),'nombres'=>'Paciente','apellido_paterno'=>'Seguimiento','ci'=>fake()->unique()->numerify('########'),'fecha_nacimiento'=>'1995-01-01','sexo'=>'femenino','estado'=>'activo']);
        $plan=PlanAlimentario::query()->create(['id_paciente'=>$paciente->getKey(),'nombre'=>'Plan','estado_plan'=>$estado,'fecha_inicio'=>'2026-08-18','fecha_fin'=>'2026-08-24','duracion_dias'=>1,'estado'=>'activo']);
        $dia=DiaPlanAlimentario::query()->create(['id_plan_alimentario'=>$plan->getKey(),'numero_dia'=>1,'nombre_dia'=>'Lunes','fecha'=>'2026-08-18','estado'=>'activo']);
        $comida=ComidaPlanAlimentario::query()->create(['id_dia_plan_alimentario'=>$dia->getKey(),'tipo_comida'=>'desayuno','nombre_comida'=>'Desayuno','hora_sugerida'=>'08:00','orden'=>1,'estado'=>'activo']);
        $receta=Receta::query()->create(['nombre'=>'Avena saludable','tipo_comida'=>'desayuno','porciones'=>1,'estado'=>'activo']);
        ComponenteComidaPlan::query()->create(['id_comida_plan_alimentario'=>$comida->getKey(),'tipo_componente'=>'receta','id_receta'=>$receta->getKey(),'cantidad'=>1,'unidad'=>'porción','orden'=>1,'estado'=>'activo']);
        return [$user,$paciente,$plan,$comida];
    }
    private function datos(array $extra=[]):array{return array_merge(['estado_cumplimiento'=>'completada','porcentaje_consumido'=>100,'nivel_agrado'=>'me_gusto','desea_repetir'=>true,'nivel_saciedad'=>'alta','nivel_hambre_posterior'=>'baja','ansiedad_posterior'=>false,'presento_molestia'=>false,'tipo_molestia'=>null,'intensidad_molestia'=>null,'dificultad_preparacion'=>'facil','consiguio_ingredientes'=>true,'motivo_no_cumplimiento'=>null,'comentario_paciente'=>'Bien','sugerencia_paciente'=>'Repetir'], $extra);}
    private function usuarioConRol(string $nombre):User{$rol=Role::query()->firstOrCreate(['nombre'=>$nombre],['descripcion'=>ucfirst($nombre),'estado'=>'activo']);$user=User::factory()->create(['estado'=>'activo','email_verified_at'=>now()]);UserRole::query()->create(['user_id'=>$user->getKey(),'id_rol'=>$rol->getKey(),'estado'=>'activo']);return $user;}
}
