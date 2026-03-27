<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('secciones', function (Blueprint $table) {
            $table->id();
            $table->string('nombre'); // Ej: "Primero Básico A"
            $table->enum('ciclo', [
                'pre-primaria',
                'kinder',
                'primaria',
                'basico',
                'diversificado',
            ]);
            $table->unsignedSmallInteger('ciclo_escolar'); // Ej: 2026
            $table->string('descripcion')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('secciones');
    }
};
