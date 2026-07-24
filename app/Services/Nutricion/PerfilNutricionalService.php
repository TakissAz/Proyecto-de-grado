<?php

namespace App\Services\Nutricion;

use App\Models\ConsultaNutricional;
use App\Models\EvaluacionNutricional;
use App\Models\HabitoAlimentario;
use App\Models\ObjetivoNutricional;
use App\Models\Paciente;
use App\Models\PreferenciaAlimentaria;
use App\Models\RestriccionAlimentaria;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PerfilNutricionalService
{
    public function crearConsulta(Paciente $paciente, int $nutricionistaId, array $datos): ConsultaNutricional
    {
        return DB::transaction(fn () => $paciente->consultasNutricionales()->create($datos + [
            'id_nutricionista' => $nutricionistaId,
            'estado' => true,
        ]));
    }

    public function actualizarConsulta(Paciente $paciente, ConsultaNutricional $consulta, array $datos): ConsultaNutricional
    {
        return $this->actualizarDelPaciente($paciente, $consulta, $datos);
    }

    public function crearEvaluacion(Paciente $paciente, int $nutricionistaId, array $datos): EvaluacionNutricional
    {
        $datos = $this->agregarCalculos($datos);
        return $this->crearRelacionado($paciente, $nutricionistaId, EvaluacionNutricional::class, $datos);
    }

    public function actualizarEvaluacion(Paciente $paciente, EvaluacionNutricional $evaluacion, array $datos): EvaluacionNutricional
    {
        return $this->actualizarDelPaciente($paciente, $evaluacion, $this->agregarCalculos($datos));
    }

    public function crearHabito(Paciente $paciente, int $nutricionistaId, array $datos): HabitoAlimentario
    {
        return $this->crearRelacionado($paciente, $nutricionistaId, HabitoAlimentario::class, $datos);
    }

    public function actualizarHabito(Paciente $paciente, HabitoAlimentario $habito, array $datos): HabitoAlimentario
    {
        return $this->actualizarDelPaciente($paciente, $habito, $datos);
    }

    public function crearPreferencia(Paciente $paciente, int $nutricionistaId, array $datos): PreferenciaAlimentaria
    {
        return $this->crearRelacionado($paciente, $nutricionistaId, PreferenciaAlimentaria::class, $datos);
    }

    public function actualizarPreferencia(Paciente $paciente, PreferenciaAlimentaria $preferencia, array $datos): PreferenciaAlimentaria
    {
        return $this->actualizarDelPaciente($paciente, $preferencia, $datos);
    }

    public function crearRestriccion(Paciente $paciente, int $nutricionistaId, array $datos): RestriccionAlimentaria
    {
        return $this->crearRelacionado($paciente, $nutricionistaId, RestriccionAlimentaria::class, $datos);
    }

    public function actualizarRestriccion(Paciente $paciente, RestriccionAlimentaria $restriccion, array $datos): RestriccionAlimentaria
    {
        return $this->actualizarDelPaciente($paciente, $restriccion, $datos);
    }

    public function crearObjetivo(Paciente $paciente, int $nutricionistaId, array $datos): ObjetivoNutricional
    {
        return $this->crearRelacionado($paciente, $nutricionistaId, ObjetivoNutricional::class, $datos);
    }

    public function actualizarObjetivo(Paciente $paciente, ObjetivoNutricional $objetivo, array $datos): ObjetivoNutricional
    {
        return $this->actualizarDelPaciente($paciente, $objetivo, $datos);
    }

    private function crearRelacionado(Paciente $paciente, int $nutricionistaId, string $modelo, array $datos): Model
    {
        $consulta = $paciente->consultasNutricionales()
            ->where('estado', true)->latest('fecha_consulta')->latest('id_consulta_nutricional')->first();

        if (! $consulta) {
            throw ValidationException::withMessages([
                'consulta' => 'Primero debe registrar una consulta nutricional activa.',
            ]);
        }

        return DB::transaction(fn () => $modelo::create($datos + [
            'id_paciente' => $paciente->id_paciente,
            'id_nutricionista' => $nutricionistaId,
            'id_consulta_nutricional' => $consulta->id_consulta_nutricional,
            'estado' => true,
        ]));
    }

    private function actualizarDelPaciente(Paciente $paciente, Model $registro, array $datos): Model
    {
        abort_unless((int) $registro->id_paciente === (int) $paciente->id_paciente, 404);
        DB::transaction(fn () => $registro->update($datos));
        return $registro->refresh();
    }

    private function agregarCalculos(array $datos): array
    {
        $peso = isset($datos['peso']) ? (float) $datos['peso'] : null;
        $talla = isset($datos['talla']) ? (float) $datos['talla'] : null;
        $cintura = isset($datos['circunferencia_cintura']) ? (float) $datos['circunferencia_cintura'] : null;
        $cadera = isset($datos['circunferencia_cadera']) ? (float) $datos['circunferencia_cadera'] : null;
        $datos['imc'] = $peso && $talla ? round($peso / ($talla ** 2), 2) : null;
        $datos['indice_cintura_cadera'] = $cintura && $cadera ? round($cintura / $cadera, 2) : null;
        return $datos;
    }
}
