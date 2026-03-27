<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('configuraciones', function (Blueprint $table) {
            $table->string('codigo_establecimiento')->nullable();
            $table->string('nivel_educativo')->nullable();
            $table->string('director_nombre')->nullable();
            $table->string('firma_cargo')->nullable()->default('Director(a)');
            $table->text('encabezado_impresion')->nullable();
            $table->string('pie_impresion')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('configuraciones', function (Blueprint $table) {
            $table->dropColumn([
                'codigo_establecimiento',
                'nivel_educativo',
                'director_nombre',
                'firma_cargo',
                'encabezado_impresion',
                'pie_impresion',
            ]);
        });
    }
};
