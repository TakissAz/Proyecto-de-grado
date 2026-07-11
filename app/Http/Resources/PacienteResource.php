<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PacienteResource extends JsonResource
{
    /**
     * Desactiva el wrapper 'data' para que Inertia reciba el objeto plano.
     * Sin esto, el frontend recibe { data: { id_paciente: ... } } en vez de { id_paciente: ... }.
     */
    public static $wrap = null;
    public function toArray(Request $request): array
    {
        return [
            'id_paciente' => $this->id_paciente,
            'user_id' => $this->user_id,
            'nombres' => $this->nombres,
            'apellido_paterno' => $this->apellido_paterno,
            'apellido_materno' => $this->apellido_materno,
            'nombre_completo' => trim(collect([
                $this->nombres,
                $this->apellido_paterno,
                $this->apellido_materno,
            ])->filter()->join(' ')),
            'ci' => $this->ci,
            'fecha_nacimiento' => $this->fecha_nacimiento?->format('Y-m-d'),
            'edad' => $this->fecha_nacimiento?->age,
            'sexo' => $this->sexo,
            'telefono' => $this->telefono,
            'direccion' => $this->direccion,
            'ocupacion' => $this->ocupacion,
            'estado_civil' => $this->estado_civil,
            'fecha_registro' => $this->fecha_registro?->format('Y-m-d'),
            'estado' => $this->estado,
            'observaciones' => $this->observaciones,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user?->id,
                    'name' => $this->user?->name,
                    'email' => $this->user?->email,
                    'estado' => $this->user?->estado,
                    'roles' => $this->user?->relationLoaded('roles')
                        ? $this->user->roles->map(function ($rol) {
                            return [
                                'id_rol' => $rol->id_rol,
                                'nombre' => $rol->nombre,
                                'descripcion' => $rol->descripcion,
                                'estado' => $rol->pivot?->estado,
                            ];
                        })->values()
                        : [],
                ];
            }),
        ];
    }
}