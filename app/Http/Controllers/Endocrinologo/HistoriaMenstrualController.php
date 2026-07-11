<?php

namespace App\Http\Controllers\Endocrinologo;

use App\Http\Controllers\Controller;
use App\Models\HistoriaMenstrual;
use App\Models\Paciente;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class HistoriaMenstrualController extends Controller
{
    private function reglas(): array
    {
        return [
            'id_consulta_endocrinologica' => ['required', 'integer', 'exists:consultas_endocrinologicas,id_consulta_endocrinologica'],
            'fecha_ultima_menstruacion'   => ['nullable', 'date'],
            'edad_menarquia'              => ['nullable', 'integer', 'min:8', 'max:20'],
            'regularidad_ciclo'           => ['nullable', 'string', Rule::in(['regular', 'irregular', 'ausente'])],
            'duracion_ciclo_dias'         => ['nullable', 'integer', 'min:1', 'max:90'],
            'intervalo_entre_ciclos_dias' => ['nullable', 'integer', 'min:15', 'max:180'],
            'amenorrea'                   => ['boolean'],
            'oligomenorrea'               => ['boolean'],
            'sangrado_abundante'          => ['boolean'],
            'dolor_menstrual'             => ['boolean'],
            'sospecha_anovulacion'        => ['boolean'],
            'progesterona_lutea'          => ['nullable', 'numeric', 'min:0', 'max:100'],
            'confirma_anovulacion_por_progesterona' => ['boolean'],
            'observaciones'               => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * Registra una nueva historia menstrual para la paciente.
     */
    public function store(Request $request, Paciente $paciente): RedirectResponse
    {
        $validated = $request->validate($this->reglas());

        HistoriaMenstrual::create([
            'id_consulta_endocrinologica'           => $validated['id_consulta_endocrinologica'],
            'id_paciente'                           => $paciente->id_paciente,
            'fecha_ultima_menstruacion'             => $validated['fecha_ultima_menstruacion'] ?? null,
            'edad_menarquia'                        => $validated['edad_menarquia'] ?? null,
            'regularidad_ciclo'                     => $validated['regularidad_ciclo'] ?? null,
            'duracion_ciclo_dias'                   => $validated['duracion_ciclo_dias'] ?? null,
            'intervalo_entre_ciclos_dias'           => $validated['intervalo_entre_ciclos_dias'] ?? null,
            'amenorrea'                             => $validated['amenorrea'] ?? false,
            'oligomenorrea'                         => $validated['oligomenorrea'] ?? false,
            'sangrado_abundante'                    => $validated['sangrado_abundante'] ?? false,
            'dolor_menstrual'                       => $validated['dolor_menstrual'] ?? false,
            'sospecha_anovulacion'                  => $validated['sospecha_anovulacion'] ?? false,
            'progesterona_lutea'                    => $validated['progesterona_lutea'] ?? null,
            'confirma_anovulacion_por_progesterona' => $validated['confirma_anovulacion_por_progesterona'] ?? false,
            'observaciones'                         => $validated['observaciones'] ?? null,
            'estado'                                => 'activo',
        ]);

        return back()->with('success', 'Historia menstrual registrada correctamente.');
    }

    /**
     * Actualiza la historia menstrual existente.
     */
    public function update(Request $request, Paciente $paciente, HistoriaMenstrual $historia): RedirectResponse
    {
        $validated = $request->validate($this->reglas());

        $historia->update([
            'fecha_ultima_menstruacion'             => $validated['fecha_ultima_menstruacion'] ?? null,
            'edad_menarquia'                        => $validated['edad_menarquia'] ?? null,
            'regularidad_ciclo'                     => $validated['regularidad_ciclo'] ?? null,
            'duracion_ciclo_dias'                   => $validated['duracion_ciclo_dias'] ?? null,
            'intervalo_entre_ciclos_dias'           => $validated['intervalo_entre_ciclos_dias'] ?? null,
            'amenorrea'                             => $validated['amenorrea'] ?? false,
            'oligomenorrea'                         => $validated['oligomenorrea'] ?? false,
            'sangrado_abundante'                    => $validated['sangrado_abundante'] ?? false,
            'dolor_menstrual'                       => $validated['dolor_menstrual'] ?? false,
            'sospecha_anovulacion'                  => $validated['sospecha_anovulacion'] ?? false,
            'progesterona_lutea'                    => $validated['progesterona_lutea'] ?? null,
            'confirma_anovulacion_por_progesterona' => $validated['confirma_anovulacion_por_progesterona'] ?? false,
            'observaciones'                         => $validated['observaciones'] ?? null,
        ]);

        return back()->with('success', 'Historia menstrual actualizada correctamente.');
    }

    /**
     * Muestra el historial completo de historia menstrual de la paciente.
     */
    public function historial(Paciente $paciente): Response
    {
        $registros = HistoriaMenstrual::where('id_paciente', $paciente->id_paciente)
            ->latest('created_at')
            ->get()
            ->map(fn ($r) => [
                'id_historia_menstrual'                 => $r->id_historia_menstrual,
                'id_consulta_endocrinologica'           => $r->id_consulta_endocrinologica,
                'fecha_ultima_menstruacion'             => $r->fecha_ultima_menstruacion?->format('Y-m-d'),
                'edad_menarquia'                        => $r->edad_menarquia,
                'regularidad_ciclo'                     => $r->regularidad_ciclo,
                'duracion_ciclo_dias'                   => $r->duracion_ciclo_dias,
                'intervalo_entre_ciclos_dias'           => $r->intervalo_entre_ciclos_dias,
                'amenorrea'                             => $r->amenorrea,
                'oligomenorrea'                         => $r->oligomenorrea,
                'sangrado_abundante'                    => $r->sangrado_abundante,
                'dolor_menstrual'                       => $r->dolor_menstrual,
                'sospecha_anovulacion'                  => $r->sospecha_anovulacion,
                'progesterona_lutea'                    => $r->progesterona_lutea,
                'confirma_anovulacion_por_progesterona' => $r->confirma_anovulacion_por_progesterona,
                'observaciones'                         => $r->observaciones,
                'estado'                                => $r->estado,
                'created_at'                            => $r->created_at?->format('Y-m-d H:i'),
                'updated_at'                            => $r->updated_at?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Endocrinologo/Pacientes/PerfilClinico/HistorialMenstrual', [
            'paciente' => [
                'id_paciente' => $paciente->id_paciente,
                'nombre_completo' => trim(collect([
                    $paciente->nombres, $paciente->apellido_paterno, $paciente->apellido_materno,
                ])->filter()->join(' ')),
                'ci' => $paciente->ci,
            ],
            'registros' => $registros,
        ]);
    }
}
