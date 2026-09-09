<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Asocia las fotografías aprobadas con los desayunos del catálogo.
     */
    public function up(): void
    {
        $imagenes = [
            'Avena con chía, canela y frutos rojos' => '/images/recetas/desayuno-avena-chia-frutos-rojos.png',
            'Bowl de papaya con yogur y linaza' => '/images/recetas/desayuno-papaya-yogur-linaza.png',
            'Huevos revueltos con verduras' => '/images/recetas/desayuno-huevos-revueltos-verduras.png',
            'Omelette de espinaca y tomate' => '/images/recetas/desayuno-omelette-espinaca-tomate.png',
            'Pan integral con queso fresco y tomate' => '/images/recetas/desayuno-pan-queso-tomate.png',
            'Quinua cocida con leche descremada y canela' => '/images/recetas/desayuno-quinua-leche-canela.png',
            'Smoothie de yogur natural con frutilla y chía' => '/images/recetas/desayuno-smoothie-yogur-frutilla-chia.png',
            'Tortilla de avena con canela' => '/images/recetas/desayuno-tortilla-avena-canela.png',
            'Tostada integral con palta y huevo' => '/images/recetas/desayuno-tostada-palta-huevo.png',
            'Yogur natural con avena y linaza' => '/images/recetas/desayuno-yogur-avena-linaza.png',
        ];

        foreach ($imagenes as $nombre => $imagenUrl) {
            DB::table('recetas')
                ->where('nombre', $nombre)
                ->update([
                    'imagen_url' => $imagenUrl,
                    'updated_at' => now(),
                ]);
        }
    }

    public function down(): void
    {
        DB::table('recetas')
            ->whereIn('imagen_url', [
                '/images/recetas/desayuno-avena-chia-frutos-rojos.png',
                '/images/recetas/desayuno-papaya-yogur-linaza.png',
                '/images/recetas/desayuno-huevos-revueltos-verduras.png',
                '/images/recetas/desayuno-omelette-espinaca-tomate.png',
                '/images/recetas/desayuno-pan-queso-tomate.png',
                '/images/recetas/desayuno-quinua-leche-canela.png',
                '/images/recetas/desayuno-smoothie-yogur-frutilla-chia.png',
                '/images/recetas/desayuno-tortilla-avena-canela.png',
                '/images/recetas/desayuno-tostada-palta-huevo.png',
                '/images/recetas/desayuno-yogur-avena-linaza.png',
            ])
            ->update([
                'imagen_url' => null,
                'updated_at' => now(),
            ]);
    }
};
