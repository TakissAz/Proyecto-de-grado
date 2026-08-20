<?php

namespace Tests\Feature\Endocrinologo;

use App\Models\ConsultaEndocrinologica;
use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use App\Models\Paciente;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ReporteDiagnosticoTest extends TestCase
{
    use RefreshDatabase;

    private Paciente $paciente;
    private DiagnosticoPmos $pmos;
    private DiagnosticoResistenciaInsulina $ri;

    protected function setUp(): void
    {
        parent::setUp();
        $this->paciente = new Paciente([
            'nombres' => 'Ana', 'apellido_paterno' => 'Pérez', 'apellido_materno' => 'López',
            'ci' => '123456', 'fecha_nacimiento' => '1995-05-10', 'sexo' => 'femenino',
        ]);
        $this->paciente->forceFill(['id_paciente' => 77]);

        $consulta = new ConsultaEndocrinologica([
            'fecha_consulta' => '2026-08-14',
            'motivo_consulta' => 'Evaluación por ciclos irregulares',
            'observaciones_generales' => 'Evaluación endocrinológica integral',
        ]);
        $consulta->setRelation('endocrinologo', null);

        $this->pmos = new DiagnosticoPmos([
            'fecha_diagnostico' => '2026-08-14', 'estado' => 'registrado',
            'diagnostico_confirmado' => true, 'fenotipo_pmos' => 'A',
            'severidad_clinica' => 'moderada', 'riesgo_metabolico' => 'alto',
            'tipo_hiperandrogenismo' => 'mixto', 'total_criterios_rotterdam' => 3,
            'cumple_alteracion_ovulatoria' => true, 'cumple_hiperandrogenismo' => true,
            'cumple_morfologia_ovarica' => true, 'diagnosticos_diferenciales_descartados' => true,
            'conclusion_medica' => 'Compatible con PMOS fenotipo A',
            'recomendaciones_medicas' => 'Seguimiento endocrinológico',
            'confianza_experta' => 0.95, 'version_motor_experto' => 'pmos-v1',
            'reglas_activadas' => ['PMOS-ROTTERDAM-CONFIRMADO'],
            'explicacion_experta' => '["Cumple tres criterios de Rotterdam"]',
            'estado_validacion_experta' => 'aprobado',
        ]);
        $this->pmos->setRelation('endocrinologo', null);
        $this->pmos->setRelation('validadorExperto', null);

        $this->ri = new DiagnosticoResistenciaInsulina([
            'fecha_diagnostico' => '2026-08-14', 'estado' => 'registrado',
            'resistencia_confirmada' => true, 'grado_resistencia' => 'moderada',
            'homa_ir' => 3.41, 'quicki' => 0.32, 'glucosa_ayunas' => 92,
            'insulina_ayunas' => 15, 'hemoglobina_glicosilada' => 5.4,
            'riesgo_diabetes' => 'moderado', 'riesgo_cardiometabolico' => 'alto',
            'conclusion_medica' => 'Compatible con resistencia a la insulina',
            'recomendaciones_medicas' => 'Control metabólico',
            'confianza_experta' => 0.90, 'version_motor_experto' => 'ri-v1',
            'reglas_activadas' => ['RI-GRADO-MODERADA'],
            'explicacion_experta' => '["HOMA-IR elevado"]',
            'estado_validacion_experta' => 'aprobado',
        ]);
        $this->ri->setRelation('endocrinologo', null);
        $this->ri->setRelation('validadorExperto', null);

        $relaciones = [
            'user' => null,
            'consultasEndocrinologicas' => new Collection([$consulta]),
            'diagnosticosPmos' => new Collection([$this->pmos]),
            'diagnosticosResistenciaInsulina' => new Collection([$this->ri]),
            'resultadosGlucosaInsulina' => new Collection(),
            'resultadosPerfilLipidico' => new Collection(),
            'evaluacionesFisicasEndocrinas' => new Collection(),
            'historiaMenstrual' => new Collection(),
            'historiaHiperandrogenica' => new Collection(),
            'resultadosPerfilAndrogenico' => new Collection(),
            'resultadosDiferencialesEndocrinos' => new Collection(),
            'evaluacionesEcograficas' => new Collection(),
        ];
        foreach ($relaciones as $nombre => $valor) $this->paciente->setRelation($nombre, $valor);

        Route::bind('paciente', fn () => $this->paciente);
    }

    public function test_endocrinologo_puede_generar_pdf(): void
    {
        $response = $this->actingAs($this->usuarioConRol('endocrinologo'))
            ->get(route('endocrinologo.pacientes.diagnostico.reporte-pdf', 77));

        $response->assertOk();
        $this->assertStringStartsWith('application/pdf', (string) $response->headers->get('content-type'));
        $this->assertStringStartsWith('%PDF', $response->getContent());
    }

    public function test_endocrinologo_puede_descargar_pdf_pmos_independiente(): void
    {
        $response = $this->actingAs($this->usuarioConRol('endocrinologo'))
            ->get(route('endocrinologo.pacientes.diagnostico.pmos.reporte-pdf', 77));

        $response->assertOk();
        $this->assertStringStartsWith('application/pdf', (string) $response->headers->get('content-type'));
        $this->assertStringStartsWith('%PDF', $response->getContent());
    }

    public function test_endocrinologo_puede_descargar_pdf_ri_independiente(): void
    {
        $response = $this->actingAs($this->usuarioConRol('endocrinologo'))
            ->get(route('endocrinologo.pacientes.diagnostico.ri.reporte-pdf', 77));

        $response->assertOk();
        $this->assertStringStartsWith('application/pdf', (string) $response->headers->get('content-type'));
        $this->assertStringStartsWith('%PDF', $response->getContent());
    }

    public function test_usuario_sin_rol_recibe_403(): void
    {
        $this->actingAs($this->usuarioConRol('nutricionista'))
            ->get(route('endocrinologo.pacientes.diagnostico.reporte-pdf', 77))
            ->assertForbidden();
    }

    public function test_usuario_no_autenticado_es_redirigido(): void
    {
        $this->get(route('endocrinologo.pacientes.diagnostico.reporte-pdf', 77))
            ->assertRedirect(route('login'));
    }

    public function test_informe_contiene_titulo_requerido(): void
    {
        $this->assertStringContainsString(
            'Informe de Diagnóstico Endocrinológico',
            $this->renderizarVista()
        );
    }

    public function test_informe_usa_datos_pmos_y_ri_cuando_existen(): void
    {
        $html = $this->renderizarVista();
        $this->assertStringContainsString('Compatible con PMOS fenotipo A', $html);
        $this->assertStringContainsString('Compatible con resistencia a la insulina', $html);
        $this->assertStringContainsString('PMOS-ROTTERDAM-CONFIRMADO', $html);
        $this->assertStringContainsString('RI-GRADO-MODERADA', $html);
    }

    private function renderizarVista(): string
    {
        return view('pdf.diagnostico-endocrinologico', [
            'paciente' => $this->paciente, 'consulta' => $this->paciente->consultasEndocrinologicas->first(),
            'pmos' => $this->pmos, 'ri' => $this->ri, 'glucosa' => null, 'lipidos' => null,
            'fisica' => null, 'historiaMenstrual' => null, 'historiaHiperandrogenica' => null,
            'perfilAndrogenico' => null, 'diferencial' => null, 'ecografia' => null,
            'endocrinologo' => null,
            'criteriosPmos' => ['Alteración ovulatoria', 'Hiperandrogenismo', 'Morfología ovárica'],
            'explicacionPmos' => ['Cumple tres criterios de Rotterdam'],
            'explicacionRi' => ['HOMA-IR elevado'], 'fechaGeneracion' => now(),
        ])->render();
    }

    private function usuarioConRol(string $nombre): User
    {
        $rol = Role::create(['nombre' => $nombre, 'descripcion' => ucfirst($nombre), 'estado' => 'activo']);
        $usuario = User::factory()->create(['estado' => 'activo']);
        UserRole::create(['user_id' => $usuario->id, 'id_rol' => $rol->id_rol, 'estado' => 'activo']);
        return $usuario;
    }
}
