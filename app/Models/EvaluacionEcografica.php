<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class EvaluacionEcografica extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'evaluaciones_ecograficas';

    protected $primaryKey = 'id_ecografia';

    protected $fillable = [
        'id_consulta_endocrinologica',
        'id_paciente',
        'id_endocrinologo',
        'fecha_ecografia',
        'tipo_ecografia',
        'volumen_ovario_derecho',
        'volumen_ovario_izquierdo',
        'foliculos_ovario_derecho',
        'foliculos_ovario_izquierdo',
        'morfologia_compatible_pmos',
        'distribucion_periferica',
        'archivo_informe',
        'observaciones',
        'estado',
    ];

    protected $casts = [
        'fecha_ecografia' => 'date',
        'volumen_ovario_derecho' => 'decimal:2',
        'volumen_ovario_izquierdo' => 'decimal:2',
        'morfologia_compatible_pmos' => 'boolean',
        'distribucion_periferica' => 'boolean',
    ];

    public function consultaEndocrinologica()
    {
        return $this->belongsTo(ConsultaEndocrinologica::class, 'id_consulta_endocrinologica', 'id_consulta_endocrinologica');
    }

    public function paciente()
    {
        return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente');
    }

    public function endocrinologo()
    {
        return $this->belongsTo(User::class, 'id_endocrinologo');
    }

    public function diagnosticosPmos()
    {
        return $this->hasMany(DiagnosticoPmos::class, 'id_ecografia', 'id_ecografia');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('evaluaciones_ecograficas')
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}