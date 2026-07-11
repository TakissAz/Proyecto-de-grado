<?php

namespace App\Http\Controllers\Endocrinologo;

use App\Http\Controllers\Controller;
use App\Models\EvaluacionFisicaEndocrina;
use App\Models\Paciente;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EvaluacionFisicaController extends Controller
{
    private function reglas(): array
    {
        return [
            'id_consulta_endocrinologica' => ['required', 'integer', 'exists:consultas_endocrinologicas,id_consulta_endocrinologica'],
            'peso'                        => ['nullable', 'numeric', 'min:20', 'max:300'],
            'talla'                       => ['nullable', 'numeric', 'min:0.50', 'max:2.50'],
            'circunferencia_cintura'      => ['nullable', 'numeric', 'min:40', 'max:200'],
            'circunferencia_cadera'       => ['nullable', 'numeric', 'min:50', 'max:200'],
            'presion_sistolica'           => ['nullable', 'integer', 'min:60', 'max:250'],
            'presion_diastolica'          => ['nullable', 'integer', 'min:30', 'max:150'],
            'acantosis_nigricans'         => ['boolean'],
            'skin_tags'                   => ['boolean'],
            'galactorrea'                 => ['boolean'],
            'hirsutismo_visible'          => ['boolean'],
            'puntaje_ferriman_gallwey'    => ['nullable', 'integer', 'min:0', 'max:36'],
            'acne_visible'                => ['boolean'],
            'alopecia_visible'            => ['boolean'],
            'observaciones'               => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * Calcula IMC e índice cintura-cadera a partir de los datos validados.
     */
    private function calcularIndices(array $data): array
    {
        $peso = $data['peso'] ?? null;
        $talla = $data['talla'] ?? null;
        $cintura = $data['circunferencia_cintura'] ?? null;
        $cadera = $data['circunferencia_cadera'] ?? null;

        $imc = ($peso && $talla && $talla > 0) ? round($peso / ($talla * $talla), 2) : null;
        $icc = ($cintura && $cadera && $cadera > 0) ? round($cintura / $cadera, 2) : null;

        return [
            'imc' => $imc,
            'indice_cintura_cadera' => $icc,
        ];
    }

    public function store(Request $request, Paciente $paciente): RedirectResponse
    {
        $validated = $request->validate($this->reglas());
        $indices = $this->calcularIndices($validated);

        EvaluacionFisicaEndocrina::create([
            'id_consulta_endocrinologica' => $validated['id_consulta_endocrinologica'],
            'id_paciente'                 => $paciente->id_paciente,
            'peso'                        => $validated['peso'] ?? null,
            'talla'                       => $validated['talla'] ?? null,
            'imc'                         => $indices['imc'],
            'circunferencia_cintura'      => $validated['circunferencia_cintura'] ?? null,
            'circunferencia_cadera'       => $validated['circunferencia_cadera'] ?? null,
            'indice_cintura_cadera'       => $indices['indice_cintura_cadera'],
            'presion_sistolica'           => $validated['presion_sistolica'] ?? null,
            'presion_diastolica'          => $validated['presion_diastolica'] ?? null,
            'acantosis_nigricans'         => $validated['acantosis_nigricans'] ?? false,
            'skin_tags'                   => $validated['skin_tags'] ?? false,
            'galactorrea'                 => $validated['galactorrea'] ?? false,
            'hirsutismo_visible'          => $validated['hirsutismo_visible'] ?? false,
            'puntaje_ferriman_gallwey'    => $validated['puntaje_ferriman_gallwey'] ?? null,
            'acne_visible'                => $validated['acne_visible'] ?? false,
            'alopecia_visible'            => $validated['alopecia_visible'] ?? false,
            'observaciones'               => $validated['observaciones'] ?? null,
            'estado'                      => 'activo',
        ]);

        return back()->with('success', 'Evaluación física registrada correctamente.');
    }

    public function update(Request $request, Paciente $paciente, EvaluacionFisicaEndocrina $evaluacion): RedirectResponse
    {
        $validated = $request->validate($this->reglas());
        $indices = $this->calcularIndices($validated);

        $evaluacion->update([
            'peso'                        => $validated['peso'] ?? null,
            'talla'                       => $validated['talla'] ?? null,
            'imc'                         => $indices['imc'],
            'circunferencia_cintura'      => $validated['circunferencia_cintura'] ?? null,
            'circunferencia_cadera'       => $validated['circunferencia_cadera'] ?? null,
            'indice_cintura_cadera'       => $indices['indice_cintura_cadera'],
            'presion_sistolica'           => $validated['presion_sistolica'] ?? null,
            'presion_diastolica'          => $validated['presion_diastolica'] ?? null,
            'acantosis_nigricans'         => $validated['acantosis_nigricans'] ?? false,
            'skin_tags'                   => $validated['skin_tags'] ?? false,
            'galactorrea'                 => $validated['galactorrea'] ?? false,
            'hirsutismo_visible'          => $validated['hirsutismo_visible'] ?? false,
            'puntaje_ferriman_gallwey'    => $validated['puntaje_ferriman_gallwey'] ?? null,
            'acne_visible'                => $validated['acne_visible'] ?? false,
            'alopecia_visible'            => $validated['alopecia_visible'] ?? false,
            'observaciones'               => $validated['observaciones'] ?? null,
        ]);

        return back()->with('success', 'Evaluación física actualizada correctamente.');
    }

    /**
     * Muestra el historial completo de evaluaciones físicas endocrinas.
     */
    public function historial(Paciente $paciente): Response
    {
        $registros = EvaluacionFisicaEndocrina::where('id_paciente', $paciente->id_paciente)
            ->latest('created_at')
            ->get()
            ->map(fn ($r) => [
                'id_evaluacion_fisica'        => $r->id_evaluacion_fisica,
                'peso'                        => $r->peso,
                'talla'                       => $r->talla,
                'imc'                         => $r->imc,
                'circunferencia_cintura'      => $r->circunferencia_cintura,
                'circunferencia_cadera'       => $r->circunferencia_cadera,
                'indice_cintura_cadera'       => $r->indice_cintura_cadera,
                'presion_sistolica'           => $r->presion_sistolica,
                'presion_diastolica'          => $r->presion_diastolica,
                'acantosis_nigricans'         => $r->acantosis_nigricans,
                'skin_tags'                   => $r->skin_tags,
                'galactorrea'                 => $r->galactorrea,
                'hirsutismo_visible'          => $r->hirsutismo_visible,
                'puntaje_ferriman_gallwey'    => $r->puntaje_ferriman_gallwey,
                'acne_visible'               => $r->acne_visible,
                'alopecia_visible'            => $r->alopecia_visible,
                'observaciones'               => $r->observaciones,
                'estado'                      => $r->estado,
                'created_at'                  => $r->created_at?->format('Y-m-d H:i'),
                'updated_at'                  => $r->updated_at?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Endocrinologo/Pacientes/PerfilClinico/HistorialEvaluacionFisica', [
            'paciente' => [
                'id_paciente'     => $paciente->id_paciente,
                'nombre_completo' => trim(collect([$paciente->nombres, $paciente->apellido_paterno, $paciente->apellido_materno])->filter()->join(' ')),
                'ci'              => $paciente->ci,
            ],
            'registros' => $registros,
        ]);
    }
}
