<?php

namespace App\Http\Controllers\Endocrinologo;

use App\Http\Controllers\Controller;
use App\Models\Paciente;
use App\Models\ResultadoDiferencialEndocrino;
use App\Models\ResultadoGlucosaInsulina;
use App\Models\ResultadoPerfilAndrogenico;
use App\Models\ResultadoPerfilGonadotropo;
use App\Models\ResultadoPerfilLipidico;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LaboratoriosController extends Controller
{
    // ─── Perfil Androgénico ─────────────────────────────────────────────

    private function reglasPerfilAndrogenico(): array
    {
        return [
            'id_consulta_endocrinologica' => ['required', 'integer', 'exists:consultas_endocrinologicas,id_consulta_endocrinologica'],
            'fecha_resultado'             => ['required', 'date'],
            'testosterona_total'          => ['nullable', 'numeric', 'min:0'],
            'testosterona_libre'          => ['nullable', 'numeric', 'min:0'],
            'shbg'                        => ['nullable', 'numeric', 'min:0'],
            'indice_androgenico_libre'    => ['nullable', 'numeric', 'min:0'],
            'dhea_s'                      => ['nullable', 'numeric', 'min:0'],
            'androstenediona'             => ['nullable', 'numeric', 'min:0'],
            'hiperandrogenismo_bioquimico'=> ['boolean'],
            'interpretacion'              => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function storePerfilAndrogenico(Request $request, Paciente $paciente): RedirectResponse
    {
        $validated = $request->validate($this->reglasPerfilAndrogenico());

        ResultadoPerfilAndrogenico::create([
            'id_consulta_endocrinologica' => $validated['id_consulta_endocrinologica'],
            'id_paciente'                 => $paciente->id_paciente,
            'id_endocrinologo'            => Auth::id(),
            'fecha_resultado'             => $validated['fecha_resultado'],
            'testosterona_total'          => $validated['testosterona_total'] ?? null,
            'testosterona_libre'          => $validated['testosterona_libre'] ?? null,
            'shbg'                        => $validated['shbg'] ?? null,
            'indice_androgenico_libre'    => $validated['indice_androgenico_libre'] ?? null,
            'dhea_s'                      => $validated['dhea_s'] ?? null,
            'androstenediona'             => $validated['androstenediona'] ?? null,
            'hiperandrogenismo_bioquimico'=> $validated['hiperandrogenismo_bioquimico'] ?? false,
            'interpretacion'              => $validated['interpretacion'] ?? null,
            'estado'                      => 'registrado',
        ]);

        return back()->with('success', 'Perfil androgénico registrado correctamente.');
    }

    public function updatePerfilAndrogenico(Request $request, Paciente $paciente, ResultadoPerfilAndrogenico $perfilAndrogenico): RedirectResponse
    {
        $validated = $request->validate($this->reglasPerfilAndrogenico());

        $perfilAndrogenico->update([
            'fecha_resultado'             => $validated['fecha_resultado'],
            'testosterona_total'          => $validated['testosterona_total'] ?? null,
            'testosterona_libre'          => $validated['testosterona_libre'] ?? null,
            'shbg'                        => $validated['shbg'] ?? null,
            'indice_androgenico_libre'    => $validated['indice_androgenico_libre'] ?? null,
            'dhea_s'                      => $validated['dhea_s'] ?? null,
            'androstenediona'             => $validated['androstenediona'] ?? null,
            'hiperandrogenismo_bioquimico'=> $validated['hiperandrogenismo_bioquimico'] ?? false,
            'interpretacion'              => $validated['interpretacion'] ?? null,
        ]);

        return back()->with('success', 'Perfil androgénico actualizado correctamente.');
    }

    // ─── Perfil Gonadotropo ─────────────────────────────────────────────

    private function reglasPerfilGonadotropo(): array
    {
        return [
            'id_consulta_endocrinologica' => ['required', 'integer', 'exists:consultas_endocrinologicas,id_consulta_endocrinologica'],
            'fecha_resultado'             => ['required', 'date'],
            'lh'                          => ['nullable', 'numeric', 'min:0'],
            'fsh'                         => ['nullable', 'numeric', 'min:0'],
            'estradiol'                   => ['nullable', 'numeric', 'min:0'],
            'progesterona'                => ['nullable', 'numeric', 'min:0'],
            'progesterona_dia_ciclo'      => ['nullable', 'integer', 'min:1', 'max:35'],
            'progesterona_fase_ciclo'     => ['nullable', 'string', 'max:50'],
            'interpretacion'              => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * Calcula la relación LH/FSH si ambos valores existen y FSH > 0.
     */
    private function calcularRelacionLhFsh(?float $lh, ?float $fsh): ?float
    {
        if ($lh !== null && $fsh !== null && $fsh > 0) {
            return round($lh / $fsh, 2);
        }

        return null;
    }

    public function storePerfilGonadotropo(Request $request, Paciente $paciente): RedirectResponse
    {
        $validated = $request->validate($this->reglasPerfilGonadotropo());

        $lh = isset($validated['lh']) ? (float) $validated['lh'] : null;
        $fsh = isset($validated['fsh']) ? (float) $validated['fsh'] : null;

        ResultadoPerfilGonadotropo::create([
            'id_consulta_endocrinologica' => $validated['id_consulta_endocrinologica'],
            'id_paciente'                 => $paciente->id_paciente,
            'id_endocrinologo'            => Auth::id(),
            'fecha_resultado'             => $validated['fecha_resultado'],
            'lh'                          => $lh,
            'fsh'                         => $fsh,
            'relacion_lh_fsh'             => $this->calcularRelacionLhFsh($lh, $fsh),
            'estradiol'                   => $validated['estradiol'] ?? null,
            'progesterona'                => $validated['progesterona'] ?? null,
            'progesterona_dia_ciclo'      => $validated['progesterona_dia_ciclo'] ?? null,
            'progesterona_fase_ciclo'     => $validated['progesterona_fase_ciclo'] ?? null,
            'interpretacion'              => $validated['interpretacion'] ?? null,
            'estado'                      => 'registrado',
        ]);

        return back()->with('success', 'Perfil gonadotropo registrado correctamente.');
    }

    public function updatePerfilGonadotropo(Request $request, Paciente $paciente, ResultadoPerfilGonadotropo $perfilGonadotropo): RedirectResponse
    {
        $validated = $request->validate($this->reglasPerfilGonadotropo());

        $lh = isset($validated['lh']) ? (float) $validated['lh'] : null;
        $fsh = isset($validated['fsh']) ? (float) $validated['fsh'] : null;

        $perfilGonadotropo->update([
            'fecha_resultado'             => $validated['fecha_resultado'],
            'lh'                          => $lh,
            'fsh'                         => $fsh,
            'relacion_lh_fsh'             => $this->calcularRelacionLhFsh($lh, $fsh),
            'estradiol'                   => $validated['estradiol'] ?? null,
            'progesterona'                => $validated['progesterona'] ?? null,
            'progesterona_dia_ciclo'      => $validated['progesterona_dia_ciclo'] ?? null,
            'progesterona_fase_ciclo'     => $validated['progesterona_fase_ciclo'] ?? null,
            'interpretacion'              => $validated['interpretacion'] ?? null,
        ]);

        return back()->with('success', 'Perfil gonadotropo actualizado correctamente.');
    }

    // ─── Diferenciales Endocrinos ───────────────────────────────────────

    private function reglasDiferencialesEndocrinos(): array
    {
        return [
            'id_consulta_endocrinologica'        => ['required', 'integer', 'exists:consultas_endocrinologicas,id_consulta_endocrinologica'],
            'fecha_resultado'                    => ['required', 'date'],
            'tsh'                                => ['nullable', 'numeric', 'min:0'],
            't3_libre'                           => ['nullable', 'numeric', 'min:0'],
            't4_libre'                           => ['nullable', 'numeric', 'min:0'],
            'prolactina'                         => ['nullable', 'numeric', 'min:0'],
            'diecisiete_oh_progesterona'          => ['nullable', 'numeric', 'min:0'],
            'cortisol'                           => ['nullable', 'numeric', 'min:0'],
            'alteracion_tiroidea_descartada'     => ['boolean'],
            'hiperprolactinemia_descartada'      => ['boolean'],
            'hiperplasia_suprarrenal_descartada' => ['boolean'],
            'cushing_descartado'                 => ['boolean'],
            'interpretacion'                     => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function storeDiferencialesEndocrinos(Request $request, Paciente $paciente): RedirectResponse
    {
        $validated = $request->validate($this->reglasDiferencialesEndocrinos());

        ResultadoDiferencialEndocrino::create([
            'id_consulta_endocrinologica'        => $validated['id_consulta_endocrinologica'],
            'id_paciente'                        => $paciente->id_paciente,
            'id_endocrinologo'                   => Auth::id(),
            'fecha_resultado'                    => $validated['fecha_resultado'],
            'tsh'                                => $validated['tsh'] ?? null,
            't3_libre'                           => $validated['t3_libre'] ?? null,
            't4_libre'                           => $validated['t4_libre'] ?? null,
            'prolactina'                         => $validated['prolactina'] ?? null,
            'diecisiete_oh_progesterona'          => $validated['diecisiete_oh_progesterona'] ?? null,
            'cortisol'                           => $validated['cortisol'] ?? null,
            'alteracion_tiroidea_descartada'     => $validated['alteracion_tiroidea_descartada'] ?? false,
            'hiperprolactinemia_descartada'      => $validated['hiperprolactinemia_descartada'] ?? false,
            'hiperplasia_suprarrenal_descartada' => $validated['hiperplasia_suprarrenal_descartada'] ?? false,
            'cushing_descartado'                 => $validated['cushing_descartado'] ?? false,
            'interpretacion'                     => $validated['interpretacion'] ?? null,
            'estado'                             => 'registrado',
        ]);

        return back()->with('success', 'Diferenciales endocrinos registrados correctamente.');
    }

    public function updateDiferencialesEndocrinos(Request $request, Paciente $paciente, ResultadoDiferencialEndocrino $diferencial): RedirectResponse
    {
        $validated = $request->validate($this->reglasDiferencialesEndocrinos());

        $diferencial->update([
            'fecha_resultado'                    => $validated['fecha_resultado'],
            'tsh'                                => $validated['tsh'] ?? null,
            't3_libre'                           => $validated['t3_libre'] ?? null,
            't4_libre'                           => $validated['t4_libre'] ?? null,
            'prolactina'                         => $validated['prolactina'] ?? null,
            'diecisiete_oh_progesterona'          => $validated['diecisiete_oh_progesterona'] ?? null,
            'cortisol'                           => $validated['cortisol'] ?? null,
            'alteracion_tiroidea_descartada'     => $validated['alteracion_tiroidea_descartada'] ?? false,
            'hiperprolactinemia_descartada'      => $validated['hiperprolactinemia_descartada'] ?? false,
            'hiperplasia_suprarrenal_descartada' => $validated['hiperplasia_suprarrenal_descartada'] ?? false,
            'cushing_descartado'                 => $validated['cushing_descartado'] ?? false,
            'interpretacion'                     => $validated['interpretacion'] ?? null,
        ]);

        return back()->with('success', 'Diferenciales endocrinos actualizados correctamente.');
    }

    // ─── Glucosa e Insulina ─────────────────────────────────────────────

    private function reglasGlucosaInsulina(): array
    {
        return [
            'id_consulta_endocrinologica' => ['required', 'integer', 'exists:consultas_endocrinologicas,id_consulta_endocrinologica'],
            'fecha_resultado'             => ['required', 'date'],
            'glucosa_ayunas'              => ['nullable', 'numeric', 'min:0'],
            'insulina_ayunas'             => ['nullable', 'numeric', 'min:0'],
            'hemoglobina_glicosilada'     => ['nullable', 'numeric', 'min:0'],
            'glucosa_2h_ogtt'             => ['nullable', 'numeric', 'min:0'],
            'insulina_2h_ogtt'            => ['nullable', 'numeric', 'min:0'],
            'hiperinsulinemia'            => ['boolean'],
            'resistencia_insulina_sugerida' => ['boolean'],
            'interpretacion'              => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * Calcula HOMA-IR: (glucosa mg/dL * insulina µU/mL) / 405
     */
    private function calcularHomaIr(?float $glucosa, ?float $insulina): ?float
    {
        if ($glucosa !== null && $insulina !== null && $glucosa > 0 && $insulina > 0) {
            return round(($glucosa * $insulina) / 405, 2);
        }

        return null;
    }

    public function storeGlucosaInsulina(Request $request, Paciente $paciente): RedirectResponse
    {
        $validated = $request->validate($this->reglasGlucosaInsulina());

        $glucosa = isset($validated['glucosa_ayunas']) ? (float) $validated['glucosa_ayunas'] : null;
        $insulina = isset($validated['insulina_ayunas']) ? (float) $validated['insulina_ayunas'] : null;
        $homaIr = $this->calcularHomaIr($glucosa, $insulina);

        // Si HOMA-IR >= 2.5, sugerir resistencia a la insulina automáticamente
        $resistenciaSugerida = ($validated['resistencia_insulina_sugerida'] ?? false) || ($homaIr !== null && $homaIr >= 2.5);

        ResultadoGlucosaInsulina::create([
            'id_consulta_endocrinologica'   => $validated['id_consulta_endocrinologica'],
            'id_paciente'                   => $paciente->id_paciente,
            'id_endocrinologo'              => Auth::id(),
            'fecha_resultado'               => $validated['fecha_resultado'],
            'glucosa_ayunas'                => $glucosa,
            'insulina_ayunas'               => $insulina,
            'homa_ir'                       => $homaIr,
            'hemoglobina_glicosilada'       => $validated['hemoglobina_glicosilada'] ?? null,
            'glucosa_2h_ogtt'               => $validated['glucosa_2h_ogtt'] ?? null,
            'insulina_2h_ogtt'              => $validated['insulina_2h_ogtt'] ?? null,
            'hiperinsulinemia'              => $validated['hiperinsulinemia'] ?? false,
            'resistencia_insulina_sugerida' => $resistenciaSugerida,
            'interpretacion'                => $validated['interpretacion'] ?? null,
            'estado'                        => 'registrado',
        ]);

        return back()->with('success', 'Glucosa e insulina registrados correctamente.');
    }

    public function updateGlucosaInsulina(Request $request, Paciente $paciente, ResultadoGlucosaInsulina $glucosaInsulina): RedirectResponse
    {
        $validated = $request->validate($this->reglasGlucosaInsulina());

        $glucosa = isset($validated['glucosa_ayunas']) ? (float) $validated['glucosa_ayunas'] : null;
        $insulina = isset($validated['insulina_ayunas']) ? (float) $validated['insulina_ayunas'] : null;
        $homaIr = $this->calcularHomaIr($glucosa, $insulina);

        $resistenciaSugerida = ($validated['resistencia_insulina_sugerida'] ?? false) || ($homaIr !== null && $homaIr >= 2.5);

        $glucosaInsulina->update([
            'fecha_resultado'               => $validated['fecha_resultado'],
            'glucosa_ayunas'                => $glucosa,
            'insulina_ayunas'               => $insulina,
            'homa_ir'                       => $homaIr,
            'hemoglobina_glicosilada'       => $validated['hemoglobina_glicosilada'] ?? null,
            'glucosa_2h_ogtt'               => $validated['glucosa_2h_ogtt'] ?? null,
            'insulina_2h_ogtt'              => $validated['insulina_2h_ogtt'] ?? null,
            'hiperinsulinemia'              => $validated['hiperinsulinemia'] ?? false,
            'resistencia_insulina_sugerida' => $resistenciaSugerida,
            'interpretacion'                => $validated['interpretacion'] ?? null,
        ]);

        return back()->with('success', 'Glucosa e insulina actualizados correctamente.');
    }

    // ─── Perfil Lipídico ────────────────────────────────────────────────

    private function reglasPerfilLipidico(): array
    {
        return [
            'id_consulta_endocrinologica' => ['required', 'integer', 'exists:consultas_endocrinologicas,id_consulta_endocrinologica'],
            'fecha_resultado'             => ['required', 'date'],
            'colesterol_total'            => ['nullable', 'numeric', 'min:0'],
            'hdl'                         => ['nullable', 'numeric', 'min:0'],
            'ldl'                         => ['nullable', 'numeric', 'min:0'],
            'vldl'                        => ['nullable', 'numeric', 'min:0'],
            'trigliceridos'               => ['nullable', 'numeric', 'min:0'],
            'dislipidemia_sugerida'       => ['boolean'],
            'interpretacion'              => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * Calcula colesterol no-HDL y VLDL si es posible.
     * Retorna también si dislipidemia debe marcarse automáticamente.
     */
    private function calcularIndicesLipidicos(array $data): array
    {
        $colTotal = isset($data['colesterol_total']) ? (float) $data['colesterol_total'] : null;
        $hdl = isset($data['hdl']) ? (float) $data['hdl'] : null;
        $ldl = isset($data['ldl']) ? (float) $data['ldl'] : null;
        $trigliceridos = isset($data['trigliceridos']) ? (float) $data['trigliceridos'] : null;
        $vldl = isset($data['vldl']) ? (float) $data['vldl'] : null;

        // Calcular colesterol no-HDL
        $colNoHdl = ($colTotal !== null && $hdl !== null) ? round($colTotal - $hdl, 2) : null;

        // Calcular VLDL si no viene pero hay triglicéridos
        if ($vldl === null && $trigliceridos !== null && $trigliceridos > 0) {
            $vldl = round($trigliceridos / 5, 2);
        }

        // Evaluar dislipidemia automática
        $dislipidemia = ($colTotal !== null && $colTotal >= 200)
            || ($ldl !== null && $ldl >= 130)
            || ($hdl !== null && $hdl < 50)
            || ($trigliceridos !== null && $trigliceridos >= 150)
            || ($colNoHdl !== null && $colNoHdl >= 130);

        return [
            'colesterol_no_hdl' => $colNoHdl,
            'vldl' => $vldl,
            'dislipidemia_auto' => $dislipidemia,
        ];
    }

    public function storePerfilLipidico(Request $request, Paciente $paciente): RedirectResponse
    {
        $validated = $request->validate($this->reglasPerfilLipidico());
        $indices = $this->calcularIndicesLipidicos($validated);

        $dislipidemia = ($validated['dislipidemia_sugerida'] ?? false) || $indices['dislipidemia_auto'];

        ResultadoPerfilLipidico::create([
            'id_consulta_endocrinologica' => $validated['id_consulta_endocrinologica'],
            'id_paciente'                 => $paciente->id_paciente,
            'id_endocrinologo'            => Auth::id(),
            'fecha_resultado'             => $validated['fecha_resultado'],
            'colesterol_total'            => $validated['colesterol_total'] ?? null,
            'hdl'                         => $validated['hdl'] ?? null,
            'ldl'                         => $validated['ldl'] ?? null,
            'vldl'                        => $indices['vldl'],
            'trigliceridos'               => $validated['trigliceridos'] ?? null,
            'colesterol_no_hdl'           => $indices['colesterol_no_hdl'],
            'dislipidemia_sugerida'       => $dislipidemia,
            'interpretacion'              => $validated['interpretacion'] ?? null,
            'estado'                      => 'registrado',
        ]);

        return back()->with('success', 'Perfil lipídico registrado correctamente.');
    }

    public function updatePerfilLipidico(Request $request, Paciente $paciente, ResultadoPerfilLipidico $perfilLipidico): RedirectResponse
    {
        $validated = $request->validate($this->reglasPerfilLipidico());
        $indices = $this->calcularIndicesLipidicos($validated);

        $dislipidemia = ($validated['dislipidemia_sugerida'] ?? false) || $indices['dislipidemia_auto'];

        $perfilLipidico->update([
            'fecha_resultado'             => $validated['fecha_resultado'],
            'colesterol_total'            => $validated['colesterol_total'] ?? null,
            'hdl'                         => $validated['hdl'] ?? null,
            'ldl'                         => $validated['ldl'] ?? null,
            'vldl'                        => $indices['vldl'],
            'trigliceridos'               => $validated['trigliceridos'] ?? null,
            'colesterol_no_hdl'           => $indices['colesterol_no_hdl'],
            'dislipidemia_sugerida'       => $dislipidemia,
            'interpretacion'              => $validated['interpretacion'] ?? null,
        ]);

        return back()->with('success', 'Perfil lipídico actualizado correctamente.');
    }

    // ─── Historial de Laboratorios ──────────────────────────────────────

    /**
     * Muestra el historial completo de todos los laboratorios de la paciente.
     */
    public function historial(Paciente $paciente): Response
    {
        $mapAndrogenico = fn ($r) => [
            'id' => $r->id_perfil_androgenico, 'fecha_resultado' => $r->fecha_resultado?->format('Y-m-d'),
            'testosterona_total' => $r->testosterona_total, 'testosterona_libre' => $r->testosterona_libre,
            'shbg' => $r->shbg, 'indice_androgenico_libre' => $r->indice_androgenico_libre,
            'dhea_s' => $r->dhea_s, 'androstenediona' => $r->androstenediona,
            'hiperandrogenismo_bioquimico' => $r->hiperandrogenismo_bioquimico,
            'interpretacion' => $r->interpretacion,
            'created_at' => $r->created_at?->format('Y-m-d H:i'), 'updated_at' => $r->updated_at?->format('Y-m-d H:i'),
        ];

        $mapGonadotropo = fn ($r) => [
            'id' => $r->id_perfil_gonadotropo, 'fecha_resultado' => $r->fecha_resultado?->format('Y-m-d'),
            'lh' => $r->lh, 'fsh' => $r->fsh, 'relacion_lh_fsh' => $r->relacion_lh_fsh,
            'estradiol' => $r->estradiol, 'progesterona' => $r->progesterona,
            'progesterona_dia_ciclo' => $r->progesterona_dia_ciclo, 'progesterona_fase_ciclo' => $r->progesterona_fase_ciclo,
            'interpretacion' => $r->interpretacion,
            'created_at' => $r->created_at?->format('Y-m-d H:i'), 'updated_at' => $r->updated_at?->format('Y-m-d H:i'),
        ];

        $mapDiferencial = fn ($r) => [
            'id' => $r->id_diferencial_endocrino, 'fecha_resultado' => $r->fecha_resultado?->format('Y-m-d'),
            'tsh' => $r->tsh, 't3_libre' => $r->t3_libre, 't4_libre' => $r->t4_libre,
            'prolactina' => $r->prolactina, 'diecisiete_oh_progesterona' => $r->diecisiete_oh_progesterona, 'cortisol' => $r->cortisol,
            'alteracion_tiroidea_descartada' => $r->alteracion_tiroidea_descartada,
            'hiperprolactinemia_descartada' => $r->hiperprolactinemia_descartada,
            'hiperplasia_suprarrenal_descartada' => $r->hiperplasia_suprarrenal_descartada,
            'cushing_descartado' => $r->cushing_descartado,
            'interpretacion' => $r->interpretacion,
            'created_at' => $r->created_at?->format('Y-m-d H:i'), 'updated_at' => $r->updated_at?->format('Y-m-d H:i'),
        ];

        $mapGlucosa = fn ($r) => [
            'id' => $r->id_glucosa_insulina, 'fecha_resultado' => $r->fecha_resultado?->format('Y-m-d'),
            'glucosa_ayunas' => $r->glucosa_ayunas, 'insulina_ayunas' => $r->insulina_ayunas,
            'homa_ir' => $r->homa_ir, 'hemoglobina_glicosilada' => $r->hemoglobina_glicosilada,
            'glucosa_2h_ogtt' => $r->glucosa_2h_ogtt, 'insulina_2h_ogtt' => $r->insulina_2h_ogtt,
            'hiperinsulinemia' => $r->hiperinsulinemia, 'resistencia_insulina_sugerida' => $r->resistencia_insulina_sugerida,
            'interpretacion' => $r->interpretacion,
            'created_at' => $r->created_at?->format('Y-m-d H:i'), 'updated_at' => $r->updated_at?->format('Y-m-d H:i'),
        ];

        $mapLipidico = fn ($r) => [
            'id' => $r->id_perfil_lipidico, 'fecha_resultado' => $r->fecha_resultado?->format('Y-m-d'),
            'colesterol_total' => $r->colesterol_total, 'hdl' => $r->hdl, 'ldl' => $r->ldl,
            'vldl' => $r->vldl, 'trigliceridos' => $r->trigliceridos, 'colesterol_no_hdl' => $r->colesterol_no_hdl,
            'dislipidemia_sugerida' => $r->dislipidemia_sugerida,
            'interpretacion' => $r->interpretacion,
            'created_at' => $r->created_at?->format('Y-m-d H:i'), 'updated_at' => $r->updated_at?->format('Y-m-d H:i'),
        ];

        return Inertia::render('Endocrinologo/Pacientes/PerfilClinico/HistorialLaboratorios', [
            'paciente' => [
                'id_paciente'     => $paciente->id_paciente,
                'nombre_completo' => trim(collect([$paciente->nombres, $paciente->apellido_paterno, $paciente->apellido_materno])->filter()->join(' ')),
                'ci'              => $paciente->ci,
            ],
            'historial' => [
                'perfil_androgenico'    => ResultadoPerfilAndrogenico::where('id_paciente', $paciente->id_paciente)->latest('created_at')->get()->map($mapAndrogenico),
                'perfil_gonadotropo'    => ResultadoPerfilGonadotropo::where('id_paciente', $paciente->id_paciente)->latest('created_at')->get()->map($mapGonadotropo),
                'diferencial_endocrino' => ResultadoDiferencialEndocrino::where('id_paciente', $paciente->id_paciente)->latest('created_at')->get()->map($mapDiferencial),
                'glucosa_insulina'      => ResultadoGlucosaInsulina::where('id_paciente', $paciente->id_paciente)->latest('created_at')->get()->map($mapGlucosa),
                'perfil_lipidico'       => ResultadoPerfilLipidico::where('id_paciente', $paciente->id_paciente)->latest('created_at')->get()->map($mapLipidico),
            ],
        ]);
    }
}
