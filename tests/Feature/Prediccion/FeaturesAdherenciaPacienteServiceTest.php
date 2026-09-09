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
use Illuminate\Support\Carbon;
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
        PlanAlimentario::query()->create(['id_paciente'=>$paciente->getKey(),'nombre'=>'Plan actual','estado_plan'=>'activo','fecha_inicio'=>today()->subDays(6),'fecha_fin'=>today(),'estado'=>'activo']);
        foreach (range(0, 2) as $dia) SeguimientoSintomaPaciente::query()->create([
            'id_paciente' => $paciente->getKey(), 'fecha_registro' => today()->subDays($dia),
            'hambre_nocturna' => true, 'antojos_dulces' => 'alto', 'ansiedad_por_comida' => 'alta',
            'hinchazon_abdominal' => 'severa', 'nivel_energia' => 'baja', 'calidad_sueno' => 'mala', 'actividad_fisica' => 'ninguna',
        ]);
        $features = app(FeaturesAdherenciaPacienteService::class)->extraer($paciente);
        foreach (['hambre_nocturna_frecuente','antojos_dulces_frecuentes','ansiedad_comida_frecuente','hinchazon_frecuente','baja_energia_frecuente','sueno_deficiente_frecuente','actividad_fisica_baja'] as $campo) $this->assertTrue($features[$campo]);
    }

    public function test_plan_que_inicia_manana_no_usa_datos_precargados_ni_historicos(): void
    {
        $paciente = $this->paciente();
        $plan = PlanAlimentario::query()->create(['id_paciente'=>$paciente->getKey(),'nombre'=>'Plan futuro','estado_plan'=>'aprobado','fecha_inicio'=>today()->addDay(),'fecha_fin'=>today()->addDays(7),'estado'=>'activo']);
        $dia = DiaPlanAlimentario::query()->create(['id_plan_alimentario'=>$plan->getKey(),'numero_dia'=>1,'nombre_dia'=>'Mañana','fecha'=>today()->addDay(),'estado'=>'activo']);
        $comida = ComidaPlanAlimentario::query()->create(['id_dia_plan_alimentario'=>$dia->getKey(),'tipo_comida'=>'desayuno','nombre_comida'=>'Desayuno','orden'=>1,'estado'=>'activo']);
        SeguimientoComida::query()->create(['id_paciente'=>$paciente->getKey(),'id_plan_alimentario'=>$plan->getKey(),'id_dia_plan_alimentario'=>$dia->getKey(),'id_comida_plan_alimentario'=>$comida->getKey(),'fecha_seguimiento'=>today()->addDay(),'estado_cumplimiento'=>'completada','porcentaje_consumido'=>100]);

        $features = app(FeaturesAdherenciaPacienteService::class)->extraer($paciente);

        $this->assertSame('no_iniciado', $features['estado_periodo']);
        $this->assertFalse($features['tiene_datos']);
        $this->assertSame(0.0, $features['adherencia_promedio']);
    }

    public function test_comando_predictivo_existe_y_maneja_paciente_inexistente(): void
    {
        $this->artisan('prediccion:riesgo-adherencia', ['paciente' => 999999])
            ->expectsOutput('No se encontró el paciente indicado.')
            ->assertFailed();
    }

    public function test_comida_vencida_sin_marcar_activa_datos_predictivos_en_hora_boliviana(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-09-07 10:00:00', 'America/La_Paz'));
        $paciente = $this->paciente();
        $plan = PlanAlimentario::query()->create(['id_paciente'=>$paciente->getKey(),'nombre'=>'Plan de hoy','estado_plan'=>'activo','fecha_inicio'=>'2026-09-07','fecha_fin'=>'2026-09-13','estado'=>'activo']);
        $dia = DiaPlanAlimentario::query()->create(['id_plan_alimentario'=>$plan->getKey(),'numero_dia'=>1,'nombre_dia'=>'Lunes','fecha'=>'2026-09-07','estado'=>'activo']);
        ComidaPlanAlimentario::query()->create(['id_dia_plan_alimentario'=>$dia->getKey(),'tipo_comida'=>'desayuno','nombre_comida'=>'Desayuno','hora_sugerida'=>'08:00','orden'=>1,'estado'=>'activo']);
        ComidaPlanAlimentario::query()->create(['id_dia_plan_alimentario'=>$dia->getKey(),'tipo_comida'=>'almuerzo','nombre_comida'=>'Almuerzo','hora_sugerida'=>'13:00','orden'=>2,'estado'=>'activo']);

        $features = app(FeaturesAdherenciaPacienteService::class)->extraer($paciente);

        $this->assertTrue($features['tiene_datos']);
        $this->assertSame(1, $features['comidas_sin_registro_vencidas']);
        $this->assertSame(0.0, $features['adherencia_promedio']);
    }

    private function paciente(): Paciente
    {
        $user = User::factory()->create();
        return Paciente::query()->create(['user_id'=>$user->getKey(),'nombres'=>'Paciente','apellido_paterno'=>'Predictiva','ci'=>fake()->unique()->numerify('########'),'fecha_nacimiento'=>'1995-01-01','sexo'=>'femenino','estado'=>'activo']);
    }

    private function seguimiento(Paciente $paciente, string $tipo, string $estado, int $porcentaje, array $extra=[]): void
    {
        $plan = $paciente->planesAlimentarios()->where('estado_plan', 'activo')->latest('id_plan_alimentario')->first()
            ?? PlanAlimentario::query()->create(['id_paciente'=>$paciente->getKey(),'nombre'=>'Plan predictivo','estado_plan'=>'activo','fecha_inicio'=>today(),'fecha_fin'=>today(),'estado'=>'activo']);
        $dia = DiaPlanAlimentario::query()->create(['id_plan_alimentario'=>$plan->getKey(),'numero_dia'=>1,'nombre_dia'=>'Día 1','fecha'=>today(),'estado'=>'activo']);
        $comida = ComidaPlanAlimentario::query()->create(['id_dia_plan_alimentario'=>$dia->getKey(),'tipo_comida'=>$tipo,'nombre_comida'=>ucfirst($tipo),'orden'=>1,'estado'=>'activo']);
        SeguimientoComida::query()->create(array_merge(['id_paciente'=>$paciente->getKey(),'id_plan_alimentario'=>$plan->getKey(),'id_dia_plan_alimentario'=>$dia->getKey(),'id_comida_plan_alimentario'=>$comida->getKey(),'fecha_seguimiento'=>today(),'estado_cumplimiento'=>$estado,'porcentaje_consumido'=>$porcentaje],$extra));
    }
}
