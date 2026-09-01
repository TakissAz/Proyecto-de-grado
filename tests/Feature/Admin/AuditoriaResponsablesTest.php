<?php

namespace Tests\Feature\Admin;

use App\Models\Paciente;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use App\Services\Pacientes\PacienteService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AuditoriaResponsablesTest extends TestCase
{
    use RefreshDatabase;

    public function test_listado_muestra_quien_creo_y_quien_actualizo_al_paciente(): void
    {
        Role::firstOrCreate(['nombre'=>'paciente'],['descripcion'=>'Paciente','estado'=>'activo']);
        $admin=$this->usuario('administrador','Admin Auditor'); $endocrino=$this->usuario('endocrinologo','Dra. Creadora');
        $this->actingAs($endocrino); $paciente=app(PacienteService::class)->crear($this->datosPaciente());
        $this->actingAs($admin); app(PacienteService::class)->actualizar($paciente,$this->datosPaciente(['telefono'=>'70000001']));

        $this->get(route('admin.auditoria.pacientes'))->assertOk()->assertInertia(fn(Assert $page)=>$page
            ->where('pacientes.data.0.creado_por_user.name','Dra. Creadora')
            ->where('pacientes.data.0.actualizado_por_user.name','Admin Auditor')
            ->where('pacientes.data.0.origen_registro','endocrinologo'));
    }

    public function test_actividad_expone_responsable_roles_y_cambios(): void
    {
        Role::firstOrCreate(['nombre'=>'paciente'],['descripcion'=>'Paciente','estado'=>'activo']); $admin=$this->usuario('administrador','Admin Auditor');
        $this->actingAs($admin); $p=app(PacienteService::class)->crear($this->datosPaciente()); app(PacienteService::class)->actualizar($p,$this->datosPaciente(['telefono'=>'71111111']));
        $this->get(route('admin.auditoria.actividad',['paciente'=>$p->getKey()]))->assertOk()->assertInertia(fn(Assert $page)=>$page
            ->where('pacienteSeleccionada.id_paciente',$p->getKey())
            ->where('pacienteSeleccionada.nombre_completo','Ana Prueba Auditoría')
            ->where('actividades.data.0.causer.name','Admin Auditor')->has('actividades.data.0.properties'));
    }

    public function test_historial_filtra_eventos_del_expediente_seleccionado(): void
    {
        Role::firstOrCreate(['nombre'=>'paciente'],['descripcion'=>'Paciente','estado'=>'activo']);$admin=$this->usuario('administrador','Admin Auditor');$this->actingAs($admin);
        $primero=app(PacienteService::class)->crear($this->datosPaciente());
        $segundo=app(PacienteService::class)->crear($this->datosPaciente(['ci'=>'AUD-002','email'=>'otra@example.test']));
        $this->get(route('admin.auditoria.actividad',['paciente'=>$primero->getKey()]))->assertInertia(fn(Assert $page)=>$page
            ->where('pacienteSeleccionada.id_paciente',$primero->getKey())
            ->where('actividades.data',fn($eventos)=>collect($eventos)->every(fn($e)=>(int)$e['subject_id']===$primero->getKey())));
        $this->assertNotSame($primero->getKey(),$segundo->getKey());
    }

    private function usuario(string $rol,string $nombre):User{$r=Role::firstOrCreate(['nombre'=>$rol],['descripcion'=>$rol,'estado'=>'activo']);$u=User::factory()->create(['name'=>$nombre,'estado'=>'activo','email_verified_at'=>now()]);UserRole::create(['user_id'=>$u->getKey(),'id_rol'=>$r->getKey(),'estado'=>'activo']);return $u;}
    private function datosPaciente(array $extra=[]):array{return array_merge(['nombres'=>'Ana','apellido_paterno'=>'Prueba','apellido_materno'=>'Auditoría','ci'=>'AUD-001','fecha_nacimiento'=>'2000-01-01','sexo'=>'femenino','telefono'=>'70000000','email'=>'ana.auditoria@example.test','password'=>'Password123!','estado'=>'activo'],$extra);}
}
