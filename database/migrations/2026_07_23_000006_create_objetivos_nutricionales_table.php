<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('objetivos_nutricionales', function (Blueprint $table) {
            $table->bigIncrements('id_objetivo_nutricional');
            $table->unsignedBigInteger('id_paciente');
            $table->unsignedBigInteger('id_nutricionista');
            $table->unsignedBigInteger('id_consulta_nutricional');
            $table->string('objetivo_principal', 60);
            $table->string('objetivo_secundario', 100)->nullable();
            $table->decimal('meta_peso', 8, 2)->nullable();
            $table->decimal('meta_cintura', 6, 2)->nullable();
            $table->unsignedSmallInteger('plazo_semanas')->nullable();
            $table->string('enfoque_nutricional', 60)->nullable();
            $table->string('prioridad', 30)->default('media');
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
            $table->index('objetivo_principal');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('objetivos_nutricionales');
    }
};
