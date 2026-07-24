<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restricciones_alimentarias', function (Blueprint $table) {
            $table->bigIncrements('id_restriccion_alimentaria');
            $table->unsignedBigInteger('id_paciente');
            $table->unsignedBigInteger('id_nutricionista');
            $table->unsignedBigInteger('id_consulta_nutricional');
            $table->text('alergias')->nullable();
            $table->text('intolerancias')->nullable();
            $table->text('alimentos_restringidos')->nullable();
            $table->text('alimentos_no_tolerados')->nullable();
            $table->text('alimentos_rechazados')->nullable();
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
        Schema::dropIfExists('restricciones_alimentarias');
    }
};
