<?php

namespace App\Services\Prediccion;

use App\Models\Paciente;
use Illuminate\Support\Collection;

class FeaturesAdherenciaPacienteService
{
    private const TIPOS = ['desayuno', 'almuerzo', 'merienda', 'cena'];

    public function extraer(Paciente $paciente): array
    {
        $comidas = $paciente->seguimientosComidas()->with('comidaPlanAlimentario:id_comida_plan_alimentario,tipo_comida')->get();
        $sintomas = $paciente->seguimientosSintomas()->latest('fecha_registro')->limit(7)->get();
        $planes = $paciente->planesAlimentarios()->get();
        $adherencia = $this->adherencia($comidas);
        $porTipo = collect(self::TIPOS)->mapWithKeys(function (string $tipo) use ($comidas) {
            $registros = $comidas->filter(fn ($item) => $item->comidaPlanAlimentario?->tipo_comida === $tipo);
            return [$tipo => $this->adherencia($registros)];
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
            'dias_sin_registro' => $comidas->isEmpty() ? 0 : collect(range(0, 6))->filter(fn ($dia) => ! $fechas->contains(today()->subDays($dia)->toDateString()))->count(),
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
            'tiene_datos' => $comidas->isNotEmpty() || $sintomas->isNotEmpty(),
        ];
    }

    private function adherencia(Collection $registros): float
    {
        if ($registros->isEmpty()) return 0.0;
        $puntos = $registros->sum(fn ($s) => match ($s->estado_cumplimiento) {
            'completada' => 1,
            'parcial' => $s->porcentaje_consumido !== null ? $s->porcentaje_consumido / 100 : .5,
            'reemplazada' => .5,
            default => 0,
        });
        return round($puntos / $registros->count() * 100, 1);
    }
}
