<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recetas', function (Blueprint $table) {
            $table->string('imagen_url', 500)->nullable()->after('descripcion');
        });

        // Primera tanda visual: las veinte recetas más recientes reciben la portada saludable.
        DB::table('recetas')->orderByDesc('id_receta')->limit(20)->update([
            'imagen_url' => '/images/recetas/receta-saludable-portada.png',
        ]);
    }

    public function down(): void
    {
        Schema::table('recetas', function (Blueprint $table) {
            $table->dropColumn('imagen_url');
        });
    }
};
