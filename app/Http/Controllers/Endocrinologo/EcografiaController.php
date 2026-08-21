<?php

namespace App\Http\Controllers\Endocrinologo;

use App\Http\Controllers\Controller;
use App\Models\EvaluacionEcografica;
use App\Models\Paciente;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EcografiaController extends Controller
{
    private function reglas(): array
    {
        return [
            'id_consulta_endocrinologica' => ['required', 'integer', 'exists:consultas_endocrinologicas,id_consulta_endocrinologica'],
            'fecha_ecografia'             => ['required', 'date'],
            'tipo_ecografia'              => ['nullable', 'string', Rule::in(['transvaginal', 'abdominal', 'otra'])],
            'volumen_ovario_derecho'      => ['nullable', 'numeric', 'min:0'],
            'volumen_ovario_izquierdo'    => ['nullable', 'numeric', 'min:0'],
            'foliculos_ovario_derecho'    => ['nullable', 'integer', 'min:0', 'max:50'],
            'foliculos_ovario_izquierdo'  => ['nullable', 'integer', 'min:0', 'max:50'],
            'distribucion_periferica'     => ['boolean'],
            'imagen_ecografia'            => ['nullable', 'image', 'max:5120'],
            'observaciones'               => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * Determina si la morfología es compatible con PMOS según criterios:
     * - Volumen ovárico >= 10 mL en al menos un ovario, O
     * - Conteo folicular >= 12 en al menos un ovario (criterio Rotterdam clásico)
     */
    private function evaluarMorfologia(array $data): bool
    {
        $volDer = isset($data['volumen_ovario_derecho']) ? (float) $data['volumen_ovario_derecho'] : null;
        $volIzq = isset($data['volumen_ovario_izquierdo']) ? (float) $data['volumen_ovario_izquierdo'] : null;
        $folDer = $data['foliculos_ovario_derecho'] ?? null;
        $folIzq = $data['foliculos_ovario_izquierdo'] ?? null;

        $volumenElevado = ($volDer !== null && $volDer >= 10) || ($volIzq !== null && $volIzq >= 10);
        $foliculosElevados = ($folDer !== null && $folDer >= 12) || ($folIzq !== null && $folIzq >= 12);

        return $volumenElevado || $foliculosElevados;
    }

    public function store(Request $request, Paciente $paciente): RedirectResponse
    {
        $validated = $request->validate($this->reglas());
        $morfologia = $this->evaluarMorfologia($validated);

        $archivoPath = null;
        if ($request->hasFile('imagen_ecografia')) {
            $archivoPath = $request->file('imagen_ecografia')->store(
                "ecografias/{$paciente->id_paciente}",
                'public'
            );
        }

        EvaluacionEcografica::create([
            'id_consulta_endocrinologica' => $validated['id_consulta_endocrinologica'],
            'id_paciente'                 => $paciente->id_paciente,
            'id_endocrinologo'            => Auth::id(),
            'fecha_ecografia'             => $validated['fecha_ecografia'],
            'tipo_ecografia'              => $validated['tipo_ecografia'] ?? null,
            'volumen_ovario_derecho'      => $validated['volumen_ovario_derecho'] ?? null,
            'volumen_ovario_izquierdo'    => $validated['volumen_ovario_izquierdo'] ?? null,
            'foliculos_ovario_derecho'    => $validated['foliculos_ovario_derecho'] ?? null,
            'foliculos_ovario_izquierdo'  => $validated['foliculos_ovario_izquierdo'] ?? null,
            'morfologia_compatible_pmos'  => $morfologia,
            'distribucion_periferica'     => $validated['distribucion_periferica'] ?? false,
            'archivo_informe'             => $archivoPath,
            'observaciones'               => $validated['observaciones'] ?? null,
            'estado'                      => 'registrada',
        ]);

        return back()->with('success', 'Evaluación ecográfica registrada correctamente.');
    }

    public function update(Request $request, Paciente $paciente, EvaluacionEcografica $ecografia): RedirectResponse
    {
        $validated = $request->validate($this->reglas());
        $morfologia = $this->evaluarMorfologia($validated);

        $archivoPath = $ecografia->archivo_informe;
        if ($request->hasFile('imagen_ecografia')) {
            // Eliminar imagen anterior si existe
            if ($archivoPath) {
                Storage::disk('public')->delete($archivoPath);
            }
            $archivoPath = $request->file('imagen_ecografia')->store(
                "ecografias/{$paciente->id_paciente}",
                'public'
            );
        }

        $ecografia->update([
            'fecha_ecografia'             => $validated['fecha_ecografia'],
            'tipo_ecografia'              => $validated['tipo_ecografia'] ?? null,
            'volumen_ovario_derecho'      => $validated['volumen_ovario_derecho'] ?? null,
            'volumen_ovario_izquierdo'    => $validated['volumen_ovario_izquierdo'] ?? null,
            'foliculos_ovario_derecho'    => $validated['foliculos_ovario_derecho'] ?? null,
            'foliculos_ovario_izquierdo'  => $validated['foliculos_ovario_izquierdo'] ?? null,
            'morfologia_compatible_pmos'  => $morfologia,
            'distribucion_periferica'     => $validated['distribucion_periferica'] ?? false,
            'archivo_informe'             => $archivoPath,
            'observaciones'               => $validated['observaciones'] ?? null,
        ]);

        return back()->with('success', 'Evaluación ecográfica actualizada correctamente.');
    }

    /**
     * Muestra el historial completo de evaluaciones ecográficas.
     */
    public function historial(Paciente $paciente): Response
    {
        $registros = EvaluacionEcografica::where('id_paciente', $paciente->id_paciente)
            ->latest('fecha_ecografia')
            ->get()
            ->map(fn ($r) => [
                'id_ecografia'                => $r->id_ecografia,
                'fecha_ecografia'             => $r->fecha_ecografia?->format('Y-m-d'),
                'tipo_ecografia'              => $r->tipo_ecografia,
                'volumen_ovario_derecho'      => $r->volumen_ovario_derecho,
                'volumen_ovario_izquierdo'    => $r->volumen_ovario_izquierdo,
                'foliculos_ovario_derecho'    => $r->foliculos_ovario_derecho,
                'foliculos_ovario_izquierdo'  => $r->foliculos_ovario_izquierdo,
                'morfologia_compatible_pmos'  => $r->morfologia_compatible_pmos,
                'distribucion_periferica'     => $r->distribucion_periferica,
                'imagen_url'                  => $r->archivo_informe ? '/storage/' . $r->archivo_informe : null,
                'observaciones'               => $r->observaciones,
                'estado'                      => $r->estado,
                'created_at'                  => $r->created_at?->format('Y-m-d H:i'),
                'updated_at'                  => $r->updated_at?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Endocrinologo/Pacientes/PerfilClinico/HistorialEcografia', [
            'paciente' => [
                'id_paciente'     => $paciente->id_paciente,
                'nombre_completo' => trim(collect([$paciente->nombres, $paciente->apellido_paterno, $paciente->apellido_materno])->filter()->join(' ')),
                'ci'              => $paciente->ci,
            ],
            'registros' => $registros,
        ]);
    }
}
