<?php

namespace App\Services\Paciente;

use App\Models\Paciente;
use App\Models\SeguimientoSintomaPaciente;
use App\Models\User;
use Illuminate\Support\Collection;

class SeguimientoSintomasPacienteService
{
    public function guardar(Paciente $paciente, array $datos, User $usuario): SeguimientoSintomaPaciente
    {
        $fecha = $datos['fecha_registro'] ?? today()->toDateString();
        unset($datos['id_paciente'], $datos['registrado_por']);
        return SeguimientoSintomaPaciente::query()->updateOrCreate(
            ['id_paciente' => $paciente->getKey(), 'fecha_registro' => $fecha],
            [...$datos, 'registrado_por' => $usuario->getKey()]
        );
    }

    public function obtenerUltimos(Paciente $paciente, int $limite = 7): Collection
    {
        return $paciente->seguimientosSintomas()->latest('fecha_registro')->latest('id_seguimiento_sintoma_paciente')->limit($limite)->get();
    }

    public function obtenerResumen(Paciente $paciente): array
    {
        $ultimos = $this->obtenerUltimos($paciente);
        return [
            'registro_hoy' => $this->transformar($ultimos->first(fn ($r) => $r->fecha_registro->isToday())),
            'ultimos_registros' => $ultimos->map(fn ($r) => $this->transformar($r))->values()->all(),
            'indicadores' => $this->calcularIndicadores($paciente),
        ];
    }

    public function calcularIndicadores(Paciente $paciente): array
    {
        $registros = $this->obtenerUltimos($paciente);
        $frecuente = fn (callable $regla) => $registros->filter($regla)->count() >= 3;
        $indicadores = [
            'total_registros' => $paciente->seguimientosSintomas()->count(),
            'registros_ultimos_7_dias' => $registros->count(),
            'hambre_nocturna_frecuente' => $frecuente(fn ($r) => $r->hambre_nocturna),
            'ansiedad_comida_frecuente' => $frecuente(fn ($r) => in_array($r->ansiedad_por_comida, ['moderada', 'alta'], true)),
            'antojos_dulces_frecuentes' => $frecuente(fn ($r) => in_array($r->antojos_dulces, ['moderado', 'alto'], true)),
            'hinchazon_frecuente' => $frecuente(fn ($r) => in_array($r->hinchazon_abdominal, ['moderada', 'severa'], true)),
            'baja_energia_frecuente' => $frecuente(fn ($r) => $r->nivel_energia === 'baja'),
            'sueno_deficiente_frecuente' => $frecuente(fn ($r) => in_array($r->calidad_sueno, ['mala', 'regular'], true)),
            'actividad_fisica_baja' => $frecuente(fn ($r) => $r->actividad_fisica === 'ninguna'),
        ];
        $recomendaciones = collect();
        if ($indicadores['hambre_nocturna_frecuente']) $recomendaciones->push('Considerar ajustar la cena o merienda por hambre nocturna frecuente.');
        if ($indicadores['antojos_dulces_frecuentes']) $recomendaciones->push('Revisar consumo de carbohidratos simples por antojos dulces frecuentes.');
        if ($indicadores['hinchazon_frecuente']) $recomendaciones->push('Evaluar alimentos que puedan causar hinchazón.');
        if ($indicadores['baja_energia_frecuente'] || $indicadores['sueno_deficiente_frecuente']) $recomendaciones->push('Reforzar hidratación y horarios regulares.');
        if ($indicadores['ansiedad_comida_frecuente']) $recomendaciones->push('Considerar apoyo por ansiedad alimentaria frecuente.');
        $indicadores['alerta_general'] = collect($indicadores)->filter(fn ($v, $k) => str_ends_with($k, '_frecuente') || $k === 'actividad_fisica_baja')->contains(true);
        $indicadores['recomendaciones_para_nutricionista'] = $recomendaciones->all();
        return $indicadores;
    }

    private function transformar(?SeguimientoSintomaPaciente $registro): ?array
    {
        if (! $registro) return null;
        return [...$registro->only($registro->getFillable()), 'id_seguimiento_sintoma_paciente' => $registro->getKey(), 'fecha_registro' => $registro->fecha_registro->toDateString()];
    }
}
