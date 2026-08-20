<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('retroalimentaciones_paciente', function (Blueprint $table) {
            $table->bigIncrements('id_retroalimentacion_paciente');
            $table->unsignedBigInteger('id_paciente');
            $table->unsignedBigInteger('id_plan_alimentario')->nullable();
            $table->unsignedBigInteger('id_seguimiento_comida')->nullable();
            $table->unsignedBigInteger('id_seguimiento_sintoma_paciente')->nullable();
            $table->unsignedBigInteger('id_usuario_emisor');
            $table->string('rol_emisor', 30);
            $table->string('tipo_retroalimentacion', 40);
            $table->text('mensaje');
            $table->string('prioridad', 20)->default('normal');
            $table->boolean('visible_para_paciente')->default(true);
            $table->boolean('leido_por_paciente')->default(false);
            $table->timestamp('fecha_lectura_paciente')->nullable();
            $table->string('estado', 20)->default('activo');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('id_paciente')->references('id_paciente')->on('pacientes')->cascadeOnDelete();
            $table->foreign('id_plan_alimentario')->references('id_plan_alimentario')->on('planes_alimentarios')->nullOnDelete();
            $table->foreign('id_seguimiento_comida')->references('id_seguimiento_comida')->on('seguimientos_comidas')->nullOnDelete();
            $table->foreign('id_seguimiento_sintoma_paciente')->references('id_seguimiento_sintoma_paciente')->on('seguimientos_sintomas_paciente')->nullOnDelete();
            $table->foreign('id_usuario_emisor')->references('id')->on('users')->restrictOnDelete();
            $table->index(['id_paciente', 'estado', 'visible_para_paciente'], 'retro_paciente_visibilidad_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retroalimentaciones_paciente');
    }
};
