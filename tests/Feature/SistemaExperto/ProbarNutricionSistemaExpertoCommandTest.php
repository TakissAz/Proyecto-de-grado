<?php

namespace Tests\Feature\SistemaExperto;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProbarNutricionSistemaExpertoCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_comando_existe_y_tolera_paciente_inexistente(): void
    {
        $this->artisan('experto:probar-nutricion', ['paciente' => 999999])
            ->expectsOutput('No se encontró el paciente indicado.')
            ->assertFailed();
    }
}
