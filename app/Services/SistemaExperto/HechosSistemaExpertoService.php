<?php

namespace App\Services\SistemaExperto;

use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use Illuminate\Database\Eloquent\Model;

class HechosSistemaExpertoService
{
    public function construirHechosPmos(DiagnosticoPmos $diagnostico): array
    {
        $diagnostico->loadMissing([
            'historiaMenstrual',
            'historiaHiperandrogenica',
            'perfilAndrogenico',
            'diferencialEndocrino',
            'ecografia',
        ]);

        return [
            'cumple_alteracion_ovulatoria' => $this->booleanoDirectoOInferido(
                $diagnostico,
                'cumple_alteracion_ovulatoria',
                fn (): bool => $this->inferirAlteracionOvulatoria($diagnostico)
            ),
            'cumple_hiperandrogenismo_clinico' => $this->booleanoDirectoOInferido(
                $diagnostico,
                'cumple_hiperandrogenismo_clinico',
                fn (): bool => $this->inferirHiperandrogenismoClinico($diagnostico)
            ),
            'cumple_hiperandrogenismo_bioquimico' => $this->booleanoDirectoOInferido(
                $diagnostico,
                'cumple_hiperandrogenismo_bioquimico',
                fn (): bool => (bool) ($diagnostico->perfilAndrogenico?->hiperandrogenismo_bioquimico ?? false)
            ),
            'cumple_morfologia_ovarica' => $this->booleanoDirectoOInferido(
                $diagnostico,
                'cumple_morfologia_ovarica',
                fn (): bool => (bool) ($diagnostico->ecografia?->morfologia_compatible_pmos ?? false)
            ),
            'diagnosticos_diferenciales_descartados' => $this->booleanoDirectoOInferido(
                $diagnostico,
                'diagnosticos_diferenciales_descartados',
                fn (): bool => $this->inferirDiferencialesDescartados($diagnostico)
            ),
        ];
    }

    public function construirHechosResistenciaInsulina(
        DiagnosticoResistenciaInsulina $diagnostico
    ): array {
        $diagnostico->loadMissing([
            'glucosaInsulina',
            'perfilLipidico',
            'evaluacionFisica',
        ]);

        $glucosa = $diagnostico->glucosaInsulina;
        $lipidos = $diagnostico->perfilLipidico;
        $fisica = $diagnostico->evaluacionFisica;

        return [
            'glucosa_ayunas' => $this->numeroDirectoORelacion(
                $diagnostico,
                'glucosa_ayunas',
                $glucosa?->glucosa_ayunas
            ),
            'insulina_ayunas' => $this->numeroDirectoORelacion(
                $diagnostico,
                'insulina_ayunas',
                $glucosa?->insulina_ayunas
            ),
            'homa_ir' => $this->numeroDirectoORelacion(
                $diagnostico,
                'homa_ir',
                $glucosa?->homa_ir
            ),
            'quicki' => $this->numeroDirectoORelacion($diagnostico, 'quicki', null),
            'hemoglobina_glicosilada' => $this->numeroDirectoORelacion(
                $diagnostico,
                'hemoglobina_glicosilada',
                $glucosa?->hemoglobina_glicosilada
            ),
            'trigliceridos' => $this->aFloatONull($lipidos?->trigliceridos),
            'hdl' => $this->aFloatONull($lipidos?->hdl),
            'acantosis_nigricans' => (bool) ($fisica?->acantosis_nigricans ?? false),
            // No existe una bandera de obesidad abdominal; el proyecto usa cintura >= 80 cm.
            'obesidad_abdominal' => $fisica?->circunferencia_cintura !== null
                && (float) $fisica->circunferencia_cintura >= 80,
        ];
    }

    private function booleanoDirectoOInferido(
        Model $modelo,
        string $campo,
        callable $inferir
    ): bool {
        if ($this->tieneValorDirecto($modelo, $campo)) {
            return (bool) $modelo->getAttribute($campo);
        }

        return (bool) $inferir();
    }

    private function numeroDirectoORelacion(
        Model $modelo,
        string $campo,
        mixed $valorRelacion
    ): ?float {
        if ($this->tieneValorDirecto($modelo, $campo)) {
            return (float) $modelo->getAttribute($campo);
        }

        return $this->aFloatONull($valorRelacion);
    }

    private function tieneValorDirecto(Model $modelo, string $campo): bool
    {
        $atributos = $modelo->getAttributes();

        return array_key_exists($campo, $atributos) && $atributos[$campo] !== null;
    }

    private function aFloatONull(mixed $valor): ?float
    {
        return $valor === null ? null : (float) $valor;
    }

    private function inferirAlteracionOvulatoria(DiagnosticoPmos $diagnostico): bool
    {
        $historia = $diagnostico->historiaMenstrual;

        return $historia !== null && (
            $historia->amenorrea
            || $historia->oligomenorrea
            || $historia->sospecha_anovulacion
            || $historia->confirma_anovulacion_por_progesterona
            || in_array($historia->regularidad_ciclo, ['irregular', 'ausente'], true)
        );
    }

    private function inferirHiperandrogenismoClinico(DiagnosticoPmos $diagnostico): bool
    {
        $historia = $diagnostico->historiaHiperandrogenica;

        return $historia !== null && (
            $historia->hirsutismo
            || $historia->alopecia_androgenica
            || ($historia->acne && in_array($historia->acne_grado, ['moderado', 'severo'], true))
            || ($historia->puntaje_ferriman_gallwey !== null
                && (int) $historia->puntaje_ferriman_gallwey >= 8)
        );
    }

    private function inferirDiferencialesDescartados(DiagnosticoPmos $diagnostico): bool
    {
        $diferencial = $diagnostico->diferencialEndocrino;

        return $diferencial !== null
            && $diferencial->alteracion_tiroidea_descartada
            && $diferencial->hiperprolactinemia_descartada
            && $diferencial->hiperplasia_suprarrenal_descartada
            && $diferencial->cushing_descartado;
    }
}
