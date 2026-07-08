<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resultados_perfil_lipidico', function (Blueprint $table) {
            $table->id('id_perfil_lipidico');

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

            $table->decimal('colesterol_total', 8, 2)->nullable();
            $table->decimal('hdl', 8, 2)->nullable();
            $table->decimal('ldl', 8, 2)->nullable();
            $table->decimal('vldl', 8, 2)->nullable();
            $table->decimal('trigliceridos', 8, 2)->nullable();
            $table->decimal('colesterol_no_hdl', 8, 2)->nullable();

            $table->boolean('dislipidemia_sugerida')->default(false);

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
        Schema::dropIfExists('resultados_perfil_lipidico');
    }
};