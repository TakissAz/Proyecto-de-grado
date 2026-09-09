<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private array $imagenes = [
        'Porridge de amaranto con pera y canela' => 'porridge-amaranto-pera.png',
        'Tortilla integral de pavo y palta' => 'tortilla-pavo-palta.png',
        'Bowl de yogur sin lactosa con arándanos' => 'bowl-yogur-arandanos.png',
        'Omelette de claras con champiñón' => 'omelette-champinon.png',
        'Avena nocturna con bebida de almendra y kiwi' => 'avena-nocturna-kiwi.png',
        'Tostada integral con pavo y rúcula' => 'tostada-pavo-rucula.png',
        'Granola sin azúcar con yogur y durazno' => 'granola-yogur-durazno.png',
        'Revuelto de tofu con verduras' => 'revuelto-tofu-verduras.png',
        'Trucha al horno con cebada y vainitas' => 'trucha-cebada-vainitas.png',
        'Pavo salteado con fideo integral y verduras' => 'pavo-fideo-verduras.png',
        'Bowl de poroto negro, quinua y palta' => 'bowl-poroto-quinua.png',
        'Salmón con camote y ensalada de rúcula' => 'salmon-camote-rucula.png',
        'Tofu dorado con arroz integral y brócoli' => 'tofu-arroz-brocoli.png',
        'Ensalada de lentejas con remolacha y huevo' => 'ensalada-lentejas-remolacha.png',
        'Pollo al horno con coliflor y papa' => 'pollo-coliflor-papa.png',
        'Carne magra con puré de zapallo y ensalada' => 'carne-zapallo-ensalada.png',
        'Pera con mantequilla de maní' => 'pera-mantequilla-mani.png',
        'Yogur sin lactosa con semillas de calabaza' => 'yogur-semillas-calabaza.png',
        'Mandarina con almendras' => 'mandarina-almendras.png',
        'Batido de bebida de almendra, cacao y plátano' => 'batido-almendra-cacao-platano.png',
    ];

    public function up(): void
    {
        foreach ($this->imagenes as $nombre => $archivo) {
            DB::table('recetas')->where('nombre', $nombre)->update([
                'imagen_url' => '/images/recetas/'.$archivo,
            ]);
        }
    }

    public function down(): void
    {
        DB::table('recetas')->whereIn('imagen_url', array_map(
            fn (string $archivo) => '/images/recetas/'.$archivo,
            array_values($this->imagenes),
        ))->update(['imagen_url' => '/images/recetas/receta-saludable-portada.png']);
    }
};
