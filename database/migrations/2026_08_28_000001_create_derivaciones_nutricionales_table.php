<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('derivaciones_nutricionales', function (Blueprint $table) {
            $table->id('id_derivacion_nutricional');
            $table->foreignId('id_paciente')->constrained('pacientes', 'id_paciente')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('id_endocrinologo')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('id_nutricionista')->nullable()->constrained('users')->nullOnDelete();
            $table->text('motivo_derivacion')->nullable();
            $table->string('prioridad', 20)->default('normal');
            $table->string('origen', 30)->nullable();
            $table->string('estado', 30)->default('pendiente');
            $table->timestamp('fecha_derivacion')->nullable();
            $table->timestamp('fecha_vista')->nullable();
            $table->timestamp('fecha_atencion')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['id_paciente', 'estado']);
            $table->index('prioridad');
            $table->index('fecha_derivacion');
        });
    }

    public function down(): void { Schema::dropIfExists('derivaciones_nutricionales'); }
};
