<?php

namespace Tests\Feature\Prediccion;

use App\Models\ComidaPlanAlimentario;
use App\Models\DiaPlanAlimentario;
use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Models\SeguimientoComida;
use App\Models\SeguimientoSintomaPaciente;
use App\Models\User;
use App\Services\Prediccion\FeaturesAdherenciaPacienteService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeaturesAdherenciaPacienteServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_extrae_features_sin_datos_y_no_falla(): void
    {
        $features = app(FeaturesAdherenciaPacienteService::class)->extraer($this->paciente());
        $this->assertFalse($features['tiene_datos']);
        $this->assertSame(0.0, $features['adherencia_promedio']);
        $this->assertSame(0, $features['planes_generados']);
    }

    public function test_calcula_adherencia_y_senales_de_comidas(): void
    {
        $paciente = $this->paciente();
        $this->seguimiento($paciente, 'desayuno', 'completada', 100);
        $this->seguimiento($paciente, 'desayuno', 'parcial', 50, ['nivel_hambre_posterior' => 'alta', 'ansiedad_posterior' => true, 'presento_molestia' => true, 'intensidad_molestia' => 'moderada', 'consiguio_ingredientes' => false]);
        $this->seguimiento($paciente, 'cena', 'no_realizada', 0, ['nivel_agrado' => 'no_me_gusto', 'desea_repetir' => false]);
        $features = app(FeaturesAdherenciaPacienteService::class)->extraer($paciente);

        $this->assertSame(50.0, $features['adherencia_promedio']);
        $this->assertSame(75.0, $features['adherencia_desayuno']);
        $this->assertSame(0.0, $features['adherencia_cena']);
        $this->assertSame(1, $features['hambre_posterior_alta']);
        $this->assertSame(1, $features['ansiedad_posterior']);
        $this->assertSame(1, $features['molestias_digestivas']);
        $this->assertSame(1, $features['ingredientes_no_conseguidos']);
    }

    public function test_extrae_sintomas_frecuentes(): void
    {
        $paciente = $this->paciente();
        foreach (range(0, 2) as $dia) SeguimientoSintomaPaciente::query()->create([
            'id_paciente' => $paciente->getKey(), 'fecha_registro' => today()->subDays($dia),
            'hambre_nocturna' => true, 'antojos_dulces' => 'alto', 'ansiedad_por_comida' => 'alta',
            'hinchazon_abdominal' => 'severa', 'nivel_energia' => 'baja', 'calidad_sueno' => 'mala', 'actividad_fisica' => 'ninguna',
        ]);
        $features = app(FeaturesAdherenciaPacienteService::class)->extraer($paciente);
        foreach (['hambre_nocturna_frecuente','antojos_dulces_frecuentes','ansiedad_comida_frecuente','hinchazon_frecuente','baja_energia_frecuente','sueno_deficiente_frecuente','actividad_fisica_baja'] as $campo) $this->assertTrue($features[$campo]);
    }

    public function test_comando_predictivo_existe_y_maneja_paciente_inexistente(): void
    {
        $this->artisan('prediccion:riesgo-adherencia', ['paciente' => 999999])
            ->expectsOutput('No se encontró el paciente indicado.')
            ->assertFailed();
    }

    private function paciente(): Paciente
    {
        $user = User::factory()->create();
        return Paciente::query()->create(['user_id'=>$user->getKey(),'nombres'=>'Paciente','apellido_paterno'=>'Predictiva','ci'=>fake()->unique()->numerify('########'),'fecha_nacimiento'=>'1995-01-01','sexo'=>'femenino','estado'=>'activo']);
    }

    private function seguimiento(Paciente $paciente, string $tipo, string $estado, int $porcentaje, array $extra=[]): void
    {
        $plan = PlanAlimentario::query()->create(['id_paciente'=>$paciente->getKey(),'nombre'=>'Plan predictivo','estado_plan'=>'activo','estado'=>'activo']);
        $dia = DiaPlanAlimentario::query()->create(['id_plan_alimentario'=>$plan->getKey(),'numero_dia'=>1,'nombre_dia'=>'Día 1','fecha'=>today(),'estado'=>'activo']);
        $comida = ComidaPlanAlimentario::query()->create(['id_dia_plan_alimentario'=>$dia->getKey(),'tipo_comida'=>$tipo,'nombre_comida'=>ucfirst($tipo),'orden'=>1,'estado'=>'activo']);
        SeguimientoComida::query()->create(array_merge(['id_paciente'=>$paciente->getKey(),'id_plan_alimentario'=>$plan->getKey(),'id_dia_plan_alimentario'=>$dia->getKey(),'id_comida_plan_alimentario'=>$comida->getKey(),'fecha_seguimiento'=>today(),'estado_cumplimiento'=>$estado,'porcentaje_consumido'=>$porcentaje],$extra));
    }
}
