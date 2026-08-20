<?php

namespace Tests\Unit\SistemaExperto;

use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use App\Models\EvaluacionNutricional;
use App\Models\HabitoAlimentario;
use App\Models\ObjetivoNutricional;
use App\Models\Paciente;
use App\Models\PreferenciaAlimentaria;
use App\Models\RequerimientoNutricional;
use App\Models\RestriccionAlimentaria;
use App\Services\SistemaExperto\HechosNutricionalesSistemaExpertoService;
use Illuminate\Database\Eloquent\Collection;
use Tests\TestCase;

class HechosNutricionalesSistemaExpertoServiceTest extends TestCase
{
    private HechosNutricionalesSistemaExpertoService $servicio;

    protected function setUp(): void
    {
        parent::setUp();
        $this->servicio = new HechosNutricionalesSistemaExpertoService();
    }

    public function test_construye_hechos_aunque_falten_diagnosticos_endocrinos(): void
    {
        $hechos = $this->servicio->construirHechosNutricionales($this->paciente());

        $this->assertSame(40, $hechos['paciente']['id_paciente']);
        $this->assertFalse($hechos['diagnostico_pmos']['diagnostico_confirmado']);
        $this->assertNull($hechos['diagnostico_pmos']['fenotipo_pmos']);
        $this->assertFalse($hechos['diagnostico_resistencia_insulina']['resistencia_confirmada']);
        $this->assertNull($hechos['evaluacion_nutricional']['peso']);
    }

    public function test_incluye_diagnostico_pmos_validado_con_prioridad(): void
    {
        $paciente = $this->paciente();
        $generado = $this->modelo(DiagnosticoPmos::class, ['id_diagnostico_pmos' => 20, 'generado_por_motor_experto' => true, 'fenotipo_pmos' => 'B']);
        $validado = $this->modelo(DiagnosticoPmos::class, ['id_diagnostico_pmos' => 10, 'estado_validacion_experta' => 'aprobado', 'diagnostico_confirmado' => true, 'fenotipo_pmos' => 'A', 'total_criterios_rotterdam' => 3]);
        $paciente->setRelation('diagnosticosPmos', new Collection([$generado, $validado]));

        $hechos = $this->servicio->construirHechosNutricionales($paciente);

        $this->assertSame('A', $hechos['diagnostico_pmos']['fenotipo_pmos']);
        $this->assertTrue($hechos['diagnostico_pmos']['diagnostico_confirmado']);
        $this->assertSame('aprobado', $hechos['diagnostico_pmos']['estado_validacion_experta']);
    }

    public function test_incluye_diagnostico_ri_validado_con_prioridad(): void
    {
        $paciente = $this->paciente();
        $generado = $this->modelo(DiagnosticoResistenciaInsulina::class, ['id_diagnostico_ri' => 8, 'generado_por_motor_experto' => true, 'grado_resistencia' => 'leve']);
        $validado = $this->modelo(DiagnosticoResistenciaInsulina::class, ['id_diagnostico_ri' => 7, 'estado_validacion_experta' => 'validado', 'resistencia_confirmada' => true, 'grado_resistencia' => 'moderada', 'homa_ir' => 3.41]);
        $paciente->setRelation('diagnosticosResistenciaInsulina', new Collection([$generado, $validado]));

        $hechos = $this->servicio->construirHechosNutricionales($paciente);

        $this->assertSame('moderada', $hechos['diagnostico_resistencia_insulina']['grado_resistencia']);
        $this->assertSame(3.41, $hechos['diagnostico_resistencia_insulina']['homa_ir']);
        $this->assertSame('validado', $hechos['diagnostico_resistencia_insulina']['estado_validacion_experta']);
    }

    public function test_no_utiliza_un_diagnostico_experto_rechazado(): void
    {
        $paciente = $this->paciente();
        $rechazado = $this->modelo(DiagnosticoPmos::class, [
            'id_diagnostico_pmos' => 21,
            'generado_por_motor_experto' => true,
            'estado_validacion_experta' => 'rechazado',
            'diagnostico_confirmado' => true,
            'fenotipo_pmos' => 'A',
        ]);
        $paciente->setRelation('diagnosticosPmos', new Collection([$rechazado]));

        $hechos = $this->servicio->construirHechosNutricionales($paciente);

        $this->assertFalse($hechos['diagnostico_pmos']['diagnostico_confirmado']);
        $this->assertNull($hechos['diagnostico_pmos']['fenotipo_pmos']);
    }

    public function test_incluye_ultima_evaluacion_nutricional_activa(): void
    {
        $paciente = $this->paciente();
        $inactiva = $this->modelo(EvaluacionNutricional::class, ['id_evaluacion_nutricional' => 30, 'estado' => false, 'peso' => 99]);
        $activa = $this->modelo(EvaluacionNutricional::class, ['id_evaluacion_nutricional' => 29, 'estado' => true, 'peso' => 72.5, 'imc' => 28.3, 'nivel_actividad' => 'ligera']);
        $paciente->setRelation('evaluacionesNutricionales', new Collection([$inactiva, $activa]));

        $hechos = $this->servicio->construirHechosNutricionales($paciente);

        $this->assertSame('72.50', $hechos['evaluacion_nutricional']['peso']);
        $this->assertSame('ligera', $hechos['evaluacion_nutricional']['nivel_actividad']);
    }

    public function test_incluye_objetivo_y_requerimiento_nutricional_activos(): void
    {
        $paciente = $this->paciente();
        $objetivo = $this->modelo(ObjetivoNutricional::class, ['id_objetivo_nutricional' => 3, 'estado' => true, 'objetivo_principal' => 'reducir_peso', 'meta_peso' => 65, 'prioridad' => 'alta']);
        $requerimiento = $this->modelo(RequerimientoNutricional::class, ['id_requerimiento_nutricional' => 4, 'estado' => true, 'calorias_objetivo' => 1750, 'proteinas_diarias' => 110, 'carbohidratos_diarios' => 180, 'reglas_aplicadas' => [['codigo' => 'RI_MODERADA']]]);
        $paciente->setRelation('objetivosNutricionales', new Collection([$objetivo]));
        $paciente->setRelation('requerimientosNutricionales', new Collection([$requerimiento]));

        $hechos = $this->servicio->construirHechosNutricionales($paciente);

        $this->assertSame('reducir_peso', $hechos['objetivo_nutricional']['objetivo_principal']);
        $this->assertSame(1750.0, $hechos['requerimiento_nutricional']['calorias_objetivo']);
        $this->assertSame(180.0, $hechos['requerimiento_nutricional']['carbohidratos_diarias']);
        $this->assertSame([['codigo' => 'RI_MODERADA']], $hechos['requerimiento_nutricional']['reglas_aplicadas']);
    }

    public function test_construccion_no_modifica_modelos_ni_colecciones(): void
    {
        $paciente = $this->paciente();
        $habito = $this->modelo(HabitoAlimentario::class, ['id_habito_alimentario' => 2, 'estado' => true, 'comidas_por_dia' => 4, 'consume_desayuno' => true]);
        $paciente->setRelation('habitosAlimentarios', new Collection([$habito]));
        $atributosPaciente = $paciente->getAttributes();
        $atributosHabito = $habito->getAttributes();

        $this->servicio->construirHechosNutricionales($paciente);

        $this->assertSame($atributosPaciente, $paciente->getAttributes());
        $this->assertSame($atributosHabito, $habito->getAttributes());
        $this->assertCount(1, $paciente->getRelation('habitosAlimentarios'));
        $this->assertFalse($paciente->exists);
        $this->assertFalse($habito->exists);
    }

    public function test_normaliza_restricciones_y_preferencias_desde_texto_json_y_comas(): void
    {
        $paciente = $this->paciente();
        $paciente->setRelation('restriccionesAlimentarias', new Collection([$this->modelo(RestriccionAlimentaria::class, [
            'id_restriccion_alimentaria' => 1, 'estado' => true,
            'alergias' => 'maní, nueces', 'intolerancias' => '["lactosa"]',
            'alimentos_restringidos' => "azúcar; gaseosa", 'alimentos_no_tolerados' => 'cebolla',
            'alimentos_rechazados' => 'pescado',
        ])]));
        $paciente->setRelation('preferenciasAlimentarias', new Collection([$this->modelo(PreferenciaAlimentaria::class, [
            'id_preferencia_alimentaria' => 1, 'estado' => true,
            'alimentos_preferidos' => 'avena, pollo', 'comidas_preferidas' => 'ensalada; sopa',
            'preparaciones_preferidas' => '["horno","plancha"]',
        ])]));

        $hechos = $this->servicio->construirHechosNutricionales($paciente);

        $this->assertSame(['maní', 'nueces'], $hechos['restricciones_alimentarias']['alergias']);
        $this->assertSame(['lactosa'], $hechos['restricciones_alimentarias']['intolerancias']);
        $this->assertSame(['azúcar', 'gaseosa'], $hechos['restricciones_alimentarias']['alimentos_restringidos']);
        $this->assertSame(['cebolla'], $hechos['restricciones_alimentarias']['alimentos_no_tolerados']);
        $this->assertSame(['pescado'], $hechos['restricciones_alimentarias']['alimentos_rechazados']);
        $this->assertSame(['avena', 'pollo'], $hechos['preferencias_alimentarias']['alimentos_preferidos']);
        $this->assertSame(['ensalada', 'sopa'], $hechos['preferencias_alimentarias']['comidas_preferidas']);
        $this->assertSame(['horno', 'plancha'], $hechos['preferencias_alimentarias']['preparaciones_preferidas']);
    }

    private function paciente(): Paciente
    {
        $paciente = $this->modelo(Paciente::class, [
            'id_paciente' => 40, 'fecha_nacimiento' => now()->subYears(29)->toDateString(), 'sexo' => 'femenino',
        ]);
        foreach ([
            'diagnosticosPmos', 'diagnosticosResistenciaInsulina', 'evaluacionesNutricionales',
            'habitosAlimentarios', 'preferenciasAlimentarias', 'restriccionesAlimentarias',
            'objetivosNutricionales', 'requerimientosNutricionales',
        ] as $relacion) {
            $paciente->setRelation($relacion, new Collection());
        }

        return $paciente;
    }

    private function modelo(string $clase, array $atributos): mixed
    {
        return (new $clase())->forceFill($atributos);
    }
}
