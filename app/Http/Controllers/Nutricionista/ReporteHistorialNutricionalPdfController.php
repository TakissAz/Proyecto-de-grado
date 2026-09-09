<?php

namespace App\Http\Controllers\Nutricionista;

use App\Http\Controllers\Controller;
use App\Models\Paciente;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReporteHistorialNutricionalPdfController extends Controller
{
    private const TIPOS = [
        'evaluaciones' => ['Evaluaciones nutricionales', 'evaluacionesNutricionales', 'fecha_evaluacion', [
            'peso'=>'Peso (kg)', 'talla'=>'Talla (m)', 'imc'=>'IMC', 'circunferencia_cintura'=>'Cintura (cm)',
            'circunferencia_cadera'=>'Cadera (cm)', 'indice_cintura_cadera'=>'ICC',
            'porcentaje_grasa'=>'Grasa (%)', 'masa_muscular'=>'Masa muscular (kg)', 'nivel_actividad'=>'Actividad',
        ]],
        'habitos' => ['Hábitos alimentarios', 'habitosAlimentarios', 'created_at', [
            'comidas_por_dia'=>'Comidas/día', 'consumo_agua_litros'=>'Agua (L)', 'consumo_azucar'=>'Azúcar',
            'consumo_ultraprocesados'=>'Ultraprocesados', 'consumo_frituras'=>'Frituras',
            'consumo_bebidas_azucaradas'=>'Bebidas azucaradas', 'frecuencia_frutas_verduras'=>'Frutas/verduras',
            'horarios_regulares'=>'Horarios regulares', 'consume_desayuno'=>'Desayuna', 'cena_tardia'=>'Cena tardía',
            'ansiedad_por_comida'=>'Ansiedad', 'hambre_nocturna'=>'Hambre nocturna',
        ]],
        'preferencias' => ['Preferencias alimentarias', 'preferenciasAlimentarias', 'created_at', [
            'alimentos_preferidos'=>'Preferidos', 'alimentos_no_preferidos'=>'No preferidos',
            'comidas_preferidas'=>'Comidas preferidas', 'comidas_frecuentes'=>'Comidas frecuentes',
            'preparaciones_preferidas'=>'Preparaciones', 'sabores_preferidos'=>'Sabores',
        ]],
        'restricciones' => ['Restricciones alimentarias', 'restriccionesAlimentarias', 'created_at', [
            'alergias'=>'Alergias', 'intolerancias'=>'Intolerancias', 'alimentos_restringidos'=>'Restringidos',
            'alimentos_no_tolerados'=>'No tolerados', 'alimentos_rechazados'=>'Rechazados',
        ]],
        'requerimientos' => ['Requerimientos nutricionales', 'requerimientosNutricionales', 'created_at', [
            'calorias_objetivo'=>'Calorías objetivo', 'tmb'=>'TMB (kcal)', 'get'=>'GET (kcal)',
            'ajuste_calorico'=>'Ajuste (kcal)', 'peso_referencia'=>'Peso de referencia (kg)',
            'talla_referencia'=>'Talla de referencia (m)', 'nivel_actividad'=>'Actividad',
            'proteinas_diarias'=>'Proteínas (g)', 'carbohidratos_diarios'=>'Carbohidratos (g)',
            'grasas_diarias'=>'Grasas (g)', 'fibra_diaria'=>'Fibra (g)', 'metodo_calculo'=>'Método',
        ]],
        'objetivos' => ['Objetivos nutricionales', 'objetivosNutricionales', 'created_at', [
            'objetivo_principal'=>'Objetivo', 'prioridad'=>'Prioridad', 'enfoque_nutricional'=>'Enfoque',
            'meta_peso'=>'Meta peso (kg)', 'meta_cintura'=>'Meta cintura (cm)',
            'plazo_semanas'=>'Plazo (semanas)', 'objetivo_secundario'=>'Objetivo secundario',
        ]],
    ];

    public function __invoke(Request $request, Paciente $paciente, string $tipo)
    {
        $paciente->loadMissing('user');
        validator(['tipo'=>$tipo], ['tipo'=>['required', Rule::in(array_keys(self::TIPOS))]])->validate();
        $filtros = $request->validate(['desde'=>['nullable','date'], 'hasta'=>['nullable','date','after_or_equal:desde']]);
        [$titulo, $relacion, $fecha, $campos] = self::TIPOS[$tipo];
        $consulta = $paciente->{$relacion}();
        if ($filtros['desde'] ?? null) $consulta->whereDate($fecha, '>=', $filtros['desde']);
        if ($filtros['hasta'] ?? null) $consulta->whereDate($fecha, '<=', $filtros['hasta']);
        $registros = $consulta->latest($fecha)->get();

        if ($tipo === 'habitos') {
            $registros->each(function ($registro): void {
                $niveles = ['nunca'=>0, 'ocasional'=>1, 'frecuente'=>2, 'diario'=>3];
                $riesgo = collect(['consumo_azucar','consumo_ultraprocesados','consumo_frituras','consumo_bebidas_azucaradas'])
                    ->sum(fn ($campo) => $niveles[(string) ($registro->{$campo} ?? 'nunca')] ?? 0);
                $alertas = collect([$registro->cena_tardia, $registro->ansiedad_por_comida, $registro->hambre_nocturna, ! $registro->consume_desayuno, ! $registro->horarios_regulares])->filter()->count();
                $registro->setAttribute('indice_habitos', max(0, round(100 - ($riesgo / 12) * 65 - min($alertas, 5) * 7)));
            });
            $campos = ['indice_habitos'=>'Índice de hábitos (0–100)'] + $campos;
        }

        $camposEvolucion = match ($tipo) {
            'evaluaciones' => ['peso', 'imc', 'circunferencia_cintura', 'porcentaje_grasa', 'masa_muscular'],
            'habitos' => ['indice_habitos'],
            'requerimientos' => ['calorias_objetivo', 'tmb', 'get', 'peso_referencia'],
            default => collect($campos)->keys()->all(),
        };
        $cronologicos = $registros->sortBy($fecha)->values();
        $series = collect($camposEvolucion)->mapWithKeys(function (string $campo) use ($cronologicos, $fecha): array {
            $puntos = $cronologicos->filter(fn ($registro) => is_numeric($registro->{$campo}))
                ->map(fn ($registro) => [
                    'fecha' => \Illuminate\Support\Carbon::parse($registro->{$fecha})->format('d/m/Y'),
                    'valor' => (float) $registro->{$campo},
                ])->values();
            if ($puntos->count() < 2) return [];
            $valores = $puntos->pluck('valor');
            return [$campo => [
                'min'=>$valores->min(), 'max'=>$valores->max(), 'inicial'=>$valores->first(),
                'ultimo'=>$valores->last(), 'cambio'=>$valores->last()-$valores->first(), 'puntos'=>$puntos->all(),
            ]];
        })->all();

        // ── Cambios entre registros consecutivos (solo hábitos) ─────────
        $cambiosConsecutivos = collect();
        if ($tipo === 'habitos') {
            $niveles = ['nunca' => 0, 'ocasional' => 1, 'frecuente' => 2, 'diario' => 3];
            $nivelesLabel = ['nunca' => 'Nunca', 'ocasional' => 'Ocasional', 'frecuente' => 'Frecuente', 'diario' => 'Diario'];

            // campos de frecuencia: mayor nivel = más riesgo (excepto frutas_verduras que es invertido)
            $camposFrecuencia = [
                'consumo_azucar'             => ['label' => 'Azúcar',              'invertido' => false],
                'consumo_ultraprocesados'    => ['label' => 'Ultraprocesados',      'invertido' => false],
                'consumo_frituras'           => ['label' => 'Frituras',             'invertido' => false],
                'consumo_bebidas_azucaradas' => ['label' => 'Bebidas azucaradas',   'invertido' => false],
                'frecuencia_frutas_verduras' => ['label' => 'Frutas y verduras',    'invertido' => true],
            ];
            // campos booleanos: true=bueno / false=bueno según campo
            $camposBooleanos = [
                'horarios_regulares'  => ['label' => 'Horarios regulares', 'bueno' => true],
                'consume_desayuno'    => ['label' => 'Desayuna',           'bueno' => true],
                'cena_tardia'         => ['label' => 'Cena tardía',        'bueno' => false],
                'ansiedad_por_comida' => ['label' => 'Ansiedad por comida','bueno' => false],
                'hambre_nocturna'     => ['label' => 'Hambre nocturna',    'bueno' => false],
            ];
            // campos numéricos simples
            $camposNumericos = [
                'comidas_por_dia'       => ['label' => 'Comidas/día',  'mayor_es_mejor' => true],
                'consumo_agua_litros'   => ['label' => 'Agua (L)',     'mayor_es_mejor' => true],
            ];

            // Recorremos del registro más reciente hacia atrás (igual que en la vista web)
            // $registros ya está ordenado latest(), así que cronologicos[0] = más antiguo
            $cronologicosList = $cronologicos->values();
            for ($i = 1; $i < $cronologicosList->count(); $i++) {
                $ant = $cronologicosList[$i - 1]; // anterior en el tiempo
                $act = $cronologicosList[$i];     // más reciente
                $diffs = [];

                // Numéricos
                foreach ($camposNumericos as $campo => $meta) {
                    $vA = (float) ($ant->{$campo} ?? 0);
                    $vB = (float) ($act->{$campo} ?? 0);
                    if (abs($vA - $vB) >= 0.05) {
                        $mejora = $meta['mayor_es_mejor'] ? $vB > $vA : $vB < $vA;
                        $diffs[] = ['label' => $meta['label'], 'antes' => number_format($vA, 2, ',', '.'), 'despues' => number_format($vB, 2, ',', '.'), 'mejora' => $mejora];
                    }
                }

                // Frecuencias
                foreach ($camposFrecuencia as $campo => $meta) {
                    $nvA = $niveles[(string) ($ant->{$campo} ?? 'nunca')] ?? 0;
                    $nvB = $niveles[(string) ($act->{$campo} ?? 'nunca')] ?? 0;
                    if ($nvA !== $nvB) {
                        $mejora = $meta['invertido'] ? $nvB > $nvA : $nvB < $nvA;
                        $diffs[] = [
                            'label'   => $meta['label'],
                            'antes'   => $nivelesLabel[(string) ($ant->{$campo} ?? 'nunca')] ?? '—',
                            'despues' => $nivelesLabel[(string) ($act->{$campo} ?? 'nunca')] ?? '—',
                            'mejora'  => $mejora,
                        ];
                    }
                }

                // Booleanos
                foreach ($camposBooleanos as $campo => $meta) {
                    $vA = (bool) ($ant->{$campo} ?? false);
                    $vB = (bool) ($act->{$campo} ?? false);
                    if ($vA !== $vB) {
                        $mejora = $meta['bueno'] ? ($vB && ! $vA) : (! $vB && $vA);
                        $diffs[] = [
                            'label'   => $meta['label'],
                            'antes'   => $vA ? 'Sí' : 'No',
                            'despues' => $vB ? 'Sí' : 'No',
                            'mejora'  => $mejora,
                        ];
                    }
                }

                // Índice
                $idxA = (int) ($ant->indice_habitos ?? 0);
                $idxB = (int) ($act->indice_habitos ?? 0);

                $cambiosConsecutivos->push([
                    'numero'   => $i + 1,                    // número del registro "actual"
                    'fecha_antes'  => \Carbon\Carbon::parse($ant->{$fecha})->timezone('America/La_Paz')->format('d/m/Y'),
                    'fecha_actual' => \Carbon\Carbon::parse($act->{$fecha})->timezone('America/La_Paz')->format('d/m/Y'),
                    'indice_antes' => $idxA,
                    'indice_actual'=> $idxB,
                    'delta_indice' => $idxB - $idxA,
                    'diffs'        => $diffs,
                ]);
            }
        }

        return Pdf::loadView('pdf.nutricion.reporte-historial-nutricional', compact(
            'paciente', 'titulo', 'tipo', 'fecha', 'campos', 'registros', 'series', 'filtros', 'cambiosConsecutivos'
        ) + ['profesional'=>$request->user(), 'fechaGeneracion'=>now()])
            ->setPaper('a4')->stream("historial-{$tipo}-paciente-{$paciente->getKey()}.pdf");
    }
}
