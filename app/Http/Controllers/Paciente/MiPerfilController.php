<?php

namespace App\Http\Controllers\Paciente;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MiPerfilController extends Controller
{
    public function show(Request $request): Response
    {
        $user = $request->user()->load('paciente');
        abort_unless($user->paciente, 404, 'No existe un perfil de paciente asociado a esta cuenta.');

        return Inertia::render('Paciente/MiPerfil', [
            'perfil' => $this->datos($user),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user()->load('paciente');
        abort_unless($user->paciente, 404, 'No existe un perfil de paciente asociado a esta cuenta.');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'fecha_nacimiento' => ['nullable', 'date', 'before:today'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        DB::transaction(function () use ($request, $user, $data): void {
            $avatarAnterior = $user->avatar;
            $user->name = $data['name'];

            if ($request->hasFile('avatar')) {
                $user->avatar = $request->file('avatar')->store('avatars', 'public');
                if ($avatarAnterior && ! filter_var($avatarAnterior, FILTER_VALIDATE_URL)) {
                    Storage::disk('public')->delete($avatarAnterior);
                }
            }

            $user->save();
            $user->paciente->update([
                'telefono' => $data['telefono'] ?? null,
                'direccion' => $data['direccion'] ?? null,
                'fecha_nacimiento' => $data['fecha_nacimiento'] ?? $user->paciente->fecha_nacimiento,
            ]);
        });

        return back()->with('success', 'Tu perfil fue actualizado correctamente.');
    }

    private function datos($user): array
    {
        $paciente = $user->paciente;
        return [
            'name' => $user->name,
            'email' => $user->email,
            'avatar_url' => $user->avatar_url,
            'estado_cuenta' => $user->estado,
            'telefono' => $paciente->telefono,
            'direccion' => $paciente->direccion,
            'fecha_nacimiento' => $paciente->fecha_nacimiento?->format('Y-m-d'),
            'edad' => $paciente->fecha_nacimiento?->age,
            'sexo' => $paciente->sexo,
        ];
    }
}
