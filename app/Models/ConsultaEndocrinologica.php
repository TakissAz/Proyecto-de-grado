<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class ConsultaEndocrinologica extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $primaryKey = 'id_consulta_endocrinologica';

    protected $fillable = [
        'id_paciente',
        'id_endocrinologo',
        'fecha_consulta',
        'motivo_consulta',
        'sospecha_pmos',
        'sospecha_resistencia_insulina',
        'observaciones_generales',
        'estado',
    ];

    protected $casts = [
        'fecha_consulta' => 'date',
        'sospecha_pmos' => 'boolean',
        'sospecha_resistencia_insulina' => 'boolean',
    ];

    public function paciente()
    {
        return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente');
    }

    public function endocrinologo()
    {
        return $this->belongsTo(User::class, 'id_endocrinologo');
    }

    public function historiaMenstrual()
    {
        return $this->hasOne(HistoriaMenstrual::class, 'id_consulta_endocrinologica', 'id_consulta_endocrinologica');
    }

    public function historiaHiperandrogenica()
    {
        return $this->hasOne(HistoriaHiperandrogenica::class, 'id_consulta_endocrinologica', 'id_consulta_endocrinologica');
    }

    public function antecedenteEndocrinoMetabolico()
    {
        return $this->hasOne(AntecedenteEndocrinoMetabolico::class, 'id_consulta_endocrinologica', 'id_consulta_endocrinologica');
    }

    public function evaluacionFisicaEndocrina()
    {
        return $this->hasOne(EvaluacionFisicaEndocrina::class, 'id_consulta_endocrinologica', 'id_consulta_endocrinologica');
    }

    public function resultadosPerfilAndrogenico()
    {
        return $this->hasMany(ResultadoPerfilAndrogenico::class, 'id_consulta_endocrinologica', 'id_consulta_endocrinologica');
    }

    public function resultadosPerfilGonadotropo()
    {
        return $this->hasMany(ResultadoPerfilGonadotropo::class, 'id_consulta_endocrinologica', 'id_consulta_endocrinologica');
    }

    public function resultadosDiferencialesEndocrinos()
    {
        return $this->hasMany(ResultadoDiferencialEndocrino::class, 'id_consulta_endocrinologica', 'id_consulta_endocrinologica');
    }

    public function resultadosGlucosaInsulina()
    {
        return $this->hasMany(ResultadoGlucosaInsulina::class, 'id_consulta_endocrinologica', 'id_consulta_endocrinologica');
    }

    public function resultadosPerfilLipidico()
    {
        return $this->hasMany(ResultadoPerfilLipidico::class, 'id_consulta_endocrinologica', 'id_consulta_endocrinologica');
    }

    public function evaluacionesEcograficas()
    {
        return $this->hasMany(EvaluacionEcografica::class, 'id_consulta_endocrinologica', 'id_consulta_endocrinologica');
    }

    public function diagnosticosPmos()
    {
        return $this->hasMany(DiagnosticoPmos::class, 'id_consulta_endocrinologica', 'id_consulta_endocrinologica');
    }

    public function diagnosticosResistenciaInsulina()
    {
        return $this->hasMany(DiagnosticoResistenciaInsulina::class, 'id_consulta_endocrinologica', 'id_consulta_endocrinologica');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('consultas_endocrinologicas')
            ->logOnly([
                'id_paciente',
                'id_endocrinologo',
                'fecha_consulta',
                'motivo_consulta',
                'sospecha_pmos',
                'sospecha_resistencia_insulina',
                'estado',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}