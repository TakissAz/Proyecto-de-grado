<?php

namespace App\Http\Requests\Nutricion;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

abstract class BasePerfilNutricionalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return match ($this->seccion()) {
            'consulta' => [
                'fecha_consulta' => ['required', 'date'],
                'estado_consulta' => ['required', Rule::in(['abierta', 'en_seguimiento', 'cerrada', 'anulada'])],
                'motivo_consulta' => ['nullable', 'string'],
                'observaciones_generales' => ['nullable', 'string'],
            ],
            'evaluacion' => [
                'fecha_evaluacion' => ['required', 'date'],
                'peso' => ['nullable', 'numeric', 'min:1'],
                'talla' => ['nullable', 'numeric', 'min:0.5', 'max:2.5'],
                'circunferencia_cintura' => ['nullable', 'numeric', 'min:1'],
                'circunferencia_cadera' => ['nullable', 'numeric', 'min:1'],
                'porcentaje_grasa' => ['nullable', 'numeric', 'min:0', 'max:100'],
                'masa_muscular' => ['nullable', 'numeric', 'min:0'],
                'nivel_actividad' => ['nullable', Rule::in(['sedentario', 'ligero', 'moderado', 'activo', 'muy_activo'])],
                'observaciones' => ['nullable', 'string'],
            ],
            'habitos' => [
                'comidas_por_dia' => ['nullable', 'integer', 'min:1', 'max:10'],
                'horarios_regulares' => ['required', 'boolean'],
                'consume_desayuno' => ['required', 'boolean'],
                'consumo_agua_litros' => ['nullable', 'numeric', 'min:0', 'max:10'],
                'consumo_azucar' => ['nullable', Rule::in(['nunca', 'ocasional', 'frecuente', 'diario'])],
                'consumo_ultraprocesados' => ['nullable', Rule::in(['nunca', 'ocasional', 'frecuente', 'diario'])],
                'consumo_frituras' => ['nullable', Rule::in(['nunca', 'ocasional', 'frecuente', 'diario'])],
                'consumo_bebidas_azucaradas' => ['nullable', Rule::in(['nunca', 'ocasional', 'frecuente', 'diario'])],
                'frecuencia_frutas_verduras' => ['nullable', Rule::in(['nunca', 'ocasional', 'frecuente', 'diario'])],
                'cena_tardia' => ['required', 'boolean'],
                'ansiedad_por_comida' => ['required', 'boolean'],
                'hambre_nocturna' => ['required', 'boolean'],
                'observaciones' => ['nullable', 'string'],
            ],
            'preferencias' => array_fill_keys([
                'alimentos_preferidos', 'alimentos_no_preferidos', 'comidas_preferidas',
                'comidas_frecuentes', 'preparaciones_preferidas', 'sabores_preferidos', 'observaciones',
            ], ['nullable', 'string']),
            'restricciones' => array_fill_keys([
                'alergias', 'intolerancias', 'alimentos_restringidos',
                'alimentos_no_tolerados', 'alimentos_rechazados', 'observaciones',
            ], ['nullable', 'string']),
            'objetivos' => [
                'objetivo_principal' => ['required', Rule::in(['perdida_peso', 'mejora_resistencia_insulina', 'control_glucemico', 'mejora_composicion_corporal', 'mantenimiento', 'educacion_nutricional', 'otro'])],
                'objetivo_secundario' => ['nullable', 'string'],
                'meta_peso' => ['nullable', 'numeric', 'min:1'],
                'meta_cintura' => ['nullable', 'numeric', 'min:1'],
                'plazo_semanas' => ['nullable', 'integer', 'min:1'],
                'enfoque_nutricional' => ['nullable', Rule::in(['bajo_indice_glucemico', 'alto_en_fibra', 'alto_en_proteina', 'control_calorico', 'antiinflamatorio', 'balanceado'])],
                'prioridad' => ['required', Rule::in(['baja', 'media', 'alta'])],
                'observaciones' => ['nullable', 'string'],
            ],
        };
    }

    abstract protected function seccion(): string;
}
