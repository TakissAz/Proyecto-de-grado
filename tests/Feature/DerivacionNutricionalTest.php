<?php

namespace Tests\Feature;

use App\Models\DerivacionNutricional;
use App\Models\NotificacionInterna;
use App\Models\Paciente;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DerivacionNutricionalTest extends TestCase
{
    use RefreshDatabase;

    public function test_endocrinologo_deriva_y_notifica_a_nutricionistas_activas(): void
    {
        $endo=$this->usuario('endocrinologo'); $nutri=$this->usuario('nutricionista'); $p=$this->paciente();
        $this->actingAs($endo)->post(route('endocrinologo.pacientes.derivar-nutricion',$p),['prioridad'=>'alta','motivo_derivacion'=>'Control metabólico'])->assertRedirect();
        $this->assertDatabaseHas('derivaciones_nutricionales',['id_paciente'=>$p->getKey(),'estado'=>'pendiente','prioridad'=>'alta']);
        $this->assertDatabaseHas('notificaciones_internas',['id_usuario_destino'=>$nutri->getKey(),'tipo'=>'derivacion_nutricional','leida'=>false]);
    }

    public function test_no_duplica_derivacion_activa_ni_notificacion(): void
    {
        $endo=$this->usuario('endocrinologo'); $nutri=$this->usuario('nutricionista'); $p=$this->paciente(); $url=route('endocrinologo.pacientes.derivar-nutricion',$p);
        $this->actingAs($endo)->post($url,['prioridad'=>'normal']); $this->actingAs($endo)->post($url,['prioridad'=>'alta']);
        $this->assertSame(1,DerivacionNutricional::count()); $this->assertSame(1,NotificacionInterna::where('id_usuario_destino',$nutri->getKey())->count()); $this->assertSame('alta',DerivacionNutricional::first()->prioridad);
    }

    public function test_roles_no_autorizados_no_gestionan_derivaciones(): void
    {
        $p=$this->paciente(); $paciente=$this->usuario('paciente'); $admin=$this->usuario('administrador');
        $this->actingAs($paciente)->post("/endocrinologo/pacientes/{$p->getKey()}/derivar-nutricion",['prioridad'=>'normal'])->assertForbidden();
        $this->actingAs($admin)->get('/nutricionista/derivaciones')->assertForbidden();
    }

    public function test_nutricionista_visualiza_y_actualiza_estados(): void
    {
        $endo=$this->usuario('endocrinologo'); $nutri=$this->usuario('nutricionista'); $p=$this->paciente(); $this->actingAs($endo)->post(route('endocrinologo.pacientes.derivar-nutricion',$p),['prioridad'=>'normal']); $d=DerivacionNutricional::firstOrFail();
        $this->actingAs($nutri)->get(route('nutricionista.derivaciones.index'))->assertOk();
        $this->actingAs($nutri)->post(route('nutricionista.derivaciones.vista',$d))->assertRedirect(); $this->assertSame('vista',$d->fresh()->estado);
        $this->actingAs($nutri)->post(route('nutricionista.derivaciones.en-proceso',$d))->assertRedirect(); $this->assertSame('en_proceso',$d->fresh()->estado);
        $this->actingAs($nutri)->post(route('nutricionista.derivaciones.atendida',$d))->assertRedirect(); $this->assertSame('atendida',$d->fresh()->estado);
    }

    public function test_notificaciones_solo_pueden_ser_leidas_por_destinatario(): void
    {
        $a=$this->usuario('nutricionista'); $b=$this->usuario('nutricionista'); $n=NotificacionInterna::create(['id_usuario_destino'=>$a->getKey(),'tipo'=>'prueba','titulo'=>'Aviso','mensaje'=>'Mensaje']);
        $this->actingAs($b)->post(route('notificaciones.leer',$n))->assertForbidden();
        $this->actingAs($a)->post(route('notificaciones.leer',$n))->assertRedirect(); $this->assertTrue($n->fresh()->leida);
    }

    public function test_shared_props_incluyen_contador_y_marcar_todas_funciona(): void
    {
        $u=$this->usuario('nutricionista'); NotificacionInterna::create(['id_usuario_destino'=>$u->getKey(),'tipo'=>'prueba','titulo'=>'Aviso','mensaje'=>'Mensaje']);
        $this->actingAs($u)->get(route('notificaciones.index'))->assertInertia(fn($p)=>$p->where('notificaciones.total_no_leidas',1));
        $this->actingAs($u)->post(route('notificaciones.leer-todas'))->assertRedirect(); $this->assertDatabaseHas('notificaciones_internas',['id_usuario_destino'=>$u->getKey(),'leida'=>true]);
    }

    private function usuario(string $nombre): User { $r=Role::firstOrCreate(['nombre'=>$nombre],['descripcion'=>$nombre,'estado'=>'activo']); $u=User::factory()->create(['estado'=>'activo','email_verified_at'=>now()]); UserRole::create(['user_id'=>$u->getKey(),'id_rol'=>$r->getKey(),'estado'=>'activo']); return $u; }
    private function paciente(): Paciente { $u=User::factory()->create(); return Paciente::create(['user_id'=>$u->getKey(),'nombres'=>'Paciente','apellido_paterno'=>'Prueba','ci'=>'CI-'.uniqid(),'fecha_nacimiento'=>'2000-01-01','sexo'=>'femenino','estado'=>'activo']); }
}
