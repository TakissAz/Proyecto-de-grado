<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dias_plan_alimentario', function (Blueprint $table) {
            $table->bigIncrements('id_dia_plan_alimentario');
            $table->foreignId('id_plan_alimentario')
                ->constrained('planes_alimentarios', 'id_plan_alimentario')
                ->cascadeOnDelete();
            $table->integer('numero_dia');
            $table->string('nombre_dia')->nullable();
            $table->date('fecha')->nullable();
            $table->decimal('calorias_totales', 8, 2)->nullable();
            $table->decimal('proteinas_totales', 8, 2)->nullable();
            $table->decimal('carbohidratos_totales', 8, 2)->nullable();
            $table->decimal('grasas_totales', 8, 2)->nullable();
            $table->decimal('fibra_total', 8, 2)->nullable();
            $table->text('observaciones')->nullable();
            $table->string('estado')->default('activo');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['id_plan_alimentario', 'numero_dia']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dias_plan_alimentario');
    }
};
