<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Asocia las fotografías aprobadas con los almuerzos del catálogo.
     */
    public function up(): void
    {
        $imagenes = [
            'Bowl de quinua con pollo y palta' => '/images/recetas/almuerzo-bowl-quinua-pollo-palta.png',
            'Carne magra salteada con verduras y arroz integral' => '/images/recetas/almuerzo-carne-verduras-arroz-integral.png',
            'Ensalada de atún con papa y verduras' => '/images/recetas/almuerzo-ensalada-atun-papa-verduras.png',
            'Ensalada tibia de lentejas con verduras' => '/images/recetas/almuerzo-ensalada-lentejas-verduras.png',
            'Guiso de garbanzos con espinaca' => '/images/recetas/almuerzo-guiso-garbanzos-espinaca.png',
            'Hamburguesa casera de lentejas con ensalada' => '/images/recetas/almuerzo-hamburguesa-lentejas-ensalada.png',
            'Pescado al horno con camote y verduras' => '/images/recetas/almuerzo-pescado-camote-verduras.png',
            'Pollo a la plancha con quinua y ensalada' => '/images/recetas/almuerzo-pollo-quinua-ensalada.png',
            'Pollo con brócoli y arroz integral' => '/images/recetas/almuerzo-pollo-brocoli-arroz-integral.png',
            'Sopa de verduras con pollo desmenuzado' => '/images/recetas/almuerzo-sopa-verduras-pollo.png',
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
                '/images/recetas/almuerzo-bowl-quinua-pollo-palta.png',
                '/images/recetas/almuerzo-carne-verduras-arroz-integral.png',
                '/images/recetas/almuerzo-ensalada-atun-papa-verduras.png',
                '/images/recetas/almuerzo-ensalada-lentejas-verduras.png',
                '/images/recetas/almuerzo-guiso-garbanzos-espinaca.png',
                '/images/recetas/almuerzo-hamburguesa-lentejas-ensalada.png',
                '/images/recetas/almuerzo-pescado-camote-verduras.png',
                '/images/recetas/almuerzo-pollo-quinua-ensalada.png',
                '/images/recetas/almuerzo-pollo-brocoli-arroz-integral.png',
                '/images/recetas/almuerzo-sopa-verduras-pollo.png',
            ])
            ->update([
                'imagen_url' => null,
                'updated_at' => now(),
            ]);
    }
};
