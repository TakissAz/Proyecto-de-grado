<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Asocia las fotografías aprobadas con las meriendas del catálogo.
     */
    public function up(): void
    {
        $imagenes = [
            'Avena pequeña con canela' => '/images/recetas/merienda-avena-canela.png',
            'Batido de leche descremada con cacao amargo' => '/images/recetas/merienda-batido-leche-cacao.png',
            'Frutilla con yogur natural' => '/images/recetas/merienda-frutilla-yogur.png',
            'Manzana con nueces' => '/images/recetas/merienda-manzana-nueces.png',
            'Palitos de zanahoria con hummus' => '/images/recetas/merienda-zanahoria-hummus.png',
            'Pan integral con queso fresco' => '/images/recetas/merienda-pan-queso-fresco.png',
            'Papaya con linaza' => '/images/recetas/merienda-papaya-linaza.png',
            'Puñado de almendras con fruta' => '/images/recetas/merienda-almendras-fruta.png',
            'Tostada integral con palta' => '/images/recetas/merienda-tostada-palta.png',
            'Yogur natural con chía' => '/images/recetas/merienda-yogur-chia.png',
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
                '/images/recetas/merienda-avena-canela.png',
                '/images/recetas/merienda-batido-leche-cacao.png',
                '/images/recetas/merienda-frutilla-yogur.png',
                '/images/recetas/merienda-manzana-nueces.png',
                '/images/recetas/merienda-zanahoria-hummus.png',
                '/images/recetas/merienda-pan-queso-fresco.png',
                '/images/recetas/merienda-papaya-linaza.png',
                '/images/recetas/merienda-almendras-fruta.png',
                '/images/recetas/merienda-tostada-palta.png',
                '/images/recetas/merienda-yogur-chia.png',
            ])
            ->update([
                'imagen_url' => null,
                'updated_at' => now(),
            ]);
    }
};
