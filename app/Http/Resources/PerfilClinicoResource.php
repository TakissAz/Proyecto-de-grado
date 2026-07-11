<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PerfilClinicoResource extends JsonResource
{
    public static $wrap = null;

    /**
     * Transforma el perfil clínico completo para Inertia/API.
     * Recibe un array con la estructura del PerfilClinicoService.
     */
    public function toArray(Request $request): array
    {
        $data = $this->resource;
        $paciente = $data['paciente'];

        return [
            'paciente' => [
                'id_paciente' => $paciente->id_paciente,
                'nombre_completo' => trim(collect([
                    $paciente->nombres,
                    $paciente->apellido_paterno,
                    $paciente->apellido_materno,
                ])->filter()->join(' ')),
                'nombres' => $paciente->nombres,
                'apellido_paterno' => $paciente->apellido_paterno,
                'apellido_materno' => $paciente->apellido_materno,
                'ci' => $paciente->ci,
                'fecha_nacimiento' => $paciente->fecha_nacimiento?->format('Y-m-d'),
                'edad' => $paciente->fecha_nacimiento?->age,
                'sexo' => $paciente->sexo,
                'telefono' => $paciente->telefono,
                'direccion' => $paciente->direccion,
                'ocupacion' => $paciente->ocupacion,
                'estado_civil' => $paciente->estado_civil,
                'fecha_registro' => $paciente->fecha_registro?->format('Y-m-d'),
                'estado' => $paciente->estado,
                'observaciones' => $paciente->observaciones,
                'user' => $paciente->user ? [
                    'id' => $paciente->user->id,
                    'name' => $paciente->user->name,
                    'email' => $paciente->user->email,
                ] : null,
            ],
            'resumen_clinico' => $data['resumen_clinico'],
            'estado_flujo' => $data['estado_flujo'],
            'secciones' => $data['secciones'],
            'alertas' => $data['alertas'],
            'auditoria' => $data['auditoria'],
            'consulta_inicial' => $data['consulta_inicial'],
            'historia_menstrual' => $data['historia_menstrual'],
            'hiperandrogenismo' => $data['hiperandrogenismo'],
            'antecedentes' => $data['antecedentes'],
            'evaluacion_fisica' => $data['evaluacion_fisica'],
            'laboratorios' => $data['laboratorios'],
            'ecografia' => $data['ecografia'],
            'evaluacion_pmos' => $data['evaluacion_pmos'],
            'diagnostico_pmos' => $data['diagnostico_pmos'],
            'evaluacion_ri' => $data['evaluacion_ri'],
            'diagnostico_ri' => $data['diagnostico_ri'],
        ];
    }
}
