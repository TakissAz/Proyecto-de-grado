<?php

namespace App\Services\Nutricion;

use App\Models\Receta;
use App\Models\RecomendacionNutricionalExperta;
use Illuminate\Support\Str;

class ClasificadorRecetasSistemaExpertoService
{
    /**
     * Clasifica todas las recetas activas según su compatibilidad clínica,
     * alimentaria y nutricional con la recomendación experta.
     */
    public function clasificarParaRecomendacion(
        RecomendacionNutricionalExperta $recomendacion,
        ?string $tipoComida = null,
        array $contextoAjuste = []
    ): array {
        $contexto = $this->construirContexto($recomendacion);
        $tipoSolicitado = $this->normalizar($tipoComida);

        return Receta::query()
            ->whereRaw('LOWER(TRIM(estado)) = ?', ['activo'])
            ->with(['alimentos' => fn ($consulta) => $consulta
                ->whereRaw('LOWER(TRIM(alimentos.estado)) = ?', ['activo'])])
            ->get()
            ->map(fn (Receta $receta): array => $this->clasificarReceta(
                $receta,
                $contexto,
                $tipoSolicitado,
                $contextoAjuste
            ))
            ->sort(function (array $a, array $b): int {
                if ($a['descartada'] !== $b['descartada']) {
                    return $a['descartada'] <=> $b['descartada'];
                }

                return $b['puntaje'] <=> $a['puntaje'];
            })
            ->values()
            ->all();
    }

    private function clasificarReceta(Receta $receta, array $contexto, string $tipoSolicitado, array $ajuste): array
    {
        $puntaje = 0;
        $motivos = [];
        $advertencias = [];
        $razonesDescarte = [];
        $textoReceta = $this->textoReceta($receta);
        $tipoReceta = $this->normalizar($receta->tipo_comida);
        $calorias = max((float) $receta->calorias_totales, 1);
        $proteinas = (float) $receta->proteinas_totales;
        $carbohidratos = (float) $receta->carbohidratos_totales;
        $grasas = (float) $receta->grasas_totales;
        $fibra = (float) $receta->fibra_total;
        $porcentajeProteina = ($proteinas * 4 / $calorias) * 100;
        $porcentajeCarbohidratos = ($carbohidratos * 4 / $calorias) * 100;
        $porcentajeGrasas = ($grasas * 9 / $calorias) * 100;

        foreach ($contexto['restricciones'] as $categoria => $valores) {
            foreach ($valores as $valor) {
                if ($this->textoCoincide($textoReceta, $valor)) {
                    $razonesDescarte[] = sprintf(
                        'Contiene %s registrado en %s.',
                        $valor,
                        str_replace('_', ' ', $categoria)
                    );
                }
            }
        }

        if ($tipoSolicitado !== '') {
            if ($tipoReceta === $tipoSolicitado) {
                $puntaje += 20;
                $motivos[] = 'Coincide con el tipo de comida solicitado.';
            } else {
                $puntaje -= 10;
                $advertencias[] = 'No coincide con el tipo de comida solicitado.';
            }
        }

        if ($this->coincideConLista($textoReceta, array_merge(
            $contexto['preferencias']['comidas_preferidas'],
            $contexto['preferencias']['comidas_frecuentes']
        ))) {
            $puntaje += 15;
            $motivos[] = 'Coincide con comidas preferidas o frecuentes.';
        }

        if ($this->coincideConLista($textoReceta, $contexto['preferencias']['alimentos_preferidos'])) {
            $puntaje += 10;
            $motivos[] = 'Incluye alimentos preferidos por el paciente.';
        }

        if ($this->coincideConLista($textoReceta, $contexto['preferencias']['alimentos_no_preferidos'])) {
            $puntaje -= 10;
            $advertencias[] = 'Incluye alimentos no preferidos por el paciente.';
        }

        if ($porcentajeProteina >= 20) {
            $puntaje += 15;
            $motivos[] = 'Aporta una proporción alta de proteína respecto a sus calorías.';
        }

        if ($fibra >= 5) {
            $puntaje += 10;
            $motivos[] = 'Aporta buena cantidad de fibra.';
        } elseif ($fibra < 3) {
            $puntaje -= 10;
            $advertencias[] = 'El aporte de fibra es bajo.';
        }

        $carbohidratosModerados = $porcentajeCarbohidratos <= 45;
        $carbohidratosMuyAltos = $porcentajeCarbohidratos > 60;
        if ($carbohidratosModerados) {
            $puntaje += 10;
            $motivos[] = 'Presenta una proporción moderada de carbohidratos.';
        }

        if ($contexto['ri_confirmada']) {
            if ($carbohidratosModerados) {
                $puntaje += 15;
                $motivos[] = 'Compatible con resistencia a la insulina por su carga moderada de carbohidratos.';
            } elseif ($carbohidratosMuyAltos) {
                $puntaje -= 15;
                $advertencias[] = 'Los carbohidratos son muy altos para resistencia a la insulina.';
            }
        }

        if ($contexto['bajo_indice_glucemico'] && ! $carbohidratosMuyAltos) {
            $puntaje += 15;
            $motivos[] = 'Es compatible con el enfoque de bajo índice glucémico.';
        }

        if ($contexto['pmos_confirmado'] && ($fibra >= 5 || $this->esAntiinflamatoria($textoReceta))) {
            $puntaje += 10;
            $motivos[] = 'Su perfil de fibra o ingredientes es favorable para PMOS.';
        }

        if ($contexto['ansiedad_por_comida'] && ($porcentajeProteina >= 20 || $fibra >= 5)) {
            $puntaje += 10;
            $motivos[] = 'Su proteína o fibra puede favorecer la saciedad.';
        }

        if ($porcentajeGrasas > 45 && ! in_array($tipoReceta, ['almuerzo', 'cena'], true)) {
            $puntaje -= 10;
            $advertencias[] = 'El aporte de grasas es alto para este tiempo de comida.';
        }

        $idsBien = collect($ajuste['recetas_bien_aceptadas'] ?? [])->pluck('id_receta')->map(fn ($id) => (int) $id);
        $evitada = collect($ajuste['recetas_a_evitar'] ?? [])->first(fn ($item) => (int) ($item['id_receta'] ?? 0) === (int) $receta->getKey());
        if ($idsBien->contains((int) $receta->getKey())) { $puntaje += 10; $motivos[] = 'Receta bien aceptada anteriormente por el paciente.'; }
        if ($evitada) {
            $puntaje -= 80; $advertencias[] = 'Penalizada por baja aceptación o tolerancia en el seguimiento.';
            if ($evitada['descartar_temporalmente'] ?? false) $razonesDescarte[] = 'Evitada temporalmente por seguimiento del paciente.';
        }
        if ($this->coincideConItems($textoReceta, $ajuste['alimentos_a_evitar'] ?? [])) { $puntaje -= 40; $advertencias[] = 'Contiene alimentos cuya tolerancia debe revisarse.'; }
        if (collect($ajuste['recetas_dificiles'] ?? [])->pluck('id_receta')->map(fn ($id) => (int) $id)->contains((int) $receta->getKey())) { $puntaje -= 30; $advertencias[] = 'Preparación reportada como difícil.'; }
        if ($this->coincideConItems($textoReceta, $ajuste['ingredientes_no_conseguidos'] ?? [])) { $puntaje -= 20; $advertencias[] = 'Contiene ingredientes que no se consiguieron anteriormente.'; }
        $necesitaSaciedad = (bool) data_get($ajuste, "necesita_mas_saciedad.{$tipoReceta}", false);
        $altaSaciedad = $porcentajeProteina >= 20 || $fibra >= 5;
        if ($necesitaSaciedad && $altaSaciedad) { $puntaje += 10; $motivos[] = 'Se priorizó mayor saciedad para este tiempo de comida.'; }
        elseif ($necesitaSaciedad) { $puntaje -= 20; $advertencias[] = 'Proteína o fibra baja ante hambre posterior frecuente.'; }
        if (($ajuste['ansiedad_comida_frecuente'] ?? false) || ($ajuste['antojos_dulces_frecuentes'] ?? false)) {
            if ($altaSaciedad) { $puntaje += 10; $motivos[] = 'La proteína o fibra favorece el control de ansiedad o antojos.'; }
        }
        if (($ajuste['actividad_fisica_baja'] ?? false) && ((int) $receta->tiempo_preparacion_minutos <= 30 || $calorias <= 450)) { $puntaje += 5; $motivos[] = 'Opción simple o liviana acorde al contexto reciente.'; }
        if (($ajuste['tipos_comida_problematicos'][$tipoReceta] ?? null) === 'molestias frecuentes' && $porcentajeGrasas > 40) { $puntaje -= 20; $advertencias[] = 'Alta en grasa para un tiempo con molestias frecuentes.'; }

        return [
            'receta' => $receta,
            'puntaje' => $puntaje,
            'motivos' => array_values(array_unique($motivos)),
            'advertencias' => array_values(array_unique($advertencias)),
            'descartada' => $razonesDescarte !== [],
            'razones_descarte' => array_values(array_unique($razonesDescarte)),
        ];
    }

    private function coincideConItems(string $texto, array $items): bool
    {
        return collect($items)->contains(fn ($item) => $this->textoCoincide($texto, $this->normalizar(is_array($item) ? ($item['nombre'] ?? '') : $item)));
    }

    private function construirContexto(RecomendacionNutricionalExperta $recomendacion): array
    {
        $hechos = $recomendacion->hechos_utilizados ?? [];
        $restricciones = [];
        foreach (['alergias', 'intolerancias', 'alimentos_restringidos', 'alimentos_no_tolerados', 'alimentos_rechazados'] as $campo) {
            $restricciones[$campo] = $this->listaNormalizada(
                data_get($hechos, $campo, data_get($hechos, "restricciones_alimentarias.{$campo}", []))
            );
        }

        // Las restricciones emitidas por el motor también son incompatibilidades estrictas.
        $preferencias = [];
        foreach (['alimentos_preferidos', 'alimentos_no_preferidos', 'comidas_preferidas', 'comidas_frecuentes', 'preparaciones_preferidas', 'sabores_preferidos'] as $campo) {
            $preferencias[$campo] = $this->listaNormalizada(
                data_get($hechos, $campo, data_get($hechos, "preferencias_alimentarias.{$campo}", []))
            );
        }

        return [
            'restricciones' => $restricciones,
            'preferencias' => $preferencias,
            'pmos_confirmado' => (bool) data_get($hechos, 'diagnostico_pmos_confirmado', data_get($hechos, 'diagnostico_pmos.diagnostico_confirmado', false)),
            'ri_confirmada' => (bool) data_get($hechos, 'resistencia_insulina_confirmada', data_get($hechos, 'diagnostico_resistencia_insulina.resistencia_confirmada', false)),
            'ansiedad_por_comida' => (bool) data_get($hechos, 'ansiedad_por_comida', data_get($hechos, 'habitos_alimentarios.ansiedad_por_comida', false)),
            'bajo_indice_glucemico' => str_contains($this->normalizar($recomendacion->enfoque_nutricional_experto), 'bajo_indice_glucemico'),
        ];
    }

    private function textoReceta(Receta $receta): string
    {
        return $this->normalizar(implode(' ', array_filter([
            $receta->nombre,
            $receta->descripcion,
            $receta->preparacion,
            $receta->observaciones,
            ...$receta->alimentos->pluck('nombre')->all(),
        ])));
    }

    private function listaNormalizada(mixed $valores): array
    {
        if (is_string($valores)) {
            $decodificado = json_decode($valores, true);
            $valores = is_array($decodificado) ? $decodificado : preg_split('/[,;\r\n]+/', $valores);
        }

        if (! is_array($valores)) {
            return [];
        }

        $valoresAusentes = [
            'no', 'ninguna', 'ninguno', 'sin ninguna', 'sin ninguno',
            'no refiere', 'no presenta', 'sin restricciones',
            'ninguna restriccion', 'ninguna alergia', 'ninguna intolerancia',
        ];

        return collect($valores)
            ->flatten()
            ->filter(fn ($valor) => is_scalar($valor) && $this->normalizar($valor) !== '')
            ->map(fn ($valor) => $this->normalizar($valor))
            ->reject(fn (string $valor): bool => in_array($valor, $valoresAusentes, true))
            ->unique()
            ->values()
            ->all();
    }

    private function coincideConLista(string $texto, array $valores): bool
    {
        return collect($valores)->contains(fn (string $valor): bool => $this->textoCoincide($texto, $valor));
    }

    private function textoCoincide(string $texto, string $valor): bool
    {
        return mb_strlen($valor) >= 3 && str_contains($texto, $valor);
    }

    private function esAntiinflamatoria(string $texto): bool
    {
        return $this->coincideConLista($texto, [
            'antiinflamatorio', 'aceite de oliva', 'pescado', 'sardina', 'salmon',
            'nuez', 'almendra', 'chia', 'linaza', 'frutos rojos', 'curcuma',
            'jengibre', 'verdura', 'brocoli', 'espinaca',
        ]);
    }

    private function normalizar(mixed $valor): string
    {
        return Str::of((string) ($valor ?? ''))->trim()->ascii()->lower()->squish()->value();
    }
}
