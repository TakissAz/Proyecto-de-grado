<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('antecedentes_endocrino_metabolicos', function (Blueprint $table) {
            $table->id('id_antecedente');

            $table->foreignId('id_consulta_endocrinologica')
                ->constrained('consultas_endocrinologicas', 'id_consulta_endocrinologica')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('id_paciente')
                ->constrained('pacientes', 'id_paciente')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->boolean('diabetes_familiar')->default(false);
            $table->boolean('diabetes_personal')->default(false);
            $table->boolean('hipertension_familiar')->default(false);
            $table->boolean('hipertension_personal')->default(false);
            $table->boolean('dislipidemia_familiar')->default(false);
            $table->boolean('dislipidemia_personal')->default(false);

            $table->boolean('enfermedad_tiroidea')->default(false);
            $table->boolean('hiperprolactinemia_previa')->default(false);

            $table->boolean('uso_anticonceptivos')->default(false);
            $table->boolean('uso_metformina')->default(false);
            $table->boolean('uso_corticoides')->default(false);

            $table->text('otros_medicamentos')->nullable();
            $table->json('antecedentes_personales_detalle')->nullable();
            $table->json('antecedentes_familiares_detalle')->nullable();
            $table->json('medicamentos_detalle')->nullable();
            $table->text('observaciones')->nullable();

            $table->string('estado')->default('activo');

            $table->timestamps();
            $table->softDeletes();

            $table->index('id_consulta_endocrinologica');
            $table->index('id_paciente');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('antecedentes_endocrino_metabolicos');
    }
};
