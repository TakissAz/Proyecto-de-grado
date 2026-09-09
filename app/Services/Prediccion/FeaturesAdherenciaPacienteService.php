<?php

namespace App\Services\Prediccion;

use App\Models\Paciente;
use Illuminate\Support\Collection;
use Illuminate\Support\Carbon;

class FeaturesAdherenciaPacienteService
{
    private const TIPOS = ['desayuno', 'almuerzo', 'merienda', 'cena'];

    public function extraer(Paciente $paciente): array
    {
        $hoy = Carbon::today('America/La_Paz');
        $plan = $paciente->planesAlimentarios()->whereIn('estado_plan', ['activo', 'aprobado'])
            ->orderByRaw("CASE WHEN estado_plan = 'activo' THEN 0 ELSE 1 END")
            ->latest('id_plan_alimentario')->with('dias.comidas')->first();
        $estadoPeriodo = ! $plan ? 'sin_plan' : ($plan->fecha_inicio?->gt($hoy) ? 'no_iniciado' : ($plan->fecha_fin?->lt($hoy) ? 'finalizado' : 'en_curso'));
        $comidas = collect();
        $sintomas = collect();
        if ($plan && $estadoPeriodo !== 'no_iniciado') {
            $comidasQuery = $paciente->seguimientosComidas()->where('id_plan_alimentario', $plan->getKey())->whereDate('fecha_seguimiento', '<=', $hoy)
                ->with('comidaPlanAlimentario:id_comida_plan_alimentario,tipo_comida');
            $sintomasQuery = $paciente->seguimientosSintomas()->whereDate('fecha_registro', '<=', $hoy);
            if ($plan->fecha_inicio) {
                $comidasQuery->whereDate('fecha_seguimiento', '>=', $plan->fecha_inicio);
                $sintomasQuery->whereDate('fecha_registro', '>=', $plan->fecha_inicio);
            }
            if ($plan->fecha_fin) {
                $comidasQuery->whereDate('fecha_seguimiento', '<=', $plan->fecha_fin);
                $sintomasQuery->whereDate('fecha_registro', '<=', $plan->fecha_fin);
            }
            $comidas = $comidasQuery->get();
            $sintomas = $sintomasQuery->latest('fecha_registro')->limit(7)->get();
        }
        $planes = $paciente->planesAlimentarios()->get();
        $vencidas = $plan && $estadoPeriodo !== 'no_iniciado'
            ? $this->comidasVencidasSinRegistro($plan, $comidas)
            : collect();
        $adherencia = $this->adherencia($comidas, $vencidas->count());
        $porTipo = collect(self::TIPOS)->mapWithKeys(function (string $tipo) use ($comidas, $vencidas) {
            $registros = $comidas->filter(fn ($item) => $item->comidaPlanAlimentario?->tipo_comida === $tipo);
            return [$tipo => $this->adherencia($registros, $vencidas->where('tipo_comida', $tipo)->count())];
        });
        $frecuente = fn (callable $regla): bool => $sintomas->filter($regla)->count() >= 3;
        $fechas = $comidas->pluck('fecha_seguimiento')->filter()->map(fn ($fecha) => $fecha->toDateString())->unique();

        return [
            'adherencia_promedio' => $adherencia,
            'adherencia_desayuno' => $porTipo['desayuno'],
            'adherencia_almuerzo' => $porTipo['almuerzo'],
            'adherencia_merienda' => $porTipo['merienda'],
            'adherencia_cena' => $porTipo['cena'],
            'seguimientos_por_tipo' => collect(self::TIPOS)->mapWithKeys(fn ($tipo) => [$tipo => $comidas->filter(fn ($item) => $item->comidaPlanAlimentario?->tipo_comida === $tipo)->count()])->all(),
            'comidas_no_realizadas' => $comidas->where('estado_cumplimiento', 'no_realizada')->count(),
            'comidas_parciales' => $comidas->where('estado_cumplimiento', 'parcial')->count(),
            'comidas_reemplazadas' => $comidas->where('estado_cumplimiento', 'reemplazada')->count(),
            'comidas_sin_registro_vencidas' => $vencidas->count(),
            'dias_sin_registro' => $comidas->isEmpty() ? 0 : $this->diasTranscurridosSinRegistro($plan, $hoy, $fechas),
            'recetas_rechazadas' => $comidas->where('nivel_agrado', 'no_me_gusto')->count(),
            'recetas_no_desea_repetir' => $comidas->whereStrict('desea_repetir', false)->count(),
            'molestias_digestivas' => $comidas->where('presento_molestia', true)->count(),
            'molestias_moderadas_severas' => $comidas->filter(fn ($s) => $s->presento_molestia && in_array($s->intensidad_molestia, ['moderada', 'severa'], true))->count(),
            'hambre_posterior_alta' => $comidas->where('nivel_hambre_posterior', 'alta')->count(),
            'ansiedad_posterior' => $comidas->where('ansiedad_posterior', true)->count(),
            'ingredientes_no_conseguidos' => $comidas->whereStrict('consiguio_ingredientes', false)->count(),
            'hambre_nocturna_frecuente' => $frecuente(fn ($s) => $s->hambre_nocturna),
            'antojos_dulces_frecuentes' => $frecuente(fn ($s) => in_array($s->antojos_dulces, ['moderado', 'alto'], true)),
            'ansiedad_comida_frecuente' => $frecuente(fn ($s) => in_array($s->ansiedad_por_comida, ['moderada', 'alta'], true)),
            'hinchazon_frecuente' => $frecuente(fn ($s) => in_array($s->hinchazon_abdominal, ['moderada', 'severa'], true)),
            'baja_energia_frecuente' => $frecuente(fn ($s) => $s->nivel_energia === 'baja'),
            'sueno_deficiente_frecuente' => $frecuente(fn ($s) => in_array($s->calidad_sueno, ['mala', 'regular'], true)),
            'actividad_fisica_baja' => $frecuente(fn ($s) => $s->actividad_fisica === 'ninguna'),
            'retroalimentaciones_no_leidas' => $paciente->retroalimentacionesPaciente()->where('visible_para_paciente', true)->where('leido_por_paciente', false)->count(),
            'planes_finalizados' => $planes->where('estado_plan', 'finalizado')->count(),
            'planes_rechazados' => $planes->where('estado_plan', 'rechazado')->count(),
            'planes_generados' => $planes->count(),
            'tiene_datos' => $comidas->isNotEmpty() || $sintomas->isNotEmpty() || $vencidas->isNotEmpty(),
            'estado_periodo' => $estadoPeriodo,
            'id_plan_alimentario' => $plan?->getKey(),
            'fecha_inicio_plan' => $plan?->fecha_inicio?->toDateString(),
            'fecha_fin_plan' => $plan?->fecha_fin?->toDateString(),
        ];
    }

    private function diasTranscurridosSinRegistro($plan, Carbon $hoy, Collection $fechas): int
    {
        if (! $plan?->fecha_inicio) return 0;
        $fin = $plan->fecha_fin && $plan->fecha_fin->lt($hoy) ? $plan->fecha_fin : $hoy;
        if ($plan->fecha_inicio->gt($fin)) return 0;
        return collect(range(0, $plan->fecha_inicio->diffInDays($fin)))
            ->map(fn ($dia) => $plan->fecha_inicio->copy()->addDays($dia)->toDateString())
            ->filter(fn ($fecha) => ! $fechas->contains($fecha))->count();
    }

    private function adherencia(Collection $registros, int $sinRegistroVencidas = 0): float
    {
        $evaluables = $registros->count() + $sinRegistroVencidas;
        if ($evaluables === 0) return 0.0;
        $puntos = $registros->sum(fn ($s) => match ($s->estado_cumplimiento) {
            'completada' => 1,
            'parcial' => $s->porcentaje_consumido !== null ? $s->porcentaje_consumido / 100 : .5,
            'reemplazada' => .5,
            default => 0,
        });
        return round($puntos / $evaluables * 100, 1);
    }

    private function comidasVencidasSinRegistro($plan, Collection $registros): Collection
    {
        $ahora = Carbon::now('America/La_Paz');
        $registradas = $registros->pluck('id_comida_plan_alimentario');

        return $plan->dias->flatMap(function ($dia) use ($ahora) {
            if (! $dia->fecha || $dia->fecha->gt($ahora->copy()->startOfDay())) return collect();

            return $dia->comidas->filter(function ($comida) use ($dia, $ahora) {
                if ($dia->fecha->lt($ahora->copy()->startOfDay())) return true;
                if (! $comida->hora_sugerida) return false;

                return Carbon::parse($dia->fecha->toDateString().' '.$comida->hora_sugerida, 'America/La_Paz')
                    ->addHour()->lte($ahora);
            });
        })->reject(fn ($comida) => $registradas->contains($comida->getKey()))->values();
    }
}
