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
        $texto = static fn (mixed $valor): ?string => trim((string) $valor) === ''
            ? null
            : preg_replace('/\s+/u', ' ', trim((string) $valor));

        $this->replace(array_merge($this->except('id_rol'), [
            'nombres' => $texto($this->input('nombres')),
            'apellido_paterno' => $texto($this->input('apellido_paterno')),
            'apellido_materno' => $texto($this->input('apellido_materno')),
            'ci' => strtoupper((string) $texto($this->input('ci'))),
            'email' => strtolower(trim((string) $this->input('email'))),
            'telefono' => $texto($this->input('telefono')),
            'direccion' => $texto($this->input('direccion')),
            'ocupacion' => $texto($this->input('ocupacion')),
            'estado_civil' => $texto($this->input('estado_civil')),
            'fecha_registro' => $this->input('fecha_registro') === '' ? null : $this->input('fecha_registro'),
            'observaciones' => $texto($this->input('observaciones')),
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
            $validator->errors()->add('fecha_nacimiento', 'La paciente debe tener entre 21 y 35 años.');
        }
    }

    protected function patientRules(?int $ignoreUserId = null, bool $passwordRequired = true): array
    {
        $paciente = $this->route('paciente');
        $pacienteId = $paciente instanceof \App\Models\Paciente
            ? $paciente->getKey()
            : (is_numeric($paciente) ? (int) $paciente : null);

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
            'nombres' => ['required', 'string', 'min:2', 'max:150', "regex:/^[\\pL\\s'\-]+$/u"],
            'apellido_paterno' => ['required', 'string', 'min:2', 'max:100', "regex:/^[\\pL\\s'\-]+$/u"],
            'apellido_materno' => ['nullable', 'string', 'min:2', 'max:100', "regex:/^[\\pL\\s'\-]+$/u"],
            'ci' => ['required', 'string', 'min:4', 'max:20', 'regex:/^[A-Z0-9.\-]+$/', Rule::unique('pacientes', 'ci')->ignore($pacienteId, 'id_paciente')],
            'fecha_nacimiento' => ['required', 'date', 'before_or_equal:today'],
            'sexo' => ['required', Rule::in(['femenino'])],
            'telefono' => ['nullable', 'string', 'min:7', 'max:30', 'regex:/^\+?[0-9 ()\-]+$/'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'ocupacion' => ['nullable', 'string', 'max:120'],
            'estado_civil' => ['nullable', 'string', 'max:50'],
            'fecha_registro' => ['nullable', 'date'],
            'email' => $emailRules,
            'password' => $passwordRequired ? ['required', 'string', 'min:8', 'max:72'] : ['nullable', 'string', 'min:8', 'max:72'],
            'observaciones' => ['nullable', 'string', 'max:2000'],
        ];
    }

    protected function commonMessages(): array
    {
        return [
            'nombres.required' => 'Los nombres son obligatorios.',
            'nombres.regex' => 'Los nombres solo pueden contener letras, espacios, apóstrofes y guiones.',
            'apellido_paterno.required' => 'El apellido paterno es obligatorio.',
            'apellido_paterno.regex' => 'El apellido paterno contiene caracteres no válidos.',
            'apellido_materno.regex' => 'El apellido materno contiene caracteres no válidos.',
            'ci.required' => 'El CI es obligatorio.',
            'ci.unique' => 'Ya existe un paciente con este CI.',
            'ci.regex' => 'El CI solo puede contener letras, números, puntos y guiones.',
            'fecha_nacimiento.required' => 'La fecha de nacimiento es obligatoria.',
            'fecha_nacimiento.date' => 'La fecha de nacimiento no es valida.',
            'fecha_nacimiento.before_or_equal' => 'La fecha de nacimiento no puede ser futura.',
            'sexo.required' => 'El sexo es obligatorio.',
            'sexo.in' => 'El sexo debe ser femenino.',
            'telefono.regex' => 'El teléfono contiene caracteres no válidos.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico no es válido.',
            'email.unique' => 'Ya existe un usuario con este correo electrónico.',
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
