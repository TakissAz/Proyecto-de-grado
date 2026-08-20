<?php

namespace Tests\Feature\SistemaExperto;

use App\Services\SistemaExperto\SistemaExpertoZenService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Tests\TestCase;

class SistemaExpertoZenServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.pmos_experto.url' => 'http://127.0.0.1:8001',
            'services.pmos_experto.timeout' => 10,
        ]);
    }

    public function test_health_devuelve_estado_correcto(): void
    {
        Http::fake([
            'http://127.0.0.1:8001/health' => Http::response([
                'status' => 'ok',
                'service' => 'pmos-experto',
                'engine' => 'zen-engine',
            ]),
        ]);

        $respuesta = $this->servicio()->health();

        $this->assertSame('ok', $respuesta['status']);
        $this->assertSame('zen-engine', $respuesta['engine']);
        Http::assertSentCount(1);
    }

    public function test_evaluar_pmos_devuelve_resultado_y_trazabilidad(): void
    {
        Http::fake([
            'http://127.0.0.1:8001/api/v1/diagnostico/pmos' => Http::response([
                'resultado' => [
                    'diagnostico_confirmado' => true,
                    'fenotipo_pmos' => 'A',
                ],
                'trazabilidad' => [
                    'confianza_experta' => 0.95,
                    'reglas_activadas' => ['PMOS-FENOTIPO-A'],
                ],
                'engine' => 'zen-engine',
            ]),
        ]);

        $respuesta = $this->servicio()->evaluarPmos([
            'cumple_alteracion_ovulatoria' => true,
        ]);

        $this->assertTrue($respuesta['resultado']['diagnostico_confirmado']);
        $this->assertSame('A', $respuesta['resultado']['fenotipo_pmos']);
        $this->assertSame(0.95, $respuesta['trazabilidad']['confianza_experta']);
    }

    public function test_evaluar_ri_devuelve_resultado_y_trazabilidad(): void
    {
        Http::fake([
            'http://127.0.0.1:8001/api/v1/diagnostico/resistencia-insulina' => Http::response([
                'resultado' => [
                    'resistencia_confirmada' => true,
                    'grado_resistencia' => 'moderada',
                ],
                'trazabilidad' => [
                    'confianza_experta' => 0.90,
                    'reglas_activadas' => ['RI-GRADO-MODERADA'],
                ],
                'engine' => 'zen-engine',
            ]),
        ]);

        $respuesta = $this->servicio()->evaluarResistenciaInsulina([
            'glucosa_ayunas' => 92,
            'insulina_ayunas' => 15,
        ]);

        $this->assertTrue($respuesta['resultado']['resistencia_confirmada']);
        $this->assertSame('moderada', $respuesta['resultado']['grado_resistencia']);
        $this->assertSame(0.90, $respuesta['trazabilidad']['confianza_experta']);
    }

    public function test_lanza_error_controlado_si_microservicio_no_responde(): void
    {
        Http::fake(function (): never {
            throw new ConnectionException('Conexión rechazada');
        });

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage(
            'No se pudo conectar con el microservicio experto ZEN.'
        );

        $this->servicio()->health();
    }

    public function test_evaluar_recomendacion_nutricional_envia_post_correcto(): void
    {
        Http::fake([
            'http://127.0.0.1:8001/api/v1/nutricion/recomendacion-base' => Http::response([
                'resultado' => ['enfoque_nutricional_experto' => 'alimentacion_equilibrada'],
                'trazabilidad' => ['reglas_activadas' => []],
                'engine' => 'zen-engine',
            ]),
        ]);

        $hechos = [
            'diagnostico_pmos' => ['diagnostico_confirmado' => true],
            'evaluacion_nutricional' => ['imc' => 31.2],
        ];

        $this->servicio()->evaluarRecomendacionNutricional($hechos);

        Http::assertSent(function (Request $request): bool {
            return $request->method() === 'POST'
                && $request->url() === 'http://127.0.0.1:8001/api/v1/nutricion/recomendacion-base'
                && data_get($request->data(), 'hechos') === array_replace([
                        'diagnostico_pmos_confirmado' => true,
                        'fenotipo_pmos' => null,
                        'resistencia_insulina_confirmada' => false,
                        'grado_resistencia' => null,
                        'riesgo_metabolico' => null,
                        'riesgo_cardiometabolico' => null,
                        'imc' => 31.2,
                        'nivel_actividad' => null,
                        'objetivo_principal' => null,
                        'calorias_objetivo' => null,
                        'proteinas_diarias' => null,
                        'carbohidratos_diarias' => null,
                        'grasas_diarias' => null,
                        'fibra_diaria' => null,
                        'consumo_azucar' => null,
                        'consumo_ultraprocesados' => null,
                        'consumo_bebidas_azucaradas' => null,
                        'ansiedad_por_comida' => null,
                        'cena_tardia' => null,
                        'comidas_por_dia' => null,
                        'horarios_regulares' => null,
                        'consume_desayuno' => null,
                        'consumo_agua_litros' => null,
                        'consumo_frituras' => null,
                        'frecuencia_frutas_verduras' => null,
                        'hambre_nocturna' => null,
                        'alergias' => [],
                        'intolerancias' => [],
                        'alimentos_restringidos' => [],
                        'alimentos_no_tolerados' => [],
                        'alimentos_rechazados' => [],
                        'alimentos_preferidos' => [],
                        'alimentos_no_preferidos' => [],
                        'comidas_preferidas' => [],
                        'comidas_frecuentes' => [],
                        'preparaciones_preferidas' => [],
                        'sabores_preferidos' => [],
                    ], []);
        });
    }

    public function test_payload_plano_envia_restricciones_y_preferencias(): void
    {
        Http::fake(['*' => Http::response(['resultado' => [], 'trazabilidad' => []])]);
        $this->servicio()->evaluarRecomendacionNutricional([
            'restricciones_alimentarias' => ['alergias' => ['maní'], 'intolerancias' => ['lactosa'], 'alimentos_restringidos' => ['azúcar'], 'alimentos_no_tolerados' => ['cebolla'], 'alimentos_rechazados' => ['pescado']],
            'preferencias_alimentarias' => ['alimentos_preferidos' => ['avena'], 'alimentos_no_preferidos' => ['hígado'], 'comidas_preferidas' => ['ensalada'], 'comidas_frecuentes' => ['sopa'], 'preparaciones_preferidas' => ['horno'], 'sabores_preferidos' => ['salado']],
            'evaluacion_nutricional' => [],
        ]);
        Http::assertSent(fn (Request $request) => data_get($request->data(), 'hechos.alergias') === ['maní']
            && data_get($request->data(), 'hechos.alimentos_rechazados') === ['pescado']
            && data_get($request->data(), 'hechos.alimentos_preferidos') === ['avena']
            && data_get($request->data(), 'hechos.preparaciones_preferidas') === ['horno']);
    }

    public function test_evaluar_recomendacion_nutricional_devuelve_resultado_y_trazabilidad(): void
    {
        Http::fake([
            'http://127.0.0.1:8001/api/v1/nutricion/recomendacion-base' => Http::response([
                'resultado' => [
                    'enfoque_nutricional_experto' => 'bajo_indice_glucemico_alto_fibra',
                    'calorias_sugeridas' => 1600,
                ],
                'trazabilidad' => [
                    'confianza_experta' => 0.90,
                    'reglas_activadas' => ['NUT-RI-BAJO-IG'],
                ],
                'engine' => 'zen-engine',
                'version_modelo' => 'nutricion-base-v1',
            ]),
        ]);

        $respuesta = $this->servicio()->evaluarRecomendacionNutricional([
            'diagnostico_resistencia_insulina' => ['resistencia_confirmada' => true],
        ]);

        $this->assertSame(
            'bajo_indice_glucemico_alto_fibra',
            $respuesta['resultado']['enfoque_nutricional_experto']
        );
        $this->assertSame(0.90, $respuesta['trazabilidad']['confianza_experta']);
        $this->assertContains(
            'NUT-RI-BAJO-IG',
            $respuesta['trazabilidad']['reglas_activadas']
        );
    }

    public function test_error_nutricional_del_microservicio_lanza_excepcion_clara(): void
    {
        Http::fake([
            'http://127.0.0.1:8001/api/v1/nutricion/recomendacion-base' => Http::response([
                'detail' => 'Modelo nutricional inválido.',
            ], 500),
        ]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage(
            'El microservicio experto ZEN respondió con error HTTP 500.'
        );

        $this->servicio()->evaluarRecomendacionNutricional([]);
    }

    private function servicio(): SistemaExpertoZenService
    {
        return app(SistemaExpertoZenService::class);
    }
}
