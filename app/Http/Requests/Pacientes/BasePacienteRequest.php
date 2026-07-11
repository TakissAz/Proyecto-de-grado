<?php

namespace App\Http\Requests\Pacientes;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

abstract class BasePacienteRequest extends FormRequest
{
    protected function sanitizeInput(): void
    {
        $this->replace(array_merge($this->except('id_rol'), [
            'email' => strtolower(trim((string) $this->input('email'))),
            'telefono' => $this->input('telefono') === '' ? null : $this->input('telefono'),
            'direccion' => $this->input('direccion') === '' ? null : $this->input('direccion'),
            'ocupacion' => $this->input('ocupacion') === '' ? null : $this->input('ocupacion'),
            'estado_civil' => $this->input('estado_civil') === '' ? null : $this->input('estado_civil'),
            'fecha_registro' => $this->input('fecha_registro') === '' ? null : $this->input('fecha_registro'),
            'observaciones' => $this->input('observaciones') === '' ? null : $this->input('observaciones'),
            'password' => $this->input('password') === '' ? null : $this->input('password'),
        ]));
    }

    protected function edadEsValida(Validator $validator): void
    {
        $fechaNacimiento = $this->input('fecha_nacimiento');

        if (empty($fechaNacimiento) || $validator->errors()->has('fecha_nacimiento')) {
            return;
        }

        try {
            $age = Carbon::parse($fechaNacimiento)->age;
        } catch (\Throwable) {
            $validator->errors()->add('fecha_nacimiento', 'La fecha de nacimiento no es valida.');

            return;
        }

        if ($age < 21 || $age > 35) {
            $validator->errors()->add('fecha_nacimiento', 'La paciente debe tener entre 21 y 35 anos.');
        }
    }

    protected function patientRules(?int $ignoreUserId = null, bool $passwordRequired = true): array
    {
        $emailRules = [
            'required',
            'email',
            'max:255',
        ];

        $uniqueEmail = Rule::unique('users', 'email');

        if ($ignoreUserId !== null) {
            $uniqueEmail = $uniqueEmail->ignore($ignoreUserId);
        }

        $emailRules[] = $uniqueEmail;

        return [
            'nombres' => ['required', 'string', 'max:150'],
            'apellido_paterno' => ['required', 'string', 'max:100'],
            'apellido_materno' => ['nullable', 'string', 'max:100'],
            'ci' => ['required', 'string', 'max:20'],
            'fecha_nacimiento' => ['required', 'date'],
            'sexo' => ['required', Rule::in(['femenino'])],
            'telefono' => ['nullable', 'string', 'max:30'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'ocupacion' => ['nullable', 'string', 'max:120'],
            'estado_civil' => ['nullable', 'string', 'max:50'],
            'fecha_registro' => ['nullable', 'date'],
            'email' => $emailRules,
            'password' => $passwordRequired ? ['required', 'string', 'min:8'] : ['nullable', 'string', 'min:8'],
            'observaciones' => ['nullable', 'string'],
        ];
    }

    protected function commonMessages(): array
    {
        return [
            'nombres.required' => 'Los nombres son obligatorios.',
            'apellido_paterno.required' => 'El apellido paterno es obligatorio.',
            'ci.required' => 'El CI es obligatorio.',
            'ci.unique' => 'Ya existe un paciente con este CI.',
            'fecha_nacimiento.required' => 'La fecha de nacimiento es obligatoria.',
            'fecha_nacimiento.date' => 'La fecha de nacimiento no es valida.',
            'sexo.required' => 'El sexo es obligatorio.',
            'sexo.in' => 'El sexo debe ser femenino.',
            'email.required' => 'El correo electronico es obligatorio.',
            'email.email' => 'El correo electronico no es valido.',
            'email.unique' => 'Ya existe un usuario con este correo electronico.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
        ];
    }

    protected function rolesPermitidos(): bool
    {
        $user = Auth::user();

        return $user !== null && (
            $user->tieneRol('nutricionista') ||
            $user->tieneRol('endocrinologo') ||
            $user->tieneRol('administrador')
        );
    }
}