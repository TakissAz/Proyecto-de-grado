<?php

namespace App\Services\Nutricion;

class ExplicacionComponentePlanService
{
    public function extraer(?string $observaciones): array
    {
        $texto = trim((string) $observaciones);
        preg_match('/Puntaje experto:\s*(-?\d+(?:\.\d+)?)/iu', $texto, $puntaje);
        preg_match('/Puntaje ajustado por diversidad:\s*(-?\d+(?:\.\d+)?)/iu', $texto, $ajustado);
        preg_match('/Ranking Groq:\s*(\d+(?:\.\d+)?)\/100\.\s*(.*)$/isu', $texto, $groq);
        preg_match(
            '/(Receta repetida porque existen menos de 7 alternativas compatibles para este tiempo de comida|Única receta compatible disponible para este tiempo de comida)\./iu',
            $texto,
            $repeticion
        );

        $limpio = preg_replace([
            '/Puntaje experto:\s*-?\d+(?:\.\d+)?\.\s*/iu',
            '/Puntaje ajustado por diversidad:\s*-?\d+(?:\.\d+)?\.\s*/iu',
            '/Ranking Groq:\s*\d+(?:\.\d+)?\/100\.\s*.*$/isu',
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
            'asistido_por_groq' => isset($groq[1]),
            'puntaje_groq' => isset($groq[1]) ? (float) $groq[1] : null,
            'motivos_groq' => isset($groq[2]) && trim($groq[2]) !== '' ? [trim($groq[2])] : [],
            'motivos' => $motivos,
            'advertencias' => isset($repeticion[1]) ? [$repeticion[1].'.'] : [],
            'texto_original' => $texto,
        ];
    }
}
