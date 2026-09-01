<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use RuntimeException;
use Throwable;
use App\Services\Auth\AccessLogService;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(Request $request, AccessLogService $accessLogService): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            $email = mb_strtolower(trim((string) $googleUser->getEmail()));

            if ($email === '') {
                throw new RuntimeException('Google no devolvió un correo electrónico válido.');
            }

            $user = User::query()
                ->whereRaw('LOWER(email) = ?', [$email])
                ->first();

            if ($user === null) {
                return to_route('login')->with('error', 'Tu correo de Google no está registrado en el sistema.');
            }

            if ($user->estado !== 'activo') {
                return to_route('login')->with('error', 'Tu cuenta está inactiva. Contacta al administrador.');
            }

            $googleId = trim((string) $googleUser->getId());
            $avatar = $googleUser->getAvatar();
            $changes = [];

            if (blank($user->google_id) && $googleId !== '') {
                $changes['google_id'] = $googleId;
            }

            if (is_string($avatar) && $avatar !== '') {
                $changes['avatar'] = $avatar;
            }

            if ($user->email_verified_at === null) {
                $changes['email_verified_at'] = now();
            }

            if ($changes !== []) {
                $user->forceFill($changes)->save();
            }

            Auth::login($user, true);
            $request->session()->regenerate();
            $accessLogService->registrarIngreso($user, $request, 'google');

            return redirect()->intended(route('dashboard', absolute: false));
        } catch (Throwable $exception) {
            report($exception);

            return to_route('login')->with(
                'error',
                'No se pudo iniciar sesión con Google. Inténtalo nuevamente.'
            );
        }
    }
}
