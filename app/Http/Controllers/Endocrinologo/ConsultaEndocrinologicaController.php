<?php

namespace App\Http\Controllers\Endocrinologo;

use App\Http\Controllers\Controller;
use App\Models\ConsultaEndocrinologica;
use App\Models\Paciente;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConsultaEndocrinologicaController extends Controller
{
    /**
     * Almacena una nueva consulta endocrinológica para el paciente indicado.
     */
    public function store(Request $request, Paciente $paciente): RedirectResponse
    {
        $validated = $request->validate([
            'fecha_consulta'                 => ['required', 'date'],
            'motivo_consulta'                => ['required', 'string', 'max:500'],
            'sospecha_pmos'                  => ['boolean'],
            'sospecha_resistencia_insulina'  => ['boolean'],
            'observaciones_generales'        => ['nullable', 'string', 'max:2000'],
        ]);

        ConsultaEndocrinologica::create([
            'id_paciente'                   => $paciente->id_paciente,
            'id_endocrinologo'              => Auth::id(),
            'fecha_consulta'                => $validated['fecha_consulta'],
            'motivo_consulta'               => $validated['motivo_consulta'],
            'sospecha_pmos'                 => $validated['sospecha_pmos'] ?? false,
            'sospecha_resistencia_insulina' => $validated['sospecha_resistencia_insulina'] ?? false,
            'observaciones_generales'       => $validated['observaciones_generales'] ?? null,
            'estado'                        => 'abierta',
        ]);

        return back()->with('success', 'Consulta endocrinológica registrada correctamente.');
    }

    /**
     * Actualiza una consulta endocrinológica existente.
     */
    public function update(Request $request, Paciente $paciente, ConsultaEndocrinologica $consulta): RedirectResponse
    {
        $validated = $request->validate([
            'fecha_consulta'                 => ['required', 'date'],
            'motivo_consulta'                => ['required', 'string', 'max:500'],
            'sospecha_pmos'                  => ['boolean'],
            'sospecha_resistencia_insulina'  => ['boolean'],
            'observaciones_generales'        => ['nullable', 'string', 'max:2000'],
        ]);

        $consulta->update([
            'fecha_consulta'                => $validated['fecha_consulta'],
            'motivo_consulta'               => $validated['motivo_consulta'],
            'sospecha_pmos'                 => $validated['sospecha_pmos'] ?? false,
            'sospecha_resistencia_insulina' => $validated['sospecha_resistencia_insulina'] ?? false,
            'observaciones_generales'       => $validated['observaciones_generales'] ?? null,
        ]);

        return back()->with('success', 'Consulta actualizada correctamente.');
    }
}
