<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Paciente extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $primaryKey = 'id_paciente';

    protected $fillable = [
        'user_id',
        'ci',
        'fecha_nacimiento',
        'sexo',
        'telefono',
        'direccion',
        'ocupacion',
        'estado_civil',
        'fecha_registro',
        'estado',
        'observaciones',
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
        'fecha_registro' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function consultasEndocrinologicas()
    {
        return $this->hasMany(ConsultaEndocrinologica::class, 'id_paciente', 'id_paciente');
    }

    public function historiaMenstrual()
    {
        return $this->hasMany(HistoriaMenstrual::class, 'id_paciente', 'id_paciente');
    }

    public function historiaHiperandrogenica()
    {
        return $this->hasMany(HistoriaHiperandrogenica::class, 'id_paciente', 'id_paciente');
    }

    public function antecedentesEndocrinoMetabolicos()
    {
        return $this->hasMany(AntecedenteEndocrinoMetabolico::class, 'id_paciente', 'id_paciente');
    }

    public function evaluacionesFisicasEndocrinas()
    {
        return $this->hasMany(EvaluacionFisicaEndocrina::class, 'id_paciente', 'id_paciente');
    }

    public function resultadosPerfilAndrogenico()
    {
        return $this->hasMany(ResultadoPerfilAndrogenico::class, 'id_paciente', 'id_paciente');
    }

    public function resultadosPerfilGonadotropo()
    {
        return $this->hasMany(ResultadoPerfilGonadotropo::class, 'id_paciente', 'id_paciente');
    }

    public function resultadosDiferencialesEndocrinos()
    {
        return $this->hasMany(ResultadoDiferencialEndocrino::class, 'id_paciente', 'id_paciente');
    }

    public function resultadosGlucosaInsulina()
    {
        return $this->hasMany(ResultadoGlucosaInsulina::class, 'id_paciente', 'id_paciente');
    }

    public function resultadosPerfilLipidico()
    {
        return $this->hasMany(ResultadoPerfilLipidico::class, 'id_paciente', 'id_paciente');
    }

    public function evaluacionesEcograficas()
    {
        return $this->hasMany(EvaluacionEcografica::class, 'id_paciente', 'id_paciente');
    }

    public function diagnosticosPmos()
    {
        return $this->hasMany(DiagnosticoPmos::class, 'id_paciente', 'id_paciente');
    }

    public function diagnosticosResistenciaInsulina()
    {
        return $this->hasMany(DiagnosticoResistenciaInsulina::class, 'id_paciente', 'id_paciente');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('pacientes')
            ->logOnly([
                'user_id',
                'ci',
                'fecha_nacimiento',
                'sexo',
                'telefono',
                'direccion',
                'ocupacion',
                'estado_civil',
                'fecha_registro',
                'estado',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}