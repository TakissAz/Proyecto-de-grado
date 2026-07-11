<?php

namespace App\Http\Requests\Pacientes;

use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Validator;

class UpdatePacienteRequest extends BasePacienteRequest
{
    public function authorize(): bool
    {
        $user = Auth::user();

        return $user !== null && ($user->tieneRol('nutricionista') || $user->tieneRol('endocrinologo') || $user->tieneRol('administrador'));
    }

    protected function prepareForValidation(): void
    {
        $this->sanitizeInput();
    }

    public function rules(): array
    {
        $paciente = $this->route('paciente');
        $userId = $paciente?->user_id;

        return $this->patientRules($userId, false);
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