<?php

namespace Database\Seeders;

use App\Models\Alimento;
use App\Models\Receta;
use App\Models\RecetaAlimento;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CatalogoAmpliadoRecetasSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $alimentos = Alimento::query()->get()->keyBy('nombre');
            foreach ($this->alimentos() as $nombre => $datos) {
                $modelo = Alimento::withTrashed()->updateOrCreate(['nombre' => $nombre], $datos + ['estado' => 'activo']);
                if ($modelo->trashed()) $modelo->restore();
                $alimentos->put($nombre, $modelo);
            }

            foreach ($this->recetas() as $datos) {
                $ingredientes = $datos['ingredientes'];
                unset($datos['ingredientes']);
                $receta = Receta::withTrashed()->updateOrCreate(['nombre' => $datos['nombre']], $datos + [
                    'porciones' => 1, 'estado' => 'activo',
                    'preparacion' => 'Lavar y medir los ingredientes. Cocinar con el método indicado, controlar la porción y servir.',
                    'observaciones' => 'Receta doméstica equilibrada para individualización por nutrición.',
                ]);
                if ($receta->trashed()) $receta->restore();
                $vigentes = [];
                foreach ($ingredientes as [$nombre, $cantidad, $unidad]) {
                    $alimento = $alimentos->get($nombre);
                    if (! $alimento) continue;
                    $factor = $cantidad / max((float) $alimento->cantidad_base, .01);
                    $aportes = [];
                    foreach (['calorias','proteinas','carbohidratos','grasas','fibra'] as $campo) {
                        $aportes["{$campo}_aporte"] = round((float) $alimento->{$campo} * $factor, 2);
                    }
                    $pivot = RecetaAlimento::withTrashed()->updateOrCreate(
                        ['id_receta'=>$receta->getKey(),'id_alimento'=>$alimento->getKey()],
                        ['cantidad'=>$cantidad,'unidad'=>$unidad] + $aportes
                    );
                    if ($pivot->trashed()) $pivot->restore();
                    $vigentes[] = $pivot->getKey();
                }
                $receta->recetaAlimentos()->whereNotIn('id_receta_alimento', $vigentes)->delete();
                $receta->recalcularTotales();
            }
        });

        $this->command?->info('Catálogo ampliado: mínimo 70 alimentos y 70 recetas reales disponibles.');
    }

    private function alimentos(): array
    {
        $a = fn (string $grupo, float $kcal, float $p, float $c, float $g, float $f, ?int $ig = null): array => [
            'grupo_alimentario'=>$grupo, 'unidad_base'=>'g', 'cantidad_base'=>100,
            'calorias'=>$kcal, 'proteinas'=>$p, 'carbohidratos'=>$c, 'grasas'=>$g, 'fibra'=>$f,
            'indice_glucemico'=>$ig, 'disponibilidad_temporal'=>'todo_el_anio',
        ];
        return [
            'Clara de huevo'=>$a('proteinas',52,10.9,.7,.2,0,0), 'Pavo'=>$a('proteinas',135,29,0,1.8,0,0),
            'Salmón'=>$a('proteinas',208,20,0,13,0,0), 'Trucha'=>$a('proteinas',148,20.5,0,6.5,0,0),
            'Tofu'=>$a('proteinas',144,17.3,2.8,8.7,2.3,15), 'Poroto negro'=>$a('legumbres',132,8.9,23.7,.5,8.7,30),
            'Arveja'=>$a('legumbres',81,5.4,14.5,.4,5.1,35), 'Amaranto'=>$a('cereales_integrales',371,13.6,65.3,7,6.7,35),
            'Cebada'=>$a('cereales_integrales',123,2.3,28.2,.4,3.8,28), 'Fideo integral'=>$a('cereales_integrales',149,5.5,30.1,1.4,3.9,42),
            'Tortilla integral'=>$a('cereales_integrales',312,9.5,52,7.5,8,45), 'Granola sin azúcar'=>$a('cereales_integrales',410,10,60,14,9,48),
            'Arándano'=>$a('frutas',57,.7,14.5,.3,2.4,25), 'Pera'=>$a('frutas',57,.4,15.2,.1,3.1,38),
            'Durazno'=>$a('frutas',39,.9,9.5,.3,1.5,28), 'Naranja'=>$a('frutas',47,.9,11.8,.1,2.4,43),
            'Mandarina'=>$a('frutas',53,.8,13.3,.3,1.8,42), 'Kiwi'=>$a('frutas',61,1.1,14.7,.5,3,50),
            'Piña'=>$a('frutas',50,.5,13.1,.1,1.4,59), 'Plátano'=>$a('frutas',89,1.1,22.8,.3,2.6,51),
            'Calabacín'=>$a('verduras',17,1.2,3.1,.3,1,15), 'Coliflor'=>$a('verduras',25,1.9,5,.3,2,15),
            'Repollo morado'=>$a('verduras',31,1.4,7.4,.2,2.1,15), 'Champiñón'=>$a('verduras',22,3.1,3.3,.3,1,15),
            'Apio'=>$a('verduras',16,.7,3,.2,1.6,15), 'Remolacha'=>$a('verduras',43,1.6,9.6,.2,2.8,61),
            'Vainita'=>$a('verduras',31,1.8,7,.2,2.7,15), 'Rúcula'=>$a('verduras',25,2.6,3.7,.7,1.6,15),
            'Semilla de calabaza'=>$a('semillas',559,30.2,10.7,49,6,15), 'Sésamo'=>$a('semillas',573,17.7,23.4,49.7,11.8,35),
            'Mantequilla de maní sin azúcar'=>$a('grasas_saludables',588,25,20,50,6,14),
            'Bebida de almendra sin azúcar'=>$a('bebidas',15,.6,.6,1.2,.3,25),
            'Yogur sin lactosa natural'=>$a('lacteos',63,5.3,7,1.6,0,35),
        ];
    }

    private function recetas(): array
    {
        $r = fn (string $n, string $t, array $i, int $m=20): array => ['nombre'=>$n,'descripcion'=>$n.' en porción individual.','tipo_comida'=>$t,'tiempo_preparacion_minutos'=>$m,'ingredientes'=>$i];
        $i = fn (string $n, float $c, string $u='g'): array => [$n,$c,$u];
        return [
            $r('Porridge de amaranto con pera y canela','desayuno',[$i('Amaranto',45),$i('Pera',120),$i('Canela',2)]),
            $r('Tortilla integral de pavo y palta','desayuno',[$i('Tortilla integral',55),$i('Pavo',70),$i('Palta',40),$i('Tomate',50)]),
            $r('Bowl de yogur sin lactosa con arándanos','desayuno',[$i('Yogur sin lactosa natural',180),$i('Arándano',100),$i('Chía',10)]),
            $r('Omelette de claras con champiñón','desayuno',[$i('Clara de huevo',150),$i('Champiñón',70),$i('Espinaca',50),$i('Aceite de oliva',5,'ml')]),
            $r('Avena nocturna con bebida de almendra y kiwi','desayuno',[$i('Avena',45),$i('Bebida de almendra sin azúcar',180,'ml'),$i('Kiwi',100),$i('Linaza',8)]),
            $r('Tostada integral con pavo y rúcula','desayuno',[$i('Pan integral',60),$i('Pavo',65),$i('Rúcula',30),$i('Tomate',50)]),
            $r('Granola sin azúcar con yogur y durazno','desayuno',[$i('Granola sin azúcar',35),$i('Yogur sin lactosa natural',170),$i('Durazno',120)]),
            $r('Revuelto de tofu con verduras','desayuno',[$i('Tofu',130),$i('Pimentón',40),$i('Espinaca',50),$i('Cebolla',25)]),

            $r('Trucha al horno con cebada y vainitas','almuerzo',[$i('Trucha',150),$i('Cebada',160),$i('Vainita',100),$i('Aceite de oliva',5,'ml')],35),
            $r('Pavo salteado con fideo integral y verduras','almuerzo',[$i('Pavo',140),$i('Fideo integral',160),$i('Calabacín',80),$i('Pimentón',50)],30),
            $r('Bowl de poroto negro, quinua y palta','almuerzo',[$i('Poroto negro',160),$i('Quinua',130),$i('Palta',45),$i('Tomate',60)]),
            $r('Salmón con camote y ensalada de rúcula','almuerzo',[$i('Salmón',140),$i('Camote',170),$i('Rúcula',50),$i('Pepino',60)],35),
            $r('Tofu dorado con arroz integral y brócoli','almuerzo',[$i('Tofu',160),$i('Arroz integral',150),$i('Brócoli',110),$i('Sésamo',8)]),
            $r('Ensalada de lentejas con remolacha y huevo','almuerzo',[$i('Lentejas',170),$i('Remolacha',90),$i('Huevo',1,'unidad'),$i('Rúcula',40)]),
            $r('Pollo al horno con coliflor y papa','almuerzo',[$i('Pollo',145),$i('Coliflor',120),$i('Papa',150),$i('Aceite de oliva',5,'ml')],40),
            $r('Carne magra con puré de zapallo y ensalada','almuerzo',[$i('Carne magra',135),$i('Zapallo',200),$i('Repollo morado',70),$i('Tomate',50)],35),

            $r('Pera con mantequilla de maní','merienda',[$i('Pera',150),$i('Mantequilla de maní sin azúcar',15)]),
            $r('Yogur sin lactosa con semillas de calabaza','merienda',[$i('Yogur sin lactosa natural',170),$i('Semilla de calabaza',15)]),
            $r('Mandarina con almendras','merienda',[$i('Mandarina',160),$i('Almendras',18)]),
            $r('Batido de bebida de almendra, cacao y plátano','merienda',[$i('Bebida de almendra sin azúcar',220,'ml'),$i('Cacao amargo',8),$i('Plátano',70)]),
            $r('Tostada integral con pavo','merienda',[$i('Pan integral',40),$i('Pavo',50),$i('Tomate',40)]),
            $r('Kiwi con yogur sin lactosa y chía','merienda',[$i('Kiwi',110),$i('Yogur sin lactosa natural',130),$i('Chía',8)]),
            $r('Durazno con nueces','merienda',[$i('Durazno',150),$i('Nueces',18)]),

            $r('Crema de coliflor con pollo desmenuzado','cena',[$i('Coliflor',220),$i('Pollo',100),$i('Cebolla',30),$i('Aceite de oliva',3,'ml')],30),
            $r('Ensalada de salmón, palta y rúcula','cena',[$i('Salmón',110),$i('Palta',45),$i('Rúcula',60),$i('Pepino',60)]),
            $r('Sopa de cebada con verduras y pavo','cena',[$i('Cebada',120),$i('Pavo',100),$i('Zanahoria',60),$i('Apio',40)],35),
            $r('Tortilla de calabacín y champiñones','cena',[$i('Huevo',2,'unidad'),$i('Calabacín',90),$i('Champiñón',70),$i('Cebolla',20)]),
            $r('Ensalada tibia de tofu y vainitas','cena',[$i('Tofu',130),$i('Vainita',100),$i('Tomate',60),$i('Sésamo',8)]),
            $r('Pescado al vapor con puré de coliflor','cena',[$i('Pescado',130),$i('Coliflor',190),$i('Acelga',60)]),
            $r('Crema de calabacín con huevo pochado','cena',[$i('Calabacín',220),$i('Huevo',1,'unidad'),$i('Cebolla',30),$i('Aceite de oliva',3,'ml')]),
        ];
    }
}
