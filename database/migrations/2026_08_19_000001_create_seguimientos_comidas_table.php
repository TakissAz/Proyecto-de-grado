<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('seguimientos_comidas', function (Blueprint $table) {
            $table->bigIncrements('id_seguimiento_comida');
            $table->unsignedBigInteger('id_paciente');
            $table->unsignedBigInteger('id_plan_alimentario');
            $table->unsignedBigInteger('id_dia_plan_alimentario');
            $table->unsignedBigInteger('id_comida_plan_alimentario');
            $table->date('fecha_seguimiento');
            $table->string('estado_cumplimiento', 30)->default('pendiente');
            $table->unsignedTinyInteger('porcentaje_consumido')->nullable();
            $table->string('nivel_agrado', 30)->nullable();
            $table->boolean('desea_repetir')->nullable();
            $table->string('nivel_saciedad', 20)->nullable();
            $table->string('nivel_hambre_posterior', 20)->nullable();
            $table->boolean('ansiedad_posterior')->default(false);
            $table->boolean('presento_molestia')->default(false);
            $table->string('tipo_molestia', 40)->nullable();
            $table->string('intensidad_molestia', 20)->nullable();
            $table->string('dificultad_preparacion', 20)->nullable();
            $table->boolean('consiguio_ingredientes')->nullable();
            $table->string('motivo_no_cumplimiento', 40)->nullable();
            $table->text('comida_reemplazo')->nullable();
            $table->text('motivo_reemplazo')->nullable();
            $table->text('comentario_paciente')->nullable();
            $table->text('sugerencia_paciente')->nullable();
            $table->text('observacion_para_siguiente_plan')->nullable();
            $table->unsignedBigInteger('registrado_por')->nullable();
            $table->boolean('revisado_por_nutricionista')->default(false);
            $table->timestamp('fecha_revision_nutricionista')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('id_paciente')->references('id_paciente')->on('pacientes');
            $table->foreign('id_plan_alimentario')->references('id_plan_alimentario')->on('planes_alimentarios');
            $table->foreign('id_dia_plan_alimentario')->references('id_dia_plan_alimentario')->on('dias_plan_alimentario');
            $table->foreign('id_comida_plan_alimentario')->references('id_comida_plan_alimentario')->on('comidas_plan_alimentario');
            $table->foreign('registrado_por')->references('id')->on('users')->nullOnDelete();
            $table->index(['id_paciente', 'id_plan_alimentario']);
            $table->index(['id_comida_plan_alimentario', 'fecha_seguimiento']);
            $table->index('estado_cumplimiento');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seguimientos_comidas');
    }
};
