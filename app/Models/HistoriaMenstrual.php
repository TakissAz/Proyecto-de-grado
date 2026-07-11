<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class HistoriaMenstrual extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'historia_menstrual';

    protected $primaryKey = 'id_historia_menstrual';

    public function getRouteKeyName(): string
    {
        return 'id_historia_menstrual';
    }

    protected $fillable = [
        'id_consulta_endocrinologica',
        'id_paciente',
        'fecha_ultima_menstruacion',
        'edad_menarquia',
        'regularidad_ciclo',
        'duracion_ciclo_dias',
        'intervalo_entre_ciclos_dias',
        'amenorrea',
        'oligomenorrea',
        'sangrado_abundante',
        'dolor_menstrual',
        'sospecha_anovulacion',
        'progesterona_lutea',
        'confirma_anovulacion_por_progesterona',
        'observaciones',
        'estado',
    ];

    protected $casts = [
        'fecha_ultima_menstruacion' => 'date',
        'amenorrea' => 'boolean',
        'oligomenorrea' => 'boolean',
        'sangrado_abundante' => 'boolean',
        'dolor_menstrual' => 'boolean',
        'sospecha_anovulacion' => 'boolean',
        'confirma_anovulacion_por_progesterona' => 'boolean',
        'progesterona_lutea' => 'decimal:2',
    ];

    public function consultaEndocrinologica()
    {
        return $this->belongsTo(ConsultaEndocrinologica::class, 'id_consulta_endocrinologica', 'id_consulta_endocrinologica');
    }

    public function paciente()
    {
        return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente');
    }

    public function diagnosticosPmos()
    {
        return $this->hasMany(DiagnosticoPmos::class, 'id_historia_menstrual', 'id_historia_menstrual');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('historia_menstrual')
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}