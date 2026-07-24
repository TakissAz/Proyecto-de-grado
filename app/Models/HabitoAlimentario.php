<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class HabitoAlimentario extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;
    protected $table = 'habitos_alimentarios';
    protected $primaryKey = 'id_habito_alimentario';
    protected $fillable = [
        'id_paciente', 'id_nutricionista', 'id_consulta_nutricional', 'comidas_por_dia',
        'horarios_regulares', 'consume_desayuno', 'consumo_agua_litros', 'consumo_azucar',
        'consumo_ultraprocesados', 'consumo_frituras', 'consumo_bebidas_azucaradas',
        'frecuencia_frutas_verduras', 'cena_tardia', 'ansiedad_por_comida',
        'hambre_nocturna', 'observaciones', 'estado',
    ];
    protected $casts = [
        'comidas_por_dia' => 'integer', 'horarios_regulares' => 'boolean',
        'consume_desayuno' => 'boolean', 'consumo_agua_litros' => 'decimal:2',
        'cena_tardia' => 'boolean', 'ansiedad_por_comida' => 'boolean',
        'hambre_nocturna' => 'boolean', 'estado' => 'boolean',
    ];

    public function paciente(): BelongsTo { return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente'); }
    public function nutricionista(): BelongsTo { return $this->belongsTo(User::class, 'id_nutricionista'); }
    public function consultaNutricional(): BelongsTo { return $this->belongsTo(ConsultaNutricional::class, 'id_consulta_nutricional', 'id_consulta_nutricional'); }
    public function tieneHabitosDeRiesgo(): bool
    {
        $riesgo = ['frecuente', 'diario'];
        return $this->cena_tardia || $this->ansiedad_por_comida || $this->hambre_nocturna
            || ! $this->consume_desayuno || ! $this->horarios_regulares
            || in_array($this->consumo_azucar, $riesgo, true)
            || in_array($this->consumo_ultraprocesados, $riesgo, true)
            || in_array($this->consumo_frituras, $riesgo, true)
            || in_array($this->consumo_bebidas_azucaradas, $riesgo, true);
    }
    public function esActiva(): bool { return $this->estado === true; }
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->useLogName('habitos_alimentarios')
            ->logOnly($this->getFillable())->logOnlyDirty()->dontLogEmptyChanges();
    }
}
