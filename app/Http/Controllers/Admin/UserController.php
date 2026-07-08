<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\Admin\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(
        private readonly UserService $userService
    ) {
    }

    public function index(Request $request): Response
    {
        $users = $this->userService->listar(
            $request->only(['buscar', 'estado', 'rol'])
        );

        return Inertia::render('Admin/Users/Index', [
            'users' => UserResource::collection($users),
            'roles' => $this->userService->rolesActivos(),
            'filters' => [
                'buscar' => $request->input('buscar', ''),
                'estado' => $request->input('estado', ''),
                'rol' => $request->input('rol', ''),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Users/Create', [
            'roles' => $this->userService->rolesActivos(),
            'estados' => [
                'activo',
                'inactivo',
                'bloqueado',
            ],
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $this->userService->crear($request->validated());

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Usuario creado correctamente.');
    }

    public function edit(User $user): Response
    {
        $user->load('roles');

        return Inertia::render('Admin/Users/Edit', [
            'user' => new UserResource($user),
            'roles' => $this->userService->rolesActivos(),
            'estados' => [
                'activo',
                'inactivo',
                'bloqueado',
            ],
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->userService->actualizar($user, $request->validated());

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Usuario actualizado correctamente.');
    }

    public function activar(User $user): RedirectResponse
    {
        $this->userService->cambiarEstado($user, 'activo');

        return back()->with('success', 'Usuario activado correctamente.');
    }

    public function inactivar(User $user): RedirectResponse
    {
        $this->userService->cambiarEstado($user, 'inactivo');

        return back()->with('success', 'Usuario inactivado correctamente.');
    }

    public function bloquear(User $user): RedirectResponse
    {
        $this->userService->cambiarEstado($user, 'bloqueado');

        return back()->with('success', 'Usuario bloqueado correctamente.');
    }
}