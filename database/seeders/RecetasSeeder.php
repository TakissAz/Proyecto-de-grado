<?php

namespace Database\Seeders;

use App\Models\Alimento;
use App\Models\Receta;
use App\Models\RecetaAlimento;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RecetasSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $alimentos = collect($this->alimentos())->mapWithKeys(function (array $datos, string $nombre): array {
                $alimento = Alimento::withTrashed()->updateOrCreate(['nombre' => $nombre], $datos + ['estado' => 'activo']);
                if ($alimento->trashed()) $alimento->restore();
                return [$nombre => $alimento];
            });

            foreach ($this->recetas() as $datos) {
                $ingredientes = $datos['ingredientes'];
                unset($datos['ingredientes']);
                $receta = Receta::withTrashed()->updateOrCreate(['nombre' => $datos['nombre']], $datos + ['estado' => 'activo']);
                if ($receta->trashed()) $receta->restore();
                $idsVigentes = [];

                foreach ($ingredientes as [$nombre, $cantidad, $unidad]) {
                    /** @var Alimento $alimento */
                    $alimento = $alimentos->get($nombre);
                    $factor = (float) $cantidad / max((float) $alimento->cantidad_base, 0.01);
                    $aportes = collect(['calorias', 'proteinas', 'carbohidratos', 'grasas', 'fibra'])
                        ->mapWithKeys(fn (string $campo): array => ["{$campo}_aporte" => round((float) $alimento->{$campo} * $factor, 2)])
                        ->all();
                    $pivot = RecetaAlimento::withTrashed()->updateOrCreate(
                        ['id_receta' => $receta->getKey(), 'id_alimento' => $alimento->getKey()],
                        ['cantidad' => $cantidad, 'unidad' => $unidad] + $aportes
                    );
                    if ($pivot->trashed()) $pivot->restore();
                    $idsVigentes[] = $pivot->getKey();
                }

                $receta->recetaAlimentos()->whereNotIn('id_receta_alimento', $idsVigentes)->delete();
                $receta->recalcularTotales();
            }
        });

        $this->command?->info('RecetasSeeder: 37 alimentos y 40 recetas creados o actualizados.');
    }

    private function alimentos(): array
    {
        $a = fn (string $grupo, string $unidad, float $base, float $kcal, float $p, float $c, float $g, float $f, ?int $ig = null): array => [
            'grupo_alimentario'=>$grupo, 'unidad_base'=>$unidad, 'cantidad_base'=>$base,
            'calorias'=>$kcal, 'proteinas'=>$p, 'carbohidratos'=>$c, 'grasas'=>$g,
            'fibra'=>$f, 'indice_glucemico'=>$ig, 'disponibilidad_temporal'=>'todo_el_anio',
        ];

        return [
            'Huevo'=>$a('proteinas','unidad',1,72,6.3,0.4,4.8,0,0),
            'Espinaca'=>$a('verduras','g',100,23,2.9,3.6,0.4,2.2,15),
            'Tomate'=>$a('verduras','g',100,18,0.9,3.9,0.2,1.2,15),
            'Aceite de oliva'=>$a('grasas','ml',10,88,0,0,10,0,0),
            'Avena'=>$a('cereales_integrales','g',100,389,16.9,66.3,6.9,10.6,55),
            'Chía'=>$a('semillas','g',100,486,16.5,42.1,30.7,34.4,30),
            'Canela'=>$a('especias','g',5,12,0.2,4,0.1,2.7,5),
            'Frutilla'=>$a('frutas','g',100,32,0.7,7.7,0.3,2,25),
            'Yogur natural sin azúcar'=>$a('lacteos','g',100,63,5.3,7,1.6,0,35),
            'Linaza'=>$a('semillas','g',100,534,18.3,28.9,42.2,27.3,35),
            'Pan integral'=>$a('cereales_integrales','g',100,247,13,41,4.2,7,50),
            'Palta'=>$a('grasas_saludables','g',100,160,2,8.5,14.7,6.7,15),
            'Quinua'=>$a('cereales_integrales','g',100,120,4.4,21.3,1.9,2.8,53),
            'Leche descremada'=>$a('lacteos','ml',100,35,3.4,5,0.1,0,32),
            'Queso fresco bajo en grasa'=>$a('lacteos','g',100,170,22,4,7,0,30),
            'Papaya'=>$a('frutas','g',100,43,0.5,10.8,0.3,1.7,60),
            'Manzana'=>$a('frutas','g',100,52,0.3,13.8,0.2,2.4,36),
            'Pollo'=>$a('proteinas','g',100,165,31,0,3.6,0,0),
            'Lechuga'=>$a('verduras','g',100,15,1.4,2.9,0.2,1.3,15),
            'Pepino'=>$a('verduras','g',100,15,0.7,3.6,0.1,0.5,15),
            'Pescado'=>$a('proteinas','g',100,140,24,0,5,0,0),
            'Camote'=>$a('tuberculos','g',100,86,1.6,20.1,0.1,3,54),
            'Brócoli'=>$a('verduras','g',100,34,2.8,6.6,0.4,2.6,15),
            'Zanahoria'=>$a('verduras','g',100,41,0.9,9.6,0.2,2.8,39),
            'Lentejas'=>$a('legumbres','g',100,116,9,20.1,0.4,7.9,32),
            'Garbanzos'=>$a('legumbres','g',100,164,8.9,27.4,2.6,7.6,33),
            'Arroz integral'=>$a('cereales_integrales','g',100,123,2.7,25.6,1,1.6,50),
            'Carne magra'=>$a('proteinas','g',100,180,27,0,8,0,0),
            'Atún'=>$a('proteinas','g',100,132,29,0,1,0,0),
            'Papa'=>$a('tuberculos','g',100,87,1.9,20.1,0.1,1.8,65),
            'Almendras'=>$a('frutos_secos','g',100,579,21.2,21.6,49.9,12.5,15),
            'Nueces'=>$a('frutos_secos','g',100,654,15.2,13.7,65.2,6.7,15),
            'Cacao amargo'=>$a('otros','g',100,228,19.6,57.9,13.7,37,20),
            'Zapallo'=>$a('verduras','g',100,26,1,6.5,0.1,0.5,51),
            'Acelga'=>$a('verduras','g',100,19,1.8,3.7,0.2,1.6,15),
            'Cebolla'=>$a('verduras','g',100,40,1.1,9.3,0.1,1.7,15),
            'Pimentón'=>$a('verduras','g',100,31,1,6,0.3,2.1,15),
        ];
    }

    private function recetas(): array
    {
        $r = fn (string $nombre, string $tipo, array $ingredientes, string $descripcion): array => [
            'nombre'=>$nombre, 'descripcion'=>$descripcion, 'tipo_comida'=>$tipo, 'porciones'=>1,
            'tiempo_preparacion_minutos'=>20, 'preparacion'=>'Lavar los ingredientes. Cocinar o mezclar según corresponda y servir en la porción indicada.',
            'observaciones'=>'Receta equilibrada para planificación nutricional individualizada.', 'ingredientes'=>$ingredientes,
        ];
        $i = fn (string $nombre, float $cantidad, string $unidad): array => [$nombre,$cantidad,$unidad];

        return [
            $r('Avena con chía, canela y frutos rojos','desayuno',[$i('Avena',40,'g'),$i('Chía',10,'g'),$i('Canela',2,'g'),$i('Frutilla',100,'g'),$i('Leche descremada',150,'ml')],'Desayuno rico en fibra y semillas.'),
            $r('Omelette de espinaca y tomate','desayuno',[$i('Huevo',2,'unidad'),$i('Espinaca',50,'g'),$i('Tomate',50,'g'),$i('Aceite de oliva',5,'ml')],'Omelette proteico con vegetales.'),
            $r('Yogur natural con avena y linaza','desayuno',[$i('Yogur natural sin azúcar',180,'g'),$i('Avena',30,'g'),$i('Linaza',10,'g')],'Bowl de yogur sin azúcar y cereales integrales.'),
            $r('Tostada integral con palta y huevo','desayuno',[$i('Pan integral',60,'g'),$i('Palta',50,'g'),$i('Huevo',1,'unidad')],'Tostada con grasas saludables y proteína.'),
            $r('Quinua cocida con leche descremada y canela','desayuno',[$i('Quinua',150,'g'),$i('Leche descremada',150,'ml'),$i('Canela',2,'g')],'Preparación caliente de quinua y leche.'),
            $r('Pan integral con queso fresco y tomate','desayuno',[$i('Pan integral',60,'g'),$i('Queso fresco bajo en grasa',50,'g'),$i('Tomate',60,'g')],'Sándwich abierto de queso fresco y tomate.'),
            $r('Smoothie de yogur natural con frutilla y chía','desayuno',[$i('Yogur natural sin azúcar',180,'g'),$i('Frutilla',120,'g'),$i('Chía',10,'g')],'Batido sin azúcar añadida.'),
            $r('Huevos revueltos con verduras','desayuno',[$i('Huevo',2,'unidad'),$i('Espinaca',40,'g'),$i('Tomate',40,'g'),$i('Pimentón',30,'g'),$i('Aceite de oliva',5,'ml')],'Huevos con variedad de verduras.'),
            $r('Bowl de papaya con yogur y linaza','desayuno',[$i('Papaya',180,'g'),$i('Yogur natural sin azúcar',150,'g'),$i('Linaza',10,'g')],'Bowl fresco con fruta y linaza.'),
            $r('Tortilla de avena con canela','desayuno',[$i('Avena',45,'g'),$i('Huevo',1,'unidad'),$i('Leche descremada',80,'ml'),$i('Canela',2,'g')],'Tortilla suave de avena sin azúcar.'),

            $r('Pollo a la plancha con quinua y ensalada','almuerzo',[$i('Pollo',140,'g'),$i('Quinua',150,'g'),$i('Lechuga',60,'g'),$i('Tomate',60,'g'),$i('Pepino',50,'g'),$i('Aceite de oliva',5,'ml')],'Plato completo de proteína, cereal y verduras.'),
            $r('Pescado al horno con camote y verduras','almuerzo',[$i('Pescado',150,'g'),$i('Camote',180,'g'),$i('Brócoli',100,'g'),$i('Zanahoria',70,'g'),$i('Aceite de oliva',5,'ml')],'Pescado al horno acompañado de vegetales.'),
            $r('Ensalada tibia de lentejas con verduras','almuerzo',[$i('Lentejas',180,'g'),$i('Tomate',70,'g'),$i('Pimentón',50,'g'),$i('Cebolla',30,'g'),$i('Espinaca',60,'g'),$i('Aceite de oliva',5,'ml')],'Ensalada vegetal rica en fibra.'),
            $r('Bowl de quinua con pollo y palta','almuerzo',[$i('Quinua',160,'g'),$i('Pollo',130,'g'),$i('Palta',50,'g'),$i('Tomate',60,'g'),$i('Lechuga',50,'g')],'Bowl balanceado con grasas saludables.'),
            $r('Carne magra salteada con verduras y arroz integral','almuerzo',[$i('Carne magra',130,'g'),$i('Arroz integral',160,'g'),$i('Brócoli',80,'g'),$i('Pimentón',50,'g'),$i('Cebolla',30,'g'),$i('Aceite de oliva',5,'ml')],'Carne magra con verduras y arroz integral.'),
            $r('Guiso de garbanzos con espinaca','almuerzo',[$i('Garbanzos',190,'g'),$i('Espinaca',80,'g'),$i('Tomate',80,'g'),$i('Cebolla',40,'g'),$i('Zanahoria',60,'g'),$i('Aceite de oliva',5,'ml')],'Guiso vegetal de legumbres.'),
            $r('Ensalada de atún con papa y verduras','almuerzo',[$i('Atún',120,'g'),$i('Papa',160,'g'),$i('Lechuga',60,'g'),$i('Tomate',70,'g'),$i('Pepino',60,'g'),$i('Aceite de oliva',5,'ml')],'Ensalada completa con atún y papa.'),
            $r('Pollo con brócoli y arroz integral','almuerzo',[$i('Pollo',140,'g'),$i('Brócoli',130,'g'),$i('Arroz integral',150,'g'),$i('Aceite de oliva',5,'ml')],'Salteado sencillo de pollo y brócoli.'),
            $r('Sopa de verduras con pollo desmenuzado','almuerzo',[$i('Pollo',120,'g'),$i('Zapallo',100,'g'),$i('Zanahoria',70,'g'),$i('Acelga',60,'g'),$i('Cebolla',30,'g'),$i('Papa',100,'g')],'Sopa casera con pollo y verduras.'),
            $r('Hamburguesa casera de lentejas con ensalada','almuerzo',[$i('Lentejas',180,'g'),$i('Huevo',1,'unidad'),$i('Avena',20,'g'),$i('Lechuga',70,'g'),$i('Tomate',70,'g'),$i('Pepino',50,'g')],'Hamburguesa vegetal horneada con ensalada.'),

            $r('Yogur natural con chía','merienda',[$i('Yogur natural sin azúcar',170,'g'),$i('Chía',10,'g')],'Merienda proteica con semillas.'),
            $r('Manzana con nueces','merienda',[$i('Manzana',150,'g'),$i('Nueces',20,'g')],'Manzana fresca con una porción controlada de nueces.'),
            $r('Frutilla con yogur natural','merienda',[$i('Frutilla',150,'g'),$i('Yogur natural sin azúcar',150,'g')],'Fruta con yogur sin azúcar.'),
            $r('Pan integral con queso fresco','merienda',[$i('Pan integral',40,'g'),$i('Queso fresco bajo en grasa',40,'g')],'Porción pequeña de pan y queso.'),
            $r('Palitos de zanahoria con hummus','merienda',[$i('Zanahoria',120,'g'),$i('Garbanzos',80,'g'),$i('Aceite de oliva',3,'ml')],'Vegetales crudos con crema de garbanzo.'),
            $r('Puñado de almendras con fruta','merienda',[$i('Almendras',20,'g'),$i('Papaya',150,'g')],'Frutos secos en porción controlada con fruta.'),
            $r('Batido de leche descremada con cacao amargo','merienda',[$i('Leche descremada',220,'ml'),$i('Cacao amargo',8,'g'),$i('Canela',1,'g')],'Batido sin azúcar añadida.'),
            $r('Tostada integral con palta','merienda',[$i('Pan integral',40,'g'),$i('Palta',40,'g')],'Tostada con grasa saludable.'),
            $r('Papaya con linaza','merienda',[$i('Papaya',180,'g'),$i('Linaza',10,'g')],'Fruta fresca con semillas molidas.'),
            $r('Avena pequeña con canela','merienda',[$i('Avena',30,'g'),$i('Leche descremada',120,'ml'),$i('Canela',2,'g')],'Porción pequeña de avena caliente.'),

            $r('Ensalada de pollo con palta','cena',[$i('Pollo',120,'g'),$i('Palta',50,'g'),$i('Lechuga',80,'g'),$i('Tomate',70,'g'),$i('Pepino',60,'g')],'Cena ligera rica en proteína.'),
            $r('Sopa de verduras con huevo','cena',[$i('Huevo',1,'unidad'),$i('Zapallo',120,'g'),$i('Zanahoria',60,'g'),$i('Acelga',60,'g'),$i('Cebolla',30,'g')],'Sopa ligera de verduras y huevo.'),
            $r('Tortilla de espinaca con ensalada','cena',[$i('Huevo',2,'unidad'),$i('Espinaca',70,'g'),$i('Lechuga',60,'g'),$i('Tomate',60,'g'),$i('Aceite de oliva',5,'ml')],'Tortilla proteica con ensalada fresca.'),
            $r('Pescado con verduras al vapor','cena',[$i('Pescado',140,'g'),$i('Brócoli',100,'g'),$i('Zanahoria',70,'g'),$i('Acelga',60,'g'),$i('Aceite de oliva',5,'ml')],'Pescado con verduras cocidas al vapor.'),
            $r('Ensalada de atún con vegetales','cena',[$i('Atún',110,'g'),$i('Lechuga',80,'g'),$i('Tomate',70,'g'),$i('Pepino',60,'g'),$i('Pimentón',40,'g'),$i('Aceite de oliva',5,'ml')],'Ensalada baja en carbohidratos.'),
            $r('Crema de zapallo saludable con pollo','cena',[$i('Zapallo',220,'g'),$i('Pollo',100,'g'),$i('Cebolla',30,'g'),$i('Leche descremada',80,'ml'),$i('Aceite de oliva',3,'ml')],'Crema de verduras con proteína magra.'),
            $r('Salteado de verduras con pollo','cena',[$i('Pollo',120,'g'),$i('Brócoli',90,'g'),$i('Pimentón',60,'g'),$i('Zanahoria',60,'g'),$i('Cebolla',30,'g'),$i('Aceite de oliva',5,'ml')],'Salteado de pollo con verduras variadas.'),
            $r('Omelette de verduras','cena',[$i('Huevo',2,'unidad'),$i('Espinaca',50,'g'),$i('Tomate',50,'g'),$i('Pimentón',40,'g'),$i('Cebolla',20,'g'),$i('Aceite de oliva',5,'ml')],'Omelette ligero con vegetales.'),
            $r('Ensalada tibia de quinua con verduras','cena',[$i('Quinua',130,'g'),$i('Brócoli',80,'g'),$i('Tomate',60,'g'),$i('Espinaca',60,'g'),$i('Pimentón',40,'g'),$i('Aceite de oliva',5,'ml')],'Ensalada tibia integral y vegetal.'),
            $r('Sopa de lentejas ligera','cena',[$i('Lentejas',150,'g'),$i('Zanahoria',60,'g'),$i('Tomate',60,'g'),$i('Acelga',50,'g'),$i('Cebolla',30,'g')],'Sopa ligera de legumbres y verduras.'),
        ];
    }
}
