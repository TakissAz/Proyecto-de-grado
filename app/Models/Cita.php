<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cita extends Model
{
    use HasFactory, SoftDeletes;

    public const ESTADOS_BLOQUEAN_AGENDA = ['programada', 'confirmada', 'atendida'];
    public const ESTADOS_NO_BLOQUEAN_AGENDA = ['cancelada', 'reprogramada', 'no_asistio'];

    protected $table = 'citas';
    protected $primaryKey = 'id_cita';

    protected $fillable = [
        'id_paciente', 'id_profesional', 'tipo_profesional', 'fecha_cita',
        'hora_inicio', 'hora_fin', 'duracion_minutos', 'tipo_cita', 'modalidad',
        'motivo', 'estado', 'observaciones', 'motivo_cancelacion', 'registrada_por',
    ];

    protected function casts(): array
    {
        return ['fecha_cita' => 'date', 'duracion_minutos' => 'integer'];
    }

    public function getRouteKeyName(): string { return 'id_cita'; }
    public function paciente(): BelongsTo { return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente'); }
    public function profesional(): BelongsTo { return $this->belongsTo(User::class, 'id_profesional'); }
    public function registradoPor(): BelongsTo { return $this->belongsTo(User::class, 'registrada_por'); }

    public function bloqueaAgenda(): bool { return in_array($this->estado, self::ESTADOS_BLOQUEAN_AGENDA, true); }
    public function esProgramada(): bool { return $this->estado === 'programada'; }
    public function esConfirmada(): bool { return $this->estado === 'confirmada'; }
    public function esAtendida(): bool { return $this->estado === 'atendida'; }
    public function esCancelada(): bool { return $this->estado === 'cancelada'; }
    public function esNutricional(): bool { return $this->tipo_profesional === 'nutricionista'; }
    public function esEndocrinologica(): bool { return $this->tipo_profesional === 'endocrinologo'; }
}
