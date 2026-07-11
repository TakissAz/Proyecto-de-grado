<?php

namespace App\Services\Pacientes;

use App\Models\DiagnosticoResistenciaInsulina;
use App\Models\Paciente;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DiagnosticoResistenciaInsulinaService
{
    /**
     * Evalúa indicadores de resistencia a la insulina de la paciente.
     */
    public function evaluarCriterios(Paciente $paciente): array
    {
        $paciente->loadMissing([
            'resultadosGlucosaInsulina',
            'resultadosPerfilLipidico',
            'evaluacionesFisicasEndocrinas',
            'antecedentesEndocrinoMetabolicos',
        ]);

        $glucosa = $paciente->resultadosGlucosaInsulina->first();
        $lipidico = $paciente->resultadosPerfilLipidico->first();
        $fisica = $paciente->evaluacionesFisicasEndocrinas->first();
        $antecedentes = $paciente->antecedentesEndocrinoMetabolicos->first();

        // HOMA-IR
        $homaIr = $glucosa?->homa_ir ? (float) $glucosa->homa_ir : null;
        $homaIrElevado = $homaIr !== null && $homaIr >= 2.5;

        // Hiperinsulinemia
        $hiperinsulinemia = $glucosa?->hiperinsulinemia ?? false;

        // Alteraciones glucémicas
        $glucosaAyunasElevada = $glucosa?->glucosa_ayunas !== null && (float) $glucosa->glucosa_ayunas >= 100;
        $hba1cElevada = $glucosa?->hemoglobina_glicosilada !== null && (float) $glucosa->hemoglobina_glicosilada >= 5.7;
        $ogttElevada = $glucosa?->glucosa_2h_ogtt !== null && (float) $glucosa->glucosa_2h_ogtt >= 140;
        $alteracionGlucemica = $glucosaAyunasElevada || $hba1cElevada || $ogttElevada;

        // Signos físicos
        $acantosis = $fisica?->acantosis_nigricans ?? false;
        $skinTags = $fisica?->skin_tags ?? false;
        $imcElevado = $fisica?->imc !== null && (float) $fisica->imc >= 25;
        $cinturaElevada = $fisica?->circunferencia_cintura !== null && (float) $fisica->circunferencia_cintura >= 80;
        $iccElevado = $fisica?->indice_cintura_cadera !== null && (float) $fisica->indice_cintura_cadera >= 0.85;
        $signosFisicos = $acantosis || $skinTags || $imcElevado || $cinturaElevada || $iccElevado;

        // Dislipidemia
        $dislipidemia = $lipidico?->dislipidemia_sugerida ?? false;
        $tgElevados = $lipidico?->trigliceridos !== null && (float) $lipidico->trigliceridos >= 150;
        $hdlBajo = $lipidico?->hdl !== null && (float) $lipidico->hdl < 50;
        $dislipidemiaAsociada = $dislipidemia || $tgElevados || $hdlBajo;

        // Antecedentes
        $diabetesFamiliar = $antecedentes?->diabetes_familiar ?? false;
        $diabetesPersonal = $antecedentes?->diabetes_personal ?? false;
        $antecedentesRelevantes = $diabetesFamiliar || $diabetesPersonal;

        // Alertas datos faltantes
        $alertas = [];
        if (! $glucosa) $alertas[] = 'Glucosa e insulina no registrados';
        if (! $fisica) $alertas[] = 'Evaluación física no registrada';
        if (! $lipidico) $alertas[] = 'Perfil lipídico no registrado';

        // Diagnóstico sugerido
        if (! $glucosa) {
            if ($signosFisicos || $dislipidemiaAsociada) {
                $diagnosticoSugerido = 'sospecha_clinica_pendiente_confirmacion';
            } else {
                $diagnosticoSugerido = 'datos_insuficientes';
            }
        } elseif ($homaIrElevado || ($glucosa->resistencia_insulina_sugerida ?? false)) {
            $diagnosticoSugerido = 'compatible_resistencia_insulina';
        } elseif (! $homaIrElevado && ! $hiperinsulinemia && ! $alteracionGlucemica) {
            $diagnosticoSugerido = 'no_compatible';
        } else {
            $diagnosticoSugerido = 'sospecha_clinica_pendiente_confirmacion';
        }

        // Nivel de riesgo sugerido
        $puntajeRiesgo = (int) $homaIrElevado + (int) $hiperinsulinemia + (int) $alteracionGlucemica + (int) $signosFisicos + (int) $dislipidemiaAsociada + (int) $antecedentesRelevantes;
        if ($puntajeRiesgo >= 4) {
            $riesgoSugerido = 'alto';
        } elseif ($puntajeRiesgo >= 2) {
            $riesgoSugerido = 'moderado';
        } else {
            $riesgoSugerido = 'bajo';
        }

        return [
            'homa_ir'                     => $homaIr,
            'homa_ir_elevado'             => $homaIrElevado,
            'hiperinsulinemia'            => $hiperinsulinemia,
            'alteracion_glucemica'        => $alteracionGlucemica,
            'signos_fisicos_asociados'    => $signosFisicos,
            'dislipidemia_asociada'       => $dislipidemiaAsociada,
            'antecedentes_relevantes'     => $antecedentesRelevantes,
            'diagnostico_sugerido'        => $diagnosticoSugerido,
            'riesgo_sugerido'             => $riesgoSugerido,
            'alertas_datos_faltantes'     => $alertas,
            // IDs para vincular
            'id_glucosa_insulina'         => $glucosa?->id_glucosa_insulina,
            'id_perfil_lipidico'          => $lipidico?->id_perfil_lipidico,
            'id_evaluacion_fisica'        => $fisica?->id_evaluacion_fisica,
            // Valores para prellenar
            'glucosa_ayunas'              => $glucosa?->glucosa_ayunas,
            'insulina_ayunas'             => $glucosa?->insulina_ayunas,
            'hemoglobina_glicosilada'     => $glucosa?->hemoglobina_glicosilada,
        ];
    }

    public function crear(Paciente $paciente, array $data): DiagnosticoResistenciaInsulina
    {
        return DB::transaction(function () use ($paciente, $data) {
            return DiagnosticoResistenciaInsulina::create([
                'id_consulta_endocrinologica' => $data['id_consulta_endocrinologica'],
                'id_paciente'                 => $paciente->id_paciente,
                'id_endocrinologo'            => Auth::id(),
                'id_glucosa_insulina'         => $data['id_glucosa_insulina'] ?? null,
                'id_perfil_lipidico'          => $data['id_perfil_lipidico'] ?? null,
                'id_evaluacion_fisica'        => $data['id_evaluacion_fisica'] ?? null,
                'fecha_diagnostico'           => $data['fecha_diagnostico'],
                'homa_ir'                     => $data['homa_ir'] ?? null,
                'glucosa_ayunas'              => $data['glucosa_ayunas'] ?? null,
                'insulina_ayunas'             => $data['insulina_ayunas'] ?? null,
                'hemoglobina_glicosilada'     => $data['hemoglobina_glicosilada'] ?? null,
                'resistencia_confirmada'      => $data['resistencia_confirmada'] ?? false,
                'grado_resistencia'           => $data['grado_resistencia'] ?? 'no_aplica',
                'riesgo_diabetes'             => $data['riesgo_diabetes'] ?? 'no_evaluado',
                'riesgo_cardiometabolico'     => $data['riesgo_cardiometabolico'] ?? 'no_evaluado',
                'conclusion_medica'           => $data['conclusion_medica'] ?? null,
                'recomendaciones_medicas'     => $data['recomendaciones_medicas'] ?? null,
                'estado'                      => 'en_estudio',
            ]);
        });
    }

    public function actualizar(DiagnosticoResistenciaInsulina $diagnostico, array $data): DiagnosticoResistenciaInsulina
    {
        return DB::transaction(function () use ($diagnostico, $data) {
            $diagnostico->update([
                'fecha_diagnostico'           => $data['fecha_diagnostico'],
                'homa_ir'                     => $data['homa_ir'] ?? null,
                'glucosa_ayunas'              => $data['glucosa_ayunas'] ?? null,
                'insulina_ayunas'             => $data['insulina_ayunas'] ?? null,
                'hemoglobina_glicosilada'     => $data['hemoglobina_glicosilada'] ?? null,
                'resistencia_confirmada'      => $data['resistencia_confirmada'] ?? false,
                'grado_resistencia'           => $data['grado_resistencia'] ?? 'no_aplica',
                'riesgo_diabetes'             => $data['riesgo_diabetes'] ?? 'no_evaluado',
                'riesgo_cardiometabolico'     => $data['riesgo_cardiometabolico'] ?? 'no_evaluado',
                'conclusion_medica'           => $data['conclusion_medica'] ?? null,
                'recomendaciones_medicas'     => $data['recomendaciones_medicas'] ?? null,
            ]);

            return $diagnostico;
        });
    }
}
