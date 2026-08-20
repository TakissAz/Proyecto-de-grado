<?php

namespace App\Services\Pacientes;

use App\Models\DiagnosticoPmos;
use App\Models\Paciente;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DiagnosticoPmosService
{
    /**
     * Evalúa los criterios PMOS de la paciente según datos ya registrados.
     * Retorna una sugerencia diagnóstica (no la guarda, solo la prepara).
     */
    public function evaluarCriterios(Paciente $paciente): array
    {
        $paciente->loadMissing([
            'historiaMenstrual',
            'historiaHiperandrogenica',
            'resultadosPerfilAndrogenico',
            'resultadosDiferencialesEndocrinos',
            'evaluacionesEcograficas',
        ]);

        $historia = $paciente->historiaMenstrual->first();
        $hiperandrogenismo = $paciente->historiaHiperandrogenica->first();
        $androgenico = $paciente->resultadosPerfilAndrogenico->first();
        $diferencial = $paciente->resultadosDiferencialesEndocrinos->first();
        $ecografia = $paciente->evaluacionesEcograficas->first();

        // Criterio 1: Alteración ovulatoria
        $cumpleAlteracionOvulatoria = false;
        if ($historia) {
            $cumpleAlteracionOvulatoria = $historia->amenorrea
                || $historia->oligomenorrea
                || $historia->sospecha_anovulacion
                || $historia->confirma_anovulacion_por_progesterona
                || $historia->regularidad_ciclo === 'irregular'
                || $historia->regularidad_ciclo === 'ausente';
        }

        // Criterio 2: Hiperandrogenismo
        $cumpleHiperandrogenismoClinico = false;
        if ($hiperandrogenismo) {
            $cumpleHiperandrogenismoClinico = $hiperandrogenismo->hirsutismo
                || $hiperandrogenismo->alopecia_androgenica
                || ($hiperandrogenismo->acne && in_array($hiperandrogenismo->acne_grado, ['moderado', 'severo']))
                || ($hiperandrogenismo->puntaje_ferriman_gallwey !== null && $hiperandrogenismo->puntaje_ferriman_gallwey >= 8);
        }

        $cumpleHiperandrogenismoBioquimico = $androgenico?->hiperandrogenismo_bioquimico ?? false;
        $cumpleHiperandrogenismo = $cumpleHiperandrogenismoClinico || $cumpleHiperandrogenismoBioquimico;

        $tipoHiperandrogenismo = 'ninguno';
        if ($cumpleHiperandrogenismoClinico && $cumpleHiperandrogenismoBioquimico) {
            $tipoHiperandrogenismo = 'clinico_y_bioquimico';
        } elseif ($cumpleHiperandrogenismoClinico) {
            $tipoHiperandrogenismo = 'clinico';
        } elseif ($cumpleHiperandrogenismoBioquimico) {
            $tipoHiperandrogenismo = 'bioquimico';
        }

        // Criterio 3: Morfología ovárica
        $cumpleMorfologia = $ecografia?->morfologia_compatible_pmos ?? false;

        // Diferenciales descartados
        $diferencialesDescartados = $diferencial
            && $diferencial->alteracion_tiroidea_descartada
            && $diferencial->hiperprolactinemia_descartada
            && $diferencial->hiperplasia_suprarrenal_descartada
            && $diferencial->cushing_descartado;

        // Total Rotterdam
        $totalRotterdam = (int) $cumpleAlteracionOvulatoria + (int) $cumpleHiperandrogenismo + (int) $cumpleMorfologia;

        // Fenotipo sugerido
        $fenotipoSugerido = $this->determinarFenotipo($cumpleAlteracionOvulatoria, $cumpleHiperandrogenismo, $cumpleMorfologia);

        // Diagnóstico sugerido
        $alertasFaltantes = [];
        if (! $historia) $alertasFaltantes[] = 'Historia menstrual no registrada';
        if (! $hiperandrogenismo) $alertasFaltantes[] = 'Hiperandrogenismo no evaluado';
        if (! $androgenico) $alertasFaltantes[] = 'Perfil androgénico no registrado';
        if (! $diferencial) $alertasFaltantes[] = 'Diferenciales endocrinos no registrados';
        if (! $ecografia) $alertasFaltantes[] = 'Ecografía no registrada';

        if (count($alertasFaltantes) > 0) {
            $diagnosticoSugerido = 'datos_insuficientes';
        } elseif ($totalRotterdam >= 2 && $diferencialesDescartados) {
            $diagnosticoSugerido = 'compatible_pmos';
        } elseif ($totalRotterdam >= 2 && ! $diferencialesDescartados) {
            $diagnosticoSugerido = 'pendiente_descartar_diferenciales';
        } else {
            $diagnosticoSugerido = 'no_compatible';
        }

        return [
            'cumple_alteracion_ovulatoria'          => $cumpleAlteracionOvulatoria,
            'cumple_hiperandrogenismo_clinico'       => $cumpleHiperandrogenismoClinico,
            'cumple_hiperandrogenismo_bioquimico'    => $cumpleHiperandrogenismoBioquimico,
            'cumple_hiperandrogenismo'               => $cumpleHiperandrogenismo,
            'tipo_hiperandrogenismo'                 => $tipoHiperandrogenismo,
            'cumple_morfologia_ovarica'              => $cumpleMorfologia,
            'diagnosticos_diferenciales_descartados' => $diferencialesDescartados,
            'total_criterios_rotterdam'              => $totalRotterdam,
            'diagnostico_sugerido'                   => $diagnosticoSugerido,
            'fenotipo_sugerido'                      => $fenotipoSugerido,
            'alertas_datos_faltantes'                => $alertasFaltantes,
            // IDs de relaciones para vincular al diagnóstico
            'id_historia_menstrual'       => $historia?->id_historia_menstrual,
            'id_historia_hiperandrogenica' => $hiperandrogenismo?->id_historia_hiperandrogenica,
            'id_perfil_androgenico'       => $androgenico?->id_perfil_androgenico,
            'id_diferencial_endocrino'    => $diferencial?->id_diferencial_endocrino,
            'id_ecografia'                => $ecografia?->id_ecografia,
        ];
    }

    /**
     * Crea el diagnóstico PMOS confirmado por el endocrinólogo.
     */
    public function crear(Paciente $paciente, array $data): DiagnosticoPmos
    {
        return DB::transaction(function () use ($paciente, $data) {
            return DiagnosticoPmos::create([
                'id_consulta_endocrinologica'           => $data['id_consulta_endocrinologica'],
                'id_paciente'                           => $paciente->id_paciente,
                'id_endocrinologo'                      => Auth::id(),
                'id_historia_menstrual'                 => $data['id_historia_menstrual'] ?? null,
                'id_historia_hiperandrogenica'          => $data['id_historia_hiperandrogenica'] ?? null,
                'id_perfil_androgenico'                 => $data['id_perfil_androgenico'] ?? null,
                'id_perfil_gonadotropo'                 => $data['id_perfil_gonadotropo'] ?? null,
                'id_diferencial_endocrino'              => $data['id_diferencial_endocrino'] ?? null,
                'id_ecografia'                          => $data['id_ecografia'] ?? null,
                'fecha_diagnostico'                     => $data['fecha_diagnostico'],
                'cumple_alteracion_ovulatoria'          => $data['cumple_alteracion_ovulatoria'] ?? false,
                'cumple_hiperandrogenismo_clinico'      => $data['cumple_hiperandrogenismo_clinico'] ?? false,
                'cumple_hiperandrogenismo_bioquimico'   => $data['cumple_hiperandrogenismo_bioquimico'] ?? false,
                'cumple_hiperandrogenismo'              => $data['cumple_hiperandrogenismo'] ?? false,
                'tipo_hiperandrogenismo'                => $data['tipo_hiperandrogenismo'] ?? 'ninguno',
                'cumple_morfologia_ovarica'             => $data['cumple_morfologia_ovarica'] ?? false,
                'total_criterios_rotterdam'             => $data['total_criterios_rotterdam'] ?? 0,
                'fenotipo_pmos'                         => $data['fenotipo_pmos'] ?? 'no_clasificado',
                'diagnostico_confirmado'                => $data['diagnostico_confirmado'] ?? false,
                'diagnosticos_diferenciales_descartados'=> $data['diagnosticos_diferenciales_descartados'] ?? false,
                'severidad_clinica'                     => $data['severidad_clinica'] ?? 'no_clasificada',
                'riesgo_metabolico'                     => $data['riesgo_metabolico'] ?? 'no_evaluado',
                'conclusion_medica'                     => $data['conclusion_medica'] ?? null,
                'recomendaciones_medicas'               => $data['recomendaciones_medicas'] ?? null,
                'estado'                                => 'registrado',
            ]);
        });
    }

    /**
     * Actualiza el diagnóstico PMOS.
     */
    public function actualizar(DiagnosticoPmos $diagnostico, array $data): DiagnosticoPmos
    {
        return DB::transaction(function () use ($diagnostico, $data) {
            $diagnostico->update([
                'fecha_diagnostico'                     => $data['fecha_diagnostico'],
                'cumple_alteracion_ovulatoria'          => $data['cumple_alteracion_ovulatoria'] ?? false,
                'cumple_hiperandrogenismo_clinico'      => $data['cumple_hiperandrogenismo_clinico'] ?? false,
                'cumple_hiperandrogenismo_bioquimico'   => $data['cumple_hiperandrogenismo_bioquimico'] ?? false,
                'cumple_hiperandrogenismo'              => $data['cumple_hiperandrogenismo'] ?? false,
                'tipo_hiperandrogenismo'                => $data['tipo_hiperandrogenismo'] ?? 'ninguno',
                'cumple_morfologia_ovarica'             => $data['cumple_morfologia_ovarica'] ?? false,
                'total_criterios_rotterdam'             => $data['total_criterios_rotterdam'] ?? 0,
                'fenotipo_pmos'                         => $data['fenotipo_pmos'] ?? 'no_clasificado',
                'diagnostico_confirmado'                => $data['diagnostico_confirmado'] ?? false,
                'diagnosticos_diferenciales_descartados'=> $data['diagnosticos_diferenciales_descartados'] ?? false,
                'severidad_clinica'                     => $data['severidad_clinica'] ?? 'no_clasificada',
                'riesgo_metabolico'                     => $data['riesgo_metabolico'] ?? 'no_evaluado',
                'conclusion_medica'                     => $data['conclusion_medica'] ?? null,
                'recomendaciones_medicas'               => $data['recomendaciones_medicas'] ?? null,
            ]);

            return $diagnostico;
        });
    }

    private function determinarFenotipo(bool $ovulacion, bool $hiperandrogenismo, bool $morfologia): ?string
    {
        if ($ovulacion && $hiperandrogenismo && $morfologia) return 'A_clasico_completo';
        if ($ovulacion && $hiperandrogenismo && !$morfologia) return 'B_hiperandrogenico_anovulatorio';
        if (!$ovulacion && $hiperandrogenismo && $morfologia) return 'C_ovulatorio';
        if ($ovulacion && !$hiperandrogenismo && $morfologia) return 'D_no_hiperandrogenico';
        return null;
    }
}
