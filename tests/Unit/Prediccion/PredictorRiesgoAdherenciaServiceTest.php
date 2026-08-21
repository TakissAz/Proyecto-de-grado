<?php

namespace Tests\Unit\Prediccion;

use App\Models\Paciente;
use App\Services\Prediccion\FeaturesAdherenciaPacienteService;
use App\Services\Prediccion\PredictorRiesgoAdherenciaService;
use Mockery;
use Tests\TestCase;

class PredictorRiesgoAdherenciaServiceTest extends TestCase
{
    public function test_clasifica_riesgo_bajo_medio_y_alto(): void
    {
        $this->assertSame('bajo', $this->predecir($this->datos())['riesgo_baja_adherencia']);
        $this->assertSame('medio', $this->predecir($this->datos(['adherencia_promedio'=>55,'adherencia_desayuno'=>40]))['riesgo_baja_adherencia']);
        $alto = $this->predecir($this->datos(['adherencia_promedio'=>40,'adherencia_desayuno'=>30,'adherencia_almuerzo'=>30,'dias_sin_registro'=>4,'molestias_moderadas_severas'=>2,'hambre_posterior_alta'=>2]));
        $this->assertSame('alto', $alto['riesgo_baja_adherencia']);
        $this->assertGreaterThanOrEqual(.65, $alto['probabilidad_riesgo']);
    }

    public function test_devuelve_factores_recomendacion_y_metadatos_explicables(): void
    {
        $resultado = $this->predecir($this->datos(['adherencia_promedio'=>40,'ingredientes_no_conseguidos'=>2,'hambre_posterior_alta'=>2,'molestias_moderadas_severas'=>2]));
        $this->assertNotEmpty($resultado['factores_influyentes']);
        $this->assertStringContainsString('Simplificar la lista de compras', $resultado['recomendacion_predictiva']);
        $this->assertStringContainsString('proteína y fibra', $resultado['recomendacion_predictiva']);
        $this->assertStringContainsString('mal toleradas', $resultado['recomendacion_predictiva']);
        $this->assertSame('baseline_heuristico', $resultado['modelo']['tipo']);
        $this->assertSame('Random Forest', $resultado['modelo']['preparado_para']);
        $this->assertSame('1.0.0', $resultado['version_modelo']);
    }

    private function predecir(array $datos): array
    {
        $extractor = Mockery::mock(FeaturesAdherenciaPacienteService::class);
        $extractor->shouldReceive('extraer')->once()->andReturn($datos);
        return (new PredictorRiesgoAdherenciaService($extractor))->predecir(new Paciente(['estado'=>'activo']));
    }

    private function datos(array $cambios=[]): array
    {
        return array_merge(['adherencia_promedio'=>90.0,'adherencia_desayuno'=>90.0,'adherencia_almuerzo'=>90.0,'adherencia_merienda'=>90.0,'adherencia_cena'=>90.0,'seguimientos_por_tipo'=>['desayuno'=>1,'almuerzo'=>1,'merienda'=>1,'cena'=>1],'comidas_no_realizadas'=>0,'comidas_parciales'=>0,'comidas_reemplazadas'=>0,'dias_sin_registro'=>0,'recetas_rechazadas'=>0,'recetas_no_desea_repetir'=>0,'molestias_digestivas'=>0,'molestias_moderadas_severas'=>0,'hambre_posterior_alta'=>0,'ansiedad_posterior'=>0,'ingredientes_no_conseguidos'=>0,'hambre_nocturna_frecuente'=>false,'antojos_dulces_frecuentes'=>false,'ansiedad_comida_frecuente'=>false,'hinchazon_frecuente'=>false,'baja_energia_frecuente'=>false,'sueno_deficiente_frecuente'=>false,'actividad_fisica_baja'=>false,'retroalimentaciones_no_leidas'=>0,'planes_finalizados'=>0,'planes_rechazados'=>0,'planes_generados'=>1,'tiene_datos'=>true],$cambios);
    }
}
