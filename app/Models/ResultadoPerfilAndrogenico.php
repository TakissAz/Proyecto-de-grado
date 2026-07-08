<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class ResultadoPerfilAndrogenico extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'resultados_perfil_androgenico';

    protected $primaryKey = 'id_perfil_androgenico';

    protected $fillable = [
        'id_consulta_endocrinologica',
        'id_paciente',
        'id_endocrinologo',
        'fecha_resultado',
        'testosterona_total',
        'testosterona_libre',
        'shbg',
        'indice_androgenico_libre',
        'dhea_s',
        'androstenediona',
        'hiperandrogenismo_bioquimico',
        'interpretacion',
        'estado',
    ];

    protected $casts = [
        'fecha_resultado' => 'date',
        'testosterona_total' => 'decimal:2',
        'testosterona_libre' => 'decimal:2',
        'shbg' => 'decimal:2',
        'indice_androgenico_libre' => 'decimal:2',
        'dhea_s' => 'decimal:2',
        'androstenediona' => 'decimal:2',
        'hiperandrogenismo_bioquimico' => 'boolean',
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
        return $this->hasMany(DiagnosticoPmos::class, 'id_perfil_androgenico', 'id_perfil_androgenico');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('resultados_perfil_androgenico')
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}