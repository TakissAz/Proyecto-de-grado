<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private array $imagenes = [
        'Tostada integral con pavo' => '/images/recetas/merienda-tostada-integral-pavo.png',
        'Kiwi con yogur sin lactosa y chía' => '/images/recetas/merienda-kiwi-yogur-chia.png',
        'Durazno con nueces' => '/images/recetas/merienda-durazno-nueces.png',
        'Crema de coliflor con pollo desmenuzado' => '/images/recetas/cena-crema-coliflor-pollo.png',
        'Ensalada de salmón, palta y rúcula' => '/images/recetas/cena-ensalada-salmon-palta-rucula.png',
        'Sopa de cebada con verduras y pavo' => '/images/recetas/cena-sopa-cebada-pavo.png',
        'Tortilla de calabacín y champiñones' => '/images/recetas/cena-tortilla-calabacin-champinones.png',
        'Ensalada tibia de tofu y vainitas' => '/images/recetas/cena-ensalada-tofu-vainitas.png',
        'Pescado al vapor con puré de coliflor' => '/images/recetas/cena-pescado-pure-coliflor.png',
        'Crema de calabacín con huevo pochado' => '/images/recetas/cena-crema-calabacin-huevo.png',
    ];

    public function up(): void
    {
        foreach ($this->imagenes as $nombre => $imagenUrl) {
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
            ->whereIn('imagen_url', array_values($this->imagenes))
            ->update([
                'imagen_url' => '/images/recetas/receta-saludable-portada.png',
                'updated_at' => now(),
            ]);
    }
};
