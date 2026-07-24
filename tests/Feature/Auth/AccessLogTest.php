<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Activitylog\Models\Activity;
use Tests\TestCase;

class AccessLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_successful_login_updates_last_access_and_creates_spatie_log(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect('/dashboard');

        $this->assertNotNull($user->fresh()->ultimo_acceso);

        $activity = Activity::query()
            ->where('log_name', 'accesos')
            ->where('event', 'inicio_sesion')
            ->where('causer_id', $user->id)
            ->first();

        $this->assertNotNull($activity);
        $this->assertSame('Inicio de sesión exitoso.', $activity->description);
        $this->assertNotNull($activity->properties->get('ip'));
    }
}
