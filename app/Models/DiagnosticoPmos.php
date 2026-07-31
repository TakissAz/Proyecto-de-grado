<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class DiagnosticoPmos extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'diagnosticos_pmos';

    protected $primaryKey = 'id_diagnostico_pmos';

    public function getRouteKeyName(): string
    {
        return 'id_diagnostico_pmos';
    }

    protected $fillable = [
        'id_consulta_endocrinologica',
        'id_paciente',
        'id_endocrinologo',
        'id_historia_menstrual',
        'id_historia_hiperandrogenica',
        'id_perfil_androgenico',
        'id_perfil_gonadotropo',
        'id_diferencial_endocrino',
        'id_ecografia',
        'fecha_diagnostico',
        'cumple_alteracion_ovulatoria',
        'cumple_hiperandrogenismo_clinico',
        'cumple_hiperandrogenismo_bioquimico',
        'cumple_hiperandrogenismo',
        'tipo_hiperandrogenismo',
        'cumple_morfologia_ovarica',
        'total_criterios_rotterdam',
        'fenotipo_pmos',
        'diagnostico_confirmado',
        'diagnosticos_diferenciales_descartados',
        'severidad_clinica',
        'riesgo_metabolico',
        'conclusion_medica',
        'recomendaciones_medicas',
        'generado_por_motor_experto',
        'criterios_rotterdam_cumplidos',
        'hechos_utilizados',
        'reglas_activadas',
        'explicacion_experta',
        'recomendaciones_expertas',
        'confianza_experta',
        'version_motor_experto',
        'evaluado_por_motor_experto_en',
        'estado_validacion_experta',
        'validado_por',
        'fecha_validacion',
        'observacion_validacion',
        'estado',
    ];

    protected $casts = [
        'fecha_diagnostico' => 'date',
        'cumple_alteracion_ovulatoria' => 'boolean',
        'cumple_hiperandrogenismo_clinico' => 'boolean',
        'cumple_hiperandrogenismo_bioquimico' => 'boolean',
        'cumple_hiperandrogenismo' => 'boolean',
        'cumple_morfologia_ovarica' => 'boolean',
        'diagnostico_confirmado' => 'boolean',
        'diagnosticos_diferenciales_descartados' => 'boolean',
        'generado_por_motor_experto' => 'boolean',
        'criterios_rotterdam_cumplidos' => 'array',
        'hechos_utilizados' => 'array',
        'reglas_activadas' => 'array',
        'recomendaciones_expertas' => 'array',
        'confianza_experta' => 'decimal:2',
        'evaluado_por_motor_experto_en' => 'datetime',
        'fecha_validacion' => 'datetime',
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

    public function historiaMenstrual()
    {
        return $this->belongsTo(HistoriaMenstrual::class, 'id_historia_menstrual', 'id_historia_menstrual');
    }

    public function historiaHiperandrogenica()
    {
        return $this->belongsTo(HistoriaHiperandrogenica::class, 'id_historia_hiperandrogenica', 'id_historia_hiperandrogenica');
    }

    public function perfilAndrogenico()
    {
        return $this->belongsTo(ResultadoPerfilAndrogenico::class, 'id_perfil_androgenico', 'id_perfil_androgenico');
    }

    public function perfilGonadotropo()
    {
        return $this->belongsTo(ResultadoPerfilGonadotropo::class, 'id_perfil_gonadotropo', 'id_perfil_gonadotropo');
    }

    public function diferencialEndocrino()
    {
        return $this->belongsTo(ResultadoDiferencialEndocrino::class, 'id_diferencial_endocrino', 'id_diferencial_endocrino');
    }

    public function ecografia()
    {
        return $this->belongsTo(EvaluacionEcografica::class, 'id_ecografia', 'id_ecografia');
    }

    public function validadorExperto()
    {
        return $this->belongsTo(User::class, 'validado_por');
    }

    public function esPendienteValidacionExperta(): bool
    {
        return $this->estado_validacion_experta === 'pendiente';
    }

    public function estaValidadoPorExperto(): bool
    {
        return $this->estado_validacion_experta === 'validado';
    }

    public function estaRechazadoPorExperto(): bool
    {
        return $this->estado_validacion_experta === 'rechazado';
    }

    public function calcularCriteriosRotterdam(): int
    {
        $total = 0;

        if ($this->cumple_alteracion_ovulatoria) {
            $total++;
        }

        if ($this->cumple_hiperandrogenismo) {
            $total++;
        }

        if ($this->cumple_morfologia_ovarica) {
            $total++;
        }

        return $total;
    }

    public function puedeConfirmarse(): bool
    {
        return $this->total_criterios_rotterdam >= 2
            && $this->diagnosticos_diferenciales_descartados;
    }

    public function determinarFenotipo(): string
    {
        $ovulacion = $this->cumple_alteracion_ovulatoria;
        $hiperandrogenismo = $this->cumple_hiperandrogenismo;
        $morfologia = $this->cumple_morfologia_ovarica;

        if ($ovulacion && $hiperandrogenismo && $morfologia) {
            return 'A_clasico_completo';
        }

        if ($ovulacion && $hiperandrogenismo && ! $morfologia) {
            return 'B_hiperandrogenico_anovulatorio';
        }

        if (! $ovulacion && $hiperandrogenismo && $morfologia) {
            return 'C_ovulatorio';
        }

        if ($ovulacion && ! $hiperandrogenismo && $morfologia) {
            return 'D_no_hiperandrogenico';
        }

        return 'no_clasificado';
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('diagnosticos_pmos')
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}