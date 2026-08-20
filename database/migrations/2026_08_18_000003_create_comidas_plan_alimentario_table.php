<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comidas_plan_alimentario', function (Blueprint $table) {
            $table->bigIncrements('id_comida_plan_alimentario');
            $table->foreignId('id_dia_plan_alimentario')
                ->constrained('dias_plan_alimentario', 'id_dia_plan_alimentario')
                ->cascadeOnDelete();
            $table->string('tipo_comida');
            $table->time('hora_sugerida')->nullable();
            $table->string('nombre_comida')->nullable();
            $table->decimal('calorias_totales', 8, 2)->nullable();
            $table->decimal('proteinas_totales', 8, 2)->nullable();
            $table->decimal('carbohidratos_totales', 8, 2)->nullable();
            $table->decimal('grasas_totales', 8, 2)->nullable();
            $table->decimal('fibra_total', 8, 2)->nullable();
            $table->text('observaciones')->nullable();
            $table->integer('orden')->default(1);
            $table->string('estado')->default('activo');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['id_dia_plan_alimentario', 'orden']);
            $table->index('tipo_comida');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comidas_plan_alimentario');
    }
};
