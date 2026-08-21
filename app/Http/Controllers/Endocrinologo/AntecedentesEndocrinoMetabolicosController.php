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
            'antecedentes_personales_detalle' => ['nullable', 'array', 'max:30'],
            'antecedentes_personales_detalle.*.antecedente' => ['required', 'string', 'max:150'],
            'antecedentes_personales_detalle.*.fecha_diagnostico' => ['nullable', 'date'],
            'antecedentes_personales_detalle.*.estado' => ['nullable', 'in:activo,controlado,resuelto,en_estudio'],
            'antecedentes_personales_detalle.*.observacion' => ['nullable', 'string', 'max:500'],
            'antecedentes_familiares_detalle' => ['nullable', 'array', 'max:30'],
            'antecedentes_familiares_detalle.*.antecedente' => ['required', 'string', 'max:150'],
            'antecedentes_familiares_detalle.*.parentesco' => ['required', 'string', 'max:50'],
            'antecedentes_familiares_detalle.*.observacion' => ['nullable', 'string', 'max:500'],
            'medicamentos_detalle' => ['nullable', 'array', 'max:30'],
            'medicamentos_detalle.*.nombre' => ['required', 'string', 'max:150'],
            'medicamentos_detalle.*.dosis' => ['nullable', 'string', 'max:100'],
            'medicamentos_detalle.*.frecuencia' => ['nullable', 'string', 'max:100'],
            'medicamentos_detalle.*.motivo' => ['nullable', 'string', 'max:250'],
            'medicamentos_detalle.*.fecha_inicio' => ['nullable', 'date'],
            'medicamentos_detalle.*.estado' => ['nullable', 'in:actual,suspendido,finalizado'],
        ];
    }

    public function store(Request $request, Paciente $paciente): RedirectResponse
    {
        $validated = $request->validate($this->reglas());

        AntecedenteEndocrinoMetabolico::create([
            'id_consulta_endocrinologica' => $validated['id_consulta_endocrinologica'],
            'id_paciente'                 => $paciente->id_paciente,
            ...$this->datosClinicos($validated),
            'estado'                      => 'activo',
        ]);

        return back()->with('success', 'Antecedentes endocrino-metabólicos registrados correctamente.');
    }

    public function update(Request $request, Paciente $paciente, AntecedenteEndocrinoMetabolico $antecedente): RedirectResponse
    {
        $validated = $request->validate($this->reglas());

        abort_unless($antecedente->id_paciente === $paciente->id_paciente, 404);

        $antecedente->update($this->datosClinicos($validated));

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
                'antecedentes_personales_detalle' => $r->antecedentes_personales_detalle,
                'antecedentes_familiares_detalle' => $r->antecedentes_familiares_detalle,
                'medicamentos_detalle'        => $r->medicamentos_detalle,
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

    private function datosClinicos(array $data): array
    {
        $personales = $data['antecedentes_personales_detalle'] ?? [];
        $familiares = $data['antecedentes_familiares_detalle'] ?? [];
        $medicamentos = $data['medicamentos_detalle'] ?? [];

        $textoPersonales = mb_strtolower(collect($personales)->pluck('antecedente')->join(' '));
        $textoFamiliares = mb_strtolower(collect($familiares)->pluck('antecedente')->join(' '));
        $textoMedicamentos = mb_strtolower(collect($medicamentos)->pluck('nombre')->join(' '));

        $contiene = static fn (string $texto, array $terminos): bool => collect($terminos)
            ->contains(fn (string $termino) => str_contains($texto, $termino));

        return [
            'antecedentes_personales_detalle' => $personales,
            'antecedentes_familiares_detalle' => $familiares,
            'medicamentos_detalle' => $medicamentos,
            'diabetes_personal' => $contiene($textoPersonales, ['diabetes']),
            'hipertension_personal' => $contiene($textoPersonales, ['hipertensi', 'presiÃ³n alta', 'presion alta']),
            'dislipidemia_personal' => $contiene($textoPersonales, ['dislipidem', 'colesterol', 'triglic']),
            'enfermedad_tiroidea' => $contiene($textoPersonales, ['tiroid', 'hipotiroid', 'hipertiroid']),
            'hiperprolactinemia_previa' => $contiene($textoPersonales, ['hiperprolact', 'prolactina alta']),
            'diabetes_familiar' => $contiene($textoFamiliares, ['diabetes']),
            'hipertension_familiar' => $contiene($textoFamiliares, ['hipertensi', 'presiÃ³n alta', 'presion alta']),
            'dislipidemia_familiar' => $contiene($textoFamiliares, ['dislipidem', 'colesterol', 'triglic']),
            'uso_anticonceptivos' => $contiene($textoMedicamentos, ['anticoncept']),
            'uso_metformina' => $contiene($textoMedicamentos, ['metformina']),
            'uso_corticoides' => $contiene($textoMedicamentos, ['cortico', 'prednis', 'dexametason']),
            'otros_medicamentos' => collect($medicamentos)->pluck('nombre')->filter()->join(', ') ?: null,
            'observaciones' => $data['observaciones'] ?? null,
        ];
    }
}
