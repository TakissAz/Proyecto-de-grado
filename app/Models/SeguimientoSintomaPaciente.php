<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class SeguimientoSintomaPaciente extends Model
{
    use SoftDeletes;

    protected $table = 'seguimientos_sintomas_paciente';
    protected $primaryKey = 'id_seguimiento_sintoma_paciente';
    protected $fillable = [
        'id_paciente', 'fecha_registro', 'nivel_energia', 'hambre_durante_dia',
        'ansiedad_por_comida', 'antojos_dulces', 'hambre_nocturna', 'hinchazon_abdominal',
        'fatiga_post_comida', 'mareos_o_debilidad', 'acne', 'dolor_menstrual',
        'irregularidad_menstrual', 'cambios_estado_animo', 'calidad_sueno', 'horas_sueno',
        'actividad_fisica', 'minutos_actividad', 'consumo_agua_litros', 'observaciones', 'registrado_por',
    ];
    protected $casts = [
        'fecha_registro' => 'date', 'hambre_nocturna' => 'boolean', 'mareos_o_debilidad' => 'boolean',
        'irregularidad_menstrual' => 'boolean', 'horas_sueno' => 'decimal:1',
        'consumo_agua_litros' => 'decimal:1', 'minutos_actividad' => 'integer',
    ];
    public function paciente(): BelongsTo { return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente'); }
    public function usuarioRegistro(): BelongsTo { return $this->belongsTo(User::class, 'registrado_por'); }
}
