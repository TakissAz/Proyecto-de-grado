<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class RestriccionAlimentaria extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;
    protected $table = 'restricciones_alimentarias';
    protected $primaryKey = 'id_restriccion_alimentaria';
    protected $fillable = [
        'id_paciente', 'id_nutricionista', 'id_consulta_nutricional', 'alergias',
        'intolerancias', 'alimentos_restringidos', 'alimentos_no_tolerados',
        'alimentos_rechazados', 'observaciones', 'estado',
    ];
    protected $casts = ['estado' => 'boolean'];
    public function paciente(): BelongsTo { return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente'); }
    public function nutricionista(): BelongsTo { return $this->belongsTo(User::class, 'id_nutricionista'); }
    public function consultaNutricional(): BelongsTo { return $this->belongsTo(ConsultaNutricional::class, 'id_consulta_nutricional', 'id_consulta_nutricional'); }
    public function tieneRestricciones(): bool
    {
        foreach (['alergias', 'intolerancias', 'alimentos_restringidos', 'alimentos_no_tolerados', 'alimentos_rechazados'] as $campo) {
            if (filled($this->{$campo})) {
                return true;
            }
        }
        return false;
    }
    public function esActiva(): bool { return $this->estado === true; }
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->useLogName('restricciones_alimentarias')
            ->logOnly($this->getFillable())->logOnlyDirty()->dontLogEmptyChanges();
    }
}
