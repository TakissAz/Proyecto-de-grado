<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recetas', function (Blueprint $table) {
            $table->id('id_receta');
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->string('tipo_comida', 40);
            $table->unsignedSmallInteger('porciones')->default(1);
            $table->unsignedSmallInteger('tiempo_preparacion_minutos')->nullable();
            $table->text('preparacion')->nullable();
            $table->decimal('calorias_totales', 10, 2)->default(0);
            $table->decimal('proteinas_totales', 10, 2)->default(0);
            $table->decimal('carbohidratos_totales', 10, 2)->default(0);
            $table->decimal('grasas_totales', 10, 2)->default(0);
            $table->decimal('fibra_total', 10, 2)->default(0);
            $table->text('observaciones')->nullable();
            $table->string('estado', 20)->default('activo');
            $table->timestamps();
            $table->softDeletes();

            $table->index('nombre');
            $table->index('tipo_comida');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recetas');
    }
};
