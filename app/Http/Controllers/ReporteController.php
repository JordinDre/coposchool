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

        return Inertia::render('reportes/Index', [
            'secciones'          => $secciones,
            'canGenerarSeccion'  => $user->can('generar boleta seccion'),
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

        $pdf      = Pdf::loadView('pdf.ficha_estudiante', compact('estudiante', 'notas', 'unidades'))
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
        $notas         = Nota::whereIn('estudiante_id', $estudianteIds)
            ->get()
            ->groupBy('estudiante_id');

        $unidades = Unidad::whereNull('deleted_at')
            ->orderBy('ciclo_escolar', 'desc')
            ->orderBy('orden')
            ->get();

        $pdf      = Pdf::loadView('pdf.fichas_seccion', compact('seccion', 'estudiantes', 'notas', 'unidades'))
            ->setPaper('letter', 'portrait');
        $filename = 'fichas-'.str($seccion->nombre)->slug().'-'.$seccion->ciclo_escolar.'.pdf';

        return $this->agregarHeadersIframe($pdf->stream($filename));
    }

    /**
     * Resumen de rendimiento por materia para una sección — landscape PDF.
     */
    public function resumenRendimiento(Request $request): Response
    {
        Gate::authorize('generar boleta seccion');

        $request->validate(['seccion_id' => 'required|integer|exists:secciones,id']);

        $seccion = Seccion::with(['materias' => function ($q) {
            $q->whereNull('materias.deleted_at')->orderBy('materias.nombre');
        }])->findOrFail($request->seccion_id);

        $unidades = Unidad::whereNull('deleted_at')
            ->where('ciclo_escolar', $seccion->ciclo_escolar)
            ->orderBy('orden')
            ->get();

        $resumen = $seccion->materias->map(function ($materia) use ($seccion, $unidades): array {
            $porUnidad = [];
            foreach ($unidades as $unidad) {
                $avg = Nota::where('seccion_id', $seccion->id)
                    ->where('materia_id', $materia->id)
                    ->where('unidad_id', $unidad->id)
                    ->whereNotNull('nota')
                    ->avg('nota');
                $porUnidad[$unidad->id] = $avg !== null ? round((float) $avg, 1) : null;
            }

            $todas = Nota::where('seccion_id', $seccion->id)
                ->where('materia_id', $materia->id)
                ->whereNotNull('nota')
                ->pluck('nota')
                ->map(fn ($n) => (float) $n);

            $total     = $todas->count();
            $promedio  = $total > 0 ? round($todas->avg(), 1) : null;
            $aprobados = $todas->filter(fn ($n) => $n >= 60)->count();

            return [
                'materia'       => ['id' => $materia->id, 'nombre' => $materia->nombre, 'codigo' => $materia->codigo],
                'por_unidad'    => $porUnidad,
                'promedio'      => $promedio,
                'pct_aprobados' => $total > 0 ? (int) round($aprobados / $total * 100) : null,
                'registradas'   => $total,
            ];
        });

        $pdf = Pdf::loadView('pdf.resumen_rendimiento', compact('seccion', 'unidades', 'resumen'))
            ->setPaper('letter', 'landscape');
        $filename = 'resumen-rendimiento-'.str($seccion->nombre)->slug().'-'.$seccion->ciclo_escolar.'.pdf';

        return $this->agregarHeadersIframe($pdf->stream($filename));
    }

    /**
     * Lista de estudiantes inscritos en una sección — portrait PDF.
     */
    public function listaInscritos(Request $request): Response
    {
        Gate::authorize('generar boleta seccion');

        $request->validate(['seccion_id' => 'required|integer|exists:secciones,id']);

        $seccion = Seccion::findOrFail($request->seccion_id);

        $estudiantes = User::withTrashed()
            ->whereHas('secciones', fn ($q) => $q->where('secciones.id', $seccion->id))
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'telefono', 'deleted_at']);

        $pdf = Pdf::loadView('pdf.lista_inscritos', compact('seccion', 'estudiantes'))
            ->setPaper('letter', 'portrait');
        $filename = 'inscritos-'.str($seccion->nombre)->slug().'-'.$seccion->ciclo_escolar.'.pdf';

        return $this->agregarHeadersIframe($pdf->stream($filename));
    }

    /**
     * Adds headers required for safe iframe display of the PDF.
     */
    private function agregarHeadersIframe(Response $response): Response
    {
        return $response->withHeaders([
            'X-Frame-Options'         => 'SAMEORIGIN',
            'Content-Security-Policy' => "frame-ancestors 'self'",
        ]);
    }
}
