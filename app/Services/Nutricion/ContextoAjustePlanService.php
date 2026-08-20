<?php

namespace App\Services\Nutricion;

use App\Models\Paciente;
use App\Services\Paciente\SeguimientoSintomasPacienteService;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ContextoAjustePlanService
{
    public function __construct(private readonly SeguimientoSintomasPacienteService $sintomas) {}

    public function construirParaPaciente(Paciente $paciente): array
    {
        $plan = $paciente->planesAlimentarios()->whereIn('estado_plan', ['activo', 'aprobado'])
            ->orderByRaw("CASE WHEN estado_plan = 'activo' THEN 0 ELSE 1 END")
            ->latest('id_plan_alimentario')->first();
        $seguimientos = collect();
        if ($plan) {
            $plan->load(['dias.comidas.componentes.receta.alimentos', 'dias.comidas.componentes.alimento']);
            $seguimientos = $paciente->seguimientosComidas()->where('id_plan_alimentario', $plan->getKey())
                ->with(['comidaPlanAlimentario.componentes.receta.alimentos', 'comidaPlanAlimentario.componentes.alimento'])->get();
        }

        $bien = collect(); $evitar = collect(); $alimentosEvitar = collect();
        $ingredientesNo = collect(); $dificiles = collect(); $problematicas = collect();
        foreach ($seguimientos as $s) {
            $comida = $s->comidaPlanAlimentario;
            foreach ($comida?->componentes ?? [] as $componente) {
                $receta = $componente->receta;
                $nombre = $receta?->nombre ?? $componente->alimento?->nombre ?? $componente->nombre_manual;
                $aceptada = in_array($s->estado_cumplimiento, ['completada', 'parcial'], true)
                    && ($s->estado_cumplimiento !== 'parcial' || (int) $s->porcentaje_consumido >= 70)
                    && $s->nivel_agrado === 'me_gusto' && $s->desea_repetir !== false
                    && ! $s->presento_molestia && $s->nivel_hambre_posterior !== 'alta' && ! $s->ansiedad_posterior;
                if ($receta && $aceptada) $bien->push($this->datoReceta($receta, 'Buena aceptación y sin molestias reportadas.'));

                $texto = $this->normalizar(($s->comentario_paciente ?? '').' '.($s->sugerencia_paciente ?? ''));
                $fraseNegativa = collect(['no quiero repetir', 'me cayo mal', 'no me gusto', 'me dio nauseas', 'me hincho'])->contains(fn ($f) => str_contains($texto, $f));
                $molestiaRelevante = $s->presento_molestia && in_array($s->intensidad_molestia, ['moderada', 'severa'], true);
                $noRealizada = $s->estado_cumplimiento === 'no_realizada' && in_array($s->motivo_no_cumplimiento, ['no_me_gusto', 'me_cayo_mal'], true);
                if ($receta && ($s->nivel_agrado === 'no_me_gusto' || $s->desea_repetir === false || $molestiaRelevante || $noRealizada || $fraseNegativa)) {
                    $motivos = array_filter([$s->nivel_agrado === 'no_me_gusto' ? 'Baja aceptación.' : null, $molestiaRelevante ? 'Molestia moderada o severa.' : null, ($s->desea_repetir === false || $fraseNegativa) ? 'El paciente no desea repetirla.' : null]);
                    $evitar->push($this->datoReceta($receta, implode(' ', $motivos), ($s->desea_repetir === false && $molestiaRelevante)));
                }
                $ingredientes = $receta?->alimentos ?? collect(array_filter([$componente->alimento]));
                if ($s->consiguio_ingredientes === false || $s->motivo_no_cumplimiento === 'no_tenia_ingredientes') {
                    $ingredientes->each(fn ($a) => $ingredientesNo->push(['id_alimento' => $a->getKey(), 'nombre' => $a->nombre, 'motivo' => 'Ingrediente no conseguido.']));
                    if ($nombre) $problematicas->push($nombre);
                }
                if ($s->dificultad_preparacion === 'dificil' && $receta) {
                    $dificiles->push($this->datoReceta($receta, 'Preparación reportada como difícil.'));
                    $problematicas->push($nombre);
                }
                if ($molestiaRelevante && in_array($s->tipo_molestia, ['hinchazon', 'acidez', 'diarrea', 'estrenimiento'], true)) {
                    $ingredientes->each(fn ($a) => $alimentosEvitar->push(['id_alimento' => $a->getKey(), 'nombre' => $a->nombre, 'motivo' => 'Revisar tolerancia; no constituye una alergia.']));
                    if ($nombre) $problematicas->push($nombre);
                }
            }
        }

        $tipos = []; $saciedad = [];
        foreach (['desayuno', 'almuerzo', 'merienda', 'cena'] as $tipo) {
            $delTipo = $seguimientos->filter(fn ($s) => $s->comidaPlanAlimentario?->tipo_comida === $tipo);
            if ($delTipo->filter(fn ($s) => $s->nivel_hambre_posterior === 'alta' || $s->ansiedad_posterior)->count() >= 2) $saciedad[$tipo] = true;
            if ($delTipo->filter(fn ($s) => $s->presento_molestia)->count() >= 2) $tipos[$tipo] = 'molestias frecuentes';
            elseif ($delTipo->where('estado_cumplimiento', 'no_realizada')->count() >= 2) $tipos[$tipo] = 'baja adherencia';
        }

        $indicadores = $this->sintomas->calcularIndicadores($paciente);
        $mensajes = $paciente->retroalimentacionesPaciente()->where('estado', 'activo')->where('rol_emisor', 'nutricionista')
            ->whereIn('tipo_retroalimentacion', ['ajuste_plan', 'recomendacion_general', 'adherencia', 'comida', 'sintomas'])
            ->where('created_at', '>=', now()->subDays(30))->latest()->limit(10)->pluck('mensaje')->all();
        $banderas = ['aumentar_saciedad' => false, 'mas_proteina' => false, 'mas_fibra' => false, 'menos_dulce' => false, 'simplificar_preparacion' => false];
        foreach ($mensajes as $mensaje) {
            $texto = $this->normalizar($mensaje);
            $banderas['aumentar_saciedad'] = $banderas['aumentar_saciedad'] || str_contains($texto, 'aumentar saciedad');
            $banderas['mas_proteina'] = $banderas['mas_proteina'] || str_contains($texto, 'mas proteina');
            $banderas['mas_fibra'] = $banderas['mas_fibra'] || str_contains($texto, 'mas fibra');
            $banderas['menos_dulce'] = $banderas['menos_dulce'] || str_contains($texto, 'menos dulce');
            $banderas['simplificar_preparacion'] = $banderas['simplificar_preparacion'] || str_contains($texto, 'simplificar preparacion');
        }

        $contexto = [
            'id_plan_considerado' => $plan?->getKey(), 'nombre_plan_considerado' => $plan?->nombre,
            'recetas_bien_aceptadas' => $this->unicos($bien, 'id_receta'), 'recetas_a_evitar' => $this->unicos($evitar, 'id_receta'),
            'alimentos_a_evitar' => $this->unicos($alimentosEvitar, 'id_alimento'),
            'preparaciones_problematicas' => $problematicas->filter()->unique()->values()->all(),
            'tipos_comida_problematicos' => $tipos, 'ingredientes_no_conseguidos' => $this->unicos($ingredientesNo, 'id_alimento'),
            'recetas_dificiles' => $this->unicos($dificiles, 'id_receta'), 'necesita_mas_saciedad' => $saciedad,
            'hambre_nocturna_frecuente' => (bool) ($indicadores['hambre_nocturna_frecuente'] ?? false),
            'ansiedad_comida_frecuente' => (bool) ($indicadores['ansiedad_comida_frecuente'] ?? false),
            'antojos_dulces_frecuentes' => (bool) ($indicadores['antojos_dulces_frecuentes'] ?? false),
            'hinchazon_frecuente' => (bool) ($indicadores['hinchazon_frecuente'] ?? false),
            'baja_energia_frecuente' => (bool) ($indicadores['baja_energia_frecuente'] ?? false),
            'sueno_deficiente_frecuente' => (bool) ($indicadores['sueno_deficiente_frecuente'] ?? false),
            'actividad_fisica_baja' => (bool) ($indicadores['actividad_fisica_baja'] ?? false),
            'recomendaciones_nutricionista' => array_values(array_unique(array_merge($mensajes, $indicadores['recomendaciones_para_nutricionista'] ?? []))),
            'banderas_profesionales' => $banderas,
        ];
        $contexto['resumen_ajuste'] = $this->resumen($contexto);
        return $contexto;
    }

    private function datoReceta($receta, string $motivo, bool $descartar = false): array { return ['id_receta' => $receta->getKey(), 'nombre' => $receta->nombre, 'tipo_comida' => $receta->tipo_comida, 'motivo' => $motivo, 'descartar_temporalmente' => $descartar]; }
    private function unicos(Collection $items, string $llave): array { return $items->unique($llave)->values()->all(); }
    private function normalizar(string $texto): string { return Str::of($texto)->ascii()->lower()->squish()->value(); }
    private function resumen(array $c): array
    {
        return array_values(array_filter([
            count($c['recetas_bien_aceptadas']) ? count($c['recetas_bien_aceptadas']).' receta(s) favorecida(s) por buena aceptación.' : null,
            count($c['recetas_a_evitar']) ? count($c['recetas_a_evitar']).' receta(s) marcadas para evitar o revisar.' : null,
            count($c['ingredientes_no_conseguidos']) ? 'Se consideró la disponibilidad de ingredientes.' : null,
            count($c['necesita_mas_saciedad']) ? 'Se detectaron tiempos de comida que necesitan mayor saciedad.' : null,
            count($c['recomendaciones_nutricionista']) ? 'Se incorporaron recomendaciones profesionales recientes.' : null,
        ]));
    }
}
