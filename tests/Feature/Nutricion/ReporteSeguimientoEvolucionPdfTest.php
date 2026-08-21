<?php

namespace Tests\Feature\Nutricion;

use App\Models\Paciente;
use App\Models\RetroalimentacionPaciente;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use App\Services\Nutricion\AnaliticaEvolucionPacienteService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReporteSeguimientoEvolucionPdfTest extends TestCase
{
    use RefreshDatabase;

    public function test_nutricionista_puede_descargar_reporte_pdf(): void
    {
        [$nutricionista, $paciente] = $this->escenario();

        $response = $this->actingAs($nutricionista)->get($this->url($paciente));

        $response->assertOk()->assertHeader('content-type', 'application/pdf');
        $this->assertStringStartsWith('%PDF', $response->getContent());
        $this->assertStringContainsString('inline; filename=reporte-seguimiento-evolucion-paciente-', $response->headers->get('content-disposition'));
    }

    public function test_usuario_no_autenticado_es_redirigido(): void
    {
        [, $paciente] = $this->escenario();

        $this->get($this->url($paciente))->assertRedirect(route('login'));
    }

    public function test_usuario_sin_rol_nutricionista_recibe_403(): void
    {
        [, $paciente] = $this->escenario();

        $this->actingAs($this->usuarioConRol('endocrinologo'))->get($this->url($paciente))->assertForbidden();
    }

    public function test_pdf_no_falla_sin_evaluaciones_planes_seguimientos_sintomas_ni_retroalimentaciones(): void
    {
        [$nutricionista, $paciente] = $this->escenario();

        $this->actingAs($nutricionista)->get($this->url($paciente))->assertOk();
    }

    public function test_vista_contiene_titulo_paciente_y_todas_las_secciones_requeridas(): void
    {
        [$nutricionista, $paciente] = $this->escenario();
        $analitica = app(AnaliticaEvolucionPacienteService::class)->obtenerAnalitica($paciente);
        $html = view('pdf.nutricion.reporte-seguimiento-evolucion', [
            'paciente' => $paciente, 'profesional' => $nutricionista, 'fechaGeneracion' => now(),
            'analitica' => $analitica, 'retroalimentaciones' => collect(), 'planActual' => null,
        ])->render();

        foreach (['Reporte de seguimiento y evolución nutricional', 'Paciente Reporte', 'Resumen ejecutivo',
            'Evolución antropométrica', 'Adherencia por plan', 'Cumplimiento por tipo de comida',
            'Seguimiento de síntomas PMOS / RI', 'Recetas aceptadas', 'Recetas problemáticas o a revisar',
            'Problemas prácticos detectados', 'Retroalimentaciones recientes', 'Alertas automáticas',
            'Recomendaciones para el siguiente plan', 'Conclusión de seguimiento'] as $texto) {
            $this->assertStringContainsString($texto, $html);
        }
    }

    public function test_vista_incluye_retroalimentacion_activa_reciente(): void
    {
        [$nutricionista, $paciente] = $this->escenario();
        $retroalimentacion = RetroalimentacionPaciente::query()->create([
            'id_paciente' => $paciente->getKey(), 'id_usuario_emisor' => $nutricionista->getKey(),
            'rol_emisor' => 'nutricionista', 'tipo_retroalimentacion' => 'ajuste_plan',
            'prioridad' => 'alta', 'mensaje' => 'Reforzar saciedad en la merienda.',
            'visible_para_paciente' => true, 'leido_por_paciente' => false, 'estado' => 'activo',
        ]);
        $html = view('pdf.nutricion.reporte-seguimiento-evolucion', [
            'paciente' => $paciente, 'profesional' => $nutricionista, 'fechaGeneracion' => now(),
            'analitica' => app(AnaliticaEvolucionPacienteService::class)->obtenerAnalitica($paciente),
            'retroalimentaciones' => collect([$retroalimentacion]), 'planActual' => null,
        ])->render();

        $this->assertStringContainsString('Reforzar saciedad en la merienda.', $html);
        $this->assertStringContainsString('ajuste plan', $html);
    }

    public function test_vista_imprime_evolucion_adherencia_sintomas_y_recetas_si_existen(): void
    {
        [$nutricionista, $paciente] = $this->escenario();
        $analitica = app(AnaliticaEvolucionPacienteService::class)->obtenerAnalitica($paciente);
        $analitica['evolucion_antropometrica'] = ['registros' => [['fecha'=>'2026-08-20','peso'=>72.5,'imc'=>27.4,'cintura'=>88,'cadera'=>102,'icc'=>.86,'grasa_corporal'=>31,'masa_muscular'=>28]], 'resumen' => ['total_evaluaciones'=>1,'peso_inicial'=>72.5,'peso_actual'=>72.5,'cambio_peso'=>0,'imc_inicial'=>27.4,'imc_actual'=>27.4,'cambio_imc'=>0,'cintura_inicial'=>88,'cintura_actual'=>88,'cambio_cintura'=>0]];
        $analitica['evolucion_adherencia']['por_plan'] = [['nombre_plan'=>'Plan clínico agosto','estado_plan'=>'aprobado','fecha_inicio'=>'2026-08-18','fecha_fin'=>'2026-08-24','comidas_totales'=>28,'registradas'=>20,'completadas'=>17,'parciales'=>2,'reemplazadas'=>1,'no_realizadas'=>0,'pendientes'=>8,'porcentaje_adherencia'=>75.0]];
        $analitica['evolucion_adherencia']['resumen']['promedio_adherencia'] = 75.0;
        $analitica['analitica_sintomas']['hambre_nocturna_frecuente'] = true;
        $analitica['recetas_aceptadas'] = [['nombre'=>'Avena con frutos rojos','tipo_comida'=>'desayuno','veces_consumida'=>3,'veces_me_gusto'=>3,'desea_repetir'=>2,'sin_molestias'=>3,'puntaje_aceptacion'=>9]];
        $analitica['recetas_problematicas'] = [['nombre'=>'Ensalada de prueba','tipo_comida'=>'cena','motivos'=>['molestia','no_me_gusto'],'frecuencia'=>2]];
        $html = view('pdf.nutricion.reporte-seguimiento-evolucion', ['paciente'=>$paciente,'profesional'=>$nutricionista,'fechaGeneracion'=>now(),'analitica'=>$analitica,'retroalimentaciones'=>collect(),'planActual'=>null])->render();

        $this->assertStringContainsString('72,5 kg', $html);
        $this->assertStringContainsString('Plan clínico agosto', $html);
        $this->assertStringContainsString('75,0%', $html);
        $this->assertStringContainsString('Avena con frutos rojos', $html);
        $this->assertStringContainsString('Ensalada de prueba', $html);
        $this->assertStringContainsString('no me gusto', $html);
    }

    private function escenario(): array
    {
        $nutricionista = $this->usuarioConRol('nutricionista');
        $paciente = Paciente::query()->create([
            'user_id' => User::factory()->create()->getKey(), 'nombres' => 'Paciente',
            'apellido_paterno' => 'Reporte', 'ci' => fake()->unique()->numerify('########'),
            'fecha_nacimiento' => '1992-01-01', 'sexo' => 'femenino', 'estado' => 'activo',
        ]);

        return [$nutricionista, $paciente];
    }

    private function usuarioConRol(string $nombre): User
    {
        $rol = Role::query()->firstOrCreate(['nombre' => $nombre], ['descripcion' => ucfirst($nombre), 'estado' => 'activo']);
        $user = User::factory()->create(['estado' => 'activo']);
        UserRole::query()->create(['user_id' => $user->getKey(), 'id_rol' => $rol->getKey(), 'estado' => 'activo']);
        return $user;
    }

    private function url(Paciente $paciente): string
    {
        return route('nutricionista.pacientes.reporte-seguimiento-evolucion-pdf', $paciente);
    }
}
