<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pacientes', function (Blueprint $table) {
            $table->id('id_paciente');

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string('ci', 30)->unique();

            $table->date('fecha_nacimiento');

            // El sistema solo trabajará con pacientes femeninas.
            $table->string('sexo')->default('femenino');

            $table->string('telefono', 30)->nullable();
            $table->string('direccion')->nullable();
            $table->string('ocupacion')->nullable();
            $table->string('estado_civil')->nullable();

            $table->date('fecha_registro')->nullable();

            $table->string('estado')->default('activo');
            $table->text('observaciones')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('estado');
            $table->index('fecha_nacimiento');
        });

        DB::statement("
            ALTER TABLE pacientes
            ADD CONSTRAINT chk_pacientes_sexo_femenino
            CHECK (sexo = 'femenino')
        ");
    }

    public function down(): void
    {
        Schema::dropIfExists('pacientes');
    }
};