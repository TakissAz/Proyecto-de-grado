<?php

namespace App\Services\Citas;

use App\Models\Cita;
use Carbon\CarbonImmutable;
use DomainException;
use InvalidArgumentException;

class AgendaCitaService
{
    public const HORA_INICIO_LABORAL = '08:00';
    public const HORA_FIN_LABORAL = '17:10';
    public const DURACION_CITA = 60;       // Cada cita dura 1 hora
    public const DESCANSO_ENTRE_CITAS = 10; // 10 minutos entre citas
    public const BLOQUE_TOTAL = 70;        // 60 + 10 = 70 min por bloque

    // Mantenemos por compatibilidad, pero la duración real es fija
    public const DURACION_ESTANDAR = 60;
    public const DURACION_MINIMA = 60;
    public const DURACION_MAXIMA = 60;

    public function obtenerHorarioLaboral(): array
    {
        return ['inicio' => self::HORA_INICIO_LABORAL, 'fin' => self::HORA_FIN_LABORAL];
    }

    /**
     * Genera los bloques de horario disponibles para un día.
     * Cada bloque: 60 min cita + 15 min descanso (75 min total).
     * Horarios fijos: 09:00, 10:15, 11:30, 12:45, 14:00, 15:15.
     * Si la fecha es hoy, los bloques cuya hora de inicio ya pasó se marcan como no disponibles.
     */
    public function generarBloquesDisponibles(string $fecha, int $idProfesional, int $duracion = self::DURACION_CITA): array
    {
        $this->parseFecha($fecha);

        $esHoy = $fecha === now()->format('Y-m-d');
        $horaActual = now()->format('H:i');

        $inicio = $this->parseHora(self::HORA_INICIO_LABORAL);
        $finLaboral = $this->parseHora(self::HORA_FIN_LABORAL);
        $bloques = [];

        while ($inicio->addMinutes(self::DURACION_CITA)->lessThanOrEqualTo($finLaboral)) {
            $fin = $inicio->addMinutes(self::DURACION_CITA);
            $horaInicio = $inicio->format('H:i');
            $horaFin = $fin->format('H:i');

            // Si es hoy y la hora de inicio ya pasó, bloquear
            $pasado = $esHoy && $horaInicio < $horaActual;

            if ($pasado) {
                $disponible = false;
                $motivoBloqueo = 'Este horario ya pasó.';
            } else {
                $disponible = $this->validarDisponibilidadProfesional($idProfesional, $fecha, $horaInicio, $horaFin);
                $motivoBloqueo = $disponible ? null : 'El profesional ya tiene una cita en este horario.';
            }

            $bloques[] = [
                'hora_inicio' => $horaInicio,
                'hora_fin' => $horaFin,
                'disponible' => $disponible,
                'pasado' => $pasado,
                'motivo_bloqueo' => $motivoBloqueo,
            ];

            // Avanzar bloque completo: duración cita + descanso
            $inicio = $inicio->addMinutes(self::BLOQUE_TOTAL);
        }

        return $bloques;
    }

    /**
     * Verifica que el profesional no tenga otra cita que se cruce en el bloque
     * (incluye los 15 min de descanso posteriores a cada cita).
     */
    public function validarDisponibilidadProfesional(int $idProfesional, string $fecha, string $horaInicio, string $horaFin, ?int $ignorarIdCita = null): bool
    {
        if (! $this->validarHorarioLaboral($horaInicio, $horaFin)) {
            return false;
        }

        // Expandimos el rango de verificación para incluir el descanso de 15 min
        // Si el profesional tiene una cita que termina menos de 15 min antes de nuestra hora_inicio,
        // no está disponible. Igualmente, si nuestra cita termina y la siguiente empieza antes de 15 min.
        $inicioConDescanso = $this->parseHora($horaInicio)->subMinutes(self::DESCANSO_ENTRE_CITAS)->format('H:i:s');
        $finConDescanso = $this->parseHora($horaFin)->addMinutes(self::DESCANSO_ENTRE_CITAS)->format('H:i:s');

        return ! Cita::query()
            ->where('id_profesional', $idProfesional)
            ->whereDate('fecha_cita', $fecha)
            ->whereIn('estado', Cita::ESTADOS_BLOQUEAN_AGENDA)
            ->when($ignorarIdCita, fn ($query) => $query->where('id_cita', '!=', $ignorarIdCita))
            ->where('hora_inicio', '<', $finConDescanso)
            ->where('hora_fin', '>', $inicioConDescanso)
            ->exists();
    }

    public function validarPacienteSinCitaMismoDia(int $idPaciente, string $fecha, ?int $ignorarIdCita = null): bool
    {
        return ! Cita::query()
            ->where('id_paciente', $idPaciente)
            ->whereDate('fecha_cita', $fecha)
            ->whereIn('estado', Cita::ESTADOS_BLOQUEAN_AGENDA)
            ->when($ignorarIdCita, fn ($query) => $query->where('id_cita', '!=', $ignorarIdCita))
            ->exists();
    }

    public function calcularHoraFin(string $horaInicio, int $duracionMinutos = self::DURACION_CITA): string
    {
        return $this->parseHora($horaInicio)->addMinutes(self::DURACION_CITA)->format('H:i');
    }

    public function validarHorarioLaboral(string $horaInicio, string $horaFin): bool
    {
        try {
            $inicio = $this->parseHora($horaInicio);
            $fin = $this->parseHora($horaFin);
            $inicioLaboral = $this->parseHora(self::HORA_INICIO_LABORAL);
            $finLaboral = $this->parseHora(self::HORA_FIN_LABORAL);
        } catch (InvalidArgumentException) {
            return false;
        }

        return $fin->greaterThan($inicio)
            && $inicio->greaterThanOrEqualTo($inicioLaboral)
            && $fin->lessThanOrEqualTo($finLaboral);
    }

    public function validarOCrearDatosAgenda(array $data): array
    {
        foreach (['id_paciente', 'id_profesional', 'fecha_cita', 'hora_inicio'] as $campo) {
            if (! isset($data[$campo]) || $data[$campo] === '') {
                throw new InvalidArgumentException("El campo {$campo} es obligatorio para validar la agenda.");
            }
        }

        $duracion = self::DURACION_CITA; // Duración fija: 60 minutos
        $fecha = $this->parseFecha((string) $data['fecha_cita'])->format('Y-m-d');
        $horaInicio = $this->parseHora((string) $data['hora_inicio'])->format('H:i');
        $horaFin = $this->calcularHoraFin($horaInicio);
        $ignorarIdCita = isset($data['id_cita']) ? (int) $data['id_cita'] : null;

        if (! $this->validarHorarioLaboral($horaInicio, $horaFin)) {
            throw new DomainException('La cita debe estar comprendida entre las 09:00 y las 17:00.');
        }

        // No permitir agendar en horarios pasados si es hoy
        if ($fecha === now()->format('Y-m-d') && $horaInicio < now()->format('H:i')) {
            throw new DomainException('No se puede agendar una cita en un horario que ya pasó.');
        }

        if (! $this->validarDisponibilidadProfesional((int) $data['id_profesional'], $fecha, $horaInicio, $horaFin, $ignorarIdCita)) {
            throw new DomainException('El profesional ya tiene una cita que se cruza con este horario (incluye 15 min de descanso entre citas).');
        }

        if (! $this->validarPacienteSinCitaMismoDia((int) $data['id_paciente'], $fecha, $ignorarIdCita)) {
            throw new DomainException('El paciente ya tiene una cita activa en la fecha seleccionada.');
        }

        return [...$data, 'fecha_cita' => $fecha, 'hora_inicio' => $horaInicio, 'hora_fin' => $horaFin, 'duracion_minutos' => $duracion];
    }

    private function parseFecha(string $fecha): CarbonImmutable
    {
        $valor = CarbonImmutable::createFromFormat('!Y-m-d', $fecha);
        if ($valor === false || $valor->format('Y-m-d') !== $fecha) {
            throw new InvalidArgumentException('La fecha debe tener el formato Y-m-d.');
        }
        return $valor;
    }

    private function parseHora(string $hora): CarbonImmutable
    {
        $hora = substr(trim($hora), 0, 5);
        $valor = CarbonImmutable::createFromFormat('!H:i', $hora);
        if ($valor === false || $valor->format('H:i') !== $hora) {
            throw new InvalidArgumentException('La hora debe tener el formato H:i.');
        }
        return $valor;
    }

    private function normalizarHora(string $hora): string
    {
        return $this->parseHora($hora)->format('H:i:s');
    }
}
