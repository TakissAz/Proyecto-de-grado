<?php

namespace Tests\Feature\Database;

use App\Models\Alimento;
use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use App\Models\EvaluacionNutricional;
use App\Models\Paciente;
use App\Models\Receta;
use App\Models\User;
use Database\Seeders\CatalogoAmpliadoRecetasSeeder;
use Database\Seeders\DatosClinicosNutricionalesRealistasSeeder;
use Database\Seeders\RecetasSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatosClinicosNutricionalesRealistasSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_crea_setenta_expedientes_ficticios_completos_sin_duplicarlos(): void
    {
        $this->seed(DatosClinicosNutricionalesRealistasSeeder::class);
        $this->seed(DatosClinicosNutricionalesRealistasSeeder::class);

        $pacientes = Paciente::query()->where('ci', 'like', 'DEMO-%');
        $this->assertSame(70, $pacientes->count());
        $this->assertSame(70, EvaluacionNutricional::query()->whereIn('id_paciente', $pacientes->pluck('id_paciente'))->count());
        $this->assertSame(70, DiagnosticoPmos::query()->whereIn('id_paciente', $pacientes->pluck('id_paciente'))->count());
        $this->assertSame(70, DiagnosticoResistenciaInsulina::query()->whereIn('id_paciente', $pacientes->pluck('id_paciente'))->count());
        $this->assertFalse($pacientes->get()->contains(fn (Paciente $paciente): bool => $paciente->fecha_nacimiento->age < 21 || $paciente->fecha_nacimiento->age > 35));
        $this->assertSame(70, $pacientes->whereHas('user', fn ($query) => $query->where('email', 'like', '%.%@gmail.test'))->count());
        $this->assertSame(0, User::query()->where('email', 'like', 'paciente.demo.%')->count());
    }

    public function test_catalogo_alcanza_minimo_setenta_alimentos_y_recetas(): void
    {
        $this->seed(RecetasSeeder::class);
        $this->seed(CatalogoAmpliadoRecetasSeeder::class);
        $this->seed(CatalogoAmpliadoRecetasSeeder::class);

        $this->assertGreaterThanOrEqual(70, Alimento::query()->count());
        $this->assertGreaterThanOrEqual(70, Receta::query()->count());
        $this->assertSame(0, Receta::query()->doesntHave('recetaAlimentos')->count());
    }
}
