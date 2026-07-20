<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Receta extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'recetas';

    protected $primaryKey = 'id_receta';

    public function getRouteKeyName(): string
    {
        return 'id_receta';
    }

    protected $fillable = [
        'nombre',
        'descripcion',
        'tipo_comida',
        'porciones',
        'tiempo_preparacion_minutos',
        'preparacion',
        'calorias_totales',
        'proteinas_totales',
        'carbohidratos_totales',
        'grasas_totales',
        'fibra_total',
        'observaciones',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'porciones' => 'integer',
            'tiempo_preparacion_minutos' => 'integer',
            'calorias_totales' => 'decimal:2',
            'proteinas_totales' => 'decimal:2',
            'carbohidratos_totales' => 'decimal:2',
            'grasas_totales' => 'decimal:2',
            'fibra_total' => 'decimal:2',
        ];
    }

    /* ═══ Relaciones ═══ */

    public function recetaAlimentos(): HasMany
    {
        return $this->hasMany(RecetaAlimento::class, 'id_receta', 'id_receta');
    }

    public function alimentos(): BelongsToMany
    {
        return $this->belongsToMany(Alimento::class, 'receta_alimentos', 'id_receta', 'id_alimento', 'id_receta', 'id_alimento')
            ->withPivot('cantidad', 'unidad', 'calorias_aporte', 'proteinas_aporte', 'carbohidratos_aporte', 'grasas_aporte', 'fibra_aporte', 'observaciones')
            ->withTimestamps();
    }

    /* ═══ Métodos útiles ═══ */

    public function esActiva(): bool
    {
        return $this->estado === 'activo';
    }

    /**
     * Recalcula los totales nutricionales sumando los aportes de cada ingrediente.
     */
    public function recalcularTotales(): void
    {
        $totales = $this->recetaAlimentos()
            ->selectRaw('
                COALESCE(SUM(calorias_aporte), 0) as calorias,
                COALESCE(SUM(proteinas_aporte), 0) as proteinas,
                COALESCE(SUM(carbohidratos_aporte), 0) as carbohidratos,
                COALESCE(SUM(grasas_aporte), 0) as grasas,
                COALESCE(SUM(fibra_aporte), 0) as fibra
            ')
            ->first();

        if ($totales) {
            $this->update([
                'calorias_totales' => $totales->calorias,
                'proteinas_totales' => $totales->proteinas,
                'carbohidratos_totales' => $totales->carbohidratos,
                'grasas_totales' => $totales->grasas,
                'fibra_total' => $totales->fibra,
            ]);
        }
    }

    /* ═══ Activity Log ═══ */

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['nombre', 'tipo_comida', 'porciones', 'calorias_totales', 'proteinas_totales', 'carbohidratos_totales', 'grasas_totales', 'fibra_total', 'estado'])
            ->logOnlyDirty()
            ->dontLogIfAttributesChangedOnly(['updated_at'])
            ->useLogName('recetas');
    }
}
