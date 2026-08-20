<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('componentes_comida_plan', function (Blueprint $table) {
            $table->bigIncrements('id_componente_comida_plan');
            $table->foreignId('id_comida_plan_alimentario')
                ->constrained('comidas_plan_alimentario', 'id_comida_plan_alimentario')
                ->cascadeOnDelete();
            $table->string('tipo_componente');
            $table->foreignId('id_alimento')->nullable()
                ->constrained('alimentos', 'id_alimento')->nullOnDelete();
            $table->foreignId('id_receta')->nullable()
                ->constrained('recetas', 'id_receta')->nullOnDelete();
            $table->string('nombre_manual')->nullable();
            $table->decimal('cantidad', 8, 2)->nullable();
            $table->string('unidad')->nullable();
            $table->decimal('calorias', 8, 2)->nullable();
            $table->decimal('proteinas', 8, 2)->nullable();
            $table->decimal('carbohidratos', 8, 2)->nullable();
            $table->decimal('grasas', 8, 2)->nullable();
            $table->decimal('fibra', 8, 2)->nullable();
            $table->text('observaciones')->nullable();
            $table->integer('orden')->default(1);
            $table->string('estado')->default('activo');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['id_comida_plan_alimentario', 'orden']);
            $table->index('tipo_componente');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('componentes_comida_plan');
    }
};
