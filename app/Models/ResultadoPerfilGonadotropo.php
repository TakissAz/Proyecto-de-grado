<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class ResultadoPerfilGonadotropo extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'resultados_perfil_gonadotropo';

    protected $primaryKey = 'id_perfil_gonadotropo';

    protected $fillable = [
        'id_consulta_endocrinologica',
        'id_paciente',
        'id_endocrinologo',
        'fecha_resultado',
        'lh',
        'fsh',
        'relacion_lh_fsh',
        'estradiol',
        'progesterona',
        'progesterona_dia_ciclo',
        'progesterona_fase_ciclo',
        'interpretacion',
        'estado',
    ];

    protected $casts = [
        'fecha_resultado' => 'date',
        'lh' => 'decimal:2',
        'fsh' => 'decimal:2',
        'relacion_lh_fsh' => 'decimal:2',
        'estradiol' => 'decimal:2',
        'progesterona' => 'decimal:2',
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
        return $this->hasMany(DiagnosticoPmos::class, 'id_perfil_gonadotropo', 'id_perfil_gonadotropo');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('resultados_perfil_gonadotropo')
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}