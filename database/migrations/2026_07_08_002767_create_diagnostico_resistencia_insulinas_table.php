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