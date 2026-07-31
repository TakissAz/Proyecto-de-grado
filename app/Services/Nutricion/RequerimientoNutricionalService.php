<?php

namespace App\Services\Nutricion;

use App\Models\EvaluacionNutricional;
use App\Models\ObjetivoNutricional;
use App\Models\Paciente;
use App\Models\RequerimientoNutricional;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RequerimientoNutricionalService
{
    private const FACTORES_ACTIVIDAD = [
        'sedentario' => 1.20,
        'ligero' => 1.375,
        'moderado' => 1.55,
        'activo' => 1.725,
        'muy_activo' => 1.90,
    ];

    public function __construct(
        private readonly MotorReglasNutricionalesService $motorReglas,
    ) {}

    public function calcularYCrear(
        Paciente $paciente,
        int $nutricionistaId,
        ?string $observaciones = null
    ): RequerimientoNutricional {
        $evaluacion = $this->obtenerUltimaEvaluacionActiva($paciente);
        $objetivo = $this->obtenerUltimoObjetivoActivo($paciente);
        $this->validarEvaluacion($evaluacion);

        $peso = (float) $evaluacion->peso;
        $tallaMetros = (float) $evaluacion->talla;
        $tallaCentimetros = $tallaMetros * 100;
        $edad = $paciente->fecha_nacimiento?->age;
        $factorActividad = self::FACTORES_ACTIVIDAD[$evaluacion->nivel_actividad] ?? 1.20;
        $tmb = $this->calcularTmb($peso, $tallaCentimetros, $edad);
        $get = round($tmb * $factorActividad, 2);

        $hechos = [
            'objetivo_principal' => $objetivo?->objetivo_principal,
            'peso' => $peso,
            'talla' => $tallaMetros,
            'edad' => $edad,
            'nivel_actividad' => $evaluacion->nivel_actividad,
        ];

        $reglasIniciales = $this->motorReglas->evaluar($hechos);
        $ajusteCalorico = (float) $reglasIniciales['ajuste_calorico'];
        $caloriasPreliminares = round($get + $ajusteCalorico, 2);
        $reglas = $this->motorReglas->evaluar([
            ...$hechos,
            'calorias_objetivo' => $caloriasPreliminares,
        ]);

        $caloriasMinimas = $reglas['calorias_minimas'];
        $caloriasObjetivo = $caloriasMinimas === null
            ? $caloriasPreliminares
            : round(max($caloriasPreliminares, (float) $caloriasMinimas), 2);
        $porcentajeProteinas = (float) $reglas['porcentaje_proteinas'];
        $porcentajeCarbohidratos = (float) $reglas['porcentaje_carbohidratos'];
        $porcentajeGrasas = (float) $reglas['porcentaje_grasas'];
        $fibraDiaria = (float) $reglas['fibra_diaria'];
        $observacionesReglas = implode(' ', $reglas['observaciones']);
        $observacionesFinales = trim(implode(' ', array_filter([
            $observaciones,
            $observacionesReglas,
        ]))) ?: null;

        return DB::transaction(function () use (
            $paciente,
            $nutricionistaId,
            $evaluacion,
            $objetivo,
            $peso,
            $tallaMetros,
            $edad,
            $factorActividad,
            $tmb,
            $get,
            $ajusteCalorico,
            $caloriasObjetivo,
            $porcentajeProteinas,
            $porcentajeCarbohidratos,
            $porcentajeGrasas,
            $fibraDiaria,
            $observacionesFinales,
            $reglas,
        ) {
            return RequerimientoNutricional::create([
                'id_paciente' => $paciente->id_paciente,
                'id_nutricionista' => $nutricionistaId,
                'id_consulta_nutricional' => $evaluacion->id_consulta_nutricional,
                'id_evaluacion_nutricional' => $evaluacion->id_evaluacion_nutricional,
                'id_objetivo_nutricional' => $objetivo?->id_objetivo_nutricional,
                'fecha_calculo' => now()->toDateString(),
                'peso_referencia' => $peso,
                'talla_referencia' => $tallaMetros,
                'edad_referencia' => $edad,
                'nivel_actividad' => $evaluacion->nivel_actividad,
                'factor_actividad' => $factorActividad,
                'tmb' => $tmb,
                'get' => $get,
                'ajuste_calorico' => $ajusteCalorico,
                'calorias_objetivo' => $caloriasObjetivo,
                'proteinas_diarias' => round(($caloriasObjetivo * ($porcentajeProteinas / 100)) / 4, 2),
                'carbohidratos_diarios' => round(($caloriasObjetivo * ($porcentajeCarbohidratos / 100)) / 4, 2),
                'grasas_diarias' => round(($caloriasObjetivo * ($porcentajeGrasas / 100)) / 9, 2),
                'fibra_diaria' => $fibraDiaria,
                'porcentaje_proteinas' => $porcentajeProteinas,
                'porcentaje_carbohidratos' => $porcentajeCarbohidratos,
                'porcentaje_grasas' => $porcentajeGrasas,
                'metodo_calculo' => 'mifflin_st_jeor',
                'observaciones' => $observacionesFinales,
                'reglas_aplicadas' => $reglas['reglas_aplicadas'],
                'estado' => true,
            ]);
        });
    }

    public function obtenerUltimaEvaluacionActiva(Paciente $paciente): ?EvaluacionNutricional
    {
        return $paciente->evaluacionesNutricionales()
            ->where('estado', true)
            ->latest('fecha_evaluacion')
            ->latest('id_evaluacion_nutricional')
            ->first();
    }

    public function obtenerUltimoObjetivoActivo(Paciente $paciente): ?ObjetivoNutricional
    {
        return $paciente->objetivosNutricionales()
            ->where('estado', true)
            ->latest('id_objetivo_nutricional')
            ->first();
    }

    private function validarEvaluacion(?EvaluacionNutricional $evaluacion): void
    {
        if (! $evaluacion) {
            throw ValidationException::withMessages([
                'evaluacion' => 'El paciente no tiene una evaluación nutricional activa.',
            ]);
        }

        if ($evaluacion->peso === null || $evaluacion->talla === null) {
            throw ValidationException::withMessages([
                'evaluacion' => 'La evaluación nutricional debe tener peso y talla.',
            ]);
        }

        if ((float) $evaluacion->peso <= 0 || (float) $evaluacion->talla <= 0) {
            throw ValidationException::withMessages([
                'evaluacion' => 'El peso y la talla deben ser mayores que cero.',
            ]);
        }
    }

    private function calcularTmb(float $peso, float $tallaCentimetros, ?int $edad): float
    {
        return round(
            (10 * $peso) + (6.25 * $tallaCentimetros) - (5 * ($edad ?? 0)) - 161,
            2
        );
    }
}