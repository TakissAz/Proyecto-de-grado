<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class NotificacionInterna extends Model
{
    use SoftDeletes;
    protected $table = 'notificaciones_internas';
    protected $primaryKey = 'id_notificacion_interna';
    protected $fillable = ['id_usuario_destino', 'tipo', 'titulo', 'mensaje', 'data', 'leida', 'fecha_lectura', 'url_destino', 'prioridad', 'estado'];
    protected $casts = ['data' => 'array', 'leida' => 'boolean', 'fecha_lectura' => 'datetime'];
    public function getRouteKeyName(): string { return 'id_notificacion_interna'; }
    public function usuarioDestino(): BelongsTo { return $this->belongsTo(User::class, 'id_usuario_destino'); }
}
