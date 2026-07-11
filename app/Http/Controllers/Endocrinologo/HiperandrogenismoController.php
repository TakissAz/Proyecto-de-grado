<?php

namespace App\Http\Controllers\Endocrinologo;

use App\Http\Controllers\Controller;
use App\Models\HistoriaHiperandrogenica;
use App\Models\Paciente;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class HiperandrogenismoController extends Controller
{
    private function reglas(): array
    {
        return [
            'id_consulta_endocrinologica' => ['required', 'integer', 'exists:consultas_endocrinologicas,id_consulta_endocrinologica'],
            'acne'                        => ['boolean'],
            'acne_grado'                  => ['nullable', 'string', Rule::in(['no_aplica', 'leve', 'moderado', 'severo'])],
            'hirsutismo'                  => ['boolean'],
            'hirsutismo_zona'             => ['nullable', 'string', 'max:255'],
            'puntaje_ferriman_gallwey'    => ['nullable', 'integer', 'min:0', 'max:36'],
            'alopecia_androgenica'        => ['boolean'],
            'seborrea'                    => ['boolean'],
            'inicio_sintomas'             => ['nullable', 'string', 'max:255'],
            'progresion_sintomas'         => ['nullable', 'string', Rule::in(['estable', 'progresivo', 'regresivo'])],
            'observaciones'               => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function store(Request $request, Paciente $paciente): RedirectResponse
    {
        $validated = $request->validate($this->reglas());

        HistoriaHiperandrogenica::create([
            'id_consulta_endocrinologica' => $validated['id_consulta_endocrinologica'],
            'id_paciente'                 => $paciente->id_paciente,
            'acne'                        => $validated['acne'] ?? false,
            'acne_grado'                  => $validated['acne_grado'] ?? 'no_aplica',
            'hirsutismo'                  => $validated['hirsutismo'] ?? false,
            'hirsutismo_zona'             => $validated['hirsutismo_zona'] ?? null,
            'puntaje_ferriman_gallwey'    => $validated['puntaje_ferriman_gallwey'] ?? null,
            'alopecia_androgenica'        => $validated['alopecia_androgenica'] ?? false,
            'seborrea'                    => $validated['seborrea'] ?? false,
            'inicio_sintomas'             => $validated['inicio_sintomas'] ?? null,
            'progresion_sintomas'         => $validated['progresion_sintomas'] ?? null,
            'observaciones'               => $validated['observaciones'] ?? null,
            'estado'                      => 'activo',
        ]);

        return back()->with('success', 'Hiperandrogenismo registrado correctamente.');
    }

    public function update(Request $request, Paciente $paciente, HistoriaHiperandrogenica $hiperandrogenismo): RedirectResponse
    {
        $validated = $request->validate($this->reglas());

        $hiperandrogenismo->update([
            'acne'                        => $validated['acne'] ?? false,
            'acne_grado'                  => $validated['acne_grado'] ?? 'no_aplica',
            'hirsutismo'                  => $validated['hirsutismo'] ?? false,
            'hirsutismo_zona'             => $validated['hirsutismo_zona'] ?? null,
            'puntaje_ferriman_gallwey'    => $validated['puntaje_ferriman_gallwey'] ?? null,
            'alopecia_androgenica'        => $validated['alopecia_androgenica'] ?? false,
            'seborrea'                    => $validated['seborrea'] ?? false,
            'inicio_sintomas'             => $validated['inicio_sintomas'] ?? null,
            'progresion_sintomas'         => $validated['progresion_sintomas'] ?? null,
            'observaciones'               => $validated['observaciones'] ?? null,
        ]);

        return back()->with('success', 'Hiperandrogenismo actualizado correctamente.');
    }

    /**
     * Muestra el historial completo de hiperandrogenismo de la paciente.
     */
    public function historial(Paciente $paciente): Response
    {
        $registros = HistoriaHiperandrogenica::where('id_paciente', $paciente->id_paciente)
            ->latest('created_at')
            ->get()
            ->map(fn ($r) => [
                'id_historia_hiperandrogenica' => $r->id_historia_hiperandrogenica,
                'id_consulta_endocrinologica'  => $r->id_consulta_endocrinologica,
                'acne'                         => $r->acne,
                'acne_grado'                   => $r->acne_grado,
                'hirsutismo'                   => $r->hirsutismo,
                'hirsutismo_zona'              => $r->hirsutismo_zona,
                'puntaje_ferriman_gallwey'     => $r->puntaje_ferriman_gallwey,
                'alopecia_androgenica'         => $r->alopecia_androgenica,
                'seborrea'                     => $r->seborrea,
                'inicio_sintomas'              => $r->inicio_sintomas,
                'progresion_sintomas'          => $r->progresion_sintomas,
                'observaciones'                => $r->observaciones,
                'estado'                       => $r->estado,
                'created_at'                   => $r->created_at?->format('Y-m-d H:i'),
                'updated_at'                   => $r->updated_at?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Endocrinologo/Pacientes/PerfilClinico/HistorialHiperandrogenismo', [
            'paciente' => [
                'id_paciente'     => $paciente->id_paciente,
                'nombre_completo' => trim(collect([$paciente->nombres, $paciente->apellido_paterno, $paciente->apellido_materno])->filter()->join(' ')),
                'ci'              => $paciente->ci,
            ],
            'registros' => $registros,
        ]);
    }
}
