<?php

namespace App\Services\Prediccion;

use App\Models\Paciente;

class PredictorRiesgoAdherenciaService
{
    public function __construct(private readonly FeaturesAdherenciaPacienteService $features) {}

    public function predecir(Paciente $paciente): array
    {
        $datos = $this->features->extraer($paciente);
        $score = 0;
        $factores = [];
        $sumar = function (bool $condicion, int $puntos, string $factor) use (&$score, &$factores): void {
            if ($condicion) { $score += $puntos; $factores[] = $factor; }
        };

        if ($datos['tiene_datos']) {
            $sumar($datos['adherencia_promedio'] < 60, 30, 'Adherencia promedio menor al 60%');
            $sumar($datos['adherencia_promedio'] >= 60 && $datos['adherencia_promedio'] < 75, 15, 'Adherencia promedio entre 60% y 75%');
            foreach (['desayuno' => 10, 'almuerzo' => 8, 'merienda' => 8, 'cena' => 8] as $tipo => $peso) {
                $sumar($datos['adherencia_'.$tipo] < 50 && ($datos['seguimientos_por_tipo'][$tipo] ?? 0) > 0, $peso, 'Baja adherencia en '.($tipo === 'almuerzo' ? 'almuerzos' : $tipo.'s'));
            }
            $sumar($datos['dias_sin_registro'] >= 3, 12, 'Tres o más días sin registro reciente');
            $sumar($datos['recetas_rechazadas'] >= 2, 8, 'Recetas rechazadas repetidamente');
            $sumar($datos['molestias_moderadas_severas'] >= 2, 10, 'Molestias digestivas moderadas o severas');
            $sumar($datos['hambre_posterior_alta'] >= 2, 8, 'Hambre posterior alta frecuente');
            $sumar($datos['ansiedad_posterior'] >= 2, 8, 'Ansiedad posterior frecuente');
            $sumar($datos['ingredientes_no_conseguidos'] >= 2, 8, 'Ingredientes no conseguidos frecuentemente');
            foreach (['hambre_nocturna_frecuente' => ['Hambre nocturna frecuente', 6], 'antojos_dulces_frecuentes' => ['Antojos dulces frecuentes', 6], 'ansiedad_comida_frecuente' => ['Ansiedad por comida frecuente', 6], 'sueno_deficiente_frecuente' => ['Sueño deficiente frecuente', 4], 'actividad_fisica_baja' => ['Actividad física baja', 4]] as $campo => [$texto, $peso]) $sumar($datos[$campo], $peso, $texto);
            $sumar($datos['retroalimentaciones_no_leidas'] >= 2, 4, 'Retroalimentaciones profesionales no leídas');
        }

        $score = min($score, 100);
        $probabilidad = $score / 100;
        $riesgo = $probabilidad >= .65 ? 'alto' : ($probabilidad >= .35 ? 'medio' : 'bajo');
        $recomendacion = match ($riesgo) {
            'alto' => 'Priorizar un plan más simple, con recetas aceptadas, ingredientes accesibles y mayor saciedad.',
            'medio' => 'Revisar comidas con menor cumplimiento y reforzar seguimiento.',
            default => 'Continuar con el plan actual y mantener el registro de seguimiento.',
        };
        if ($datos['ingredientes_no_conseguidos'] >= 2) $recomendacion .= ' Simplificar la lista de compras.';
        if ($datos['hambre_posterior_alta'] >= 2) $recomendacion .= ' Aumentar proteína y fibra en comidas críticas.';
        if ($datos['molestias_moderadas_severas'] >= 2) $recomendacion .= ' Evitar recetas mal toleradas.';
        if (in_array('Baja adherencia en desayunos', $factores, true)) $recomendacion .= ' Usar desayunos rápidos.';

        return [
            'riesgo_baja_adherencia' => $riesgo,
            'probabilidad_riesgo' => round($probabilidad, 2),
            'score' => $score,
            'factores_influyentes' => $factores,
            'recomendacion_predictiva' => $recomendacion,
            'datos_utilizados' => $datos,
            'modelo' => ['tipo' => 'baseline_heuristico', 'nombre' => 'Predictor inicial de riesgo de baja adherencia', 'version' => '1.0.0', 'preparado_para' => 'Random Forest'],
            'version_modelo' => '1.0.0',
            'fecha_prediccion' => now()->toISOString(),
            'sin_datos' => ! $datos['tiene_datos'],
        ];
    }

}
