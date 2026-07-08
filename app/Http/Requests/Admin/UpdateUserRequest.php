<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = Auth::user();

        return $user !== null && $user->tieneRol('administrador');
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => [
                'nullable',
                'string',
                'min:8',
            ],
            'estado' => [
                'required',
                Rule::in(['activo', 'inactivo', 'bloqueado']),
            ],
            'id_rol' => [
                'required',
                'integer',
                'exists:roles,id_rol',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del usuario es obligatorio.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico no tiene un formato válido.',
            'email.unique' => 'Ya existe otro usuario con este correo electrónico.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'estado.required' => 'El estado es obligatorio.',
            'estado.in' => 'El estado seleccionado no es válido.',
            'id_rol.required' => 'Debe asignar un rol al usuario.',
            'id_rol.exists' => 'El rol seleccionado no existe.',
        ];
    }
}