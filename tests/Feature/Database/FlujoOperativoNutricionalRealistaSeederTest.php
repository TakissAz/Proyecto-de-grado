<?php

namespace Tests\Feature\Database;

use Database\Seeders\DatosClinicosNutricionalesRealistasSeeder;
use Database\Seeders\FlujoOperativoNutricionalRealistaSeeder;
use Database\Seeders\ReglasNutricionalesSeeder;
use App\Models\User;
use App\Services\Paciente\PortalPacienteService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;
use Illuminate\Support\Carbon;

class FlujoOperativoNutricionalRealistaSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow(self::today().' 12:00:00');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_crea_flujo_operativo_completo_e_idempotente(): void
    {
        $this->seed(DatosClinicosNutricionalesRealistasSeeder::class);
        $this->seed(ReglasNutricionalesSeeder::class);
        $this->seed(FlujoOperativoNutricionalRealistaSeeder::class);
        $this->seed(FlujoOperativoNutricionalRealistaSeeder::class);

        $ids = DB::table('pacientes')->where('ci', 'like', 'DEMO-%')->pluck('id_paciente');
        $this->assertCount(70, $ids);
        $this->assertSame(70, DB::table('derivaciones_nutricionales')->whereIn('id_paciente', $ids)->count());
        $this->assertSame(140, DB::table('citas')->whereIn('id_paciente', $ids)->count());
        $this->assertSame(70, DB::table('planes_alimentarios')->whereIn('id_paciente', $ids)->count());
        $this->assertSame(70, DB::table('recomendaciones_nutricionales_expertas')->whereIn('id_paciente', $ids)->count());
        $this->assertSame(70, DB::table('planes_alimentarios')->whereIn('id_paciente', $ids)
            ->whereNotNull('id_recomendacion_nutricional_experta')->count());
        $this->assertSame(1960, DB::table('seguimientos_comidas')->whereIn('id_paciente', $ids)->count());
        $this->assertSame(490, DB::table('seguimientos_sintomas_paciente')->whereIn('id_paciente', $ids)->count());
        $this->assertSame(70, DB::table('retroalimentaciones_paciente')->whereIn('id_paciente', $ids)->count());
        $this->assertSame(140, DB::table('evaluaciones_nutricionales')->whereIn('id_paciente', $ids)->count());
        $this->assertGreaterThanOrEqual(11, DB::table('reglas_nutricionales')->count());
    }

    public function test_incluye_estados_y_niveles_de_adherencia_variados(): void
    {
        $this->seed(DatosClinicosNutricionalesRealistasSeeder::class);
        $this->seed(FlujoOperativoNutricionalRealistaSeeder::class);

        $ids = DB::table('pacientes')->where('ci', 'like', 'DEMO-%')->pluck('id_paciente');
        foreach (['pendiente','vista','aceptada','atendida'] as $estado) {
            $this->assertTrue(DB::table('derivaciones_nutricionales')->whereIn('id_paciente', $ids)->where('estado', $estado)->exists());
        }
        foreach (['programada','confirmada','atendida','cancelada'] as $estado) {
            $this->assertTrue(DB::table('citas')->whereIn('id_paciente', $ids)->where('estado', $estado)->exists());
        }
        foreach (['completada','parcial','reemplazada','no_realizada'] as $estado) {
            $this->assertTrue(DB::table('seguimientos_comidas')->whereIn('id_paciente', $ids)->where('estado_cumplimiento', $estado)->exists());
        }
        $this->assertSame(70, DB::table('seguimientos_sintomas_paciente')->whereIn('id_paciente', $ids)->where('fecha_registro', self::today())->count());
    }

    public function test_panel_del_paciente_recibe_progreso_y_seguimiento_visible(): void
    {
        $this->seed(DatosClinicosNutricionalesRealistasSeeder::class);
        $this->seed(FlujoOperativoNutricionalRealistaSeeder::class);

        $usuario = User::query()->where('email', 'like', '%01@gmail.test')->firstOrFail();
        $datos = app(PortalPacienteService::class)->obtenerDashboard($usuario);

        $this->assertNotNull($datos['planAlimentario']);
        $this->assertSame(self::today(), $datos['planAlimentario']['fecha_fin']);
        $this->assertSame(28, $datos['resumenAdherencia']['registradas']);
        $this->assertGreaterThan(0, $datos['resumenAdherencia']['porcentaje_adherencia']);
        $this->assertNotNull($datos['progresoPaciente']['evaluacion']['cambio_peso']);
        $this->assertNotNull($datos['seguimientoSintomas']['registro_hoy']);
    }

    private static function today(): string { return '2026-08-31'; }
}
