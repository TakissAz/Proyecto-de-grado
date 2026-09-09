<?php

namespace Tests\Feature\Nutricion;

use App\Models\ConsultaNutricional;
use App\Models\HabitoAlimentario;
use App\Models\Paciente;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HabitosAlimentariosCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_nutricionista_crea_un_nuevo_registro_de_habitos(): void
    {
        [$nutricionista, $paciente] = $this->contexto();

        $this->actingAs($nutricionista)->post(route('nutricionista.pacientes.perfil-nutricional.habitos.store', $paciente), $this->datos())
            ->assertRedirect();

        $this->assertDatabaseHas('habitos_alimentarios', [
            'id_paciente'=>$paciente->getKey(), 'comidas_por_dia'=>4,
            'consumo_azucar'=>'ocasional', 'horarios_regulares'=>true,
        ]);
    }

    public function test_nutricionista_edita_el_registro_y_el_perfil_muestra_el_cambio(): void
    {
        [$nutricionista, $paciente, $consulta] = $this->contexto();
        $habito = HabitoAlimentario::query()->create($this->datos() + [
            'id_paciente'=>$paciente->getKey(), 'id_nutricionista'=>$nutricionista->getKey(),
            'id_consulta_nutricional'=>$consulta->getKey(), 'estado'=>true,
        ]);
        $actualizados = array_replace($this->datos(), ['comidas_por_dia'=>5, 'consumo_agua_litros'=>2.5, 'consumo_azucar'=>'nunca']);

        $this->actingAs($nutricionista)->put(route('nutricionista.pacientes.perfil-nutricional.habitos.update', [$paciente, $habito]), $actualizados)
            ->assertRedirect();

        $this->assertDatabaseHas('habitos_alimentarios', [
            'id_habito_alimentario'=>$habito->getKey(), 'comidas_por_dia'=>5,
            'consumo_agua_litros'=>2.5, 'consumo_azucar'=>'nunca',
        ]);
    }

    private function contexto(): array
    {
        $rol=Role::query()->create(['nombre'=>'nutricionista','descripcion'=>'Nutricionista','estado'=>'activo']);
        $nutricionista=User::factory()->create(['estado'=>'activo']);
        UserRole::query()->create(['user_id'=>$nutricionista->getKey(),'id_rol'=>$rol->getKey(),'estado'=>'activo']);
        $paciente=Paciente::query()->create(['user_id'=>User::factory()->create()->getKey(),'nombres'=>'Paciente','apellido_paterno'=>'Hábitos','ci'=>'HAB-001','fecha_nacimiento'=>'1995-01-01','sexo'=>'femenino','estado'=>'activo']);
        $consulta=ConsultaNutricional::query()->create(['id_paciente'=>$paciente->getKey(),'id_nutricionista'=>$nutricionista->getKey(),'fecha_consulta'=>today(),'motivo_consulta'=>'Seguimiento','estado_consulta'=>'abierta','estado'=>true]);
        return [$nutricionista,$paciente,$consulta];
    }

    private function datos(): array
    {
        return ['comidas_por_dia'=>4,'consumo_agua_litros'=>2,'consumo_azucar'=>'ocasional','consumo_ultraprocesados'=>'ocasional','consumo_frituras'=>'nunca','consumo_bebidas_azucaradas'=>'nunca','frecuencia_frutas_verduras'=>'diario','horarios_regulares'=>true,'consume_desayuno'=>true,'cena_tardia'=>false,'ansiedad_por_comida'=>false,'hambre_nocturna'=>false,'observaciones'=>'Hábitos revisados.'];
    }
}
