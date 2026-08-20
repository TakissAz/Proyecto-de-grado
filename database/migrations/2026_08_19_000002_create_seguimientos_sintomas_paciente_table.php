<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('seguimientos_sintomas_paciente', function (Blueprint $table) {
            $table->bigIncrements('id_seguimiento_sintoma_paciente');
            $table->foreignId('id_paciente')->constrained('pacientes', 'id_paciente')->cascadeOnDelete();
            $table->date('fecha_registro');
            $table->string('nivel_energia')->nullable();
            $table->string('hambre_durante_dia')->nullable();
            $table->string('ansiedad_por_comida')->nullable();
            $table->string('antojos_dulces')->nullable();
            $table->boolean('hambre_nocturna')->default(false);
            $table->string('hinchazon_abdominal')->nullable();
            $table->string('fatiga_post_comida')->nullable();
            $table->boolean('mareos_o_debilidad')->default(false);
            $table->string('acne')->nullable();
            $table->string('dolor_menstrual')->nullable();
            $table->boolean('irregularidad_menstrual')->nullable();
            $table->string('cambios_estado_animo')->nullable();
            $table->string('calidad_sueno')->nullable();
            $table->decimal('horas_sueno', 4, 1)->nullable();
            $table->string('actividad_fisica')->nullable();
            $table->unsignedSmallInteger('minutos_actividad')->nullable();
            $table->decimal('consumo_agua_litros', 4, 1)->nullable();
            $table->text('observaciones')->nullable();
            $table->foreignId('registrado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['id_paciente', 'fecha_registro'], 'seguimiento_sintoma_paciente_fecha_unique');
            $table->index('id_paciente');
            $table->index('fecha_registro');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seguimientos_sintomas_paciente');
    }
};
