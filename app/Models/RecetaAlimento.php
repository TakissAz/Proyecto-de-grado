<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class RecetaAlimento extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'receta_alimentos';

    protected $primaryKey = 'id_receta_alimento';

    public function getRouteKeyName(): string
    {
        return 'id_receta_alimento';
    }

    protected $fillable = [
        'id_receta',
        'id_alimento',
        'cantidad',
        'unidad',
        'calorias_aporte',
        'proteinas_aporte',
        'carbohidratos_aporte',
        'grasas_aporte',
        'fibra_aporte',
        'observaciones',
    ];

    protected function casts(): array
    {
        return [
            'cantidad' => 'decimal:2',
            'calorias_aporte' => 'decimal:2',
            'proteinas_aporte' => 'decimal:2',
            'carbohidratos_aporte' => 'decimal:2',
            'grasas_aporte' => 'decimal:2',
            'fibra_aporte' => 'decimal:2',
        ];
    }

    /* ═══ Relaciones ═══ */

    public function receta(): BelongsTo
    {
        return $this->belongsTo(Receta::class, 'id_receta', 'id_receta');
    }

    public function alimento(): BelongsTo
    {
        return $this->belongsTo(Alimento::class, 'id_alimento', 'id_alimento');
    }

    /* ═══ Métodos útiles ═══ */

    /**
     * Calcula los aportes nutricionales proporcionalmente según la cantidad usada
     * respecto a la cantidad base del alimento.
     */
    public function calcularAportesDesdeAlimento(): array
    {
        $alimento = $this->alimento;

        if (!$alimento || $alimento->cantidad_base <= 0) {
            return [
                'calorias_aporte' => 0,
                'proteinas_aporte' => 0,
                'carbohidratos_aporte' => 0,
                'grasas_aporte' => 0,
                'fibra_aporte' => 0,
            ];
        }

        $factor = $this->cantidad / $alimento->cantidad_base;

        return [
            'calorias_aporte' => round($alimento->calorias * $factor, 2),
            'proteinas_aporte' => round($alimento->proteinas * $factor, 2),
            'carbohidratos_aporte' => round($alimento->carbohidratos * $factor, 2),
            'grasas_aporte' => round($alimento->grasas * $factor, 2),
            'fibra_aporte' => round($alimento->fibra * $factor, 2),
        ];
    }

    /* ═══ Activity Log ═══ */

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['id_receta', 'id_alimento', 'cantidad', 'unidad', 'calorias_aporte', 'proteinas_aporte', 'carbohidratos_aporte', 'grasas_aporte', 'fibra_aporte'])
            ->logOnlyDirty()
            ->dontLogIfAttributesChangedOnly(['updated_at'])
            ->useLogName('receta_alimentos');
    }
}
