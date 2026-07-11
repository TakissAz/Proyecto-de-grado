<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class DiagnosticoResistenciaInsulina extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'diagnosticos_resistencia_insulina';

    protected $primaryKey = 'id_diagnostico_ri';

    public function getRouteKeyName(): string
    {
        return 'id_diagnostico_ri';
    }

    protected $fillable = [
        'id_consulta_endocrinologica',
        'id_paciente',
        'id_endocrinologo',
        'id_glucosa_insulina',
        'id_perfil_lipidico',
        'id_evaluacion_fisica',
        'fecha_diagnostico',
        'homa_ir',
        'glucosa_ayunas',
        'insulina_ayunas',
        'hemoglobina_glicosilada',
        'resistencia_confirmada',
        'grado_resistencia',
        'riesgo_diabetes',
        'riesgo_cardiometabolico',
        'conclusion_medica',
        'recomendaciones_medicas',
        'estado',
    ];

    protected $casts = [
        'fecha_diagnostico' => 'date',
        'homa_ir' => 'decimal:2',
        'glucosa_ayunas' => 'decimal:2',
        'insulina_ayunas' => 'decimal:2',
        'hemoglobina_glicosilada' => 'decimal:2',
        'resistencia_confirmada' => 'boolean',
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

    public function glucosaInsulina()
    {
        return $this->belongsTo(ResultadoGlucosaInsulina::class, 'id_glucosa_insulina', 'id_glucosa_insulina');
    }

    public function perfilLipidico()
    {
        return $this->belongsTo(ResultadoPerfilLipidico::class, 'id_perfil_lipidico', 'id_perfil_lipidico');
    }

    public function evaluacionFisica()
    {
        return $this->belongsTo(EvaluacionFisicaEndocrina::class, 'id_evaluacion_fisica', 'id_evaluacion_fisica');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('diagnosticos_resistencia_insulina')
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}