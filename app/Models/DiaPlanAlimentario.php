<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class DiaPlanAlimentario extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $table = 'dias_plan_alimentario';
    protected $primaryKey = 'id_dia_plan_alimentario';
    protected $fillable = [
        'id_plan_alimentario', 'numero_dia', 'nombre_dia', 'fecha',
        'calorias_totales', 'proteinas_totales', 'carbohidratos_totales',
        'grasas_totales', 'fibra_total', 'observaciones', 'estado',
    ];
    protected $casts = [
        'numero_dia' => 'integer', 'fecha' => 'date', 'calorias_totales' => 'decimal:2',
        'proteinas_totales' => 'decimal:2', 'carbohidratos_totales' => 'decimal:2',
        'grasas_totales' => 'decimal:2', 'fibra_total' => 'decimal:2',
    ];

    public function getRouteKeyName(): string { return 'id_dia_plan_alimentario'; }
    public function plan(): BelongsTo { return $this->belongsTo(PlanAlimentario::class, 'id_plan_alimentario', 'id_plan_alimentario'); }
    public function comidas(): HasMany { return $this->hasMany(ComidaPlanAlimentario::class, 'id_dia_plan_alimentario', 'id_dia_plan_alimentario')->orderBy('orden'); }
    public function getActivitylogOptions(): LogOptions { return LogOptions::defaults()->useLogName('dias_plan_alimentario')->logOnly($this->fillable)->logOnlyDirty()->dontLogEmptyChanges(); }
}
