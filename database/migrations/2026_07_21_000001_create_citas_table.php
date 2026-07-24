<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('citas', function (Blueprint $table) {
            $table->id('id_cita');
            $table->foreignId('id_paciente')->constrained('pacientes', 'id_paciente')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('id_profesional')->constrained('users')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('tipo_profesional', 30);
            $table->date('fecha_cita');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->unsignedSmallInteger('duracion_minutos')->default(60);
            $table->string('tipo_cita', 50);
            $table->string('modalidad', 30);
            $table->text('motivo');
            $table->string('estado', 30)->default('programada');
            $table->text('observaciones')->nullable();
            $table->text('motivo_cancelacion')->nullable();
            $table->foreignId('registrada_por')->constrained('users')->cascadeOnUpdate()->restrictOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('estado');
            $table->index('tipo_profesional');
            $table->index(['fecha_cita', 'id_profesional']);
            $table->index(['fecha_cita', 'id_paciente']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('citas');
    }
};
