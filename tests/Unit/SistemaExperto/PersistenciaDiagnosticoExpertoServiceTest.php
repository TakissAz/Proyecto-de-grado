<?php

namespace Tests\Unit\SistemaExperto;

use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use App\Services\SistemaExperto\PersistenciaDiagnosticoExpertoService;
use Mockery;
use Tests\TestCase;

class PersistenciaDiagnosticoExpertoServiceTest extends TestCase
{
    private PersistenciaDiagnosticoExpertoService $servicio;

    protected function setUp(): void
    {
        parent::setUp();
        $this->servicio = new PersistenciaDiagnosticoExpertoService();
    }

    public function test_guardar_pmos_actualiza_trazabilidad(): void
    {
        $diagnostico = $this->diagnosticoPmos();

        $this->servicio->guardarPmos($diagnostico, $this->respuestaPmos());

        $this->assertTrue($diagnostico->generado_por_motor_experto);
        $this->assertSame(['criterio' => true], $diagnostico->hechos_utilizados);
        $this->assertSame(['PMOS-ROTTERDAM-CONFIRMADO'], $diagnostico->reglas_activadas);
        $this->assertSame(['Validar resultado'], $diagnostico->recomendaciones_expertas);
        $this->assertSame('pmos-rotterdam-v1', $diagnostico->version_motor_experto);
        $this->assertSame('pendiente', $diagnostico->estado_validacion_experta);
        $this->assertSame(['Cumple Rotterdam'], json_decode($diagnostico->explicacion_experta, true));
    }

    public function test_guardar_pmos_mapea_resultado_clinico(): void
    {
        $diagnostico = $this->diagnosticoPmos();

        $this->servicio->guardarPmos($diagnostico, $this->respuestaPmos());

        $this->assertTrue($diagnostico->diagnostico_confirmado);
        $this->assertSame('A', $diagnostico->fenotipo_pmos);
        $this->assertSame(3, $diagnostico->total_criterios_rotterdam);
        $this->assertSame('Compatible con PMOS fenotipo A', $diagnostico->conclusion_medica);
    }

    public function test_guardar_pmos_no_sobrescribe_validacion_resuelta(): void
    {
        $diagnostico = $this->diagnosticoPmos([
            'estado_validacion_experta' => 'validado',
            'validado_por' => 7,
            'fecha_validacion' => '2026-08-01 10:00:00',
            'observacion_validacion' => 'Revisado por especialista',
        ]);

        $this->servicio->guardarPmos($diagnostico, $this->respuestaPmos());

        $this->assertSame('validado', $diagnostico->estado_validacion_experta);
        $this->assertSame(7, $diagnostico->validado_por);
        $this->assertSame('Revisado por especialista', $diagnostico->observacion_validacion);
        $this->assertSame('2026-08-01 10:00:00', $diagnostico->getRawOriginal('fecha_validacion'));
    }

    public function test_guardar_ri_actualiza_trazabilidad(): void
    {
        $diagnostico = $this->diagnosticoRi();

        $this->servicio->guardarResistenciaInsulina($diagnostico, $this->respuestaRi());

        $this->assertTrue($diagnostico->generado_por_motor_experto);
        $this->assertSame(['glucosa_ayunas' => 92], $diagnostico->hechos_utilizados);
        $this->assertSame(['RI-GRADO-MODERADA'], $diagnostico->reglas_activadas);
        $this->assertSame(['Validar resultado metabólico'], $diagnostico->recomendaciones_expertas);
        $this->assertSame('ri-homa-quicki-v1', $diagnostico->version_motor_experto);
        $this->assertSame(['HOMA-IR elevado'], json_decode($diagnostico->explicacion_experta, true));
    }

    public function test_guardar_ri_mapea_resultado_clinico_y_riesgos(): void
    {
        $diagnostico = $this->diagnosticoRi();

        $this->servicio->guardarResistenciaInsulina($diagnostico, $this->respuestaRi());

        $this->assertSame('3.41', $diagnostico->homa_ir);
        $this->assertSame('0.3200', $diagnostico->quicki);
        $this->assertTrue($diagnostico->resistencia_confirmada);
        $this->assertSame('moderada', $diagnostico->grado_resistencia);
        $this->assertSame('moderado', $diagnostico->riesgo_diabetes);
        $this->assertSame('alto', $diagnostico->riesgo_cardiometabolico);
        $this->assertSame('Compatible con resistencia a la insulina moderada', $diagnostico->conclusion_medica);
    }

    public function test_guardar_ri_no_sobrescribe_validacion_resuelta(): void
    {
        $diagnostico = $this->diagnosticoRi([
            'estado_validacion_experta' => 'rechazado',
            'validado_por' => 9,
            'fecha_validacion' => '2026-08-02 11:00:00',
            'observacion_validacion' => 'Resultado rechazado',
        ]);

        $this->servicio->guardarResistenciaInsulina($diagnostico, $this->respuestaRi());

        $this->assertSame('rechazado', $diagnostico->estado_validacion_experta);
        $this->assertSame(9, $diagnostico->validado_por);
        $this->assertSame('Resultado rechazado', $diagnostico->observacion_validacion);
        $this->assertSame('2026-08-02 11:00:00', $diagnostico->getRawOriginal('fecha_validacion'));
    }

    private function diagnosticoPmos(array $atributos = []): DiagnosticoPmos
    {
        $modelo = Mockery::mock(DiagnosticoPmos::class)->makePartial();
        $modelo->forceFill(array_merge(['estado_validacion_experta' => 'pendiente'], $atributos));
        $modelo->syncOriginal();
        $modelo->shouldReceive('save')->once()->andReturnTrue();

        return $modelo;
    }

    private function diagnosticoRi(array $atributos = []): DiagnosticoResistenciaInsulina
    {
        $modelo = Mockery::mock(DiagnosticoResistenciaInsulina::class)->makePartial();
        $modelo->forceFill(array_merge(['estado_validacion_experta' => 'pendiente'], $atributos));
        $modelo->syncOriginal();
        $modelo->shouldReceive('save')->once()->andReturnTrue();

        return $modelo;
    }

    private function respuestaPmos(): array
    {
        return [
            'resultado' => [
                'diagnostico_confirmado' => true,
                'fenotipo_pmos' => 'A',
                'total_criterios_rotterdam' => 3,
                'conclusion' => 'Compatible con PMOS fenotipo A',
            ],
            'trazabilidad' => [
                'generado_por_motor_experto' => true,
                'hechos_utilizados' => ['criterio' => true],
                'reglas_activadas' => ['PMOS-ROTTERDAM-CONFIRMADO'],
                'explicacion_experta' => ['Cumple Rotterdam'],
                'recomendaciones_expertas' => ['Validar resultado'],
                'confianza_experta' => 0.95,
                'version_motor_experto' => 'pmos-rotterdam-v1',
                'evaluado_por_motor_experto_en' => '2026-08-13T12:00:00+00:00',
                'estado_validacion_experta' => 'pendiente',
            ],
        ];
    }

    private function respuestaRi(): array
    {
        return [
            'resultado' => [
                'homa_ir' => 3.41,
                'quicki' => 0.32,
                'resistencia_confirmada' => true,
                'grado_resistencia' => 'moderada',
                'riesgo_diabetes' => 'moderado',
                'riesgo_cardiometabolico' => 'alto',
                'conclusion' => 'Compatible con resistencia a la insulina moderada',
            ],
            'trazabilidad' => [
                'generado_por_motor_experto' => true,
                'hechos_utilizados' => ['glucosa_ayunas' => 92],
                'reglas_activadas' => ['RI-GRADO-MODERADA'],
                'explicacion_experta' => ['HOMA-IR elevado'],
                'recomendaciones_expertas' => ['Validar resultado metabólico'],
                'confianza_experta' => 0.90,
                'version_motor_experto' => 'ri-homa-quicki-v1',
                'evaluado_por_motor_experto_en' => '2026-08-13T12:00:00+00:00',
                'estado_validacion_experta' => 'pendiente',
            ],
        ];
    }
}
