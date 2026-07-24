<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class AccessLogService
{
    public function registrarIngreso(User $user, Request $request): void
    {
        try {
            $fechaAcceso = now();

            DB::table($user->getTable())
                ->where($user->getKeyName(), $user->getKey())
                ->update(['ultimo_acceso' => $fechaAcceso]);

            $user->setAttribute('ultimo_acceso', $fechaAcceso);

            activity()
                ->useLog('accesos')
                ->causedBy($user)
                ->performedOn($user)
                ->event('inicio_sesion')
                ->withProperties([
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ])
                ->log('Inicio de sesión exitoso.');
        } catch (Throwable $exception) {
            // La auditoría es secundaria: nunca debe impedir un acceso válido.
            report($exception);
        }
    }
}
