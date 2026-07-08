<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resultados_glucosa_insulina', function (Blueprint $table) {
            $table->id('id_glucosa_insulina');

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

            $table->date('fecha_resultado');

            $table->decimal('glucosa_ayunas', 8, 2)->nullable();
            $table->decimal('insulina_ayunas', 8, 2)->nullable();
            $table->decimal('homa_ir', 8, 2)->nullable();
            $table->decimal('hemoglobina_glicosilada', 8, 2)->nullable();

            $table->decimal('glucosa_2h_ogtt', 8, 2)->nullable();
            $table->decimal('insulina_2h_ogtt', 8, 2)->nullable();

            $table->boolean('hiperinsulinemia')->default(false);
            $table->boolean('resistencia_insulina_sugerida')->default(false);

            $table->text('interpretacion')->nullable();
            $table->string('estado')->default('registrado');

            $table->timestamps();
            $table->softDeletes();

            $table->index(['id_paciente', 'fecha_resultado']);
            $table->index('id_consulta_endocrinologica');
            $table->index('id_endocrinologo');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resultados_glucosa_insulina');
    }
};