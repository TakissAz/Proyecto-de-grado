<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class EvaluacionNutricional extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'evaluaciones_nutricionales';
    protected $primaryKey = 'id_evaluacion_nutricional';
    protected $fillable = [
        'id_paciente', 'id_nutricionista', 'id_consulta_nutricional', 'fecha_evaluacion',
        'peso', 'talla', 'imc', 'circunferencia_cintura', 'circunferencia_cadera',
        'indice_cintura_cadera', 'porcentaje_grasa', 'masa_muscular', 'nivel_actividad',
        'observaciones', 'estado',
    ];
    protected $casts = [
        'fecha_evaluacion' => 'date', 'peso' => 'decimal:2', 'talla' => 'decimal:2',
        'imc' => 'decimal:2', 'circunferencia_cintura' => 'decimal:2',
        'circunferencia_cadera' => 'decimal:2', 'indice_cintura_cadera' => 'decimal:2',
        'porcentaje_grasa' => 'decimal:2', 'masa_muscular' => 'decimal:2', 'estado' => 'boolean',
    ];

    public function paciente(): BelongsTo { return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente'); }
    public function nutricionista(): BelongsTo { return $this->belongsTo(User::class, 'id_nutricionista'); }
    public function consultaNutricional(): BelongsTo { return $this->belongsTo(ConsultaNutricional::class, 'id_consulta_nutricional', 'id_consulta_nutricional'); }
    public function requerimientosNutricionales(): HasMany { return $this->hasMany(RequerimientoNutricional::class, 'id_evaluacion_nutricional', 'id_evaluacion_nutricional'); }
    public function calcularImc(): ?float
    {
        $peso = (float) $this->peso;
        $talla = (float) $this->talla;
        return $peso > 0 && $talla > 0 ? round($peso / ($talla ** 2), 2) : null;
    }
    public function calcularIndiceCinturaCadera(): ?float
    {
        $cintura = (float) $this->circunferencia_cintura;
        $cadera = (float) $this->circunferencia_cadera;
        return $cintura > 0 && $cadera > 0 ? round($cintura / $cadera, 2) : null;
    }
    public function esActiva(): bool { return $this->estado === true; }
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->useLogName('evaluaciones_nutricionales')
            ->logOnly($this->getFillable())->logOnlyDirty()->dontLogEmptyChanges();
    }
}
