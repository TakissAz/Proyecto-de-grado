<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultas_endocrinologicas', function (Blueprint $table) {
            $table->id('id_consulta_endocrinologica');

            $table->foreignId('id_paciente')
                ->constrained('pacientes', 'id_paciente')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('id_endocrinologo')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->date('fecha_consulta');

            $table->string('motivo_consulta');
            $table->boolean('sospecha_pmos')->default(false);
            $table->boolean('sospecha_resistencia_insulina')->default(false);

            $table->text('observaciones_generales')->nullable();
            $table->string('estado')->default('abierta');

            $table->timestamps();
            $table->softDeletes();

            $table->index(['id_paciente', 'fecha_consulta']);
            $table->index(['id_endocrinologo', 'fecha_consulta']);
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultas_endocrinologicas');
    }
};