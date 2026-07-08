<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resultados_diferenciales_endocrinos', function (Blueprint $table) {
            $table->id('id_diferencial_endocrino');

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

            $table->decimal('tsh', 8, 2)->nullable();
            $table->decimal('t3_libre', 8, 2)->nullable();
            $table->decimal('t4_libre', 8, 2)->nullable();
            $table->decimal('prolactina', 8, 2)->nullable();
            $table->decimal('diecisiete_oh_progesterona', 8, 2)->nullable();
            $table->decimal('cortisol', 8, 2)->nullable();

            $table->boolean('alteracion_tiroidea_descartada')->default(false);
            $table->boolean('hiperprolactinemia_descartada')->default(false);
            $table->boolean('hiperplasia_suprarrenal_descartada')->default(false);
            $table->boolean('cushing_descartado')->default(false);

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
        Schema::dropIfExists('resultados_diferenciales_endocrinos');
    }
};