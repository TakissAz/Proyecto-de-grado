<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class ComponenteComidaPlan extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $table = 'componentes_comida_plan';
    protected $primaryKey = 'id_componente_comida_plan';
    protected $fillable = [
        'id_comida_plan_alimentario', 'tipo_componente', 'id_alimento', 'id_receta',
        'nombre_manual', 'cantidad', 'unidad', 'calorias', 'proteinas',
        'carbohidratos', 'grasas', 'fibra', 'observaciones', 'orden', 'estado',
    ];
    protected $casts = [
        'cantidad' => 'decimal:2', 'calorias' => 'decimal:2', 'proteinas' => 'decimal:2',
        'carbohidratos' => 'decimal:2', 'grasas' => 'decimal:2',
        'fibra' => 'decimal:2', 'orden' => 'integer',
    ];

    public function getRouteKeyName(): string { return 'id_componente_comida_plan'; }
    public function comida(): BelongsTo { return $this->belongsTo(ComidaPlanAlimentario::class, 'id_comida_plan_alimentario', 'id_comida_plan_alimentario'); }
    public function alimento(): BelongsTo { return $this->belongsTo(Alimento::class, 'id_alimento', 'id_alimento'); }
    public function receta(): BelongsTo { return $this->belongsTo(Receta::class, 'id_receta', 'id_receta'); }
    public function getActivitylogOptions(): LogOptions { return LogOptions::defaults()->useLogName('componentes_comida_plan')->logOnly($this->fillable)->logOnlyDirty()->dontLogEmptyChanges(); }
}
