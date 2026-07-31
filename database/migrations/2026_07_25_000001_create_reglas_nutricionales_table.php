<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reglas_nutricionales', function (Blueprint $table) {
            $table->bigIncrements('id_regla_nutricional');
            $table->string('codigo', 30)->unique();
            $table->string('nombre', 150);
            $table->string('tipo_regla', 60);
            $table->string('condicion_campo', 80);
            $table->string('condicion_operador', 20);
            $table->json('condicion_valor')->nullable();
            $table->json('resultado');
            $table->unsignedSmallInteger('prioridad')->default(10);
            $table->text('descripcion')->nullable();
            $table->string('fuente', 255)->nullable();
            $table->boolean('estado')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('tipo_regla');
            $table->index('condicion_campo');
            $table->index('prioridad');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reglas_nutricionales');
    }
};
