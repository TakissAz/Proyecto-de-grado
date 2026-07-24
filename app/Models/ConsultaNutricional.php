<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class ConsultaNutricional extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'consultas_nutricionales';
    protected $primaryKey = 'id_consulta_nutricional';
    protected $fillable = [
        'id_paciente', 'id_nutricionista', 'id_cita', 'fecha_consulta',
        'motivo_consulta', 'estado_consulta', 'observaciones_generales', 'estado',
    ];
    protected $casts = ['fecha_consulta' => 'date', 'estado' => 'boolean'];

    public function paciente(): BelongsTo { return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente'); }
    public function nutricionista(): BelongsTo { return $this->belongsTo(User::class, 'id_nutricionista'); }
    public function cita(): BelongsTo { return $this->belongsTo(Cita::class, 'id_cita', 'id_cita'); }
    public function evaluacionesNutricionales(): HasMany { return $this->hasMany(EvaluacionNutricional::class, 'id_consulta_nutricional', 'id_consulta_nutricional'); }
    public function habitosAlimentarios(): HasMany { return $this->hasMany(HabitoAlimentario::class, 'id_consulta_nutricional', 'id_consulta_nutricional'); }
    public function preferenciasAlimentarias(): HasMany { return $this->hasMany(PreferenciaAlimentaria::class, 'id_consulta_nutricional', 'id_consulta_nutricional'); }
    public function restriccionesAlimentarias(): HasMany { return $this->hasMany(RestriccionAlimentaria::class, 'id_consulta_nutricional', 'id_consulta_nutricional'); }
    public function objetivosNutricionales(): HasMany { return $this->hasMany(ObjetivoNutricional::class, 'id_consulta_nutricional', 'id_consulta_nutricional'); }

    public function estaAbierta(): bool { return $this->estado_consulta === 'abierta'; }
    public function estaCerrada(): bool { return $this->estado_consulta === 'cerrada'; }
    public function estaAnulada(): bool { return $this->estado_consulta === 'anulada'; }
    public function esActiva(): bool { return $this->estado === true; }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->useLogName('consultas_nutricionales')
            ->logOnly($this->getFillable())->logOnlyDirty()->dontLogEmptyChanges();
    }
}
