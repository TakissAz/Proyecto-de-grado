<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluaciones_fisicas_endocrinas', function (Blueprint $table) {
            $table->id('id_evaluacion_fisica');

            $table->foreignId('id_consulta_endocrinologica')
                ->constrained('consultas_endocrinologicas', 'id_consulta_endocrinologica')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('id_paciente')
                ->constrained('pacientes', 'id_paciente')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->decimal('peso', 6, 2)->nullable();
            $table->decimal('talla', 5, 2)->nullable();
            $table->decimal('imc', 5, 2)->nullable();

            $table->decimal('circunferencia_cintura', 6, 2)->nullable();
            $table->decimal('circunferencia_cadera', 6, 2)->nullable();
            $table->decimal('indice_cintura_cadera', 5, 2)->nullable();

            $table->unsignedSmallInteger('presion_sistolica')->nullable();
            $table->unsignedSmallInteger('presion_diastolica')->nullable();

            $table->boolean('acantosis_nigricans')->default(false);
            $table->boolean('skin_tags')->default(false);
            $table->boolean('galactorrea')->default(false);

            $table->boolean('hirsutismo_visible')->default(false);
            $table->unsignedTinyInteger('puntaje_ferriman_gallwey')->nullable();

            $table->boolean('acne_visible')->default(false);
            $table->boolean('alopecia_visible')->default(false);

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
        Schema::dropIfExists('evaluaciones_fisicas_endocrinas');
    }
};