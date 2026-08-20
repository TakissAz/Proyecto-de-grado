<?php

namespace App\Services\Nutricion;

class ExplicacionComponentePlanService
{
    public function extraer(?string $observaciones): array
    {
        $texto = trim((string) $observaciones);
        preg_match('/Puntaje experto:\s*(-?\d+(?:\.\d+)?)/iu', $texto, $puntaje);
        preg_match('/Puntaje ajustado por diversidad:\s*(-?\d+(?:\.\d+)?)/iu', $texto, $ajustado);
        preg_match(
            '/(Receta repetida porque existen menos de 7 alternativas compatibles para este tiempo de comida|Única receta compatible disponible para este tiempo de comida)\./iu',
            $texto,
            $repeticion
        );

        $limpio = preg_replace([
            '/Puntaje experto:\s*-?\d+(?:\.\d+)?\.\s*/iu',
            '/Puntaje ajustado por diversidad:\s*-?\d+(?:\.\d+)?\.\s*/iu',
            '/^Motivos:\s*/iu',
            '/(Receta repetida porque existen menos de 7 alternativas compatibles para este tiempo de comida|Única receta compatible disponible para este tiempo de comida)\./iu',
        ], '', $texto) ?? '';

        $motivos = array_values(array_filter(array_map(
            fn (string $motivo): string => trim($motivo, " \t\n\r\0\x0B."),
            preg_split('/\.\s+/u', trim($limpio)) ?: []
        )));

        return [
            'puntaje_experto' => isset($puntaje[1]) ? (float) $puntaje[1] : null,
            'puntaje_ajustado' => isset($ajustado[1]) ? (float) $ajustado[1] : null,
            'motivos' => $motivos,
            'advertencias' => isset($repeticion[1]) ? [$repeticion[1].'.'] : [],
            'texto_original' => $texto,
        ];
    }
}
