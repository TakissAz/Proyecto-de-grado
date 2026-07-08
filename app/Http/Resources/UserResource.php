<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'estado' => $this->estado,
            'ultimo_acceso' => $this->ultimo_acceso?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'roles' => $this->whenLoaded('roles', function () {
                return $this->roles->map(function ($rol) {
                    return [
                        'id_rol' => $rol->id_rol,
                        'nombre' => $rol->nombre,
                        'descripcion' => $rol->descripcion,
                        'estado' => $rol->pivot?->estado,
                    ];
                })->values();
            }),
            'rol_principal' => $this->whenLoaded('roles', function () {
                $rol = $this->roles->first();

                if ($rol === null) {
                    return null;
                }

                return [
                    'id_rol' => $rol->id_rol,
                    'nombre' => $rol->nombre,
                    'descripcion' => $rol->descripcion,
                    'estado' => $rol->pivot?->estado,
                ];
            }),
        ];
    }
}