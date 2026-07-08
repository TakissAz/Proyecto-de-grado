<?php

namespace App\Services\Admin;

use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function listar(array $filtros = []): LengthAwarePaginator
    {
        return User::query()
            ->with(['roles' => function ($query) {
                $query->orderBy('nombre');
            }])
            ->when($filtros['buscar'] ?? null, function ($query, string $buscar) {
                $query->where(function ($subquery) use ($buscar) {
                    $subquery
                        ->where('name', 'ilike', "%{$buscar}%")
                        ->orWhere('email', 'ilike', "%{$buscar}%");
                });
            })
            ->when($filtros['estado'] ?? null, function ($query, string $estado) {
                $query->where('estado', '=', $estado, 'and');
            })
            ->when($filtros['rol'] ?? null, function ($query, string $rol) {
                $query->whereHas('roles', function ($subquery) use ($rol) {
                    $subquery->where('roles.id_rol', '=', $rol, 'and');
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    public function crear(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'estado' => $data['estado'] ?? 'activo',
            ]);

            $this->asignarRol($user, (int) $data['id_rol']);

            activity()
                ->useLog('usuarios')
                ->causedBy(Auth::user())
                ->performedOn($user)
                ->event('crear_usuario')
                ->withProperties([
                    'rol_asignado' => $data['id_rol'],
                ])
                ->log('Usuario creado desde el modulo administrador.');

            return $user->load('roles');
        });
    }

    public function actualizar(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $user->update([
                'name' => $data['name'],
                'email' => $data['email'],
                'estado' => $data['estado'],
            ]);

            if (! empty($data['password'])) {
                $user->update([
                    'password' => Hash::make($data['password']),
                ]);
            }

            if (! empty($data['id_rol'])) {
                $this->asignarRol($user, (int) $data['id_rol']);
            }

            activity()
                ->useLog('usuarios')
                ->causedBy(Auth::user())
                ->performedOn($user)
                ->event('actualizar_usuario')
                ->log('Usuario actualizado desde el modulo administrador.');

            return $user->load('roles');
        });
    }

    public function cambiarEstado(User $user, string $estado): User
    {
        return DB::transaction(function () use ($user, $estado) {
            $user->update([
                'estado' => $estado,
            ]);

            activity()
                ->useLog('usuarios')
                ->causedBy(Auth::user())
                ->performedOn($user)
                ->event('cambiar_estado_usuario')
                ->withProperties([
                    'estado' => $estado,
                ])
                ->log('Estado del usuario actualizado.');

            return $user->load('roles');
        });
    }

    private function asignarRol(User $user, int $idRol): void
    {
        UserRole::query()
            ->where('user_id', '=', $user->id, 'and')
            ->update([
                'estado' => 'inactivo',
            ]);

        $userRole = UserRole::query()
            ->where('user_id', '=', $user->id, 'and')
            ->where('id_rol', '=', $idRol, 'and')
            ->first();

        if ($userRole === null) {
            $userRole = UserRole::create([
                'user_id' => $user->id,
                'id_rol' => $idRol,
                'estado' => 'activo',
            ]);
        } else {
            $userRole->update([
                'estado' => 'activo',
            ]);
        }

        activity()
            ->useLog('usuarios')
            ->causedBy(Auth::user())
            ->performedOn($user)
            ->event('asignar_rol_usuario')
            ->withProperties([
                'id_rol' => $idRol,
                'user_role_id' => $userRole->id_user_rol ?? null,
            ])
            ->log('Rol activo asignado al usuario.');
    }

    public function rolesActivos()
    {
        return Role::query()
            ->where('estado', '=', 'activo', 'and')
            ->orderBy('nombre')
            ->get();
    }
}