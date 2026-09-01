<?php

namespace Tests\Feature\Admin;

use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use App\Services\Auth\AccessLogService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LogsAccesoTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrador_visualiza_logs_con_usuario_rol_ip_y_metodo(): void
    {
        $admin=$this->usuario('administrador');$nutri=$this->usuario('nutricionista');
        $request=Request::create('/login','POST',server:['REMOTE_ADDR'=>'192.168.1.20','HTTP_USER_AGENT'=>'Mozilla/5.0 Chrome/120 Windows']);
        app(AccessLogService::class)->registrarIngreso($nutri,$request,'credenciales');
        $this->actingAs($admin)->get(route('admin.logs-acceso.index'))->assertOk()->assertInertia(fn(Assert $p)=>$p
            ->where('accesos.data.0.usuario.email',$nutri->email)->where('accesos.data.0.ip','192.168.1.20')
            ->where('accesos.data.0.metodo','credenciales')->where('accesos.data.0.usuario.roles.0','nutricionista'));
    }

    public function test_logs_estan_protegidos_para_superadministracion(): void
    {
        $this->get(route('admin.logs-acceso.index'))->assertRedirect(route('login'));
        $this->actingAs($this->usuario('nutricionista'))->get(route('admin.logs-acceso.index'))->assertForbidden();
    }

    private function usuario(string $rol):User{$r=Role::firstOrCreate(['nombre'=>$rol],['descripcion'=>$rol,'estado'=>'activo']);$u=User::factory()->create(['estado'=>'activo','email_verified_at'=>now()]);UserRole::create(['user_id'=>$u->getKey(),'id_rol'=>$r->getKey(),'estado'=>'activo']);return $u;}
}
