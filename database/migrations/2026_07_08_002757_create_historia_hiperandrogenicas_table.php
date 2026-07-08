<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('historia_hiperandrogenica', function (Blueprint $table) {
            $table->id('id_historia_hiperandrogenica');

            $table->foreignId('id_consulta_endocrinologica')
                ->constrained('consultas_endocrinologicas', 'id_consulta_endocrinologica')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('id_paciente')
                ->constrained('pacientes', 'id_paciente')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->boolean('acne')->default(false);
            $table->string('acne_grado')->default('no_aplica');

            $table->boolean('hirsutismo')->default(false);
            $table->string('hirsutismo_zona')->nullable();
            $table->unsignedTinyInteger('puntaje_ferriman_gallwey')->nullable();

            $table->boolean('alopecia_androgenica')->default(false);
            $table->boolean('seborrea')->default(false);

            $table->string('inicio_sintomas')->nullable();
            $table->string('progresion_sintomas')->nullable();

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
        Schema::dropIfExists('historia_hiperandrogenica');
    }
};