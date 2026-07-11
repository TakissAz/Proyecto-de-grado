<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Pacientes\BasePacienteRequest;
use Illuminate\Validation\Validator;

class StorePacienteRequest extends BasePacienteRequest
{
    public function authorize(): bool
    {
        $user = \Illuminate\Support\Facades\Auth::user();

        return $user !== null && $user->tieneRol('administrador');
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