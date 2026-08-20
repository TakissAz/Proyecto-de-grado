<?php

namespace Tests\Feature\Database;

use App\Models\DiagnosticoResistenciaInsulina;
use App\Models\Paciente;
use App\Models\RequerimientoNutricional;
use App\Models\RestriccionAlimentaria;
use App\Models\User;
use App\Services\SistemaExperto\HechosNutricionalesSistemaExpertoService;
use Database\Seeders\PacientesPruebaSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PacientesPruebaSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_crea_los_ocho_escenarios_clinicos_y_nutricionales_solicitados(): void
    {
        $this->seed(PacientesPruebaSeeder::class);
        $pacientes = Paciente::query()->where('ci', 'like', 'PRUEBA-PMOS-%')->get();

        $this->assertCount(8, $pacientes);
        $this->assertTrue($pacientes->every(fn (Paciente $p): bool => $p->sexo === 'femenino'));
        $this->assertTrue($pacientes->every(fn (Paciente $p): bool =>
            $p->fecha_nacimiento->age >= 21 && $p->fecha_nacimiento->age <= 35
        ));
        $this->assertTrue(User::query()->where('email', 'nutricionista.prueba@pmos.test')->firstOrFail()->tieneRol('nutricionista'));
        $this->assertTrue(User::query()->where('email', 'endocrinologo.prueba@pmos.test')->firstOrFail()->tieneRol('endocrinologo'));

        $alergia = $this->pacientePorEmail('paciente.pmos.ri.alergia@pmos.test');
        $restriccion = RestriccionAlimentaria::query()->where('id_paciente', $alergia->getKey())->firstOrFail();
        $this->assertStringContainsString('maní', $restriccion->alergias);
        $this->assertStringContainsString('lactosa', $restriccion->intolerancias);

        $severa = $this->pacientePorEmail('paciente.ri.severa@pmos.test');
        $diagnosticoRi = DiagnosticoResistenciaInsulina::query()->where('id_paciente', $severa->getKey())->firstOrFail();
        $this->assertSame('5.50', $diagnosticoRi->homa_ir);
        $this->assertSame('severa', $diagnosticoRi->grado_resistencia);

        $completa = $this->pacientePorEmail('paciente.plancompleto@pmos.test');
        $this->assertDatabaseHas('preferencias_alimentarias', ['id_paciente' => $completa->getKey()]);
        $this->assertTrue(RequerimientoNutricional::query()->where('id_paciente', $completa->getKey())->exists());

        $servicio = app(HechosNutricionalesSistemaExpertoService::class);
        $hechosCompletos = $servicio->construirHechosNutricionales($completa);
        $this->assertTrue($hechosCompletos['diagnostico_pmos']['diagnostico_confirmado']);
        $this->assertTrue($hechosCompletos['diagnostico_resistencia_insulina']['resistencia_confirmada']);
        $this->assertNotEmpty($hechosCompletos['preferencias_alimentarias']['alimentos_preferidos']);
        $this->assertNotNull($hechosCompletos['requerimiento_nutricional']['calorias_objetivo']);

        $incompleta = $this->pacientePorEmail('paciente.incompleta@pmos.test');
        $hechosIncompletos = $servicio->construirHechosNutricionales($incompleta);
        $this->assertFalse($hechosIncompletos['diagnostico_pmos']['diagnostico_confirmado']);
        $this->assertFalse($hechosIncompletos['diagnostico_resistencia_insulina']['resistencia_confirmada']);
        $this->assertNull($hechosIncompletos['requerimiento_nutricional']['calorias_objetivo']);
        $this->assertNotNull($hechosIncompletos['evaluacion_nutricional']['peso']);
    }

    private function pacientePorEmail(string $email): Paciente
    {
        return User::query()->where('email', $email)->firstOrFail()->paciente()->firstOrFail();
    }
}
