<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class ComidaPlanAlimentario extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $table = 'comidas_plan_alimentario';
    protected $primaryKey = 'id_comida_plan_alimentario';
    protected $fillable = [
        'id_dia_plan_alimentario', 'tipo_comida', 'hora_sugerida', 'nombre_comida',
        'calorias_totales', 'proteinas_totales', 'carbohidratos_totales',
        'grasas_totales', 'fibra_total', 'observaciones', 'orden', 'estado',
    ];
    protected $casts = [
        'calorias_totales' => 'decimal:2', 'proteinas_totales' => 'decimal:2',
        'carbohidratos_totales' => 'decimal:2', 'grasas_totales' => 'decimal:2',
        'fibra_total' => 'decimal:2', 'orden' => 'integer',
    ];

    public function getRouteKeyName(): string { return 'id_comida_plan_alimentario'; }
    public function dia(): BelongsTo { return $this->belongsTo(DiaPlanAlimentario::class, 'id_dia_plan_alimentario', 'id_dia_plan_alimentario'); }
    public function componentes(): HasMany { return $this->hasMany(ComponenteComidaPlan::class, 'id_comida_plan_alimentario', 'id_comida_plan_alimentario')->orderBy('orden'); }
    public function seguimientosComidas(): HasMany { return $this->hasMany(SeguimientoComida::class, 'id_comida_plan_alimentario', 'id_comida_plan_alimentario'); }
    public function getActivitylogOptions(): LogOptions { return LogOptions::defaults()->useLogName('comidas_plan_alimentario')->logOnly($this->fillable)->logOnlyDirty()->dontLogEmptyChanges(); }
}
