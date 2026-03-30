<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('configuraciones', function (Blueprint $table) {
            $table->string('nombre_completo')->nullable()->after('nombre_empresa');
            $table->string('abreviatura')->nullable()->after('nombre_completo');
            $table->integer('ciclo_actual')->nullable()->after('abreviatura');
            $table->string('descripcion_establecimiento')->nullable()->after('abreviatura'); // Line 2 of header
            $table->string('descripcion_ciclo')->nullable()->after('descripcion_establecimiento'); // Line 5 of header
            $table->string('sub_director_nombre')->nullable()->after('director_nombre');
            $table->string('coordinador_nombre')->nullable()->after('sub_director_nombre');
        });
    }

    public function down(): void
    {
        Schema::table('configuraciones', function (Blueprint $table) {
            $table->dropColumn([
                'nombre_completo',
                'abreviatura',
                'ciclo_actual',
                'descripcion_establecimiento',
                'descripcion_ciclo',
                'sub_director_nombre',
                'coordinador_nombre',
            ]);
        });
    }
};
