<?php

namespace Tests\Feature\Nutricion;

use App\Models\Receta;
use Database\Seeders\RecetasSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecetasSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_crea_recetas_activas_con_tipos_validos(): void
    {
        $this->seed(RecetasSeeder::class);

        $this->assertSame(40, Receta::query()->count());
        $this->assertSame(
            0,
            Receta::query()->whereNotIn('tipo_comida', ['desayuno', 'almuerzo', 'merienda', 'cena'])->count()
        );
        $this->assertSame(40, Receta::query()->where('estado', 'activo')->count());
    }

    public function test_cada_receta_del_seeder_tiene_ingredientes_asociados(): void
    {
        $this->seed(RecetasSeeder::class);

        $this->assertSame(40, Receta::query()->has('recetaAlimentos')->count());
        $this->assertSame(0, Receta::query()->doesntHave('recetaAlimentos')->count());
    }
}
