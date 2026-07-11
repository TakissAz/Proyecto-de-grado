<?php

namespace App\Http\Controllers\Endocrinologo;

use App\Http\Controllers\Controller;
use App\Models\AntecedenteEndocrinoMetabolico;
use App\Models\Paciente;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AntecedentesEndocrinoMetabolicosController extends Controller
{
    private function reglas(): array
    {
        return [
            'id_consulta_endocrinologica' => ['required', 'integer', 'exists:consultas_endocrinologicas,id_consulta_endocrinologica'],
            'diabetes_familiar'           => ['boolean'],
            'diabetes_personal'           => ['boolean'],
            'hipertension_familiar'       => ['boolean'],
            'hipertension_personal'       => ['boolean'],
            'dislipidemia_familiar'       => ['boolean'],
            'dislipidemia_personal'       => ['boolean'],
            'enfermedad_tiroidea'         => ['boolean'],
            'hiperprolactinemia_previa'   => ['boolean'],
            'uso_anticonceptivos'         => ['boolean'],
            'uso_metformina'              => ['boolean'],
            'uso_corticoides'             => ['boolean'],
            'otros_medicamentos'          => ['nullable', 'string', 'max:2000'],
            'observaciones'               => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function store(Request $request, Paciente $paciente): RedirectResponse
    {
        $validated = $request->validate($this->reglas());

        AntecedenteEndocrinoMetabolico::create([
            'id_consulta_endocrinologica' => $validated['id_consulta_endocrinologica'],
            'id_paciente'                 => $paciente->id_paciente,
            'diabetes_familiar'           => $validated['diabetes_familiar'] ?? false,
            'diabetes_personal'           => $validated['diabetes_personal'] ?? false,
            'hipertension_familiar'       => $validated['hipertension_familiar'] ?? false,
            'hipertension_personal'       => $validated['hipertension_personal'] ?? false,
            'dislipidemia_familiar'       => $validated['dislipidemia_familiar'] ?? false,
            'dislipidemia_personal'       => $validated['dislipidemia_personal'] ?? false,
            'enfermedad_tiroidea'         => $validated['enfermedad_tiroidea'] ?? false,
            'hiperprolactinemia_previa'   => $validated['hiperprolactinemia_previa'] ?? false,
            'uso_anticonceptivos'         => $validated['uso_anticonceptivos'] ?? false,
            'uso_metformina'              => $validated['uso_metformina'] ?? false,
            'uso_corticoides'             => $validated['uso_corticoides'] ?? false,
            'otros_medicamentos'          => $validated['otros_medicamentos'] ?? null,
            'observaciones'               => $validated['observaciones'] ?? null,
            'estado'                      => 'activo',
        ]);

        return back()->with('success', 'Antecedentes endocrino-metabólicos registrados correctamente.');
    }

    public function update(Request $request, Paciente $paciente, AntecedenteEndocrinoMetabolico $antecedente): RedirectResponse
    {
        $validated = $request->validate($this->reglas());

        $antecedente->update([
            'diabetes_familiar'           => $validated['diabetes_familiar'] ?? false,
            'diabetes_personal'           => $validated['diabetes_personal'] ?? false,
            'hipertension_familiar'       => $validated['hipertension_familiar'] ?? false,
            'hipertension_personal'       => $validated['hipertension_personal'] ?? false,
            'dislipidemia_familiar'       => $validated['dislipidemia_familiar'] ?? false,
            'dislipidemia_personal'       => $validated['dislipidemia_personal'] ?? false,
            'enfermedad_tiroidea'         => $validated['enfermedad_tiroidea'] ?? false,
            'hiperprolactinemia_previa'   => $validated['hiperprolactinemia_previa'] ?? false,
            'uso_anticonceptivos'         => $validated['uso_anticonceptivos'] ?? false,
            'uso_metformina'              => $validated['uso_metformina'] ?? false,
            'uso_corticoides'             => $validated['uso_corticoides'] ?? false,
            'otros_medicamentos'          => $validated['otros_medicamentos'] ?? null,
            'observaciones'               => $validated['observaciones'] ?? null,
        ]);

        return back()->with('success', 'Antecedentes endocrino-metabólicos actualizados correctamente.');
    }

    /**
     * Muestra el historial completo de antecedentes endocrino-metabólicos.
     */
    public function historial(Paciente $paciente): Response
    {
        $registros = AntecedenteEndocrinoMetabolico::where('id_paciente', $paciente->id_paciente)
            ->latest('created_at')
            ->get()
            ->map(fn ($r) => [
                'id_antecedente'              => $r->id_antecedente,
                'id_consulta_endocrinologica' => $r->id_consulta_endocrinologica,
                'diabetes_familiar'           => $r->diabetes_familiar,
                'diabetes_personal'           => $r->diabetes_personal,
                'hipertension_familiar'       => $r->hipertension_familiar,
                'hipertension_personal'       => $r->hipertension_personal,
                'dislipidemia_familiar'       => $r->dislipidemia_familiar,
                'dislipidemia_personal'       => $r->dislipidemia_personal,
                'enfermedad_tiroidea'         => $r->enfermedad_tiroidea,
                'hiperprolactinemia_previa'   => $r->hiperprolactinemia_previa,
                'uso_anticonceptivos'         => $r->uso_anticonceptivos,
                'uso_metformina'              => $r->uso_metformina,
                'uso_corticoides'             => $r->uso_corticoides,
                'otros_medicamentos'          => $r->otros_medicamentos,
                'observaciones'               => $r->observaciones,
                'estado'                      => $r->estado,
                'created_at'                  => $r->created_at?->format('Y-m-d H:i'),
                'updated_at'                  => $r->updated_at?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Endocrinologo/Pacientes/PerfilClinico/HistorialAntecedentes', [
            'paciente' => [
                'id_paciente'     => $paciente->id_paciente,
                'nombre_completo' => trim(collect([$paciente->nombres, $paciente->apellido_paterno, $paciente->apellido_materno])->filter()->join(' ')),
                'ci'              => $paciente->ci,
            ],
            'registros' => $registros,
        ]);
    }
}
