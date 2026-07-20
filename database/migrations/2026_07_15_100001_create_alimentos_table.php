<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alimentos', function (Blueprint $table) {
            $table->id('id_alimento');
            $table->string('nombre', 150);
            $table->string('grupo_alimentario', 50);
            $table->string('unidad_base', 30);
            $table->decimal('cantidad_base', 8, 2);
            $table->decimal('calorias', 8, 2);
            $table->decimal('proteinas', 8, 2);
            $table->decimal('carbohidratos', 8, 2);
            $table->decimal('grasas', 8, 2);
            $table->decimal('fibra', 8, 2)->default(0);
            $table->unsignedSmallInteger('indice_glucemico')->nullable();
            $table->string('disponibilidad_temporal', 30)->default('desconocida');
            $table->string('temporada_escasez', 30)->nullable();
            $table->text('mensaje_disponibilidad')->nullable();
            $table->text('observaciones')->nullable();
            $table->string('estado', 20)->default('activo');
            $table->timestamps();
            $table->softDeletes();

            $table->index('nombre');
            $table->index('grupo_alimentario');
            $table->index('estado');
            $table->index('disponibilidad_temporal');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alimentos');
    }
};
