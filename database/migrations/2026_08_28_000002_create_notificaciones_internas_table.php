<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('notificaciones_internas', function (Blueprint $table) {
            $table->id('id_notificacion_interna');
            $table->foreignId('id_usuario_destino')->constrained('users')->cascadeOnDelete();
            $table->string('tipo', 80);
            $table->string('titulo', 180);
            $table->text('mensaje');
            $table->json('data')->nullable();
            $table->boolean('leida')->default(false);
            $table->timestamp('fecha_lectura')->nullable();
            $table->string('url_destino')->nullable();
            $table->string('prioridad', 20)->default('normal');
            $table->string('estado', 20)->default('activo');
            $table->timestamps();
            $table->softDeletes();
            $table->index(['id_usuario_destino', 'leida', 'estado'], 'notificaciones_usuario_estado_idx');
        });
    }

    public function down(): void { Schema::dropIfExists('notificaciones_internas'); }
};
