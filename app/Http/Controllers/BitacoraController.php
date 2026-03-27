<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\PersistsFilters;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Activitylog\Models\Activity;

class BitacoraController extends Controller
{
    use PersistsFilters;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('gestionar roles');

        $query = Activity::query()
            ->with(['causer:id,name,email', 'subject']);

        // ===== PERSISTENCIA DE FILTROS Y PAGINACIÓN =====
        $persisted = $this->applyPersistedFilters('bitacora', ['search', 'search_field', 'log_name', 'causer_id', 'subject_type', 'fecha_desde', 'fecha_hasta'], 'bitacora.index', 'created_at', 'desc', 15);

        if ($persisted['redirect']) {
            return $persisted['redirect'];
        }

        $filters = $persisted['filters'];

        // Búsqueda optimizada: si es numérico, buscar por ID exacto primero
        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $searchField = $filters['search_field'] ?? 'all';

            $query->where(function ($q) use ($search, $searchField) {
                if ($searchField === 'all' || empty($searchField)) {
                    // Búsqueda genérica: buscar en todos los campos
                    if (is_numeric($search)) {
                        $q->where('id', $search)
                            ->orWhere('description', 'like', "%{$search}%")
                            ->orWhere('log_name', 'like', "%{$search}%");
                    } else {
                        // Para texto, usar LIKE
                        $q->where('description', 'like', "%{$search}%")
                            ->orWhere('log_name', 'like', "%{$search}%")
                            ->orWhereHas('causer', function ($userQuery) use ($search) {
                                $userQuery->where('name', 'like', "%{$search}%")
                                    ->orWhere('email', 'like', "%{$search}%");
                            });
                    }
                } else {
                    // Búsqueda específica por campo
                    match ($searchField) {
                        'id' => $q->where('id', is_numeric($search) ? $search : '0'),
                        'description' => $q->where('description', 'like', "%{$search}%"),
                        'causer' => $q->whereHas('causer', function ($userQuery) use ($search) {
                            $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        }),
                        'subject_type' => $q->where('subject_type', 'like', "%{$search}%"),
                        default => $q->where('id', is_numeric($search) ? $search : '0'),
                    };
                }
            });
        }

        if (! empty($filters['log_name'])) {
            $query->where('log_name', $filters['log_name']);
        }

        if (! empty($filters['causer_id'])) {
            $query->where('causer_id', $filters['causer_id']);
        }

        if (! empty($filters['subject_type'])) {
            $query->where('subject_type', $filters['subject_type']);
        }

        // Optimizar consultas de fecha: usar where en lugar de whereDate para mejor uso de índices
        if (! empty($filters['fecha_desde'])) {
            $query->where('created_at', '>=', $filters['fecha_desde'].' 00:00:00');
        }

        if (! empty($filters['fecha_hasta'])) {
            $query->where('created_at', '<=', $filters['fecha_hasta'].' 23:59:59');
        }

        // Ordenamiento
        $sortBy = $persisted['sortBy'];
        $sortDir = $persisted['sortDir'];

        // Mapeo de campos de ordenamiento
        $sortableMap = [
            'id' => 'id',
            'log_name' => 'log_name',
            'description' => 'description',
            'causer.name' => 'causer_id',
            'subject_type' => 'subject_type',
            'subject_id' => 'subject_id',
            'created_at' => 'created_at',
        ];

        $sortField = $sortableMap[$sortBy] ?? 'created_at';

        // Para campos de relación, necesitamos hacer join o usar subquery
        if ($sortBy === 'causer.name') {
            $query->join('users', 'activity_log.causer_id', '=', 'users.id')
                ->orderBy('users.name', $sortDir)
                ->select('activity_log.*');
        } else {
            $query->orderBy($sortField, $sortDir);
        }

        // Paginación
        $perPage = $persisted['perPage'];
        $activities = $query->paginate($perPage)->withQueryString();

        // Datos para filtros - optimizado: limitar usuarios
        $logNames = Activity::distinct()->pluck('log_name')->filter()->values();
        $subjectTypes = Activity::distinct()->pluck('subject_type')->filter()->values();
        // Optimizado: solo usuarios que han creado bitacora
        $users = \App\Models\User::select('id', 'name', 'email')
            ->whereIn('id', function ($query) {
                $query->select('causer_id')
                    ->from('activity_log')
                    ->whereNotNull('causer_id');
            })
            ->orderBy('name')
            ->limit(100)
            ->get();

        return Inertia::render('bitacora/Index', [
            'activities' => [
                'data' => $activities->items(),
                'meta' => [
                    'page' => $activities->currentPage(),
                    'lastPage' => $activities->lastPage(),
                    'perPage' => $activities->perPage(),
                    'total' => $activities->total(),
                    'from' => $activities->firstItem(),
                    'to' => $activities->lastItem(),
                    'sortBy' => $request->get('sortBy'),
                    'sortDir' => $request->get('sortDir', 'asc'),
                ],
            ],
            'filters' => [
                'log_names' => $logNames,
                'subject_types' => $subjectTypes,
                'users' => $users,
            ],
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $bitacora)
    {
        $this->authorize('gestionar roles');

        // Buscar la bitacora por ID ya que el route model binding no funciona con Activity de Spatie
        $bitacora = Activity::findOrFail($bitacora);
        $bitacora->load(['causer:id,name,email', 'subject']);

        // Preparar los datos de la bitacora
        $activityData = [
            'id' => $bitacora->id,
            'log_name' => $bitacora->log_name,
            'description' => $bitacora->description,
            'subject_type' => $bitacora->subject_type,
            'event' => $bitacora->event,
            'subject_id' => $bitacora->subject_id,
            'causer_type' => $bitacora->causer_type,
            'causer_id' => $bitacora->causer_id,
            'batch_uuid' => $bitacora->batch_uuid,
            'created_at' => $bitacora->created_at?->toISOString(),
            'updated_at' => $bitacora->updated_at?->toISOString(),
            'causer' => $bitacora->causer ? [
                'id' => $bitacora->causer->id,
                'name' => $bitacora->causer->name,
                'email' => $bitacora->causer->email,
            ] : null,
            'subject' => $bitacora->subject ? (is_array($bitacora->subject) ? $bitacora->subject : $bitacora->subject->toArray()) : null,
        ];

        // Procesar properties
        $properties = $bitacora->properties;
        if ($properties) {
            // Si es un string, decodificarlo
            if (is_string($properties)) {
                $properties = json_decode($properties, true);
            }
            // Si es un array o Collection, convertirlo a array
            if (is_object($properties) && method_exists($properties, 'toArray')) {
                $properties = $properties->toArray();
            }
        }
        $activityData['properties'] = $properties;

        return Inertia::render('bitacora/Show', [
            'activity' => $activityData,
        ]);
    }

    /**
     * Exportar bitacora a Excel
     */
    public function exportar(Request $request)
    {
        $this->authorize('gestionar roles');

        $query = Activity::with(['causer', 'subject']);

        // Aplicar filtros
        if ($request->filled('search')) {
            $search = $request->input('search');
            $searchField = $request->input('search_field', 'all');

            $query->where(function ($q) use ($search, $searchField) {
                if ($searchField === 'all' || empty($searchField)) {
                    $q->where('description', 'like', "%{$search}%")
                        ->orWhere('log_name', 'like', "%{$search}%")
                        ->orWhereHas('causer', function ($userQuery) use ($search) {
                            $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                } else {
                    match ($searchField) {
                        'id' => $q->where('id', is_numeric($search) ? $search : '0'),
                        'description' => $q->where('description', 'like', "%{$search}%"),
                        'causer' => $q->whereHas('causer', function ($userQuery) use ($search) {
                            $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        }),
                        'subject_type' => $q->where('subject_type', 'like', "%{$search}%"),
                        default => $q->where('id', is_numeric($search) ? $search : '0'),
                    };
                }
            });
        }

        if ($request->filled('log_name')) {
            $query->where('log_name', $request->input('log_name'));
        }

        if ($request->filled('causer_id')) {
            $query->where('causer_id', $request->input('causer_id'));
        }

        if ($request->filled('subject_type')) {
            $query->where('subject_type', $request->input('subject_type'));
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('created_at', '>=', $request->input('fecha_desde'));
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('created_at', '<=', $request->input('fecha_hasta'));
        }

        $bitacora = $query->orderBy('created_at', 'desc')->get();

        $encabezados = ['ID', 'Tipo', 'Descripción', 'Usuario', 'Modelo', 'ID Modelo', 'Fecha'];
        $datosExport = [];

        foreach ($bitacora as $bitacora) {
            $datosExport[] = [
                $bitacora->id,
                $bitacora->log_name ?: '-',
                $bitacora->description,
                $bitacora->causer?->name ?: 'Sistema',
                $bitacora->subject_type ? str_replace('App\\Models\\', '', $bitacora->subject_type) : '-',
                $bitacora->subject_id ?: '-',
                $bitacora->created_at->format('d/m/Y H:i:s'),
            ];
        }

        return Excel::download(
            new \App\Exports\GenericExport($datosExport, $encabezados),
            'bitacora-'.now()->format('Y-m-d-H-i-s').'.xlsx'
        );
    }
}
