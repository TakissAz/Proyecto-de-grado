<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('historia_menstrual', function (Blueprint $table) {
            $table->id('id_historia_menstrual');

            $table->foreignId('id_consulta_endocrinologica')
                ->constrained('consultas_endocrinologicas', 'id_consulta_endocrinologica')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('id_paciente')
                ->constrained('pacientes', 'id_paciente')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->date('fecha_ultima_menstruacion')->nullable();
            $table->unsignedTinyInteger('edad_menarquia')->nullable();

            $table->string('regularidad_ciclo')->nullable();
            $table->unsignedSmallInteger('duracion_ciclo_dias')->nullable();
            $table->unsignedSmallInteger('intervalo_entre_ciclos_dias')->nullable();

            $table->boolean('amenorrea')->default(false);
            $table->boolean('oligomenorrea')->default(false);
            $table->boolean('sangrado_abundante')->default(false);
            $table->boolean('dolor_menstrual')->default(false);
            $table->boolean('sospecha_anovulacion')->default(false);

            $table->decimal('progesterona_lutea', 8, 2)->nullable();
            $table->boolean('confirma_anovulacion_por_progesterona')->default(false);

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
        Schema::dropIfExists('historia_menstrual');
    }
};