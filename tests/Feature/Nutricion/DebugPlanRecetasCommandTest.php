<?php

namespace Tests\Feature\Nutricion;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DebugPlanRecetasCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_comando_existe_y_reporta_recomendacion_inexistente_sin_guardar(): void
    {
        $this->artisan('recetas:debug-plan', ['recomendacion' => 999999])
            ->expectsOutput('No existe la recomendación nutricional indicada.')
            ->assertFailed();
    }
}
