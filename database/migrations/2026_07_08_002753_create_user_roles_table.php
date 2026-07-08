<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id('id_user_rol');

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('id_rol')
                ->constrained('roles', 'id_rol')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string('estado')->default('activo');

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'id_rol']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_roles');
    }
};