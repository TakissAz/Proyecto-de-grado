<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('regla_requerimiento_nutricional', function (Blueprint $table) {
            $table->bigIncrements('id_regla_requerimiento_nutricional');
            $table->unsignedBigInteger('id_regla_nutricional');
            $table->unsignedBigInteger('id_requerimiento_nutricional');
            $table->timestamps();

            $table->foreign('id_regla_nutricional')
                ->references('id_regla_nutricional')
                ->on('reglas_nutricionales')
                ->cascadeOnDelete();

            $table->foreign('id_requerimiento_nutricional')
                ->references('id_requerimiento_nutricional')
                ->on('requerimientos_nutricionales')
                ->cascadeOnDelete();

            $table->unique(
                ['id_regla_nutricional', 'id_requerimiento_nutricional'],
                'regla_requerimiento_unico'
            );
            $table->index('id_regla_nutricional');
            $table->index('id_requerimiento_nutricional');
        });

        $this->vincularReglasHistoricas();
    }

    public function down(): void
    {
        Schema::dropIfExists('regla_requerimiento_nutricional');
    }

    /**
     * Conserva la trazabilidad existente y crea los vínculos formales posibles
     * usando el código guardado en el snapshot JSON de cada requerimiento.
     */
    private function vincularReglasHistoricas(): void
    {
        $reglasPorCodigo = DB::table('reglas_nutricionales')
            ->pluck('id_regla_nutricional', 'codigo');

        DB::table('requerimientos_nutricionales')
            ->select('id_requerimiento_nutricional', 'reglas_aplicadas')
            ->whereNotNull('reglas_aplicadas')
            ->orderBy('id_requerimiento_nutricional')
            ->chunkById(100, function ($requerimientos) use ($reglasPorCodigo): void {
                $ahora = now();
                $vinculos = [];

                foreach ($requerimientos as $requerimiento) {
                    $reglas = is_string($requerimiento->reglas_aplicadas)
                        ? json_decode($requerimiento->reglas_aplicadas, true)
                        : $requerimiento->reglas_aplicadas;

                    if (! is_array($reglas)) {
                        continue;
                    }

                    foreach ($reglas as $reglaAplicada) {
                        $codigo = is_array($reglaAplicada)
                            ? ($reglaAplicada['codigo'] ?? null)
                            : null;
                        $reglaId = $codigo ? $reglasPorCodigo->get($codigo) : null;

                        if (! $reglaId) {
                            continue;
                        }

                        $vinculos[] = [
                            'id_regla_nutricional' => $reglaId,
                            'id_requerimiento_nutricional' => $requerimiento->id_requerimiento_nutricional,
                            'created_at' => $ahora,
                            'updated_at' => $ahora,
                        ];
                    }
                }

                if ($vinculos !== []) {
                    DB::table('regla_requerimiento_nutricional')->insertOrIgnore($vinculos);
                }
            }, 'id_requerimiento_nutricional');
    }
};
