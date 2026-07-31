<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class ReglaNutricional extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $table = 'reglas_nutricionales';

    protected $primaryKey = 'id_regla_nutricional';

    protected $fillable = [
        'codigo',
        'nombre',
        'tipo_regla',
        'condicion_campo',
        'condicion_operador',
        'condicion_valor',
        'resultado',
        'prioridad',
        'descripcion',
        'fuente',
        'estado',
    ];

    protected $casts = [
        'condicion_valor' => 'array',
        'resultado' => 'array',
        'prioridad' => 'integer',
        'estado' => 'boolean',
    ];

    public function esActiva(): bool
    {
        return $this->estado === true && $this->deleted_at === null;
    }

    public function aplica(array $hechos): bool
    {
        if (! $this->esActiva()) {
            return false;
        }

        $operador = $this->condicion_operador;

        if ($operador === 'default') {
            return true;
        }

        if (! array_key_exists($this->condicion_campo, $hechos)) {
            return false;
        }

        $hecho = $hechos[$this->condicion_campo];
        $condicion = $this->condicion_valor;
        $valor = is_array($condicion) && count($condicion) === 1
            ? array_values($condicion)[0]
            : $condicion;

        return match ($operador) {
            '=' => $hecho == $valor,
            '!=' => $hecho != $valor,
            '>' => is_numeric($hecho) && is_numeric($valor) && $hecho > $valor,
            '>=' => is_numeric($hecho) && is_numeric($valor) && $hecho >= $valor,
            '<' => is_numeric($hecho) && is_numeric($valor) && $hecho < $valor,
            '<=' => is_numeric($hecho) && is_numeric($valor) && $hecho <= $valor,
            'in' => in_array($hecho, is_array($condicion) ? $condicion : [$condicion], true),
            'not_in' => ! in_array($hecho, is_array($condicion) ? $condicion : [$condicion], true),
            default => false,
        };
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('reglas_nutricionales')
            ->logOnly($this->getFillable())
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}
