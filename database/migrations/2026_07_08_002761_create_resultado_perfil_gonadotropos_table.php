<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resultados_perfil_gonadotropo', function (Blueprint $table) {
            $table->id('id_perfil_gonadotropo');

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

            $table->decimal('lh', 8, 2)->nullable();
            $table->decimal('fsh', 8, 2)->nullable();
            $table->decimal('relacion_lh_fsh', 8, 2)->nullable();
            $table->decimal('estradiol', 8, 2)->nullable();

            $table->decimal('progesterona', 8, 2)->nullable();
            $table->unsignedSmallInteger('progesterona_dia_ciclo')->nullable();
            $table->string('progesterona_fase_ciclo')->nullable();

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
        Schema::dropIfExists('resultados_perfil_gonadotropo');
    }
};