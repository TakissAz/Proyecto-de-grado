<?php

namespace Tests\Feature\Admin;

use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_users_index(): void
    {
        $role = Role::create([
            'nombre' => 'administrador',
            'descripcion' => 'Administrador del sistema',
            'estado' => 'activo',
        ]);

        /** @var \App\Models\User $admin */
        $admin = User::factory()->create([
            'name' => 'Admin Test',
            'email' => 'admin@example.com',
            'estado' => 'activo',
        ]);

        UserRole::create([
            'user_id' => $admin->id,
            'id_rol' => $role->id_rol,
            'estado' => 'activo',
        ]);

        $response = $this->actingAs($admin)->get('/admin/users');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Users/Index')
            ->has('users')
            ->has('roles'));
    }
}
