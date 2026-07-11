<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class ResultadoGlucosaInsulina extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'resultados_glucosa_insulina';

    protected $primaryKey = 'id_glucosa_insulina';

    public function getRouteKeyName(): string
    {
        return 'id_glucosa_insulina';
    }

    protected $fillable = [
        'id_consulta_endocrinologica',
        'id_paciente',
        'id_endocrinologo',
        'fecha_resultado',
        'glucosa_ayunas',
        'insulina_ayunas',
        'homa_ir',
        'hemoglobina_glicosilada',
        'glucosa_2h_ogtt',
        'insulina_2h_ogtt',
        'hiperinsulinemia',
        'resistencia_insulina_sugerida',
        'interpretacion',
        'estado',
    ];

    protected $casts = [
        'fecha_resultado' => 'date',
        'glucosa_ayunas' => 'decimal:2',
        'insulina_ayunas' => 'decimal:2',
        'homa_ir' => 'decimal:2',
        'hemoglobina_glicosilada' => 'decimal:2',
        'glucosa_2h_ogtt' => 'decimal:2',
        'insulina_2h_ogtt' => 'decimal:2',
        'hiperinsulinemia' => 'boolean',
        'resistencia_insulina_sugerida' => 'boolean',
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
        return $this->hasMany(DiagnosticoResistenciaInsulina::class, 'id_glucosa_insulina', 'id_glucosa_insulina');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('resultados_glucosa_insulina')
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}