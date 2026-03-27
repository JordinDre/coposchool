<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class Helper
{
    /**
     * Obtiene los permisos específicos de un módulo para el usuario actual.
     */
    public static function getModulePermissions(string $module): array
    {
        $user = Auth::user();
        if (! $user) {
            return [];
        }

        $module = Str::lower($module);
        $variants = array_values(array_unique([
            $module,
            Str::singular($module),
            Str::plural($module),
        ]));

        return $user->getAllPermissions()
            ->filter(function ($permission) use ($variants) {
                $name = Str::lower($permission->name);
                $tokens = preg_split('/[\s\.\:\-]+/', $name, -1, PREG_SPLIT_NO_EMPTY);
                if (! $tokens) {
                    return false;
                }
                $first = $tokens[0];
                $last = $tokens[count($tokens) - 1];

                return in_array($last, $variants, true) || in_array($first, $variants, true);
            })
            ->pluck('name')
            ->values()
            ->toArray();
    }

    /**
     * Obtiene los permisos de navegación (listar*) para el usuario actual.
     */
    public static function getNavigationPermissions(): array
    {
        $user = Auth::user();
        if (! $user) {
            return [];
        }

        return $user->getAllPermissions()
            ->filter(fn ($permission) => str_contains($permission->name, 'listar'))
            ->pluck('name')
            ->toArray();
    }
}
