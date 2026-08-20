<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes, LogsActivity;

    protected $fillable = [
        'name',
        'email',
        'password',
        'estado',
        'ultimo_acceso',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'ultimo_acceso' => 'datetime',
        ];
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'id_rol')
            ->withPivot(['id_user_rol', 'estado', 'deleted_at'])
            ->withTimestamps()
            ->wherePivot('estado', 'activo')
            ->wherePivotNull('deleted_at');
    }

    public function userRoles()
    {
        return $this->hasMany(UserRole::class, 'user_id');
    }

    public function tieneRol(string $rol): bool
    {
        return $this->roles()
            ->where('roles.nombre', $rol)
            ->exists();
    }

    public function paciente()
    {
        return $this->hasOne(Paciente::class, 'user_id');
    }

    public function consultasEndocrinologicas()
    {
        return $this->hasMany(ConsultaEndocrinologica::class, 'id_endocrinologo');
    }

    public function resultadosPerfilAndrogenico()
    {
        return $this->hasMany(ResultadoPerfilAndrogenico::class, 'id_endocrinologo');
    }

    public function resultadosPerfilGonadotropo()
    {
        return $this->hasMany(ResultadoPerfilGonadotropo::class, 'id_endocrinologo');
    }

    public function resultadosDiferencialesEndocrinos()
    {
        return $this->hasMany(ResultadoDiferencialEndocrino::class, 'id_endocrinologo');
    }

    public function resultadosGlucosaInsulina()
    {
        return $this->hasMany(ResultadoGlucosaInsulina::class, 'id_endocrinologo');
    }

    public function resultadosPerfilLipidico()
    {
        return $this->hasMany(ResultadoPerfilLipidico::class, 'id_endocrinologo');
    }

    public function evaluacionesEcograficas()
    {
        return $this->hasMany(EvaluacionEcografica::class, 'id_endocrinologo');
    }

    public function diagnosticosPmos()
    {
        return $this->hasMany(DiagnosticoPmos::class, 'id_endocrinologo');
    }

    public function diagnosticosResistenciaInsulina()
    {
        return $this->hasMany(DiagnosticoResistenciaInsulina::class, 'id_endocrinologo');
    }

    public function diagnosticosPmosValidadosComoExperto()
    {
        return $this->hasMany(DiagnosticoPmos::class, 'validado_por');
    }

    public function diagnosticosRiValidadosComoExperto()
    {
        return $this->hasMany(DiagnosticoResistenciaInsulina::class, 'validado_por');
    }

    public function citasComoProfesional(): HasMany
    {
        return $this->hasMany(Cita::class, 'id_profesional');
    }

    public function citasRegistradas(): HasMany
    {
        return $this->hasMany(Cita::class, 'registrada_por');
    }

    public function consultasNutricionalesComoNutricionista(): HasMany
    {
        return $this->hasMany(ConsultaNutricional::class, 'id_nutricionista');
    }

    public function evaluacionesNutricionalesComoNutricionista(): HasMany
    {
        return $this->hasMany(EvaluacionNutricional::class, 'id_nutricionista');
    }

    public function habitosAlimentariosComoNutricionista(): HasMany
    {
        return $this->hasMany(HabitoAlimentario::class, 'id_nutricionista');
    }

    public function preferenciasAlimentariasComoNutricionista(): HasMany
    {
        return $this->hasMany(PreferenciaAlimentaria::class, 'id_nutricionista');
    }

    public function restriccionesAlimentariasComoNutricionista(): HasMany
    {
        return $this->hasMany(RestriccionAlimentaria::class, 'id_nutricionista');
    }

    public function objetivosNutricionalesComoNutricionista(): HasMany
    {
        return $this->hasMany(ObjetivoNutricional::class, 'id_nutricionista');
    }
    public function requerimientosNutricionalesComoNutricionista(): HasMany
    {
        return $this->hasMany(RequerimientoNutricional::class, 'id_nutricionista');
    }

    public function recomendacionesNutricionalesExpertasComoNutricionista(): HasMany
    {
        return $this->hasMany(RecomendacionNutricionalExperta::class, 'id_nutricionista');
    }

    public function recomendacionesNutricionalesExpertasValidadas(): HasMany
    {
        return $this->hasMany(RecomendacionNutricionalExperta::class, 'validado_por');
    }

    public function planesAlimentariosComoNutricionista(): HasMany
    {
        return $this->hasMany(PlanAlimentario::class, 'id_nutricionista');
    }

    public function planesAlimentariosAprobados(): HasMany
    {
        return $this->hasMany(PlanAlimentario::class, 'aprobado_por');
    }
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('usuarios')
            ->logOnly([
                'name',
                'email',
                'estado',
                'ultimo_acceso',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}
