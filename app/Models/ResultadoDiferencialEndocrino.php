<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class ResultadoDiferencialEndocrino extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'resultados_diferenciales_endocrinos';

    protected $primaryKey = 'id_diferencial_endocrino';

    protected $fillable = [
        'id_consulta_endocrinologica',
        'id_paciente',
        'id_endocrinologo',
        'fecha_resultado',
        'tsh',
        't3_libre',
        't4_libre',
        'prolactina',
        'diecisiete_oh_progesterona',
        'cortisol',
        'alteracion_tiroidea_descartada',
        'hiperprolactinemia_descartada',
        'hiperplasia_suprarrenal_descartada',
        'cushing_descartado',
        'interpretacion',
        'estado',
    ];

    protected $casts = [
        'fecha_resultado' => 'date',
        'tsh' => 'decimal:2',
        't3_libre' => 'decimal:2',
        't4_libre' => 'decimal:2',
        'prolactina' => 'decimal:2',
        'diecisiete_oh_progesterona' => 'decimal:2',
        'cortisol' => 'decimal:2',
        'alteracion_tiroidea_descartada' => 'boolean',
        'hiperprolactinemia_descartada' => 'boolean',
        'hiperplasia_suprarrenal_descartada' => 'boolean',
        'cushing_descartado' => 'boolean',
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
        return $this->hasMany(DiagnosticoPmos::class, 'id_diferencial_endocrino', 'id_diferencial_endocrino');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('resultados_diferenciales_endocrinos')
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}