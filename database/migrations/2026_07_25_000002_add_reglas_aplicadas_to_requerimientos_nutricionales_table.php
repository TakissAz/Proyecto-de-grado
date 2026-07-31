<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('requerimientos_nutricionales', function (Blueprint $table) {
            $table->json('reglas_aplicadas')->nullable()->after('observaciones');
        });
    }

    public function down(): void
    {
        Schema::table('requerimientos_nutricionales', function (Blueprint $table) {
            $table->dropColumn('reglas_aplicadas');
        });
    }
};
