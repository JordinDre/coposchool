<?php

namespace App\Http\Controllers;

use App\Models\Nota;
use App\Models\Seccion;
use App\Models\Unidad;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ReporteController extends Controller
{
    /**
     * Reportes index — shows all available report generators.
     */
    public function index(): \Inertia\Response
    {
        $user = Auth::user();

        abort_unless(
            $user->can('generar boleta individual') || $user->can('generar boleta seccion'),
            403
        );

        $secciones = Seccion::whereNull('deleted_at')
            ->orderBy('ciclo_escolar', 'desc')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'ciclo', 'ciclo_escolar']);

        $config = \App\Models\Configuracion::cached();
        $unidades = Unidad::whereNull('deleted_at')
            ->orderBy('ciclo_escolar', 'desc')
            ->orderBy('orden')
            ->get(['id', 'nombre', 'orden', 'ciclo_escolar']);

        return Inertia::render('reportes/Index', [
            'secciones' => $secciones,
            'unidades' => $unidades,
            'canGenerarSeccion' => $user->can('generar boleta seccion'),
            'canGenerarIndividual' => $user->can('generar boleta individual'),
        ]);
    }

    /**
     * Individual student ficha PDF — streamed for iframe display.
     */
    public function fichaEstudiante(int $estudianteId): Response
    {
        Gate::authorize('generar boleta individual');

        $estudiante = User::withTrashed()
            ->with(['secciones' => function ($q) {
                $q->with(['materias' => function ($mq) {
                    $mq->whereNull('materias.deleted_at');
                }]);
            }])
            ->findOrFail($estudianteId);

        $notas = Nota::where('estudiante_id', $estudianteId)->get();

        $unidades = Unidad::whereNull('deleted_at')
            ->orderBy('ciclo_escolar', 'desc')
            ->orderBy('orden')
            ->get();

        $configuracion = \App\Models\Configuracion::cached();
        $pdf = Pdf::loadView('pdf.ficha_estudiante', compact('estudiante', 'notas', 'unidades', 'configuracion'))
            ->setPaper('letter', 'portrait');
        $filename = 'ficha-'.str($estudiante->name)->slug().'.pdf';

        return $this->agregarHeadersIframe($pdf->stream($filename));
    }

    /**
     * Batch ficha PDF for all students in a section — streamed for iframe display.
     */
    public function fichasSeccion(Request $request): Response
    {
        Gate::authorize('generar boleta seccion');

        $request->validate(['seccion_id' => 'required|integer|exists:secciones,id']);

        $seccion = Seccion::with(['materias' => function ($q) {
            $q->whereNull('materias.deleted_at')->orderBy('materias.nombre');
        }])->findOrFail($request->seccion_id);

        $estudiantes = User::withTrashed()
            ->whereHas('secciones', fn ($q) => $q->where('secciones.id', $seccion->id))
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'telefono', 'deleted_at']);

        $estudianteIds = $estudiantes->pluck('id');
        $notas = Nota::whereIn('estudiante_id', $estudianteIds)
            ->get()
            ->groupBy('estudiante_id');

        $unidades = Unidad::whereNull('deleted_at')
            ->orderBy('ciclo_escolar', 'desc')
            ->orderBy('orden')
            ->get();

        $configuracion = \App\Models\Configuracion::cached();
        $pdf = Pdf::loadView('pdf.fichas_seccion', compact('seccion', 'estudiantes', 'notas', 'unidades', 'configuracion'))
            ->setPaper('letter', 'portrait');
        $filename = 'fichas-'.str($seccion->nombre)->slug().'-'.$seccion->ciclo_escolar.'.pdf';

        return $this->agregarHeadersIframe($pdf->stream($filename));
    }

    /**
     * View consolidated report in browser.
     */
    public function consolidadoView(Request $request): \Inertia\Response
    {
        Gate::authorize('generar boleta seccion');

        $seccionId = $request->query('seccion_id');
        $unidadId  = $request->query('unidad_id');

        $configuracion = \App\Models\Configuracion::cached();

        // All available sections for the filter
        $secciones = Seccion::whereNull('deleted_at')
            ->orderBy('ciclo_escolar', 'desc')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'ciclo_escolar']);

        // All available units for the filter
        $unidades = Unidad::whereNull('deleted_at')
            ->orderBy('ciclo_escolar', 'desc')
            ->orderBy('orden')
            ->get(['id', 'nombre', 'orden', 'ciclo_escolar']);

        // Default to latest if not provided
        if (!$seccionId && $secciones->count() > 0) {
            $seccionId = $secciones->first()->id;
        }

        if (!$unidadId && $unidades->count() > 0) {
            // Find a unit for the current cycle if possible, otherwise just the first one
            $unidadId = $unidades->where('ciclo_escolar', $configuracion->ciclo_actual)->first()?->id 
                        ?? $unidades->first()?->id;
        }

        // If still no IDs (empty DB), handle gracefully
        if (!$seccionId || !$unidadId) {
            return Inertia::render('reportes/Consolidado', [
                'secciones' => $secciones,
                'unidades' => $unidades,
                'seccion' => null,
                'unidad' => null,
                'materias' => [],
                'estudiantes' => [],
                'notas' => [],
                'configuracion' => $configuracion,
            ]);
        }

        $seccion = Seccion::with(['materias' => function ($q) {
            $q->whereNull('materias.deleted_at')->orderBy('materias.nombre');
        }])->findOrFail($seccionId);

        $unidad = Unidad::findOrFail($unidadId);

        $estudiantes = User::withTrashed()
            ->whereHas('secciones', fn ($q) => $q->where('secciones.id', $seccion->id))
            ->orderBy('name')
            ->get(['id', 'name', 'deleted_at']);

        $estudianteIds = $estudiantes->pluck('id');
        
        $notas = Nota::whereIn('estudiante_id', $estudianteIds)
            ->where('seccion_id', $seccion->id)
            ->where('unidad_id', $unidad->id)
            ->get(['estudiante_id', 'materia_id', 'nota']);

        $configuracion = \App\Models\Configuracion::cached();

        return Inertia::render('reportes/Consolidado', [
            'secciones' => $secciones,
            'unidades' => $unidades,
            'seccion' => $seccion,
            'unidad' => $unidad,
            'materias' => $seccion->materias ?? [],
            'estudiantes' => $estudiantes,
            'notas' => $notas,
            'configuracion' => $configuracion,
        ]);
    }

    /**
     * Consolidado completo: todas las materias × todos los bimestres de la sección + FINALES.
     */
    public function consolidadoMaterias(Request $request): \Inertia\Response
    {
        Gate::authorize('generar boleta seccion');

        $seccionId = $request->query('seccion_id');

        $secciones = Seccion::whereNull('deleted_at')
            ->orderBy('ciclo_escolar', 'desc')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'ciclo_escolar']);

        if (! $seccionId && $secciones->count() > 0) {
            $seccionId = $secciones->first()->id;
        }

        if (! $seccionId) {
            return Inertia::render('reportes/ConsolidadoMaterias', [
                'secciones' => $secciones,
                'seccion'   => null,
                'materias'  => [],
                'unidades'  => [],
                'estudiantes' => [],
                'notas'     => [],
            ]);
        }

        $seccion = Seccion::with(['materias' => function ($q) {
            $q->whereNull('materias.deleted_at')->orderBy('materias.nombre');
        }])->findOrFail($seccionId);

        $unidades = Unidad::whereNull('deleted_at')
            ->where('ciclo_escolar', $seccion->ciclo_escolar)
            ->orderBy('orden')
            ->get(['id', 'nombre', 'orden', 'ciclo_escolar']);

        $estudiantes = User::withTrashed()
            ->whereHas('secciones', fn ($q) => $q->where('secciones.id', $seccion->id))
            ->orderBy('name')
            ->get(['id', 'name', 'deleted_at']);

        $notas = Nota::whereIn('estudiante_id', $estudiantes->pluck('id'))
            ->where('seccion_id', $seccion->id)
            ->whereIn('materia_id', $seccion->materias->pluck('id'))
            ->get(['estudiante_id', 'materia_id', 'unidad_id', 'nota']);

        return Inertia::render('reportes/ConsolidadoMaterias', [
            'secciones'   => $secciones,
            'seccion'     => $seccion ? $seccion->only(['id', 'nombre', 'ciclo_escolar']) : null,
            'materias'    => $seccion->materias->map->only(['id', 'nombre']),
            'unidades'    => $unidades,
            'estudiantes' => $estudiantes,
            'notas'       => $notas,
        ]);
    }

    /**
     * Consolidado de notas — Excel con todos los estudiantes × materias de la UNIDAD seleccionada.
     */
    public function consolidado(Request $request): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        Gate::authorize('generar boleta seccion');

        $request->validate([
            'seccion_id' => 'required|integer|exists:secciones,id',
            'unidad_id'  => 'required|integer|exists:unidades,id',
        ]);

        $seccion = Seccion::with(['materias' => function ($q) {
            $q->whereNull('materias.deleted_at')->orderBy('materias.nombre');
        }])->findOrFail($request->seccion_id);

        $unidad = Unidad::findOrFail($request->unidad_id);

        $estudiantes = User::withTrashed()
            ->whereHas('secciones', fn ($q) => $q->where('secciones.id', $seccion->id))
            ->orderBy('name')
            ->get(['id', 'name', 'deleted_at']);

        $estudianteIds = $estudiantes->pluck('id');
        $notas = Nota::whereIn('estudiante_id', $estudianteIds)
            ->where('seccion_id', $seccion->id)
            ->where('unidad_id', $unidad->id)
            ->get()
            ->groupBy('estudiante_id');

        $filename = 'consolidado-'.str($seccion->nombre)->slug().'-'.str($unidad->nombre)->slug().'.xlsx';

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\ConsolidadoExport($seccion, $unidad, $seccion->materias, $estudiantes, $notas),
            $filename,
        );
    }

    /**
     * Adds headers required for safe iframe display of the PDF.
     */
    private function agregarHeadersIframe(Response $response): Response
    {
        return $response->withHeaders([
            'X-Frame-Options' => 'SAMEORIGIN',
            'Content-Security-Policy' => "frame-ancestors 'self'",
        ]);
    }
}
