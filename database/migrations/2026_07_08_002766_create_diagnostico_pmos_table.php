<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diagnosticos_pmos', function (Blueprint $table) {
            $table->id('id_diagnostico_pmos');

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

            $table->foreignId('id_historia_menstrual')
                ->nullable()
                ->constrained('historia_menstrual', 'id_historia_menstrual')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->foreignId('id_historia_hiperandrogenica')
                ->nullable()
                ->constrained('historia_hiperandrogenica', 'id_historia_hiperandrogenica')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->foreignId('id_perfil_androgenico')
                ->nullable()
                ->constrained('resultados_perfil_androgenico', 'id_perfil_androgenico')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->foreignId('id_perfil_gonadotropo')
                ->nullable()
                ->constrained('resultados_perfil_gonadotropo', 'id_perfil_gonadotropo')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->foreignId('id_diferencial_endocrino')
                ->nullable()
                ->constrained('resultados_diferenciales_endocrinos', 'id_diferencial_endocrino')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->foreignId('id_ecografia')
                ->nullable()
                ->constrained('evaluaciones_ecograficas', 'id_ecografia')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->date('fecha_diagnostico');

            $table->boolean('cumple_alteracion_ovulatoria')->default(false);
            $table->boolean('cumple_hiperandrogenismo_clinico')->default(false);
            $table->boolean('cumple_hiperandrogenismo_bioquimico')->default(false);
            $table->boolean('cumple_hiperandrogenismo')->default(false);
            $table->string('tipo_hiperandrogenismo')->default('ninguno');

            $table->boolean('cumple_morfologia_ovarica')->default(false);
            $table->unsignedTinyInteger('total_criterios_rotterdam')->default(0);

            $table->string('fenotipo_pmos')->default('no_clasificado');
            $table->boolean('diagnostico_confirmado')->default(false);
            $table->boolean('diagnosticos_diferenciales_descartados')->default(false);

            $table->string('severidad_clinica')->default('no_clasificada');
            $table->string('riesgo_metabolico')->default('no_evaluado');

            $table->text('conclusion_medica')->nullable();
            $table->text('recomendaciones_medicas')->nullable();

            $table->boolean('generado_por_motor_experto')->default(false);
            $table->json('criterios_rotterdam_cumplidos')->nullable();
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
            $table->index('fenotipo_pmos');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diagnosticos_pmos');
    }
};