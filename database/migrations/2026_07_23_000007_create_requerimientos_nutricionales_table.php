<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('requerimientos_nutricionales', function (Blueprint $table) {
            $table->bigIncrements('id_requerimiento_nutricional');
            $table->unsignedBigInteger('id_paciente');
            $table->unsignedBigInteger('id_nutricionista');
            $table->unsignedBigInteger('id_consulta_nutricional')->nullable();
            $table->unsignedBigInteger('id_evaluacion_nutricional');
            $table->unsignedBigInteger('id_objetivo_nutricional')->nullable();
            $table->date('fecha_calculo');
            $table->decimal('peso_referencia', 8, 2);
            $table->decimal('talla_referencia', 5, 2);
            $table->unsignedSmallInteger('edad_referencia')->nullable();
            $table->string('nivel_actividad', 40)->nullable();
            $table->decimal('factor_actividad', 4, 3);
            $table->decimal('tmb', 10, 2);
            $table->decimal('get', 10, 2);
            $table->decimal('ajuste_calorico', 10, 2)->default(0);
            $table->decimal('calorias_objetivo', 10, 2);
            $table->decimal('proteinas_diarias', 10, 2);
            $table->decimal('carbohidratos_diarios', 10, 2);
            $table->decimal('grasas_diarias', 10, 2);
            $table->decimal('fibra_diaria', 10, 2)->default(25);
            $table->decimal('porcentaje_proteinas', 5, 2)->default(30);
            $table->decimal('porcentaje_carbohidratos', 5, 2)->default(35);
            $table->decimal('porcentaje_grasas', 5, 2)->default(35);
            $table->string('metodo_calculo', 60)->default('mifflin_st_jeor');
            $table->text('observaciones')->nullable();
            $table->boolean('estado')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('id_paciente')->references('id_paciente')->on('pacientes')->restrictOnDelete();
            $table->foreign('id_nutricionista')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('id_consulta_nutricional')->references('id_consulta_nutricional')->on('consultas_nutricionales')->restrictOnDelete();
            $table->foreign('id_evaluacion_nutricional')->references('id_evaluacion_nutricional')->on('evaluaciones_nutricionales')->restrictOnDelete();
            $table->foreign('id_objetivo_nutricional')->references('id_objetivo_nutricional')->on('objetivos_nutricionales')->restrictOnDelete();
            $table->index('id_paciente');
            $table->index('id_nutricionista');
            $table->index('id_consulta_nutricional');
            $table->index('id_evaluacion_nutricional');
            $table->index('id_objetivo_nutricional');
            $table->index('fecha_calculo');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('requerimientos_nutricionales');
    }
};
