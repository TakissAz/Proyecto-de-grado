<?php

namespace App\Http\Requests\Pacientes;

use Illuminate\Validation\Validator;

class StorePacienteRequest extends BasePacienteRequest
{
    public function authorize(): bool
    {
        $user = \Illuminate\Support\Facades\Auth::user();

        return $user !== null && ($user->tieneRol('nutricionista') || $user->tieneRol('endocrinologo') || $user->tieneRol('administrador'));
    }

    protected function prepareForValidation(): void
    {
        $this->sanitizeInput();
    }

    public function rules(): array
    {
        return $this->patientRules(null, true);
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $this->edadEsValida($validator);
        });
    }

    public function messages(): array
    {
        return $this->commonMessages();
    }
}