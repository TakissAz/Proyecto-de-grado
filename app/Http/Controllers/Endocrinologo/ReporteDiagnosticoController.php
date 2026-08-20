<?php

namespace App\Http\Controllers\Endocrinologo;

use App\Http\Controllers\Controller;
use App\Models\Paciente;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class ReporteDiagnosticoController extends Controller
{
    public function generarPmos(Paciente $paciente): Response
    {
        $datos = $this->datosReporte($paciente);
        abort_if($datos['pmos'] === null, 404, 'No existe un diagnóstico PMOS registrado para esta paciente.');

        return Pdf::loadView('pdf.diagnostico-pmos', $datos)
            ->setPaper('a4')
            ->stream("diagnostico-pmos-{$paciente->getKey()}.pdf");
    }

    public function generarResistenciaInsulina(Paciente $paciente): Response
    {
        $datos = $this->datosReporte($paciente);
        abort_if($datos['ri'] === null, 404, 'No existe un diagnóstico de resistencia a la insulina registrado para esta paciente.');

        return Pdf::loadView('pdf.diagnostico-resistencia-insulina', $datos)
            ->setPaper('a4')
            ->stream("diagnostico-ri-{$paciente->getKey()}.pdf");
    }

    public function generar(Paciente $paciente): Response
    {
        $paciente->loadMissing([
            'user',
            'consultasEndocrinologicas.endocrinologo',
            'diagnosticosPmos.endocrinologo',
            'diagnosticosPmos.validadorExperto',
            'diagnosticosResistenciaInsulina.endocrinologo',
            'diagnosticosResistenciaInsulina.validadorExperto',
            'resultadosGlucosaInsulina',
            'resultadosPerfilLipidico',
            'evaluacionesFisicasEndocrinas',
            'historiaMenstrual',
            'historiaHiperandrogenica',
            'resultadosPerfilAndrogenico',
            'resultadosDiferencialesEndocrinos',
            'evaluacionesEcograficas',
        ]);

        $consulta = $paciente->consultasEndocrinologicas->sortByDesc('fecha_consulta')->first();
        $pmos = $paciente->diagnosticosPmos->sortByDesc('fecha_diagnostico')->first();
        $ri = $paciente->diagnosticosResistenciaInsulina->sortByDesc('fecha_diagnostico')->first();

        $datos = [
            'paciente' => $paciente,
            'consulta' => $consulta,
            'pmos' => $pmos,
            'ri' => $ri,
            'glucosa' => $paciente->resultadosGlucosaInsulina->sortByDesc('fecha_resultado')->first(),
            'lipidos' => $paciente->resultadosPerfilLipidico->sortByDesc('fecha_resultado')->first(),
            'fisica' => $paciente->evaluacionesFisicasEndocrinas->sortByDesc('id_evaluacion_fisica')->first(),
            'historiaMenstrual' => $paciente->historiaMenstrual->sortByDesc('id_historia_menstrual')->first(),
            'historiaHiperandrogenica' => $paciente->historiaHiperandrogenica->sortByDesc('id_historia_hiperandrogenica')->first(),
            'perfilAndrogenico' => $paciente->resultadosPerfilAndrogenico->sortByDesc('fecha_resultado')->first(),
            'diferencial' => $paciente->resultadosDiferencialesEndocrinos->sortByDesc('fecha_resultado')->first(),
            'ecografia' => $paciente->evaluacionesEcograficas->sortByDesc('fecha_ecografia')->first(),
            'endocrinologo' => $pmos?->endocrinologo ?? $ri?->endocrinologo ?? $consulta?->endocrinologo,
            'criteriosPmos' => $this->criteriosPmos($pmos),
            'explicacionPmos' => $this->textos($pmos?->explicacion_experta),
            'explicacionRi' => $this->textos($ri?->explicacion_experta),
            'fechaGeneracion' => now(),
        ];

        return Pdf::loadView('pdf.diagnostico-endocrinologico', $datos)
            ->setPaper('a4')
            ->stream("diagnostico-endocrinologico-{$paciente->getKey()}.pdf");
    }

    private function criteriosPmos(mixed $pmos): array
    {
        if ($pmos === null) {
            return [];
        }

        if (is_array($pmos->criterios_rotterdam_cumplidos)) {
            return $pmos->criterios_rotterdam_cumplidos;
        }

        return array_values(array_filter([
            $pmos->cumple_alteracion_ovulatoria ? 'Alteración ovulatoria' : null,
            $pmos->cumple_hiperandrogenismo ? 'Hiperandrogenismo' : null,
            $pmos->cumple_morfologia_ovarica ? 'Morfología ovárica compatible' : null,
        ]));
    }

    private function datosReporte(Paciente $paciente): array
    {
        $paciente->loadMissing([
            'user', 'consultasEndocrinologicas.endocrinologo',
            'diagnosticosPmos.endocrinologo', 'diagnosticosPmos.validadorExperto',
            'diagnosticosResistenciaInsulina.endocrinologo', 'diagnosticosResistenciaInsulina.validadorExperto',
            'resultadosGlucosaInsulina', 'resultadosPerfilLipidico', 'evaluacionesFisicasEndocrinas',
            'historiaMenstrual', 'historiaHiperandrogenica', 'resultadosPerfilAndrogenico',
            'resultadosDiferencialesEndocrinos', 'evaluacionesEcograficas',
        ]);

        $consulta = $paciente->consultasEndocrinologicas->sortByDesc('fecha_consulta')->first();
        $pmos = $paciente->diagnosticosPmos->sortByDesc('fecha_diagnostico')->first();
        $ri = $paciente->diagnosticosResistenciaInsulina->sortByDesc('fecha_diagnostico')->first();

        return [
            'paciente' => $paciente, 'consulta' => $consulta, 'pmos' => $pmos, 'ri' => $ri,
            'glucosa' => $paciente->resultadosGlucosaInsulina->sortByDesc('fecha_resultado')->first(),
            'lipidos' => $paciente->resultadosPerfilLipidico->sortByDesc('fecha_resultado')->first(),
            'fisica' => $paciente->evaluacionesFisicasEndocrinas->sortByDesc('id_evaluacion_fisica')->first(),
            'historiaMenstrual' => $paciente->historiaMenstrual->sortByDesc('id_historia_menstrual')->first(),
            'historiaHiperandrogenica' => $paciente->historiaHiperandrogenica->sortByDesc('id_historia_hiperandrogenica')->first(),
            'perfilAndrogenico' => $paciente->resultadosPerfilAndrogenico->sortByDesc('fecha_resultado')->first(),
            'diferencial' => $paciente->resultadosDiferencialesEndocrinos->sortByDesc('fecha_resultado')->first(),
            'ecografia' => $paciente->evaluacionesEcograficas->sortByDesc('fecha_ecografia')->first(),
            'endocrinologo' => $pmos?->endocrinologo ?? $ri?->endocrinologo ?? $consulta?->endocrinologo,
            'criteriosPmos' => $this->criteriosPmos($pmos),
            'explicacionPmos' => $this->textos($pmos?->explicacion_experta),
            'explicacionRi' => $this->textos($ri?->explicacion_experta),
            'recomendacionesPmos' => $this->textos($pmos?->recomendaciones_expertas),
            'recomendacionesRi' => $this->textos($ri?->recomendaciones_expertas),
            'fechaGeneracion' => now(),
        ];
    }

    private function textos(mixed $valor): array
    {
        if (is_array($valor)) {
            return $valor;
        }
        if (! is_string($valor) || $valor === '') {
            return [];
        }

        $decodificado = json_decode($valor, true);
        return is_array($decodificado) ? $decodificado : [$valor];
    }
}
