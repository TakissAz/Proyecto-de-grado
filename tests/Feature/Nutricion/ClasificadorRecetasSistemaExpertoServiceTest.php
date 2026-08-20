<?php

namespace Tests\Feature\Nutricion;

use App\Models\Alimento;
use App\Models\Paciente;
use App\Models\Receta;
use App\Models\RecomendacionNutricionalExperta;
use App\Models\User;
use App\Services\Nutricion\ClasificadorRecetasSistemaExpertoService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClasificadorRecetasSistemaExpertoServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_descarta_receta_por_alergia_en_ingrediente(): void
    {
        $receta = $this->receta('Batido energético', 'desayuno', ['Mantequilla de maní']);
        $resultado = $this->buscar($this->clasificar(['alergias' => ['maní']]), $receta);

        $this->assertTrue($resultado['descartada']);
        $this->assertStringContainsString('alergias', implode(' ', $resultado['razones_descarte']));
    }

    public function test_descarta_receta_por_intolerancia(): void
    {
        $receta = $this->receta('Yogur con fruta', 'merienda', ['Leche de vaca']);
        $resultado = $this->buscar($this->clasificar(['intolerancias' => ['leche']]), $receta);

        $this->assertTrue($resultado['descartada']);
    }

    public function test_descarta_receta_por_alimento_rechazado(): void
    {
        $receta = $this->receta('Ensalada de atún', 'almuerzo', ['Atún']);
        $resultado = $this->buscar($this->clasificar(['alimentos_rechazados' => ['atún']]), $receta);

        $this->assertTrue($resultado['descartada']);
    }

    public function test_da_mas_puntaje_si_coincide_tipo_comida(): void
    {
        $desayuno = $this->receta('Huevos matutinos', 'desayuno');
        $cena = $this->receta('Huevos nocturnos', 'cena');
        $resultados = $this->servicio()->clasificarParaRecomendacion($this->recomendacion(), 'desayuno');

        $this->assertGreaterThan(
            $this->buscar($resultados, $cena)['puntaje'],
            $this->buscar($resultados, $desayuno)['puntaje']
        );
    }

    public function test_da_mas_puntaje_si_contiene_alimento_preferido(): void
    {
        $preferida = $this->receta('Pollo con verduras', 'almuerzo', ['Pollo']);
        $otra = $this->receta('Tofu con verduras', 'almuerzo', ['Tofu']);
        $resultados = $this->clasificar(['alimentos_preferidos' => ['pollo']]);

        $this->assertGreaterThan(
            $this->buscar($resultados, $otra)['puntaje'],
            $this->buscar($resultados, $preferida)['puntaje']
        );
    }

    public function test_penaliza_alimento_no_preferido(): void
    {
        $noPreferida = $this->receta('Brócoli salteado', 'almuerzo', ['Brócoli']);
        $neutral = $this->receta('Calabacín salteado', 'almuerzo', ['Calabacín']);
        $resultados = $this->clasificar(['alimentos_no_preferidos' => ['brócoli']]);

        $this->assertLessThan(
            $this->buscar($resultados, $neutral)['puntaje'],
            $this->buscar($resultados, $noPreferida)['puntaje']
        );
        $this->assertNotEmpty($this->buscar($resultados, $noPreferida)['advertencias']);
    }

    public function test_ri_confirmada_favorece_carbohidratos_moderados(): void
    {
        $moderada = $this->receta('Omelette proteico', 'desayuno', [], 300, 25, 20, 13, 5);
        $alta = $this->receta('Panqueques dulces', 'desayuno', [], 300, 5, 60, 4, 1);
        $resultados = $this->clasificar(['resistencia_insulina_confirmada' => true]);

        $this->assertGreaterThan(
            $this->buscar($resultados, $alta)['puntaje'],
            $this->buscar($resultados, $moderada)['puntaje']
        );
    }

    public function test_ordena_compatibles_por_puntaje_descendente_y_descartadas_al_final(): void
    {
        $mejor = $this->receta('Pollo y verduras', 'almuerzo', ['Pollo'], 350, 30, 25, 12, 8);
        $menor = $this->receta('Arroz blanco', 'cena', ['Arroz'], 350, 5, 70, 5, 1);
        $descartada = $this->receta('Crema de maní', 'almuerzo', ['Maní'], 300, 10, 30, 15, 3);
        $resultados = $this->clasificar([
            'alergias' => ['maní'],
            'alimentos_preferidos' => ['pollo'],
            'resistencia_insulina_confirmada' => true,
        ], 'almuerzo');

        $this->assertTrue($resultados[0]['receta']->is($mejor));
        $this->assertTrue(end($resultados)['receta']->is($descartada));
        $this->assertGreaterThan($this->buscar($resultados, $menor)['puntaje'], $resultados[0]['puntaje']);
    }

    public function test_devuelve_motivos_y_advertencias_auditables(): void
    {
        $receta = $this->receta('Snack de pollo', 'cena', ['Pollo'], 300, 25, 15, 20, 1);
        $resultado = $this->buscar($this->clasificar([
            'alimentos_preferidos' => ['pollo'],
            'alimentos_no_preferidos' => ['pollo'],
        ], 'desayuno'), $receta);

        $this->assertIsArray($resultado['motivos']);
        $this->assertIsArray($resultado['advertencias']);
        $this->assertNotEmpty($resultado['motivos']);
        $this->assertNotEmpty($resultado['advertencias']);
    }

    public function test_devuelve_receta_activa_compatible_sin_restricciones(): void
    {
        $receta = $this->receta('Desayuno compatible', 'desayuno');
        $resultado = $this->buscar($this->clasificar([], 'desayuno'), $receta);

        $this->assertFalse($resultado['descartada']);
        $this->assertEmpty($resultado['razones_descarte']);
    }

    public function test_ignora_expresiones_que_indican_ausencia_de_restricciones(): void
    {
        $receta = $this->receta('Cena libre', 'cena', ['Leche']);

        foreach (['sin ninguna', 'ninguna', 'ninguno', 'no', 'no refiere', 'no presenta', 'sin restricciones'] as $valor) {
            $resultado = $this->buscar($this->clasificar(['alergias' => $valor], 'cena'), $receta);
            $this->assertFalse($resultado['descartada'], "No debía descartar por: {$valor}");
        }
    }

    public function test_normaliza_mayusculas_y_espacios_en_tipo_y_estado(): void
    {
        $receta = $this->receta('Merienda normalizada', '  MERIENDA  ');
        $receta->update(['estado' => ' ACTIVO ']);
        $resultado = $this->buscar(
            $this->servicio()->clasificarParaRecomendacion($this->recomendacion(), ' MERIENDA '),
            $receta
        );

        $this->assertNotNull($resultado);
        $this->assertContains('Coincide con el tipo de comida solicitado.', $resultado['motivos']);
    }

    public function test_no_convierte_texto_general_de_recomendacion_en_restriccion_estricta(): void
    {
        $receta = $this->receta('Avena saludable', 'desayuno', ['Avena']);
        $recomendacion = $this->recomendacion();
        $recomendacion->update(['restricciones' => ['Priorizar alimentos integrales y evitar excesos']]);
        $resultado = $this->buscar(
            $this->servicio()->clasificarParaRecomendacion($recomendacion, 'desayuno'),
            $receta
        );

        $this->assertFalse($resultado['descartada']);
    }

    private function clasificar(array $hechos = [], ?string $tipo = null): array
    {
        return $this->servicio()->clasificarParaRecomendacion($this->recomendacion($hechos), $tipo);
    }

    private function buscar(array $resultados, Receta $receta): array
    {
        return collect($resultados)->first(
            fn (array $resultado): bool => $resultado['receta']->is($receta)
        );
    }

    private function servicio(): ClasificadorRecetasSistemaExpertoService
    {
        return app(ClasificadorRecetasSistemaExpertoService::class);
    }

    private function recomendacion(array $hechos = []): RecomendacionNutricionalExperta
    {
        $usuario = User::factory()->create();
        $paciente = Paciente::query()->create([
            'user_id' => $usuario->getKey(), 'nombres' => 'Paciente',
            'apellido_paterno' => 'Clasificador', 'ci' => fake()->unique()->numerify('########'),
            'fecha_nacimiento' => '1992-01-01', 'sexo' => 'femenino', 'estado' => 'activo',
        ]);

        return RecomendacionNutricionalExperta::query()->create([
            'id_paciente' => $paciente->getKey(),
            'enfoque_nutricional_experto' => 'bajo_indice_glucemico_alto_fibra',
            'calorias_sugeridas' => 1600, 'restricciones' => [],
            'hechos_utilizados' => $hechos, 'estado_validacion_experta' => 'aprobado',
            'estado' => 'activo',
        ]);
    }

    private function receta(
        string $nombre,
        string $tipo,
        array $ingredientes = [],
        float $calorias = 300,
        float $proteinas = 20,
        float $carbohidratos = 30,
        float $grasas = 10,
        float $fibra = 5
    ): Receta {
        $receta = Receta::query()->create([
            'nombre' => $nombre, 'tipo_comida' => $tipo, 'porciones' => 1,
            'calorias_totales' => $calorias, 'proteinas_totales' => $proteinas,
            'carbohidratos_totales' => $carbohidratos, 'grasas_totales' => $grasas,
            'fibra_total' => $fibra, 'estado' => 'activo',
        ]);

        foreach ($ingredientes as $nombreAlimento) {
            $alimento = Alimento::query()->create([
                'nombre' => $nombreAlimento, 'grupo_alimentario' => 'otros',
                'unidad_base' => 'g', 'cantidad_base' => 100, 'calorias' => 100,
                'proteinas' => 10, 'carbohidratos' => 10, 'grasas' => 3,
                'fibra' => 2, 'estado' => 'activo',
            ]);
            $receta->alimentos()->attach($alimento->getKey(), [
                'cantidad' => 100, 'unidad' => 'g', 'calorias_aporte' => 100,
                'proteinas_aporte' => 10, 'carbohidratos_aporte' => 10,
                'grasas_aporte' => 3, 'fibra_aporte' => 2,
            ]);
        }

        return $receta;
    }
}
