<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class RecomendacionNutricionalExperta extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $table = 'recomendaciones_nutricionales_expertas';

    protected $primaryKey = 'id_recomendacion_nutricional_experta';

    protected $fillable = [
        'id_paciente', 'id_nutricionista', 'id_requerimiento_nutricional',
        'enfoque_nutricional_experto', 'prioridad_nutricional',
        'calorias_sugeridas', 'proteinas_porcentaje', 'carbohidratos_porcentaje',
        'grasas_porcentaje', 'fibra_sugerida', 'recomendaciones', 'restricciones',
        'alertas', 'conclusion', 'generado_por_motor_experto', 'hechos_utilizados',
        'reglas_activadas', 'explicacion_experta', 'recomendaciones_expertas',
        'confianza_experta', 'version_motor_experto',
        'evaluado_por_motor_experto_en', 'estado_validacion_experta',
        'validado_por', 'fecha_validacion', 'observacion_validacion', 'estado',
    ];

    protected $casts = [
        'recomendaciones' => 'array',
        'restricciones' => 'array',
        'alertas' => 'array',
        'hechos_utilizados' => 'array',
        'reglas_activadas' => 'array',
        'recomendaciones_expertas' => 'array',
        'generado_por_motor_experto' => 'boolean',
        'evaluado_por_motor_experto_en' => 'datetime',
        'fecha_validacion' => 'datetime',
        'confianza_experta' => 'decimal:2',
        'calorias_sugeridas' => 'decimal:2',
        'proteinas_porcentaje' => 'decimal:2',
        'carbohidratos_porcentaje' => 'decimal:2',
        'grasas_porcentaje' => 'decimal:2',
        'fibra_sugerida' => 'decimal:2',
    ];

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente');
    }

    public function nutricionista(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_nutricionista');
    }

    public function requerimientoNutricional(): BelongsTo
    {
        return $this->belongsTo(
            RequerimientoNutricional::class,
            'id_requerimiento_nutricional',
            'id_requerimiento_nutricional'
        );
    }

    public function validadorExperto(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validado_por');
    }

    public function planesAlimentarios(): HasMany
    {
        return $this->hasMany(
            PlanAlimentario::class,
            'id_recomendacion_nutricional_experta',
            'id_recomendacion_nutricional_experta'
        );
    }

    public function estaPendienteValidacionExperta(): bool
    {
        return $this->estado_validacion_experta === 'pendiente';
    }

    public function fueValidadaPorNutricionista(): bool
    {
        return in_array($this->estado_validacion_experta, ['aprobado', 'validado'], true);
    }

    public function fueRechazadaPorNutricionista(): bool
    {
        return $this->estado_validacion_experta === 'rechazado';
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('recomendaciones_nutricionales_expertas')
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}
