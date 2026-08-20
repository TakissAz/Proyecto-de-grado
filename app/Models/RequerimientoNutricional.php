<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class RequerimientoNutricional extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'requerimientos_nutricionales';
    protected $primaryKey = 'id_requerimiento_nutricional';

    protected $fillable = [
        'id_paciente', 'id_nutricionista', 'id_consulta_nutricional',
        'id_evaluacion_nutricional', 'id_objetivo_nutricional', 'fecha_calculo',
        'peso_referencia', 'talla_referencia', 'edad_referencia', 'nivel_actividad',
        'factor_actividad', 'tmb', 'get', 'ajuste_calorico', 'calorias_objetivo',
        'proteinas_diarias', 'carbohidratos_diarios', 'grasas_diarias', 'fibra_diaria',
        'porcentaje_proteinas', 'porcentaje_carbohidratos', 'porcentaje_grasas',
        'metodo_calculo', 'observaciones', 'reglas_aplicadas', 'estado',
    ];

    protected $casts = [
        'fecha_calculo' => 'date',
        'peso_referencia' => 'decimal:2',
        'talla_referencia' => 'decimal:2',
        'edad_referencia' => 'integer',
        'factor_actividad' => 'decimal:3',
        'tmb' => 'decimal:2',
        'get' => 'decimal:2',
        'ajuste_calorico' => 'decimal:2',
        'calorias_objetivo' => 'decimal:2',
        'proteinas_diarias' => 'decimal:2',
        'carbohidratos_diarios' => 'decimal:2',
        'grasas_diarias' => 'decimal:2',
        'fibra_diaria' => 'decimal:2',
        'porcentaje_proteinas' => 'decimal:2',
        'porcentaje_carbohidratos' => 'decimal:2',
        'porcentaje_grasas' => 'decimal:2',
        'reglas_aplicadas' => 'array',
        'estado' => 'boolean',
    ];

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente');
    }

    public function nutricionista(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_nutricionista');
    }

    public function consultaNutricional(): BelongsTo
    {
        return $this->belongsTo(ConsultaNutricional::class, 'id_consulta_nutricional', 'id_consulta_nutricional');
    }

    public function evaluacionNutricional(): BelongsTo
    {
        return $this->belongsTo(EvaluacionNutricional::class, 'id_evaluacion_nutricional', 'id_evaluacion_nutricional');
    }

    public function objetivoNutricional(): BelongsTo
    {
        return $this->belongsTo(ObjetivoNutricional::class, 'id_objetivo_nutricional', 'id_objetivo_nutricional');
    }

    public function planesAlimentarios(): HasMany
    {
        return $this->hasMany(
            PlanAlimentario::class,
            'id_requerimiento_nutricional',
            'id_requerimiento_nutricional'
        );
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('requerimientos_nutricionales')
            ->logOnly([
                'id_paciente', 'id_nutricionista', 'id_consulta_nutricional',
                'id_evaluacion_nutricional', 'id_objetivo_nutricional', 'fecha_calculo',
                'peso_referencia', 'talla_referencia', 'edad_referencia',
                'nivel_actividad', 'factor_actividad', 'tmb', 'get',
                'ajuste_calorico', 'calorias_objetivo', 'proteinas_diarias',
                'carbohidratos_diarios', 'grasas_diarias', 'fibra_diaria',
                'porcentaje_proteinas', 'porcentaje_carbohidratos',
                'porcentaje_grasas', 'metodo_calculo', 'reglas_aplicadas', 'estado',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}
