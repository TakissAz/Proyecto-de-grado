<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recomendaciones_nutricionales_expertas', function (Blueprint $table) {
            $table->bigIncrements('id_recomendacion_nutricional_experta');
            $table->foreignId('id_paciente')
                ->constrained('pacientes', 'id_paciente')
                ->restrictOnDelete();
            $table->foreignId('id_nutricionista')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignId('id_requerimiento_nutricional')
                ->nullable()
                ->constrained('requerimientos_nutricionales', 'id_requerimiento_nutricional')
                ->nullOnDelete();

            $table->string('enfoque_nutricional_experto')->nullable();
            $table->string('prioridad_nutricional')->nullable();
            $table->decimal('calorias_sugeridas', 8, 2)->nullable();
            $table->decimal('proteinas_porcentaje', 5, 2)->nullable();
            $table->decimal('carbohidratos_porcentaje', 5, 2)->nullable();
            $table->decimal('grasas_porcentaje', 5, 2)->nullable();
            $table->decimal('fibra_sugerida', 5, 2)->nullable();
            $table->json('recomendaciones')->nullable();
            $table->json('restricciones')->nullable();
            $table->json('alertas')->nullable();
            $table->text('conclusion')->nullable();

            $table->boolean('generado_por_motor_experto')->default(true);
            $table->json('hechos_utilizados')->nullable();
            $table->json('reglas_activadas')->nullable();
            $table->text('explicacion_experta')->nullable();
            $table->json('recomendaciones_expertas')->nullable();
            $table->decimal('confianza_experta', 5, 2)->nullable();
            $table->string('version_motor_experto')->nullable();
            $table->timestamp('evaluado_por_motor_experto_en')->nullable();

            $table->string('estado_validacion_experta')->default('pendiente');
            $table->foreignId('validado_por')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('fecha_validacion')->nullable();
            $table->text('observacion_validacion')->nullable();

            $table->string('estado')->default('pendiente');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['id_paciente', 'estado']);
            $table->index('estado_validacion_experta');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recomendaciones_nutricionales_expertas');
    }
};
