<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluaciones_ecograficas', function (Blueprint $table) {
            $table->id('id_ecografia');

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

            $table->date('fecha_ecografia');

            $table->string('tipo_ecografia')->nullable();

            $table->decimal('volumen_ovario_derecho', 8, 2)->nullable();
            $table->decimal('volumen_ovario_izquierdo', 8, 2)->nullable();

            $table->unsignedSmallInteger('foliculos_ovario_derecho')->nullable();
            $table->unsignedSmallInteger('foliculos_ovario_izquierdo')->nullable();

            $table->boolean('morfologia_compatible_pmos')->default(false);
            $table->boolean('distribucion_periferica')->default(false);

            $table->string('archivo_informe')->nullable();

            $table->text('observaciones')->nullable();
            $table->string('estado')->default('registrada');

            $table->timestamps();
            $table->softDeletes();

            $table->index(['id_paciente', 'fecha_ecografia']);
            $table->index('id_consulta_endocrinologica');
            $table->index('id_endocrinologo');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluaciones_ecograficas');
    }
};