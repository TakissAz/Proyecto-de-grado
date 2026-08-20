<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class PlanAlimentario extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $table = 'planes_alimentarios';
    protected $primaryKey = 'id_plan_alimentario';

    protected $fillable = [
        'id_paciente', 'id_nutricionista', 'id_recomendacion_nutricional_experta',
        'id_requerimiento_nutricional', 'nombre', 'fecha_inicio', 'fecha_fin',
        'duracion_dias', 'objetivo_plan', 'calorias_objetivo', 'proteinas_objetivo',
        'carbohidratos_objetivo', 'grasas_objetivo', 'fibra_objetivo',
        'calorias_totales', 'proteinas_totales', 'carbohidratos_totales',
        'grasas_totales', 'fibra_total', 'estado_plan',
        'generado_por_sistema_experto', 'observaciones', 'fecha_aprobacion',
        'aprobado_por', 'estado',
    ];

    protected $casts = [
        'fecha_inicio' => 'date', 'fecha_fin' => 'date', 'fecha_aprobacion' => 'datetime',
        'duracion_dias' => 'integer', 'generado_por_sistema_experto' => 'boolean',
        'calorias_objetivo' => 'decimal:2', 'proteinas_objetivo' => 'decimal:2',
        'carbohidratos_objetivo' => 'decimal:2', 'grasas_objetivo' => 'decimal:2',
        'fibra_objetivo' => 'decimal:2', 'calorias_totales' => 'decimal:2',
        'proteinas_totales' => 'decimal:2', 'carbohidratos_totales' => 'decimal:2',
        'grasas_totales' => 'decimal:2', 'fibra_total' => 'decimal:2',
    ];

    public function getRouteKeyName(): string { return 'id_plan_alimentario'; }
    public function paciente(): BelongsTo { return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente'); }
    public function nutricionista(): BelongsTo { return $this->belongsTo(User::class, 'id_nutricionista'); }
    public function recomendacionNutricionalExperta(): BelongsTo { return $this->belongsTo(RecomendacionNutricionalExperta::class, 'id_recomendacion_nutricional_experta', 'id_recomendacion_nutricional_experta'); }
    public function requerimientoNutricional(): BelongsTo { return $this->belongsTo(RequerimientoNutricional::class, 'id_requerimiento_nutricional', 'id_requerimiento_nutricional'); }
    public function aprobador(): BelongsTo { return $this->belongsTo(User::class, 'aprobado_por'); }
    public function dias(): HasMany { return $this->hasMany(DiaPlanAlimentario::class, 'id_plan_alimentario', 'id_plan_alimentario')->orderBy('numero_dia'); }
    public function seguimientosComidas(): HasMany { return $this->hasMany(SeguimientoComida::class, 'id_plan_alimentario', 'id_plan_alimentario'); }
    public function retroalimentacionesPaciente(): HasMany { return $this->hasMany(RetroalimentacionPaciente::class, 'id_plan_alimentario', 'id_plan_alimentario'); }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->useLogName('planes_alimentarios')
            ->logOnly($this->fillable)->logOnlyDirty()->dontLogEmptyChanges();
    }
}
