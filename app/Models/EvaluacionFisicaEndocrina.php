<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class EvaluacionFisicaEndocrina extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'evaluaciones_fisicas_endocrinas';

    protected $primaryKey = 'id_evaluacion_fisica';

    protected $fillable = [
        'id_consulta_endocrinologica',
        'id_paciente',
        'peso',
        'talla',
        'imc',
        'circunferencia_cintura',
        'circunferencia_cadera',
        'indice_cintura_cadera',
        'presion_sistolica',
        'presion_diastolica',
        'acantosis_nigricans',
        'skin_tags',
        'galactorrea',
        'hirsutismo_visible',
        'puntaje_ferriman_gallwey',
        'acne_visible',
        'alopecia_visible',
        'observaciones',
        'estado',
    ];

    protected $casts = [
        'peso' => 'decimal:2',
        'talla' => 'decimal:2',
        'imc' => 'decimal:2',
        'circunferencia_cintura' => 'decimal:2',
        'circunferencia_cadera' => 'decimal:2',
        'indice_cintura_cadera' => 'decimal:2',
        'acantosis_nigricans' => 'boolean',
        'skin_tags' => 'boolean',
        'galactorrea' => 'boolean',
        'hirsutismo_visible' => 'boolean',
        'acne_visible' => 'boolean',
        'alopecia_visible' => 'boolean',
    ];

    public function consultaEndocrinologica()
    {
        return $this->belongsTo(ConsultaEndocrinologica::class, 'id_consulta_endocrinologica', 'id_consulta_endocrinologica');
    }

    public function paciente()
    {
        return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente');
    }

    public function diagnosticosResistenciaInsulina()
    {
        return $this->hasMany(DiagnosticoResistenciaInsulina::class, 'id_evaluacion_fisica', 'id_evaluacion_fisica');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('evaluaciones_fisicas_endocrinas')
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}