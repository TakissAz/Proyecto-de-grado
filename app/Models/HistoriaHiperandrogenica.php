<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class HistoriaHiperandrogenica extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'historia_hiperandrogenica';

    protected $primaryKey = 'id_historia_hiperandrogenica';

    public function getRouteKeyName(): string
    {
        return 'id_historia_hiperandrogenica';
    }

    protected $fillable = [
        'id_consulta_endocrinologica',
        'id_paciente',
        'acne',
        'acne_grado',
        'hirsutismo',
        'hirsutismo_zona',
        'puntaje_ferriman_gallwey',
        'alopecia_androgenica',
        'seborrea',
        'inicio_sintomas',
        'progresion_sintomas',
        'observaciones',
        'estado',
    ];

    protected $casts = [
        'acne' => 'boolean',
        'hirsutismo' => 'boolean',
        'alopecia_androgenica' => 'boolean',
        'seborrea' => 'boolean',
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
        return $this->hasMany(DiagnosticoPmos::class, 'id_historia_hiperandrogenica', 'id_historia_hiperandrogenica');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('historia_hiperandrogenica')
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}