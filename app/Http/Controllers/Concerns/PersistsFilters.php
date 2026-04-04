<?php

namespace App\Http\Controllers\Concerns;

trait PersistsFilters
{
    /**
     * Obtener columnas visibles desde request o sesión
     *
     * @return array|null Array de columnas visibles o null si no se especificaron
     */
    protected function getVisibleColumns(string $sessionPrefix): ?array
    {
        $columnsKey = "{$sessionPrefix}_visible_columns";

        // Si vienen en el request, guardarlas en sesión
        if (request()->filled('columnas')) {
            $columnas = explode(',', request()->input('columnas'));
            $columnas = array_filter($columnas, fn ($col) => $col !== 'actions' && ! empty($col));
            session([$columnsKey => $columnas]);

            return ! empty($columnas) ? $columnas : null;
        }

        // Si no vienen en el request, leer de sesión
        $columnas = session($columnsKey, null);

        return $columnas;
    }

    /**
     * Aplicar persistencia de filtros y paginación automáticamente
     *
     * @return array ['filters' => array, 'sortBy' => string, 'sortDir' => string, 'perPage' => int, 'visibleColumns' => array|null, 'redirect' => RedirectResponse|null]
     */
    protected function applyPersistedFilters(
        string $sessionPrefix,
        array $filterKeys,
        ?string $routeName = null,
        string $defaultSortBy = 'created_at',
        string $defaultSortDir = 'desc',
        int $defaultPerPage = 10
    ): array {
        // === FILTROS ===
        $hasAnyFilter = false;
        foreach ($filterKeys as $key) {
            if (request()->has($key)) {
                $hasAnyFilter = true;
                break;
            }
        }

        // Inicializar variables
        $redirect = null;
        $filters = [];

        // Detectar si se están limpiando los filtros explícitamente
        $clearFilters = request()->has('_clear') && request()->get('_clear') == '1';

        // Detectar si se está removiendo un filtro específico
        $removeFilter = request()->has('_remove_filter') ? request()->get('_remove_filter') : null;

        if ($clearFilters) {
            // Redirigir a la ruta limpia sin ningún filtro
            $redirect = redirect()->route($routeName);
        } elseif ($removeFilter) {
            // Redirigir sin el filtro removido
            $remainingFilters = array_filter(
                request()->only($filterKeys),
                fn ($v, $k) => $k !== $removeFilter && $v !== null && $v !== '',
                ARRAY_FILTER_USE_BOTH
            );
            $redirectParams = array_merge(
                $remainingFilters,
                request()->only(['page', 'sortBy', 'sortDir', 'perPage', 'columnas'])
            );
            $redirect = redirect()->route($routeName, $redirectParams);
            $filters = $remainingFilters;
        } elseif ($hasAnyFilter) {
            // Si hay filtros en la URL, usarlos directamente
            $filters = request()->only($filterKeys);
            $filters = array_filter($filters, fn ($value) => $value !== null && $value !== '');
        } else {
            // Sin filtros en la URL → estado limpio
            $filters = [];
        }

        // === PAGINACIÓN Y ORDENAMIENTO ===
        $sortByKey = "{$sessionPrefix}_sortBy";
        $sortDirKey = "{$sessionPrefix}_sortDir";
        $perPageKey = "{$sessionPrefix}_perPage";

        if (request()->has('sortBy') || request()->has('sortDir')) {
            $sortBy = request()->get('sortBy');
            $sortDir = request()->get('sortDir');

            // Si sortBy es null o cadena vacía, eliminar de sesión y usar defaults
            if ($sortBy === null || $sortBy === '') {
                session()->forget([$sortByKey, $sortDirKey]);
                $sortBy = $defaultSortBy;
                $sortDir = $defaultSortDir;
            } else {
                $sortDir = $sortDir === 'asc' ? 'asc' : 'desc';
                session([$sortByKey => $sortBy, $sortDirKey => $sortDir]);
            }
        } else {
            $sortBy = session($sortByKey, $defaultSortBy);
            $sortDir = session($sortDirKey, $defaultSortDir);
        }

        if (request()->has('perPage')) {
            $perPage = (int) request()->get('perPage', $defaultPerPage);
            session([$perPageKey => $perPage]);
        } else {
            $perPage = session($perPageKey, $defaultPerPage);
        }

        // === COLUMNAS VISIBLES ===
        $visibleColumns = $this->getVisibleColumns($sessionPrefix);

        return [
            'filters' => $filters,
            'sortBy' => $sortBy,
            'sortDir' => $sortDir,
            'perPage' => $perPage,
            'visibleColumns' => $visibleColumns,
            'redirect' => $redirect,
        ];
    }
}
