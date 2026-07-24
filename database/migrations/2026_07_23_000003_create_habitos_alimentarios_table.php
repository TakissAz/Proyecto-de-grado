<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('habitos_alimentarios', function (Blueprint $table) {
            $table->bigIncrements('id_habito_alimentario');
            $table->unsignedBigInteger('id_paciente');
            $table->unsignedBigInteger('id_nutricionista');
            $table->unsignedBigInteger('id_consulta_nutricional');
            $table->unsignedSmallInteger('comidas_por_dia')->nullable();
            $table->boolean('horarios_regulares')->default(false);
            $table->boolean('consume_desayuno')->default(false);
            $table->decimal('consumo_agua_litros', 4, 2)->nullable();
            $table->string('consumo_azucar', 30)->nullable();
            $table->string('consumo_ultraprocesados', 30)->nullable();
            $table->string('consumo_frituras', 30)->nullable();
            $table->string('consumo_bebidas_azucaradas', 30)->nullable();
            $table->string('frecuencia_frutas_verduras', 30)->nullable();
            $table->boolean('cena_tardia')->default(false);
            $table->boolean('ansiedad_por_comida')->default(false);
            $table->boolean('hambre_nocturna')->default(false);
            $table->text('observaciones')->nullable();
            $table->boolean('estado')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('id_paciente')->references('id_paciente')->on('pacientes')->restrictOnDelete();
            $table->foreign('id_nutricionista')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('id_consulta_nutricional')->references('id_consulta_nutricional')->on('consultas_nutricionales')->restrictOnDelete();
            $table->index('id_paciente');
            $table->index('id_nutricionista');
            $table->index('id_consulta_nutricional');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('habitos_alimentarios');
    }
};
