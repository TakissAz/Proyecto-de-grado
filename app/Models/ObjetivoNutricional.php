<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class ObjetivoNutricional extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;
    protected $table = 'objetivos_nutricionales';
    protected $primaryKey = 'id_objetivo_nutricional';
    protected $fillable = [
        'id_paciente', 'id_nutricionista', 'id_consulta_nutricional',
        'objetivo_principal', 'objetivo_secundario', 'meta_peso', 'meta_cintura',
        'plazo_semanas', 'enfoque_nutricional', 'prioridad', 'observaciones', 'estado',
    ];
    protected $casts = [
        'meta_peso' => 'decimal:2', 'meta_cintura' => 'decimal:2',
        'plazo_semanas' => 'integer', 'estado' => 'boolean',
    ];
    public function paciente(): BelongsTo { return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente'); }
    public function nutricionista(): BelongsTo { return $this->belongsTo(User::class, 'id_nutricionista'); }
    public function consultaNutricional(): BelongsTo { return $this->belongsTo(ConsultaNutricional::class, 'id_consulta_nutricional', 'id_consulta_nutricional'); }
    public function requerimientosNutricionales(): HasMany { return $this->hasMany(RequerimientoNutricional::class, 'id_objetivo_nutricional', 'id_objetivo_nutricional'); }
    public function esPrioridadAlta(): bool { return $this->prioridad === 'alta'; }
    public function esActiva(): bool { return $this->estado === true; }
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->useLogName('objetivos_nutricionales')
            ->logOnly($this->getFillable())->logOnlyDirty()->dontLogEmptyChanges();
    }
}
