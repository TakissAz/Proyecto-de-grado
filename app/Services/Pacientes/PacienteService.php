<?php

namespace App\Services\Pacientes;

use App\Models\Paciente;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Activitylog\Models\Activity;

class PacienteService
{
    public const ORIGEN_NUTRICIONISTA = 'nutricionista';
    public const ORIGEN_ENDOCRINOLOGO = 'endocrinologo';
    public const ORIGEN_ADMINISTRADOR = 'administrador';

    public const FLUJO_PENDIENTE_NUTRICION = 'pendiente_nutricion';
    public const FLUJO_PENDIENTE_ENDOCRINO = 'pendiente_endocrino';
    public const FLUJO_EN_SEGUIMIENTO = 'en_seguimiento';
    public const FLUJO_COMPLETO = 'completo';
    public const FLUJO_INACTIVO = 'inactivo';

    public function listar(array $filtros = [], ?string $contexto = null): LengthAwarePaginator
    {
        return $this->baseQuery()
            ->when(! empty($filtros['buscar']), function ($query) use ($filtros) {
                $buscar = trim((string) $filtros['buscar']);

                $query->where(function ($subquery) use ($buscar) {
                    $subquery
                        ->where('ci', 'ilike', '%' . $buscar . '%')
                        ->orWhere('telefono', 'ilike', '%' . $buscar . '%')
                        ->orWhereHas('user', function ($userQuery) use ($buscar) {
                            $userQuery->where('name', 'ilike', '%' . $buscar . '%')
                                ->orWhere('email', 'ilike', '%' . $buscar . '%');
                        });
                });
            })
            ->when(! empty($filtros['estado']), function ($query) use ($filtros) {
                $query->where('estado', '=', $filtros['estado'], 'and');
            })
            ->latest('id_paciente')
            ->paginate(10)
            ->withQueryString();
    }

    public function auditoriaPacientes(array $filtros = []): LengthAwarePaginator
    {
        return $this->listar($filtros);
    }

    public function actividadPacientes(array $filtros = []): LengthAwarePaginator
    {
        $query = Activity::query()
            ->with(['causer', 'subject'])
            ->where('log_name', '=', 'pacientes', 'and');

        if (! empty($filtros['paciente'])) {
            $query->where('subject_type', '=', Paciente::class, 'and')
                ->where('subject_id', '=', $filtros['paciente'], 'and');
        }

        if (! empty($filtros['buscar'])) {
            $buscar = trim((string) $filtros['buscar']);

            $query->where(function ($subquery) use ($buscar) {
                $subquery
                    ->where('description', 'ilike', '%' . $buscar . '%')
                    ->orWhere('event', 'ilike', '%' . $buscar . '%')
                    ->orWhereHas('causer', function ($causerQuery) use ($buscar) {
                        $causerQuery->where('name', 'ilike', '%' . $buscar . '%');
                    });
            });
        }

        return $query
            ->latest('id')
            ->paginate(15)
            ->withQueryString();
    }

    public function cargar(Paciente $paciente): Paciente
    {
        return $paciente->load([
            'user.roles' => function ($query) {
                $query->orderBy('nombre');
            },
        ]);
    }

    public function crear(array $data): Paciente
    {
        return DB::transaction(function () use ($data) {
            $actor = Auth::user();
            $user = $this->crearUsuarioPaciente($data);

            $paciente = Paciente::create([
                'user_id' => $user->id,
                'nombres' => $data['nombres'],
                'apellido_paterno' => $data['apellido_paterno'],
                'apellido_materno' => $data['apellido_materno'] ?? null,
                'ci' => $data['ci'],
                'fecha_nacimiento' => $data['fecha_nacimiento'],
                'sexo' => $data['sexo'] ?? 'femenino',
                'telefono' => $data['telefono'] ?? null,
                'direccion' => $data['direccion'] ?? null,
                'ocupacion' => $data['ocupacion'] ?? null,
                'estado_civil' => $data['estado_civil'] ?? null,
                'fecha_registro' => $data['fecha_registro'] ?? Carbon::now()->toDateString(),
                'estado' => $data['estado'] ?? 'activo',
                'observaciones' => $data['observaciones'] ?? null,
            ]);

            $this->registrarActividad($paciente, 'crear_paciente', 'Paciente creado desde el modulo clinico.', [
                'creado_por' => $actor?->id,
            ]);

            return $this->cargar($paciente);
        });
    }

    public function actualizar(Paciente $paciente, array $data): Paciente
    {
        return DB::transaction(function () use ($paciente, $data) {
            $user = $paciente->user ?? $this->crearUsuarioPaciente($data);

            $user->update([
                'name' => $this->nombreCompletoPaciente($data),
                'email' => $data['email'],
            ]);

            if (! empty($data['password'])) {
                $user->update([
                    'password' => Hash::make($data['password']),
                ]);
            }

            $this->asegurarRolPaciente($user);

            $paciente->update([
                'user_id' => $user->id,
                'nombres' => $data['nombres'],
                'apellido_paterno' => $data['apellido_paterno'],
                'apellido_materno' => $data['apellido_materno'] ?? null,
                'ci' => $data['ci'],
                'fecha_nacimiento' => $data['fecha_nacimiento'],
                'sexo' => $data['sexo'] ?? 'femenino',
                'telefono' => $data['telefono'] ?? null,
                'direccion' => $data['direccion'] ?? null,
                'ocupacion' => $data['ocupacion'] ?? null,
                'estado_civil' => $data['estado_civil'] ?? null,
                'fecha_registro' => $data['fecha_registro'] ?? Carbon::now()->toDateString(),
                'estado' => $data['estado'] ?? $paciente->estado,
                'observaciones' => $data['observaciones'] ?? null,
            ]);

            $this->registrarActividad($paciente, 'actualizar_paciente', 'Paciente actualizado desde el modulo clinico.');

            return $this->cargar($paciente);
        });
    }

    public function cambiarEstado(Paciente $paciente, string $estado): Paciente
    {
        return DB::transaction(function () use ($paciente, $estado) {
            $paciente->update([
                'estado' => $estado,
            ]);

            $this->registrarActividad($paciente, 'cambiar_estado_paciente', 'Estado del paciente actualizado.', [
                'estado' => $estado,
            ]);

            return $this->cargar($paciente);
        });
    }

    public function usuariosDisponibles(?Paciente $paciente = null): Collection
    {
        return User::query()
            ->where('estado', '=', 'activo', 'and')
            ->whereDoesntHave('roles', function ($query) {
                $query->where('roles.nombre', '=', 'paciente', 'and');
            })
            ->orderBy('name')
            ->get();
    }

    private function baseQuery()
    {
        return Paciente::query()
            ->with([
                'user.roles' => function ($query) {
                    $query->orderBy('nombre');
                },
            ]);
    }

    private function crearUsuarioPaciente(array $data): User
    {
        $user = User::create([
            'name' => $this->nombreCompletoPaciente($data),
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'estado' => 'activo',
        ]);

        $this->asegurarRolPaciente($user);

        return $user;
    }

    private function nombreCompletoPaciente(array $data): string
    {
        return trim(collect([
            $data['nombres'] ?? null,
            $data['apellido_paterno'] ?? null,
            $data['apellido_materno'] ?? null,
        ])->filter()->join(' '));
    }

    private function asegurarRolPaciente(User $user): void
    {
        $rolPaciente = $this->obtenerRolPaciente();

        $yaTieneRol = UserRole::query()
            ->where('user_id', '=', $user->id, 'and')
            ->where('id_rol', '=', $rolPaciente->id_rol, 'and')
            ->whereNull('deleted_at')
            ->exists();

        if ($yaTieneRol) {
            return;
        }

        UserRole::create([
            'user_id' => $user->id,
            'id_rol' => $rolPaciente->id_rol,
            'estado' => 'activo',
        ]);
    }

    private function obtenerRolPaciente(): Role
    {
        return Role::query()
            ->where('nombre', '=', 'paciente', 'and')
            ->firstOrFail();
    }

    private function registrarActividad(Paciente $paciente, string $evento, string $descripcion, array $properties = []): void
    {
        activity()
            ->useLog('pacientes')
            ->causedBy(Auth::user())
            ->performedOn($paciente)
            ->event($evento)
            ->withProperties($properties)
            ->log($descripcion);
    }
}