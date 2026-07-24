<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultas_nutricionales', function (Blueprint $table) {
            $table->bigIncrements('id_consulta_nutricional');
            $table->unsignedBigInteger('id_paciente');
            $table->unsignedBigInteger('id_nutricionista');
            $table->unsignedBigInteger('id_cita')->nullable();
            $table->date('fecha_consulta');
            $table->text('motivo_consulta')->nullable();
            $table->string('estado_consulta', 30)->default('abierta');
            $table->text('observaciones_generales')->nullable();
            $table->boolean('estado')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('id_paciente')->references('id_paciente')->on('pacientes')->restrictOnDelete();
            $table->foreign('id_nutricionista')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('id_cita')->references('id_cita')->on('citas')->nullOnDelete();
            $table->index('id_paciente');
            $table->index('id_nutricionista');
            $table->index('id_cita');
            $table->index('fecha_consulta');
            $table->index('estado_consulta');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultas_nutricionales');
    }
};
