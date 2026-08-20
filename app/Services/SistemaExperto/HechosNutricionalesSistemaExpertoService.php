<?php

namespace App\Services\SistemaExperto;

use App\Models\Paciente;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class HechosNutricionalesSistemaExpertoService
{
    public function construirHechosNutricionales(Paciente $paciente): array
    {
        $pmos = $this->diagnosticoPreferido($paciente, 'diagnosticosPmos', 'id_diagnostico_pmos');
        $ri = $this->diagnosticoPreferido($paciente, 'diagnosticosResistenciaInsulina', 'id_diagnostico_ri');
        $evaluacion = $this->ultimoActivo($paciente, 'evaluacionesNutricionales', 'id_evaluacion_nutricional');
        $habitos = $this->ultimoActivo($paciente, 'habitosAlimentarios', 'id_habito_alimentario');
        $preferencias = $this->ultimoActivo($paciente, 'preferenciasAlimentarias', 'id_preferencia_alimentaria');
        $restricciones = $this->ultimoActivo($paciente, 'restriccionesAlimentarias', 'id_restriccion_alimentaria');
        $objetivo = $this->ultimoActivo($paciente, 'objetivosNutricionales', 'id_objetivo_nutricional');
        $requerimiento = $this->ultimoActivo($paciente, 'requerimientosNutricionales', 'id_requerimiento_nutricional');

        return [
            'paciente' => [
                'id_paciente' => $paciente->getKey(),
                'edad' => $paciente->fecha_nacimiento?->age,
                'sexo' => $paciente->sexo,
            ],
            'diagnostico_pmos' => [
                'diagnostico_confirmado' => (bool) ($pmos?->diagnostico_confirmado ?? false),
                'fenotipo_pmos' => $pmos?->fenotipo_pmos,
                'severidad_clinica' => $pmos?->severidad_clinica,
                'riesgo_metabolico' => $pmos?->riesgo_metabolico,
                'total_criterios_rotterdam' => $this->enteroONull($pmos?->total_criterios_rotterdam),
                'estado_validacion_experta' => $pmos?->estado_validacion_experta,
                'confianza_experta' => $this->numeroONull($pmos?->confianza_experta),
            ],
            'diagnostico_resistencia_insulina' => [
                'resistencia_confirmada' => (bool) ($ri?->resistencia_confirmada ?? false),
                'grado_resistencia' => $ri?->grado_resistencia,
                'riesgo_diabetes' => $ri?->riesgo_diabetes,
                'riesgo_cardiometabolico' => $ri?->riesgo_cardiometabolico,
                'homa_ir' => $this->numeroONull($ri?->homa_ir),
                'quicki' => $this->numeroONull($ri?->quicki),
                'estado_validacion_experta' => $ri?->estado_validacion_experta,
                'confianza_experta' => $this->numeroONull($ri?->confianza_experta),
            ],
            'evaluacion_nutricional' => $this->campos($evaluacion, [
                'peso', 'talla', 'imc', 'circunferencia_cintura', 'circunferencia_cadera',
                'indice_cintura_cadera', 'porcentaje_grasa', 'masa_muscular', 'nivel_actividad',
            ]),
            'habitos_alimentarios' => $this->campos($habitos, [
                'comidas_por_dia', 'horarios_regulares', 'consume_desayuno', 'consumo_agua_litros',
                'consumo_azucar', 'consumo_ultraprocesados', 'consumo_frituras',
                'consumo_bebidas_azucaradas', 'frecuencia_frutas_verduras', 'cena_tardia',
                'ansiedad_por_comida', 'hambre_nocturna',
            ], ['horarios_regulares', 'consume_desayuno', 'cena_tardia', 'ansiedad_por_comida', 'hambre_nocturna']),
            'preferencias_alimentarias' => $this->camposLista($preferencias, [
                'alimentos_preferidos', 'alimentos_no_preferidos', 'comidas_preferidas',
                'comidas_frecuentes', 'preparaciones_preferidas', 'sabores_preferidos',
            ]),
            'restricciones_alimentarias' => $this->camposLista($restricciones, [
                'alergias', 'intolerancias', 'alimentos_restringidos', 'alimentos_no_tolerados',
                'alimentos_rechazados',
            ]),
            'objetivo_nutricional' => $this->campos($objetivo, [
                'objetivo_principal', 'objetivo_secundario', 'meta_peso', 'meta_cintura',
                'plazo_semanas', 'enfoque_nutricional', 'prioridad',
            ]),
            'requerimiento_nutricional' => [
                'calorias_objetivo' => $this->numeroONull($requerimiento?->calorias_objetivo),
                'proteinas_diarias' => $this->numeroONull($requerimiento?->proteinas_diarias),
                'carbohidratos_diarias' => $this->numeroONull($requerimiento?->carbohidratos_diarios),
                'grasas_diarias' => $this->numeroONull($requerimiento?->grasas_diarias),
                'fibra_diaria' => $this->numeroONull($requerimiento?->fibra_diaria),
                'porcentaje_proteinas' => $this->numeroONull($requerimiento?->porcentaje_proteinas),
                'porcentaje_carbohidratos' => $this->numeroONull($requerimiento?->porcentaje_carbohidratos),
                'porcentaje_grasas' => $this->numeroONull($requerimiento?->porcentaje_grasas),
                'reglas_aplicadas' => $requerimiento?->reglas_aplicadas ?? [],
            ],
        ];
    }

    private function diagnosticoPreferido(Paciente $paciente, string $relacion, string $clave): ?Model
    {
        $registros = $this->registros($paciente, $relacion);
        $validados = $registros->filter(fn (Model $modelo): bool => in_array(
            $modelo->estado_validacion_experta,
            ['aprobado', 'validado'],
            true
        ));

        if ($validados->isNotEmpty()) {
            return $validados->sortByDesc($clave)->first();
        }

        return $registros
            ->filter(fn (Model $modelo): bool => (bool) $modelo->generado_por_motor_experto
                && $modelo->estado_validacion_experta !== 'rechazado')
            ->sortByDesc($clave)
            ->first();
    }

    private function ultimoActivo(Paciente $paciente, string $relacion, string $clave): ?Model
    {
        return $this->registros($paciente, $relacion)
            ->filter(fn (Model $modelo): bool => (bool) $modelo->estado)
            ->sortByDesc($clave)
            ->first();
    }

    private function registros(Paciente $paciente, string $relacion): Collection
    {
        if ($paciente->relationLoaded($relacion)) {
            return $paciente->getRelation($relacion);
        }

        return $paciente->{$relacion}()->get();
    }

    private function campos(?Model $modelo, array $campos, array $booleanos = []): array
    {
        $resultado = [];
        foreach ($campos as $campo) {
            $resultado[$campo] = in_array($campo, $booleanos, true)
                ? (bool) ($modelo?->{$campo} ?? false)
                : $modelo?->{$campo};
        }

        return $resultado;
    }

    private function camposLista(?Model $modelo, array $campos): array
    {
        return collect($campos)->mapWithKeys(
            fn (string $campo): array => [$campo => $this->normalizarLista($modelo?->{$campo})]
        )->all();
    }

    private function normalizarLista(mixed $valor): array
    {
        if ($valor === null || $valor === '') {
            return [];
        }
        if (is_string($valor)) {
            $decodificado = json_decode($valor, true);
            $valor = is_array($decodificado)
                ? $decodificado
                : (preg_split('/[,;\r\n]+/u', $valor) ?: []);
        } elseif (! is_array($valor)) {
            $valor = [$valor];
        }

        return collect($valor)->flatten()->filter(fn ($item) => is_scalar($item))
            ->map(fn ($item): string => trim((string) $item))
            ->filter()->unique(fn ($item) => mb_strtolower($item))->values()->all();
    }

    private function numeroONull(mixed $valor): ?float
    {
        return is_numeric($valor) ? (float) $valor : null;
    }

    private function enteroONull(mixed $valor): ?int
    {
        return is_numeric($valor) ? (int) $valor : null;
    }
}
