<?php

namespace Tests\Unit\SistemaExperto;

use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use App\Services\SistemaExperto\HechosSistemaExpertoService;
use App\Services\SistemaExperto\OrquestadorSistemaExpertoService;
use App\Services\SistemaExperto\PersistenciaDiagnosticoExpertoService;
use App\Services\SistemaExperto\SistemaExpertoZenService;
use Mockery;
use RuntimeException;
use Tests\TestCase;

class OrquestadorSistemaExpertoServiceTest extends TestCase
{
    public function test_evaluar_y_persistir_pmos_ejecuta_flujo_completo(): void
    {
        $diagnostico = new DiagnosticoPmos();
        $hechosEsperados = ['cumple_alteracion_ovulatoria' => true];
        $respuesta = ['resultado' => ['diagnostico_confirmado' => true]];

        $hechos = Mockery::mock(HechosSistemaExpertoService::class);
        $hechos->shouldReceive('construirHechosPmos')
            ->once()->with($diagnostico)->andReturn($hechosEsperados);
        $zen = Mockery::mock(SistemaExpertoZenService::class);
        $zen->shouldReceive('evaluarPmos')
            ->once()->with($hechosEsperados)->andReturn($respuesta);
        $persistencia = Mockery::mock(PersistenciaDiagnosticoExpertoService::class);
        $persistencia->shouldReceive('guardarPmos')
            ->once()->with($diagnostico, $respuesta)
            ->andReturnUsing(function (DiagnosticoPmos $modelo): DiagnosticoPmos {
                $modelo->forceFill(['diagnostico_confirmado' => true]);
                return $modelo;
            });

        $resultado = $this->orquestador($hechos, $zen, $persistencia)
            ->evaluarYPersistirPmos($diagnostico);

        $this->assertSame($diagnostico, $resultado);
        $this->assertTrue($resultado->diagnostico_confirmado);
    }

    public function test_evaluar_y_persistir_ri_ejecuta_flujo_completo(): void
    {
        $diagnostico = new DiagnosticoResistenciaInsulina();
        $hechosEsperados = ['glucosa_ayunas' => 92.0];
        $respuesta = ['resultado' => ['resistencia_confirmada' => true]];

        $hechos = Mockery::mock(HechosSistemaExpertoService::class);
        $hechos->shouldReceive('construirHechosResistenciaInsulina')
            ->once()->with($diagnostico)->andReturn($hechosEsperados);
        $zen = Mockery::mock(SistemaExpertoZenService::class);
        $zen->shouldReceive('evaluarResistenciaInsulina')
            ->once()->with($hechosEsperados)->andReturn($respuesta);
        $persistencia = Mockery::mock(PersistenciaDiagnosticoExpertoService::class);
        $persistencia->shouldReceive('guardarResistenciaInsulina')
            ->once()->with($diagnostico, $respuesta)
            ->andReturnUsing(function (DiagnosticoResistenciaInsulina $modelo): DiagnosticoResistenciaInsulina {
                $modelo->forceFill(['resistencia_confirmada' => true]);
                return $modelo;
            });

        $resultado = $this->orquestador($hechos, $zen, $persistencia)
            ->evaluarYPersistirResistenciaInsulina($diagnostico);

        $this->assertSame($diagnostico, $resultado);
        $this->assertTrue($resultado->resistencia_confirmada);
    }

    public function test_fallo_del_microservicio_lanza_error_claro_y_no_persiste(): void
    {
        $diagnostico = new DiagnosticoPmos();
        $hechosConstruidos = ['cumple_alteracion_ovulatoria' => false];

        $hechos = Mockery::mock(HechosSistemaExpertoService::class);
        $hechos->shouldReceive('construirHechosPmos')
            ->once()->andReturn($hechosConstruidos);
        $zen = Mockery::mock(SistemaExpertoZenService::class);
        $zen->shouldReceive('evaluarPmos')
            ->once()->with($hechosConstruidos)
            ->andThrow(new RuntimeException('Microservicio no disponible'));
        $persistencia = Mockery::mock(PersistenciaDiagnosticoExpertoService::class);
        $persistencia->shouldNotReceive('guardarPmos');

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage(
            'No se pudo completar la evaluación experta de PMOS: Microservicio no disponible'
        );

        $this->orquestador($hechos, $zen, $persistencia)
            ->evaluarYPersistirPmos($diagnostico);
    }

    public function test_validaciones_resueltas_no_se_sobrescriben(): void
    {
        $pmos = Mockery::mock(DiagnosticoPmos::class)->makePartial();
        $pmos->forceFill([
            'estado_validacion_experta' => 'validado',
            'validado_por' => 7,
            'observacion_validacion' => 'Aprobado por especialista',
        ]);
        $pmos->shouldReceive('save')->once()->andReturnTrue();

        $ri = Mockery::mock(DiagnosticoResistenciaInsulina::class)->makePartial();
        $ri->forceFill([
            'estado_validacion_experta' => 'rechazado',
            'validado_por' => 9,
            'observacion_validacion' => 'Rechazado por especialista',
        ]);
        $ri->shouldReceive('save')->once()->andReturnTrue();

        $hechos = Mockery::mock(HechosSistemaExpertoService::class);
        $hechos->shouldReceive('construirHechosPmos')->once()->andReturn([]);
        $hechos->shouldReceive('construirHechosResistenciaInsulina')->once()->andReturn([]);
        $zen = Mockery::mock(SistemaExpertoZenService::class);
        $zen->shouldReceive('evaluarPmos')->once()->andReturn($this->respuestaPmos());
        $zen->shouldReceive('evaluarResistenciaInsulina')->once()->andReturn($this->respuestaRi());

        $orquestador = $this->orquestador(
            $hechos,
            $zen,
            new PersistenciaDiagnosticoExpertoService()
        );
        $orquestador->evaluarYPersistirPmos($pmos);
        $orquestador->evaluarYPersistirResistenciaInsulina($ri);

        $this->assertSame('validado', $pmos->estado_validacion_experta);
        $this->assertSame(7, $pmos->validado_por);
        $this->assertSame('Aprobado por especialista', $pmos->observacion_validacion);
        $this->assertSame('rechazado', $ri->estado_validacion_experta);
        $this->assertSame(9, $ri->validado_por);
        $this->assertSame('Rechazado por especialista', $ri->observacion_validacion);
    }

    private function orquestador(
        HechosSistemaExpertoService $hechos,
        SistemaExpertoZenService $zen,
        PersistenciaDiagnosticoExpertoService $persistencia
    ): OrquestadorSistemaExpertoService {
        return new OrquestadorSistemaExpertoService($hechos, $zen, $persistencia);
    }

    private function respuestaPmos(): array
    {
        return [
            'resultado' => [
                'diagnostico_confirmado' => true,
                'fenotipo_pmos' => 'A',
                'total_criterios_rotterdam' => 3,
                'conclusion' => 'Compatible con PMOS',
            ],
            'trazabilidad' => $this->trazabilidad(),
        ];
    }

    private function respuestaRi(): array
    {
        return [
            'resultado' => [
                'homa_ir' => 3.4,
                'quicki' => 0.32,
                'resistencia_confirmada' => true,
                'grado_resistencia' => 'moderada',
                'riesgo_diabetes' => 'moderado',
                'riesgo_cardiometabolico' => 'alto',
                'conclusion' => 'Compatible con RI',
            ],
            'trazabilidad' => $this->trazabilidad(),
        ];
    }

    private function trazabilidad(): array
    {
        return [
            'generado_por_motor_experto' => true,
            'hechos_utilizados' => [],
            'reglas_activadas' => [],
            'explicacion_experta' => [],
            'recomendaciones_expertas' => [],
            'confianza_experta' => 0.9,
            'version_motor_experto' => 'test-v1',
            'evaluado_por_motor_experto_en' => '2026-08-13T12:00:00+00:00',
            'estado_validacion_experta' => 'pendiente',
        ];
    }
}
