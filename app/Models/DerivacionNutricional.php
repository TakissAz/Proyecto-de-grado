<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class DerivacionNutricional extends Model
{
    use SoftDeletes;

    protected $table = 'derivaciones_nutricionales';
    protected $primaryKey = 'id_derivacion_nutricional';
    protected $fillable = ['id_paciente', 'id_endocrinologo', 'id_nutricionista', 'motivo_derivacion', 'prioridad', 'origen', 'estado', 'fecha_derivacion', 'fecha_vista', 'fecha_atencion', 'observaciones'];
    protected $casts = ['fecha_derivacion' => 'datetime', 'fecha_vista' => 'datetime', 'fecha_atencion' => 'datetime'];

    public function getRouteKeyName(): string { return 'id_derivacion_nutricional'; }
    public function paciente(): BelongsTo { return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente'); }
    public function endocrinologo(): BelongsTo { return $this->belongsTo(User::class, 'id_endocrinologo'); }
    public function nutricionista(): BelongsTo { return $this->belongsTo(User::class, 'id_nutricionista'); }
}
