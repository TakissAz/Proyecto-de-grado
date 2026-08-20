<?php

namespace Tests\Unit\SistemaExperto;

use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use App\Models\EvaluacionEcografica;
use App\Models\EvaluacionFisicaEndocrina;
use App\Models\HistoriaHiperandrogenica;
use App\Models\HistoriaMenstrual;
use App\Models\ResultadoDiferencialEndocrino;
use App\Models\ResultadoGlucosaInsulina;
use App\Models\ResultadoPerfilAndrogenico;
use App\Models\ResultadoPerfilLipidico;
use App\Services\SistemaExperto\HechosSistemaExpertoService;
use Tests\TestCase;

class HechosSistemaExpertoServiceTest extends TestCase
{
    private HechosSistemaExpertoService $servicio;

    protected function setUp(): void
    {
        parent::setUp();
        $this->servicio = new HechosSistemaExpertoService();
    }

    public function test_construir_hechos_pmos_usa_valores_directos_del_diagnostico(): void
    {
        $diagnostico = $this->pmosConRelaciones([
            'cumple_alteracion_ovulatoria' => true,
            'cumple_hiperandrogenismo_clinico' => false,
            'cumple_hiperandrogenismo_bioquimico' => true,
            'cumple_morfologia_ovarica' => false,
            'diagnosticos_diferenciales_descartados' => true,
        ]);
        $diagnostico->setRelation('historiaHiperandrogenica', new HistoriaHiperandrogenica([
            'hirsutismo' => true,
        ]));

        $hechos = $this->servicio->construirHechosPmos($diagnostico);

        $this->assertSame([
            'cumple_alteracion_ovulatoria' => true,
            'cumple_hiperandrogenismo_clinico' => false,
            'cumple_hiperandrogenismo_bioquimico' => true,
            'cumple_morfologia_ovarica' => false,
            'diagnosticos_diferenciales_descartados' => true,
        ], $hechos);
    }

    public function test_construir_hechos_pmos_devuelve_false_en_diferenciales_sin_datos(): void
    {
        $diagnostico = $this->pmosConRelaciones();

        $hechos = $this->servicio->construirHechosPmos($diagnostico);

        $this->assertFalse($hechos['diagnosticos_diferenciales_descartados']);
    }

    public function test_construir_hechos_ri_usa_valores_directos_del_diagnostico(): void
    {
        $diagnostico = $this->riConRelaciones([
            'glucosa_ayunas' => 92,
            'insulina_ayunas' => 15,
            'homa_ir' => 3.41,
            'quicki' => 0.32,
            'hemoglobina_glicosilada' => 5.4,
        ]);
        $diagnostico->setRelation('glucosaInsulina', new ResultadoGlucosaInsulina([
            'glucosa_ayunas' => 110,
            'insulina_ayunas' => 20,
            'homa_ir' => 5.43,
            'hemoglobina_glicosilada' => 6.1,
        ]));

        $hechos = $this->servicio->construirHechosResistenciaInsulina($diagnostico);

        $this->assertSame(92.0, $hechos['glucosa_ayunas']);
        $this->assertSame(15.0, $hechos['insulina_ayunas']);
        $this->assertSame(3.41, $hechos['homa_ir']);
        $this->assertSame(0.32, $hechos['quicki']);
        $this->assertSame(5.4, $hechos['hemoglobina_glicosilada']);
    }

    public function test_construir_hechos_ri_incluye_trigliceridos_y_hdl_de_la_relacion(): void
    {
        $diagnostico = $this->riConRelaciones();
        $diagnostico->setRelation('perfilLipidico', new ResultadoPerfilLipidico([
            'trigliceridos' => 170,
            'hdl' => 42,
        ]));

        $hechos = $this->servicio->construirHechosResistenciaInsulina($diagnostico);

        $this->assertSame(170.0, $hechos['trigliceridos']);
        $this->assertSame(42.0, $hechos['hdl']);
    }

    public function test_construir_hechos_ri_usa_false_en_signos_fisicos_sin_datos(): void
    {
        $diagnostico = $this->riConRelaciones();

        $hechos = $this->servicio->construirHechosResistenciaInsulina($diagnostico);

        $this->assertFalse($hechos['acantosis_nigricans']);
        $this->assertFalse($hechos['obesidad_abdominal']);
    }

    public function test_construir_hechos_pmos_infiere_desde_relaciones_reales(): void
    {
        $diagnostico = $this->pmosConRelaciones();
        $diagnostico->setRelation('historiaMenstrual', new HistoriaMenstrual([
            'oligomenorrea' => true,
        ]));
        $diagnostico->setRelation('historiaHiperandrogenica', new HistoriaHiperandrogenica([
            'puntaje_ferriman_gallwey' => 8,
        ]));
        $diagnostico->setRelation('perfilAndrogenico', new ResultadoPerfilAndrogenico([
            'hiperandrogenismo_bioquimico' => true,
        ]));
        $diagnostico->setRelation('ecografia', new EvaluacionEcografica([
            'morfologia_compatible_pmos' => true,
        ]));
        $diagnostico->setRelation('diferencialEndocrino', new ResultadoDiferencialEndocrino([
            'alteracion_tiroidea_descartada' => true,
            'hiperprolactinemia_descartada' => true,
            'hiperplasia_suprarrenal_descartada' => true,
            'cushing_descartado' => true,
        ]));

        $hechos = $this->servicio->construirHechosPmos($diagnostico);

        $this->assertNotContains(false, $hechos, true);
    }

    public function test_construir_hechos_ri_infiere_obesidad_abdominal_desde_cintura(): void
    {
        $diagnostico = $this->riConRelaciones();
        $diagnostico->setRelation('evaluacionFisica', new EvaluacionFisicaEndocrina([
            'acantosis_nigricans' => true,
            'circunferencia_cintura' => 80,
        ]));

        $hechos = $this->servicio->construirHechosResistenciaInsulina($diagnostico);

        $this->assertTrue($hechos['acantosis_nigricans']);
        $this->assertTrue($hechos['obesidad_abdominal']);
    }

    private function pmosConRelaciones(array $atributos = []): DiagnosticoPmos
    {
        $diagnostico = new DiagnosticoPmos($atributos);
        foreach ([
            'historiaMenstrual',
            'historiaHiperandrogenica',
            'perfilAndrogenico',
            'diferencialEndocrino',
            'ecografia',
        ] as $relacion) {
            $diagnostico->setRelation($relacion, null);
        }

        return $diagnostico;
    }

    private function riConRelaciones(array $atributos = []): DiagnosticoResistenciaInsulina
    {
        $diagnostico = new DiagnosticoResistenciaInsulina($atributos);
        foreach (['glucosaInsulina', 'perfilLipidico', 'evaluacionFisica'] as $relacion) {
            $diagnostico->setRelation($relacion, null);
        }

        return $diagnostico;
    }
}
