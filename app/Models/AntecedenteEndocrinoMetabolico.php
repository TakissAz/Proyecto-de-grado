<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class AntecedenteEndocrinoMetabolico extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'antecedentes_endocrino_metabolicos';

    protected $primaryKey = 'id_antecedente';

    protected $fillable = [
        'id_consulta_endocrinologica',
        'id_paciente',
        'diabetes_familiar',
        'diabetes_personal',
        'hipertension_familiar',
        'hipertension_personal',
        'dislipidemia_familiar',
        'dislipidemia_personal',
        'enfermedad_tiroidea',
        'hiperprolactinemia_previa',
        'uso_anticonceptivos',
        'uso_metformina',
        'uso_corticoides',
        'otros_medicamentos',
        'observaciones',
        'estado',
    ];

    protected $casts = [
        'diabetes_familiar' => 'boolean',
        'diabetes_personal' => 'boolean',
        'hipertension_familiar' => 'boolean',
        'hipertension_personal' => 'boolean',
        'dislipidemia_familiar' => 'boolean',
        'dislipidemia_personal' => 'boolean',
        'enfermedad_tiroidea' => 'boolean',
        'hiperprolactinemia_previa' => 'boolean',
        'uso_anticonceptivos' => 'boolean',
        'uso_metformina' => 'boolean',
        'uso_corticoides' => 'boolean',
    ];

    public function consultaEndocrinologica()
    {
        return $this->belongsTo(ConsultaEndocrinologica::class, 'id_consulta_endocrinologica', 'id_consulta_endocrinologica');
    }

    public function paciente()
    {
        return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('antecedentes_endocrino_metabolicos')
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}