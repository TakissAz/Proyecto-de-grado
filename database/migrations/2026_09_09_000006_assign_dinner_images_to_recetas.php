<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Asocia las fotografías aprobadas con las cenas del catálogo.
     */
    public function up(): void
    {
        $imagenes = [
            'Crema de zapallo saludable con pollo' => '/images/recetas/cena-crema-zapallo-pollo.png',
            'Ensalada de atún con vegetales' => '/images/recetas/cena-ensalada-atun-vegetales.png',
            'Ensalada de pollo con palta' => '/images/recetas/cena-ensalada-pollo-palta.png',
            'Ensalada tibia de quinua con verduras' => '/images/recetas/cena-ensalada-quinua-verduras.png',
            'Omelette de verduras' => '/images/recetas/cena-omelette-verduras.png',
            'Pescado con verduras al vapor' => '/images/recetas/cena-pescado-verduras-vapor.png',
            'Salteado de verduras con pollo' => '/images/recetas/cena-salteado-verduras-pollo.png',
            'Sopa de lentejas ligera' => '/images/recetas/cena-sopa-lentejas.png',
            'Sopa de verduras con huevo' => '/images/recetas/cena-sopa-verduras-huevo.png',
            'Tortilla de espinaca con ensalada' => '/images/recetas/cena-tortilla-espinaca-ensalada.png',
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
                '/images/recetas/cena-crema-zapallo-pollo.png',
                '/images/recetas/cena-ensalada-atun-vegetales.png',
                '/images/recetas/cena-ensalada-pollo-palta.png',
                '/images/recetas/cena-ensalada-quinua-verduras.png',
                '/images/recetas/cena-omelette-verduras.png',
                '/images/recetas/cena-pescado-verduras-vapor.png',
                '/images/recetas/cena-salteado-verduras-pollo.png',
                '/images/recetas/cena-sopa-lentejas.png',
                '/images/recetas/cena-sopa-verduras-huevo.png',
                '/images/recetas/cena-tortilla-espinaca-ensalada.png',
            ])
            ->update([
                'imagen_url' => null,
                'updated_at' => now(),
            ]);
    }
};
