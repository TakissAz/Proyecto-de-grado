<?php

namespace Tests\Feature\Nutricion;

use App\Models\ComidaPlanAlimentario;
use App\Models\DiaPlanAlimentario;
use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Models\RetroalimentacionPaciente;
use App\Models\SeguimientoComida;
use App\Models\SeguimientoSintomaPaciente;
use App\Models\User;
use App\Services\Nutricion\AlertasNutricionistaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AlertasNutricionistaServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_tolera_paciente_sin_plan_ni_seguimientos(): void
    {
        $resultado = $this->servicio()->generarParaPaciente($this->paciente());
        $this->assertSame(0, $resultado['resumen']['total']);
        $this->assertSame([], $resultado['alertas']);
    }

    public function test_genera_alertas_de_adherencia_tipo_y_falta_de_registros(): void
    {
        [$paciente] = $this->escenario();
        $codigos = $this->codigos($paciente);
        $this->assertContains('adherencia_baja', $codigos);
        $this->assertContains('adherencia_baja_desayuno', $codigos);
        $this->assertContains('sin_registros_recientes', $codigos);
    }

    public function test_genera_alertas_de_hambre_ansiedad_molestias_ingredientes_y_recetas(): void
    {
        [$paciente, $plan, $comidas] = $this->escenario();
        foreach (array_slice($comidas, 0, 2) as $comida) $this->seguimiento($paciente, $plan, $comida, [
            'nivel_hambre_posterior' => 'alta', 'ansiedad_posterior' => true,
            'presento_molestia' => true, 'intensidad_molestia' => 'severa',
            'consiguio_ingredientes' => false, 'motivo_no_cumplimiento' => 'no_tenia_ingredientes',
            'nivel_agrado' => 'no_me_gusto', 'desea_repetir' => false,
        ]);
        $codigos = $this->codigos($paciente);
        foreach (['hambre_posterior_alta','ansiedad_posterior_frecuente','molestias_digestivas_frecuentes','ingredientes_no_conseguidos','recetas_rechazadas'] as $codigo) $this->assertContains($codigo, $codigos);
    }

    public function test_genera_alertas_por_sintomas_frecuentes(): void
    {
        $paciente = $this->paciente(); $usuario = User::factory()->create();
        foreach (range(1, 3) as $dia) SeguimientoSintomaPaciente::query()->create(['id_paciente'=>$paciente->getKey(),'fecha_registro'=>today()->subDays($dia),'hambre_nocturna'=>true,'ansiedad_por_comida'=>'alta','registrado_por'=>$usuario->getKey()]);
        $codigos = $this->codigos($paciente);
        $this->assertContains('hambre_nocturna_frecuente', $codigos);
        $this->assertContains('ansiedad_comida_frecuente', $codigos);
    }

    public function test_genera_alertas_de_comunicacion_y_plan_pendiente(): void
    {
        $paciente = $this->paciente();
        PlanAlimentario::query()->create(['id_paciente'=>$paciente->getKey(),'nombre'=>'Nuevo plan','estado_plan'=>'sugerido','estado'=>'activo']);
        RetroalimentacionPaciente::query()->create(['id_paciente'=>$paciente->getKey(),'id_usuario_emisor'=>User::factory()->create()->getKey(),'rol_emisor'=>'nutricionista','tipo_retroalimentacion'=>'general','mensaje'=>'Revisar','prioridad'=>'media','visible_para_paciente'=>true,'leido_por_paciente'=>false,'estado'=>'activo']);
        $codigos = $this->codigos($paciente);
        $this->assertContains('retroalimentaciones_no_leidas', $codigos);
        $this->assertContains('plan_pendiente_revision', $codigos);
    }

    public function test_no_genera_codigos_duplicados_y_calcula_resumen(): void
    {
        [$paciente] = $this->escenario(); $resultado = $this->servicio()->generarParaPaciente($paciente); $codigos = collect($resultado['alertas'])->pluck('codigo');
        $this->assertSame($codigos->unique()->count(), $codigos->count());
        $this->assertSame($codigos->count(), $resultado['resumen']['total']);
        $this->assertTrue($resultado['resumen']['tiene_alertas_criticas']);
    }

    private function escenario(): array
    {
        $paciente=$this->paciente(); $plan=PlanAlimentario::query()->create(['id_paciente'=>$paciente->getKey(),'nombre'=>'Plan activo','estado_plan'=>'activo','fecha_inicio'=>today(),'duracion_dias'=>1,'estado'=>'activo']);
        $dia=DiaPlanAlimentario::query()->create(['id_plan_alimentario'=>$plan->getKey(),'numero_dia'=>1,'nombre_dia'=>'Lunes','fecha'=>today(),'estado'=>'activo']);
        $comidas=[]; foreach(['desayuno','almuerzo','merienda','cena'] as $i=>$tipo) $comidas[]=ComidaPlanAlimentario::query()->create(['id_dia_plan_alimentario'=>$dia->getKey(),'tipo_comida'=>$tipo,'nombre_comida'=>ucfirst($tipo),'orden'=>$i+1,'estado'=>'activo']);
        return [$paciente,$plan,$comidas];
    }

    private function seguimiento(Paciente $paciente, PlanAlimentario $plan, ComidaPlanAlimentario $comida, array $extra): void
    {
        SeguimientoComida::query()->create(array_merge(['id_paciente'=>$paciente->getKey(),'id_plan_alimentario'=>$plan->getKey(),'id_dia_plan_alimentario'=>$comida->id_dia_plan_alimentario,'id_comida_plan_alimentario'=>$comida->getKey(),'fecha_seguimiento'=>today(),'estado_cumplimiento'=>'no_realizada'], $extra));
    }

    private function paciente(): Paciente { $u=User::factory()->create(); return Paciente::query()->create(['user_id'=>$u->getKey(),'nombres'=>'Paciente','apellido_paterno'=>'Alertas','ci'=>fake()->unique()->numerify('########'),'fecha_nacimiento'=>'1995-01-01','sexo'=>'femenino','estado'=>'activo']); }
    private function codigos(Paciente $paciente): array { return collect($this->servicio()->generarParaPaciente($paciente)['alertas'])->pluck('codigo')->all(); }
    private function servicio(): AlertasNutricionistaService { return app(AlertasNutricionistaService::class); }
}
