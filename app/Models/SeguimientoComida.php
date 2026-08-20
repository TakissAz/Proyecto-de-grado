<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class SeguimientoComida extends Model
{
    use SoftDeletes;

    protected $table = 'seguimientos_comidas';
    protected $primaryKey = 'id_seguimiento_comida';
    protected $fillable = [
        'id_paciente', 'id_plan_alimentario', 'id_dia_plan_alimentario', 'id_comida_plan_alimentario',
        'fecha_seguimiento', 'estado_cumplimiento', 'porcentaje_consumido', 'nivel_agrado',
        'desea_repetir', 'nivel_saciedad', 'nivel_hambre_posterior', 'ansiedad_posterior',
        'presento_molestia', 'tipo_molestia', 'intensidad_molestia', 'dificultad_preparacion',
        'consiguio_ingredientes', 'motivo_no_cumplimiento', 'comida_reemplazo', 'motivo_reemplazo',
        'comentario_paciente', 'sugerencia_paciente', 'observacion_para_siguiente_plan',
        'registrado_por', 'revisado_por_nutricionista', 'fecha_revision_nutricionista',
    ];
    protected $casts = [
        'fecha_seguimiento' => 'date', 'porcentaje_consumido' => 'integer',
        'desea_repetir' => 'boolean', 'ansiedad_posterior' => 'boolean',
        'presento_molestia' => 'boolean', 'consiguio_ingredientes' => 'boolean',
        'revisado_por_nutricionista' => 'boolean', 'fecha_revision_nutricionista' => 'datetime',
    ];
    public function paciente(): BelongsTo { return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente'); }
    public function planAlimentario(): BelongsTo { return $this->belongsTo(PlanAlimentario::class, 'id_plan_alimentario', 'id_plan_alimentario'); }
    public function diaPlanAlimentario(): BelongsTo { return $this->belongsTo(DiaPlanAlimentario::class, 'id_dia_plan_alimentario', 'id_dia_plan_alimentario'); }
    public function comidaPlanAlimentario(): BelongsTo { return $this->belongsTo(ComidaPlanAlimentario::class, 'id_comida_plan_alimentario', 'id_comida_plan_alimentario'); }
    public function usuarioRegistro(): BelongsTo { return $this->belongsTo(User::class, 'registrado_por'); }
}
