<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receta_alimentos', function (Blueprint $table) {
            $table->id('id_receta_alimento');
            $table->unsignedBigInteger('id_receta');
            $table->unsignedBigInteger('id_alimento');
            $table->decimal('cantidad', 10, 2);
            $table->string('unidad', 30);
            $table->decimal('calorias_aporte', 10, 2)->default(0);
            $table->decimal('proteinas_aporte', 10, 2)->default(0);
            $table->decimal('carbohidratos_aporte', 10, 2)->default(0);
            $table->decimal('grasas_aporte', 10, 2)->default(0);
            $table->decimal('fibra_aporte', 10, 2)->default(0);
            $table->text('observaciones')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('id_receta')->references('id_receta')->on('recetas')->onDelete('restrict');
            $table->foreign('id_alimento')->references('id_alimento')->on('alimentos')->onDelete('restrict');

            $table->index('id_receta');
            $table->index('id_alimento');
            $table->index('unidad');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receta_alimentos');
    }
};
