<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;
use Mockery;
use RuntimeException;
use Tests\TestCase;

class GoogleAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_redirect_sends_the_user_to_google(): void
    {
        $provider = Mockery::mock(Provider::class);
        $provider->shouldReceive('redirect')
            ->once()
            ->andReturn(redirect('https://accounts.google.test/oauth'));

        Socialite::shouldReceive('driver')->once()->with('google')->andReturn($provider);

        $this->get(route('auth.google.redirect'))
            ->assertRedirect('https://accounts.google.test/oauth');
    }

    public function test_existing_active_user_can_log_in_with_google_without_losing_roles(): void
    {
        $user = $this->userWithRole('nutricionista', ['email' => 'persona@example.com']);
        $roleIds = $user->roles()->pluck('roles.id_rol')->all();
        $this->fakeGoogleUser('Persona@Example.com', 'google-123', 'https://example.com/avatar.jpg');

        $this->get(route('auth.google.callback'))
            ->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user);
        $user->refresh();
        $this->assertSame('google-123', $user->google_id);
        $this->assertSame('https://example.com/avatar.jpg', $user->avatar);
        $this->assertSame($roleIds, $user->roles()->pluck('roles.id_rol')->all());
    }

    public function test_google_login_verifies_an_existing_unverified_email(): void
    {
        $user = User::factory()->unverified()->create([
            'email' => 'pendiente@example.com',
            'estado' => 'activo',
        ]);
        $this->fakeGoogleUser($user->email);

        $this->get(route('auth.google.callback'))->assertRedirect(route('dashboard'));

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_existing_google_id_is_not_overwritten(): void
    {
        $user = User::factory()->create([
            'email' => 'vinculado@example.com',
            'estado' => 'activo',
            'google_id' => 'google-original',
        ]);
        $this->fakeGoogleUser($user->email, 'google-nuevo');

        $this->get(route('auth.google.callback'))->assertRedirect(route('dashboard'));

        $this->assertSame('google-original', $user->fresh()->google_id);
    }

    public function test_unknown_google_email_is_rejected_without_creating_a_user(): void
    {
        $before = User::query()->count();
        $this->fakeGoogleUser('desconocido@example.com');

        $this->get(route('auth.google.callback'))
            ->assertRedirect(route('login'))
            ->assertSessionHas('error', 'Tu correo de Google no está registrado en el sistema.');

        $this->assertGuest();
        $this->assertSame($before, User::query()->count());
    }

    public function test_inactive_existing_user_cannot_log_in_with_google(): void
    {
        $user = User::factory()->create([
            'email' => 'inactivo@example.com',
            'estado' => 'inactivo',
        ]);
        $this->fakeGoogleUser($user->email);

        $this->get(route('auth.google.callback'))
            ->assertRedirect(route('login'))
            ->assertSessionHas('error', 'Tu cuenta está inactiva. Contacta al administrador.');

        $this->assertGuest();
    }

    public function test_provider_failure_returns_a_controlled_error(): void
    {
        $provider = Mockery::mock(Provider::class);
        $provider->shouldReceive('user')->once()->andThrow(new RuntimeException('OAuth unavailable'));
        Socialite::shouldReceive('driver')->once()->with('google')->andReturn($provider);

        $this->get(route('auth.google.callback'))
            ->assertRedirect(route('login'))
            ->assertSessionHas('error', 'No se pudo iniciar sesión con Google. Inténtalo nuevamente.');

        $this->assertGuest();
    }

    public function test_google_tokens_are_never_stored(): void
    {
        $user = User::factory()->create([
            'email' => 'seguro@example.com',
            'estado' => 'activo',
        ]);
        $this->fakeGoogleUser($user->email);

        $this->get(route('auth.google.callback'))->assertRedirect(route('dashboard'));

        $attributes = $user->fresh()->getAttributes();
        $this->assertArrayNotHasKey('google_token', $attributes);
        $this->assertArrayNotHasKey('access_token', $attributes);
        $this->assertArrayNotHasKey('refresh_token', $attributes);
    }

    private function fakeGoogleUser(
        string $email,
        string $id = 'google-id',
        ?string $avatar = 'https://example.com/avatar.jpg'
    ): void {
        $googleUser = Mockery::mock(SocialiteUser::class);
        $googleUser->shouldReceive('getEmail')->andReturn($email);
        $googleUser->shouldReceive('getId')->andReturn($id);
        $googleUser->shouldReceive('getAvatar')->andReturn($avatar);

        $provider = Mockery::mock(Provider::class);
        $provider->shouldReceive('user')->once()->andReturn($googleUser);
        Socialite::shouldReceive('driver')->once()->with('google')->andReturn($provider);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function userWithRole(string $roleName, array $attributes = []): User
    {
        $role = Role::query()->create([
            'nombre' => $roleName,
            'descripcion' => ucfirst($roleName),
            'estado' => 'activo',
        ]);
        $user = User::factory()->create([
            'estado' => 'activo',
            ...$attributes,
        ]);
        UserRole::query()->create([
            'user_id' => $user->getKey(),
            'id_rol' => $role->getKey(),
            'estado' => 'activo',
        ]);

        return $user;
    }
}
