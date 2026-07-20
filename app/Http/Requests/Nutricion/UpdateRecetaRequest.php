<?php

namespace App\Http\Requests\Nutricion;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateRecetaRequest extends FormRequest
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
            'descripcion' => ['nullable', 'string'],
            'tipo_comida' => ['required', 'string', 'in:desayuno,media_manana,almuerzo,merienda,cena,colacion'],
            'porciones' => ['required', 'integer', 'min:1'],
            'tiempo_preparacion_minutos' => ['nullable', 'integer', 'min:1'],
            'preparacion' => ['nullable', 'string'],
            'observaciones' => ['nullable', 'string'],
            'ingredientes' => ['required', 'array', 'min:1'],
            'ingredientes.*.id_receta_alimento' => ['nullable', 'integer'],
            'ingredientes.*.id_alimento' => ['required', 'exists:alimentos,id_alimento'],
            'ingredientes.*.cantidad' => ['required', 'numeric', 'min:0.01'],
            'ingredientes.*.unidad' => ['required', 'string', 'max:30'],
            'ingredientes.*.observaciones' => ['nullable', 'string'],
        ];
    }
}
