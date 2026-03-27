<?php

declare(strict_types=1);

use App\Http\Controllers\BitacoraController;
use App\Http\Controllers\CatedraticoController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EstudianteController;
use App\Http\Controllers\MateriaController;
use App\Http\Controllers\NotaController;
use App\Http\Controllers\NotificacionController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\RolesPermisosController;
use App\Http\Controllers\SeccionController;
use App\Http\Controllers\UnidadController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| Tenant Routes — CopoSchool
|--------------------------------------------------------------------------
*/

Route::middleware([
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
    'web',
])->group(function () {

    Route::redirect('/', '/dashboard');
    Route::redirect('/admin', '/dashboard');

    Route::middleware(['auth', 'verified'])->group(function () {

        // ===== DASHBOARD =====
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // ===== USUARIOS =====
        Route::get('usuarios/buscar', [UserController::class, 'search'])->name('usuarios.buscar');
        Route::post('usuarios/{usuario}/restore', [UserController::class, 'restore'])->name('usuarios.restore');
        Route::post('usuarios/{usuario}/logout', [UserController::class, 'logoutUser'])->name('usuarios.logout');
        Route::resource('usuarios', UserController::class)->names('usuarios');
        Route::impersonate();

        // ===== ESTUDIANTES =====
        Route::post('estudiantes/{estudiante}/restore', [EstudianteController::class, 'restore'])->name('estudiantes.restore');
        Route::get('estudiantes/{estudiante}/notas', [EstudianteController::class, 'notas'])->name('estudiantes.notas');
        Route::resource('estudiantes', EstudianteController::class)
            ->names('estudiantes')
            ->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);

        // ===== CATEDRÁTICOS =====
        Route::post('catedraticos/{catedratico}/restore', [CatedraticoController::class, 'restore'])->name('catedraticos.restore');
        Route::get('catedraticos/{catedratico}/asignaciones', [CatedraticoController::class, 'asignaciones'])->name('catedraticos.asignaciones');
        Route::post('catedraticos/{catedratico}/asignaciones/toggle', [CatedraticoController::class, 'toggleAsignacion'])->name('catedraticos.asignaciones.toggle');
        Route::resource('catedraticos', CatedraticoController::class)
            ->names('catedraticos')
            ->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);

        // ===== SECCIONES =====
        Route::post('secciones/{seccion}/restore', [SeccionController::class, 'restore'])->name('secciones.restore');
        Route::get('secciones/{seccion}/inscribir', [SeccionController::class, 'inscribir'])->name('secciones.inscribir');
        Route::post('secciones/{seccion}/inscribir/toggle', [SeccionController::class, 'toggleEstudiante'])->name('secciones.inscribir.toggle');
        Route::get('secciones/{seccion}/materias', [SeccionController::class, 'asignarMaterias'])->name('secciones.asignar-materias');
        Route::post('secciones/{seccion}/materias/toggle', [SeccionController::class, 'toggleMateria'])->name('secciones.materias.toggle');
        Route::post('secciones/{seccion}/materias/catedratico', [SeccionController::class, 'updateCatedratico'])->name('secciones.materias.catedratico');
        Route::resource('secciones', SeccionController::class)->names('secciones');

        // ===== MATERIAS =====
        Route::post('materias/{materia}/restore', [MateriaController::class, 'restore'])->name('materias.restore');
        Route::resource('materias', MateriaController::class)->names('materias');

        // ===== UNIDADES =====
        Route::post('unidades/{unidad}/restore', [UnidadController::class, 'restore'])->name('unidades.restore');
        Route::resource('unidades', UnidadController::class)->names('unidades');

        // ===== NOTAS =====
        Route::post('notas/bulk', [NotaController::class, 'bulkStore'])->name('notas.bulk-store');
        Route::get('notas/{nota}/historial', [NotaController::class, 'historial'])->name('notas.historial');
        Route::get('notas', [EstudianteController::class, 'calificaciones'])->name('notas.index');

        // ===== REPORTES =====
        Route::get('reportes', [ReporteController::class, 'index'])->name('reportes.index');
        Route::get('reportes/ficha/{estudiante}', [ReporteController::class, 'fichaEstudiante'])->name('reportes.ficha');
        Route::get('reportes/fichas-seccion', [ReporteController::class, 'fichasSeccion'])->name('reportes.fichas-seccion');
        Route::get('reportes/resumen-rendimiento', [ReporteController::class, 'resumenRendimiento'])->name('reportes.resumen-rendimiento');
        Route::get('reportes/lista-inscritos', [ReporteController::class, 'listaInscritos'])->name('reportes.lista-inscritos');

        // ===== BITÁCORA (Sistema) =====
        Route::get('bitacora/exportar', [BitacoraController::class, 'exportar'])->name('bitacora.exportar');
        Route::resource('bitacora', BitacoraController::class)->names('bitacora');


        // ===== ROLES Y PERMISOS =====
        Route::resource('roles-permisos', RolesPermisosController::class)
            ->names('roles-permisos')
            ->parameter('roles-permisos', 'role');

        // ===== NOTIFICACIONES =====
        Route::prefix('notificaciones')->name('notificaciones.')->group(function () {
            Route::get('/', [NotificacionController::class, 'index'])->name('index');
            Route::get('/unread', [NotificacionController::class, 'unread'])->name('unread');
            Route::post('/{id}/mark-as-read', [NotificacionController::class, 'markAsRead'])->name('mark-as-read');
            Route::post('/mark-all-as-read', [NotificacionController::class, 'markAllAsRead'])->name('mark-all-as-read');
            Route::delete('/{id}', [NotificacionController::class, 'destroy'])->name('destroy');
            Route::delete('/delete-all', [NotificacionController::class, 'deleteAll'])->name('delete-all');
        });

        require __DIR__.'/settings.php';
    });

    require __DIR__.'/auth.php';
});
