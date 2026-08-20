<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('planes_alimentarios', function (Blueprint $table) {
            $table->bigIncrements('id_plan_alimentario');
            $table->foreignId('id_paciente')->constrained('pacientes', 'id_paciente')->restrictOnDelete();
            $table->foreignId('id_nutricionista')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('id_recomendacion_nutricional_experta')->nullable()
                ->constrained('recomendaciones_nutricionales_expertas', 'id_recomendacion_nutricional_experta')
                ->nullOnDelete();
            $table->foreignId('id_requerimiento_nutricional')->nullable()
                ->constrained('requerimientos_nutricionales', 'id_requerimiento_nutricional')
                ->nullOnDelete();
            $table->string('nombre');
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->integer('duracion_dias')->default(7);
            $table->string('objetivo_plan')->nullable();
            $table->decimal('calorias_objetivo', 8, 2)->nullable();
            $table->decimal('proteinas_objetivo', 8, 2)->nullable();
            $table->decimal('carbohidratos_objetivo', 8, 2)->nullable();
            $table->decimal('grasas_objetivo', 8, 2)->nullable();
            $table->decimal('fibra_objetivo', 8, 2)->nullable();
            $table->decimal('calorias_totales', 10, 2)->nullable();
            $table->decimal('proteinas_totales', 10, 2)->nullable();
            $table->decimal('carbohidratos_totales', 10, 2)->nullable();
            $table->decimal('grasas_totales', 10, 2)->nullable();
            $table->decimal('fibra_total', 10, 2)->nullable();
            $table->string('estado_plan')->default('borrador');
            $table->boolean('generado_por_sistema_experto')->default(false);
            $table->text('observaciones')->nullable();
            $table->timestamp('fecha_aprobacion')->nullable();
            $table->foreignId('aprobado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->string('estado')->default('activo');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['id_paciente', 'estado']);
            $table->index('estado_plan');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('planes_alimentarios');
    }
};
