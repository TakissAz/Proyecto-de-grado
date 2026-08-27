<?php

namespace App\Http\Requests\Nutricion;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ReglaNutricionalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::user()?->tieneRol('nutricionista') === true;
    }

    public function rules(): array
    {
        $regla = $this->route('reglaNutricional');

        return [
            'codigo' => ['required', 'string', 'max:30', 'regex:/^[A-Z0-9-]+$/', Rule::unique('reglas_nutricionales', 'codigo')->ignore($regla?->getKey(), 'id_regla_nutricional')],
            'nombre' => ['required', 'string', 'max:150'],
            'tipo_regla' => ['required', Rule::in(['ajuste_calorico', 'distribucion_macros', 'limite_calorico'])],
            'condicion_campo' => ['required', Rule::in(['objetivo_principal', 'peso', 'talla', 'edad', 'nivel_actividad', 'calorias_objetivo'])],
            'condicion_operador' => ['required', Rule::in(['default', '=', '!=', '>', '>=', '<', '<=', 'in', 'not_in'])],
            'condicion_valor' => ['nullable', 'string', 'max:500'],
            'prioridad' => ['required', 'integer', 'min:1', 'max:999'],
            'descripcion' => ['nullable', 'string', 'max:1000'],
            'fuente' => ['nullable', 'string', 'max:255'],
            'ajuste_calorico' => ['nullable', 'numeric', 'between:-1000,1000'],
            'porcentaje_proteinas' => ['nullable', 'numeric', 'between:0,100'],
            'porcentaje_carbohidratos' => ['nullable', 'numeric', 'between:0,100'],
            'porcentaje_grasas' => ['nullable', 'numeric', 'between:0,100'],
            'fibra_diaria' => ['nullable', 'numeric', 'between:0,100'],
            'calorias_minimas' => ['nullable', 'numeric', 'between:800,3000'],
            'observacion_resultado' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($this->input('condicion_operador') !== 'default' && blank($this->input('condicion_valor'))) {
                $validator->errors()->add('condicion_valor', 'Indica el valor que debe cumplir la condición.');
            }

            $camposResultado = ['ajuste_calorico', 'porcentaje_proteinas', 'porcentaje_carbohidratos', 'porcentaje_grasas', 'fibra_diaria', 'calorias_minimas', 'observacion_resultado'];
            if (collect($camposResultado)->every(fn (string $campo) => blank($this->input($campo)))) {
                $validator->errors()->add('resultado', 'La regla debe producir al menos un resultado nutricional.');
            }

            $macros = collect(['porcentaje_proteinas', 'porcentaje_carbohidratos', 'porcentaje_grasas'])
                ->map(fn (string $campo) => $this->input($campo));
            if ($macros->filter(fn ($valor) => ! blank($valor))->isNotEmpty()) {
                if ($macros->contains(fn ($valor) => blank($valor)) || abs($macros->sum() - 100) > 0.01) {
                    $validator->errors()->add('porcentaje_proteinas', 'Los porcentajes de proteínas, carbohidratos y grasas deben estar completos y sumar 100%.');
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'codigo.unique' => 'Ya existe una regla con este código.',
            'codigo.regex' => 'Usa únicamente letras mayúsculas, números y guiones.',
        ];
    }
}
