<?php

namespace Tests\Feature\Admin;

use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use App\Services\Admin\MetricasGeneralesAdminService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardAdminMetricasTest extends TestCase
{
    use RefreshDatabase;

    public function test_metricas_no_fallan_sin_datos(): void
    {
        $metricas = app(MetricasGeneralesAdminService::class)->obtenerMetricas();

        $this->assertSame(0, $metricas['resumen']['total_pacientes']);
        $this->assertSame(0, $metricas['diagnosticos']['pmos_confirmado']);
        $this->assertSame(0, $metricas['diagnosticos']['ri_confirmada']);
        $this->assertSame(0, $metricas['planes']['total']);
        $this->assertSame(0, $metricas['recomendaciones_expertas']['total']);
        $this->assertSame(0.0, $metricas['seguimiento']['adherencia_promedio']);
        $this->assertSame(0, $metricas['citas']['total']);
        $this->assertIsArray($metricas['actividad']);
        $this->assertIsArray($metricas['alertas_admin']);
        $this->assertSame(['riesgo_alto'=>0,'riesgo_medio'=>0,'riesgo_bajo'=>0,'sin_datos'=>0], $metricas['prediccion_adherencia']);
    }

    public function test_administrador_puede_cargar_dashboard_con_metricas(): void
    {
        $admin = $this->usuarioConRol('administrador');

        $this->actingAs($admin)->get(route('admin.dashboard'))->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Dashboard')
                ->has('metricasGenerales.resumen')
                ->has('metricasGenerales.diagnosticos')
                ->has('metricasGenerales.alertas_admin'));
    }

    public function test_usuario_no_autenticado_es_redirigido(): void
    {
        $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
    }

    public function test_usuario_sin_rol_administrador_recibe_403(): void
    {
        $this->actingAs($this->usuarioConRol('paciente'))->get(route('admin.dashboard'))->assertForbidden();
    }

    private function usuarioConRol(string $nombre): User
    {
        $rol = Role::query()->create(['nombre' => $nombre, 'descripcion' => $nombre, 'estado' => 'activo']);
        $usuario = User::factory()->create(['email_verified_at' => now(), 'estado' => 'activo']);
        UserRole::query()->create(['user_id' => $usuario->getKey(), 'id_rol' => $rol->getKey(), 'estado' => 'activo']);

        return $usuario;
    }
}
