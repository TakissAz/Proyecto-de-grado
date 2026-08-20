<?php

namespace Tests\Unit\Paciente;

use App\Models\Alimento;
use App\Models\ComidaPlanAlimentario;
use App\Models\ComponenteComidaPlan;
use App\Models\DiaPlanAlimentario;
use App\Models\PlanAlimentario;
use App\Models\Receta;
use App\Models\RecetaAlimento;
use App\Services\Paciente\ListaComprasPacienteService;
use Illuminate\Support\Collection;
use Tests\TestCase;

class ListaComprasPacienteServiceTest extends TestCase
{
    public function test_agrupa_y_suma_ingredientes_repetidos_de_recetas(): void
    {
        $huevo = $this->alimento(1, 'Huevo', 'Proteínas');
        $receta = $this->recetaCon($huevo, 2, 'unidad');
        $lista = $this->generar([$this->componenteReceta($receta, 1), $this->componenteReceta($receta, 2)]);

        $this->assertSame(6.0, $lista['categorias'][0]['items'][0]['cantidad']);
        $this->assertSame(1, $lista['resumen']['total_items']);
    }

    public function test_separa_el_mismo_alimento_cuando_la_unidad_no_coincide(): void
    {
        $huevo = $this->alimento(1, 'Huevo', 'Proteínas');
        $lista = $this->generar([
            $this->componenteAlimento($huevo, 2, 'unidad'),
            $this->componenteAlimento($huevo, 100, 'g'),
        ]);

        $this->assertSame(2, $lista['resumen']['total_items']);
        $this->assertEqualsCanonicalizing(['unidad', 'g'], array_column($lista['categorias'][0]['items'], 'unidad'));
    }

    public function test_incluye_componentes_tipo_alimento_directamente(): void
    {
        $tomate = $this->alimento(2, 'Tomate', 'Verduras');
        $lista = $this->generar([$this->componenteAlimento($tomate, 250, 'g')]);

        $this->assertSame('Tomate', $lista['categorias'][0]['items'][0]['nombre']);
        $this->assertSame(250.0, $lista['categorias'][0]['items'][0]['cantidad']);
    }

    public function test_componentes_manuales_se_muestran_como_indicaciones(): void
    {
        $manual = new ComponenteComidaPlan(['tipo_componente' => 'manual', 'nombre_manual' => 'Elegir fruta local', 'cantidad' => 1, 'unidad' => 'porción', 'observaciones' => 'Consultar disponibilidad']);
        $lista = $this->generar([$manual]);

        $this->assertTrue($lista['resumen']['tiene_indicaciones_manuales']);
        $this->assertSame('Elegir fruta local', $lista['indicaciones_manuales'][0]['nombre']);
    }

    public function test_agrupa_por_categoria_e_incluye_referencias_de_uso(): void
    {
        $tomate = $this->alimento(2, 'Tomate', 'Verduras');
        $lista = $this->generar([$this->componenteAlimento($tomate, 100, 'g')]);

        $this->assertSame('Verduras', $lista['categorias'][0]['nombre']);
        $this->assertSame(['Día 1 - Desayuno'], $lista['categorias'][0]['items'][0]['usado_en']);
    }

    private function generar(array $componentes): array
    {
        $comida = new ComidaPlanAlimentario(['tipo_comida' => 'desayuno']);
        $comida->setRelation('componentes', new Collection($componentes));
        $dia = new DiaPlanAlimentario(['numero_dia' => 1]);
        $dia->setRelation('comidas', new Collection([$comida]));
        $plan = new PlanAlimentario();
        $plan->setRelation('dias', new Collection([$dia]));

        return app(ListaComprasPacienteService::class)->generarParaPlan($plan);
    }

    private function alimento(int $id, string $nombre, string $grupo): Alimento
    {
        return (new Alimento(['nombre' => $nombre, 'grupo_alimentario' => $grupo]))->forceFill(['id_alimento' => $id]);
    }

    private function recetaCon(Alimento $alimento, float $cantidad, string $unidad): Receta
    {
        $ingrediente = new RecetaAlimento(['cantidad' => $cantidad, 'unidad' => $unidad]);
        $ingrediente->setRelation('alimento', $alimento);
        $receta = new Receta(['nombre' => 'Receta prueba']);
        $receta->setRelation('recetaAlimentos', new Collection([$ingrediente]));
        return $receta;
    }

    private function componenteReceta(Receta $receta, float $cantidad): ComponenteComidaPlan
    {
        $componente = new ComponenteComidaPlan(['tipo_componente' => 'receta', 'cantidad' => $cantidad, 'unidad' => 'porción']);
        $componente->setRelation('receta', $receta);
        return $componente;
    }

    private function componenteAlimento(Alimento $alimento, float $cantidad, string $unidad): ComponenteComidaPlan
    {
        $componente = new ComponenteComidaPlan(['tipo_componente' => 'alimento', 'cantidad' => $cantidad, 'unidad' => $unidad]);
        $componente->setRelation('alimento', $alimento);
        return $componente;
    }
}
