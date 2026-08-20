<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class RetroalimentacionPaciente extends Model
{
    use SoftDeletes;

    protected $table = 'retroalimentaciones_paciente';
    protected $primaryKey = 'id_retroalimentacion_paciente';
    protected $fillable = [
        'id_paciente', 'id_plan_alimentario', 'id_seguimiento_comida',
        'id_seguimiento_sintoma_paciente', 'id_usuario_emisor', 'rol_emisor',
        'tipo_retroalimentacion', 'mensaje', 'prioridad', 'visible_para_paciente',
        'leido_por_paciente', 'fecha_lectura_paciente', 'estado',
    ];
    protected $casts = [
        'visible_para_paciente' => 'boolean',
        'leido_por_paciente' => 'boolean',
        'fecha_lectura_paciente' => 'datetime',
    ];

    public function getRouteKeyName(): string { return 'id_retroalimentacion_paciente'; }
    public function paciente(): BelongsTo { return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente'); }
    public function planAlimentario(): BelongsTo { return $this->belongsTo(PlanAlimentario::class, 'id_plan_alimentario', 'id_plan_alimentario'); }
    public function seguimientoComida(): BelongsTo { return $this->belongsTo(SeguimientoComida::class, 'id_seguimiento_comida', 'id_seguimiento_comida'); }
    public function seguimientoSintomaPaciente(): BelongsTo { return $this->belongsTo(SeguimientoSintomaPaciente::class, 'id_seguimiento_sintoma_paciente', 'id_seguimiento_sintoma_paciente'); }
    public function usuarioEmisor(): BelongsTo { return $this->belongsTo(User::class, 'id_usuario_emisor'); }
}
