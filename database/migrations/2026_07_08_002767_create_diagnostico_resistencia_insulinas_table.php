<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diagnosticos_resistencia_insulina', function (Blueprint $table) {
            $table->id('id_diagnostico_ri');

            $table->foreignId('id_consulta_endocrinologica')
                ->constrained('consultas_endocrinologicas', 'id_consulta_endocrinologica')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('id_paciente')
                ->constrained('pacientes', 'id_paciente')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('id_endocrinologo')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('id_glucosa_insulina')
                ->nullable()
                ->constrained('resultados_glucosa_insulina', 'id_glucosa_insulina')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->foreignId('id_perfil_lipidico')
                ->nullable()
                ->constrained('resultados_perfil_lipidico', 'id_perfil_lipidico')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->foreignId('id_evaluacion_fisica')
                ->nullable()
                ->constrained('evaluaciones_fisicas_endocrinas', 'id_evaluacion_fisica')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->date('fecha_diagnostico');

            $table->decimal('homa_ir', 8, 2)->nullable();
            $table->decimal('glucosa_ayunas', 8, 2)->nullable();
            $table->decimal('insulina_ayunas', 8, 2)->nullable();
            $table->decimal('hemoglobina_glicosilada', 8, 2)->nullable();

            $table->boolean('resistencia_confirmada')->default(false);

            $table->string('grado_resistencia')->default('no_aplica');
            $table->string('riesgo_diabetes')->default('no_evaluado');
            $table->string('riesgo_cardiometabolico')->default('no_evaluado');

            $table->text('conclusion_medica')->nullable();
            $table->text('recomendaciones_medicas')->nullable();

            $table->boolean('generado_por_motor_experto')->default(false);
            $table->decimal('quicki', 8, 4)->nullable();
            $table->json('hechos_utilizados')->nullable();
            $table->json('reglas_activadas')->nullable();
            $table->text('explicacion_experta')->nullable();
            $table->json('recomendaciones_expertas')->nullable();
            $table->decimal('confianza_experta', 5, 2)->nullable();
            $table->string('version_motor_experto', 30)->nullable();
            $table->timestamp('evaluado_por_motor_experto_en')->nullable();
            $table->string('estado_validacion_experta', 30)->default('pendiente');
            $table->unsignedBigInteger('validado_por')->nullable();
            $table->timestamp('fecha_validacion')->nullable();
            $table->text('observacion_validacion')->nullable();

            $table->foreign('validado_por')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->string('estado')->default('en_estudio');

            $table->timestamps();
            $table->softDeletes();

            $table->index(['id_paciente', 'fecha_diagnostico']);
            $table->index('id_consulta_endocrinologica');
            $table->index('id_endocrinologo');
            $table->index('estado');
            $table->index('grado_resistencia');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diagnosticos_resistencia_insulina');
    }
};