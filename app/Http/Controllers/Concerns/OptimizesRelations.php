<?php

namespace App\Http\Controllers\Concerns;

trait OptimizesRelations
{
    /**
     * Determina qué relaciones cargar basándose en las columnas visibles
     *
     * @param  array|null  $visibleColumns  Columnas visibles desde la sesión/request
     * @param  array  $columnToRelations  Mapeo de columnas a relaciones requeridas
     * @return array Array de relaciones a cargar
     */
    protected function getRelationsToLoad(?array $visibleColumns, array $columnToRelations): array
    {
        // Si no hay columnas visibles especificadas, cargar todas las relaciones
        if ($visibleColumns === null) {
            return array_values(array_unique(array_merge(...array_values($columnToRelations))));
        }

        $relationsToLoad = [];

        // Para cada columna visible, agregar sus relaciones requeridas
        foreach ($visibleColumns as $column) {
            if (isset($columnToRelations[$column])) {
                $relations = $columnToRelations[$column];
                if (is_array($relations)) {
                    $relationsToLoad = array_merge($relationsToLoad, $relations);
                } else {
                    $relationsToLoad[] = $relations;
                }
            }
        }

        // Eliminar duplicados y retornar
        return array_values(array_unique($relationsToLoad));
    }
}
