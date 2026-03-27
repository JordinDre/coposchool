<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabla pivote que inscribe a los estudiantes en una sección.
     */
    public function up(): void
    {
        Schema::create('seccion_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seccion_id')->constrained('secciones')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['seccion_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seccion_user');
    }
};
