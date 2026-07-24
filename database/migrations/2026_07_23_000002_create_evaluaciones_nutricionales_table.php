<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluaciones_nutricionales', function (Blueprint $table) {
            $table->bigIncrements('id_evaluacion_nutricional');
            $table->unsignedBigInteger('id_paciente');
            $table->unsignedBigInteger('id_nutricionista');
            $table->unsignedBigInteger('id_consulta_nutricional');
            $table->date('fecha_evaluacion');
            $table->decimal('peso', 8, 2)->nullable();
            $table->decimal('talla', 5, 2)->nullable();
            $table->decimal('imc', 5, 2)->nullable();
            $table->decimal('circunferencia_cintura', 6, 2)->nullable();
            $table->decimal('circunferencia_cadera', 6, 2)->nullable();
            $table->decimal('indice_cintura_cadera', 5, 2)->nullable();
            $table->decimal('porcentaje_grasa', 5, 2)->nullable();
            $table->decimal('masa_muscular', 6, 2)->nullable();
            $table->string('nivel_actividad', 40)->nullable();
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
            $table->index('fecha_evaluacion');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluaciones_nutricionales');
    }
};
