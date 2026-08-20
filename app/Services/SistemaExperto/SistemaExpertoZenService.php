<?php

namespace App\Services\SistemaExperto;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;

class SistemaExpertoZenService
{
    private string $baseUrl;

    private int $timeout;

    public function __construct()
    {
        $this->baseUrl = rtrim(
            (string) config('services.pmos_experto.url'),
            '/'
        );
        $this->timeout = max(
            1,
            (int) config('services.pmos_experto.timeout', 10)
        );
    }

    public function health(): array
    {
        return $this->solicitar('get', '/health');
    }

    public function evaluarPmos(array $hechos): array
    {
        return $this->solicitar(
            'post',
            '/api/v1/diagnostico/pmos',
            $hechos
        );
    }

    public function evaluarResistenciaInsulina(array $hechos): array
    {
        return $this->solicitar(
            'post',
            '/api/v1/diagnostico/resistencia-insulina',
            $hechos
        );
    }

    public function evaluarRecomendacionNutricional(array $hechos): array
    {
        return $this->solicitar(
            'post',
            '/api/v1/nutricion/recomendacion-base',
            ['hechos' => $this->construirPayloadNutricional($hechos)]
        );
    }

    public function construirPayloadNutricional(array $hechos): array
    {
        if (! array_key_exists('diagnostico_pmos', $hechos)
            && ! array_key_exists('evaluacion_nutricional', $hechos)) {
            return $hechos;
        }

        return [
            'diagnostico_pmos_confirmado' => (bool) data_get(
                $hechos,
                'diagnostico_pmos.diagnostico_confirmado',
                false
            ),
            'fenotipo_pmos' => data_get($hechos, 'diagnostico_pmos.fenotipo_pmos'),
            'resistencia_insulina_confirmada' => (bool) data_get(
                $hechos,
                'diagnostico_resistencia_insulina.resistencia_confirmada',
                false
            ),
            'grado_resistencia' => data_get(
                $hechos,
                'diagnostico_resistencia_insulina.grado_resistencia'
            ),
            'riesgo_metabolico' => data_get($hechos, 'diagnostico_pmos.riesgo_metabolico'),
            'riesgo_cardiometabolico' => data_get(
                $hechos,
                'diagnostico_resistencia_insulina.riesgo_cardiometabolico'
            ),
            'imc' => data_get($hechos, 'evaluacion_nutricional.imc'),
            'nivel_actividad' => data_get($hechos, 'evaluacion_nutricional.nivel_actividad'),
            'objetivo_principal' => data_get($hechos, 'objetivo_nutricional.objetivo_principal'),
            'calorias_objetivo' => data_get($hechos, 'requerimiento_nutricional.calorias_objetivo'),
            'proteinas_diarias' => data_get($hechos, 'requerimiento_nutricional.proteinas_diarias'),
            'carbohidratos_diarias' => data_get($hechos, 'requerimiento_nutricional.carbohidratos_diarias'),
            'grasas_diarias' => data_get($hechos, 'requerimiento_nutricional.grasas_diarias'),
            'fibra_diaria' => data_get($hechos, 'requerimiento_nutricional.fibra_diaria'),
            'consumo_azucar' => data_get($hechos, 'habitos_alimentarios.consumo_azucar'),
            'consumo_ultraprocesados' => data_get(
                $hechos,
                'habitos_alimentarios.consumo_ultraprocesados'
            ),
            'consumo_bebidas_azucaradas' => data_get(
                $hechos,
                'habitos_alimentarios.consumo_bebidas_azucaradas'
            ),
            'ansiedad_por_comida' => data_get($hechos, 'habitos_alimentarios.ansiedad_por_comida'),
            'cena_tardia' => data_get($hechos, 'habitos_alimentarios.cena_tardia'),
            'comidas_por_dia' => data_get($hechos, 'habitos_alimentarios.comidas_por_dia'),
            'horarios_regulares' => data_get($hechos, 'habitos_alimentarios.horarios_regulares'),
            'consume_desayuno' => data_get($hechos, 'habitos_alimentarios.consume_desayuno'),
            'consumo_agua_litros' => data_get($hechos, 'habitos_alimentarios.consumo_agua_litros'),
            'consumo_frituras' => data_get($hechos, 'habitos_alimentarios.consumo_frituras'),
            'frecuencia_frutas_verduras' => data_get($hechos, 'habitos_alimentarios.frecuencia_frutas_verduras'),
            'hambre_nocturna' => data_get($hechos, 'habitos_alimentarios.hambre_nocturna'),
            'alergias' => data_get($hechos, 'restricciones_alimentarias.alergias', []),
            'intolerancias' => data_get($hechos, 'restricciones_alimentarias.intolerancias', []),
            'alimentos_restringidos' => data_get(
                $hechos,
                'restricciones_alimentarias.alimentos_restringidos',
                []
            ),
            'alimentos_no_tolerados' => data_get(
                $hechos,
                'restricciones_alimentarias.alimentos_no_tolerados',
                []
            ),
            'alimentos_rechazados' => data_get(
                $hechos,
                'restricciones_alimentarias.alimentos_rechazados',
                []
            ),
            'alimentos_preferidos' => data_get($hechos, 'preferencias_alimentarias.alimentos_preferidos', []),
            'alimentos_no_preferidos' => data_get($hechos, 'preferencias_alimentarias.alimentos_no_preferidos', []),
            'comidas_preferidas' => data_get($hechos, 'preferencias_alimentarias.comidas_preferidas', []),
            'comidas_frecuentes' => data_get($hechos, 'preferencias_alimentarias.comidas_frecuentes', []),
            'preparaciones_preferidas' => data_get($hechos, 'preferencias_alimentarias.preparaciones_preferidas', []),
            'sabores_preferidos' => data_get($hechos, 'preferencias_alimentarias.sabores_preferidos', []),
        ];
    }

    private function cliente(): PendingRequest
    {
        return Http::baseUrl($this->baseUrl)
            ->acceptJson()
            ->asJson()
            ->timeout($this->timeout);
    }

    private function solicitar(
        string $metodo,
        string $ruta,
        array $datos = []
    ): array {
        try {
            $respuesta = $metodo === 'get'
                ? $this->cliente()->get($ruta)
                : $this->cliente()->post($ruta, $datos);

            $respuesta->throw();
            $contenido = $respuesta->json();

            if (! is_array($contenido)) {
                throw new RuntimeException(
                    'El microservicio experto devolvió una respuesta inválida.'
                );
            }

            return $contenido;
        } catch (ConnectionException $exception) {
            throw new RuntimeException(
                'No se pudo conectar con el microservicio experto ZEN.',
                0,
                $exception
            );
        } catch (RequestException $exception) {
            throw new RuntimeException(
                sprintf(
                    'El microservicio experto ZEN respondió con error HTTP %d.',
                    $exception->response->status()
                ),
                0,
                $exception
            );
        } catch (RuntimeException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            throw new RuntimeException(
                'Ocurrió un error al comunicarse con el microservicio experto ZEN.',
                0,
                $exception
            );
        }
    }
}
