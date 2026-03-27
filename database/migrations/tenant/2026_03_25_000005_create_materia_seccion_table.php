<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabla pivote que relaciona una materia con una sección y asigna
     * el catedrático responsable de esa materia en esa sección.
     */
    public function up(): void
    {
        Schema::create('materia_seccion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('materia_id')->constrained('materias')->cascadeOnDelete();
            $table->foreignId('seccion_id')->constrained('secciones')->cascadeOnDelete();
            $table->foreignId('catedratico_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['materia_id', 'seccion_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materia_seccion');
    }
};
