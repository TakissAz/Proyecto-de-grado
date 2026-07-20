<?php

namespace App\Http\Requests\Nutricion;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateAlimentoRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = Auth::user();

        return $user !== null && (
            $user->tieneRol('nutricionista') ||
            $user->tieneRol('administrador')
        );
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:150'],
            'grupo_alimentario' => ['required', 'string', 'in:proteina,carbohidrato,verdura,fruta,lacteo,grasa,legumbre,semilla,bebida,otro'],
            'unidad_base' => ['required', 'string', 'in:g,ml,unidad'],
            'cantidad_base' => ['required', 'numeric', 'min:0.01'],
            'calorias' => ['required', 'numeric', 'min:0'],
            'proteinas' => ['required', 'numeric', 'min:0'],
            'carbohidratos' => ['required', 'numeric', 'min:0'],
            'grasas' => ['required', 'numeric', 'min:0'],
            'fibra' => ['nullable', 'numeric', 'min:0'],
            'indice_glucemico' => ['nullable', 'integer', 'min:0', 'max:100'],
            'observaciones' => ['nullable', 'string'],
        ];
    }
}
