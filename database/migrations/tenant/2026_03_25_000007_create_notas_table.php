<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estudiante_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('materia_id')->constrained('materias')->cascadeOnDelete();
            $table->foreignId('unidad_id')->constrained('unidades')->cascadeOnDelete();
            $table->foreignId('seccion_id')->constrained('secciones')->cascadeOnDelete();
            $table->foreignId('catedratico_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('nota', 5, 2)->nullable(); // Ej: 87.50
            $table->text('observaciones')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Un estudiante solo puede tener una nota por materia/unidad/sección
            $table->unique(
                ['estudiante_id', 'materia_id', 'unidad_id', 'seccion_id'],
                'notas_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notas');
    }
};
