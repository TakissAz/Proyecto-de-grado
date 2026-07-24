<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class PreferenciaAlimentaria extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;
    protected $table = 'preferencias_alimentarias';
    protected $primaryKey = 'id_preferencia_alimentaria';
    protected $fillable = [
        'id_paciente', 'id_nutricionista', 'id_consulta_nutricional',
        'alimentos_preferidos', 'alimentos_no_preferidos', 'comidas_preferidas',
        'comidas_frecuentes', 'preparaciones_preferidas', 'sabores_preferidos',
        'observaciones', 'estado',
    ];
    protected $casts = ['estado' => 'boolean'];
    public function paciente(): BelongsTo { return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente'); }
    public function nutricionista(): BelongsTo { return $this->belongsTo(User::class, 'id_nutricionista'); }
    public function consultaNutricional(): BelongsTo { return $this->belongsTo(ConsultaNutricional::class, 'id_consulta_nutricional', 'id_consulta_nutricional'); }
    public function esActiva(): bool { return $this->estado === true; }
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->useLogName('preferencias_alimentarias')
            ->logOnly($this->getFillable())->logOnlyDirty()->dontLogEmptyChanges();
    }
}
