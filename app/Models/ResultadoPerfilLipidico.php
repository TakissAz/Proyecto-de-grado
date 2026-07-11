<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class ResultadoPerfilLipidico extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'resultados_perfil_lipidico';

    protected $primaryKey = 'id_perfil_lipidico';

    public function getRouteKeyName(): string
    {
        return 'id_perfil_lipidico';
    }

    protected $fillable = [
        'id_consulta_endocrinologica',
        'id_paciente',
        'id_endocrinologo',
        'fecha_resultado',
        'colesterol_total',
        'hdl',
        'ldl',
        'vldl',
        'trigliceridos',
        'colesterol_no_hdl',
        'dislipidemia_sugerida',
        'interpretacion',
        'estado',
    ];

    protected $casts = [
        'fecha_resultado' => 'date',
        'colesterol_total' => 'decimal:2',
        'hdl' => 'decimal:2',
        'ldl' => 'decimal:2',
        'vldl' => 'decimal:2',
        'trigliceridos' => 'decimal:2',
        'colesterol_no_hdl' => 'decimal:2',
        'dislipidemia_sugerida' => 'boolean',
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

    public function diagnosticosResistenciaInsulina()
    {
        return $this->hasMany(DiagnosticoResistenciaInsulina::class, 'id_perfil_lipidico', 'id_perfil_lipidico');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('resultados_perfil_lipidico')
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}