<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Session;

class SessionHelper
{
    /**
     * Persist table state in session
     */
    public static function persistTableState(string $tableName, array $state): void
    {
        Session::put("tables.{$tableName}", $state);
    }

    /**
     * Get persisted table state from session
     */
    public static function getPersistedTableState(string $tableName): array
    {
        return Session::get("tables.{$tableName}", []);
    }

    /**
     * Clear persisted table state from session
     */
    public static function clearTableState(string $tableName): void
    {
        Session::forget("tables.{$tableName}");
    }

    /**
     * Get persisted filters for a table
     */
    public static function getPersistedFilters(string $tableName): array
    {
        $state = self::getPersistedTableState($tableName);

        return $state['filters'] ?? [];
    }

    /**
     * Persist filters for a table
     */
    public static function persistFilters(string $tableName, array $filters): void
    {
        $state = self::getPersistedTableState($tableName);
        $state['filters'] = $filters;
        self::persistTableState($tableName, $state);
    }

    /**
     * Merge filters with existing ones
     */
    public static function mergeFilters(string $tableName, array $filters): void
    {
        $existing = self::getPersistedFilters($tableName);
        $merged = array_merge($existing, $filters);
        self::persistFilters($tableName, $merged);
    }
}
