<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Alimento extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'alimentos';

    protected $primaryKey = 'id_alimento';

    public function getRouteKeyName(): string
    {
        return 'id_alimento';
    }

    protected $fillable = [
        'nombre',
        'grupo_alimentario',
        'unidad_base',
        'cantidad_base',
        'calorias',
        'proteinas',
        'carbohidratos',
        'grasas',
        'fibra',
        'indice_glucemico',
        'disponibilidad_temporal',
        'temporada_escasez',
        'mensaje_disponibilidad',
        'observaciones',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'cantidad_base' => 'decimal:2',
            'calorias' => 'decimal:2',
            'proteinas' => 'decimal:2',
            'carbohidratos' => 'decimal:2',
            'grasas' => 'decimal:2',
            'fibra' => 'decimal:2',
            'indice_glucemico' => 'integer',
        ];
    }

    /* ═══ Relaciones ═══ */

    public function recetaAlimentos(): HasMany
    {
        return $this->hasMany(RecetaAlimento::class, 'id_alimento', 'id_alimento');
    }

    public function recetas(): BelongsToMany
    {
        return $this->belongsToMany(Receta::class, 'receta_alimentos', 'id_alimento', 'id_receta', 'id_alimento', 'id_receta')
            ->withPivot('cantidad', 'unidad', 'calorias_aporte', 'proteinas_aporte', 'carbohidratos_aporte', 'grasas_aporte', 'fibra_aporte', 'observaciones')
            ->withTimestamps();
    }

    /* ═══ Métodos útiles ═══ */

    public function esActivo(): bool
    {
        return $this->estado === 'activo';
    }

    public function tieneEscasezTemporal(): bool
    {
        return $this->temporada_escasez !== null;
    }

    public function esDisponibleTodoElAnio(): bool
    {
        return $this->disponibilidad_temporal === 'todo_el_anio';
    }

    /* ═══ Activity Log ═══ */

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['nombre', 'grupo_alimentario', 'unidad_base', 'cantidad_base', 'calorias', 'proteinas', 'carbohidratos', 'grasas', 'fibra', 'indice_glucemico', 'disponibilidad_temporal', 'estado'])
            ->logOnlyDirty()
            ->dontLogIfAttributesChangedOnly(['updated_at'])
            ->useLogName('alimentos');
    }
}
