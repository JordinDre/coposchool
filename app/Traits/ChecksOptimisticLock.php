<?php

namespace App\Traits;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

trait ChecksOptimisticLock
{
    /**
     * Verifica que el registro no haya sido modificado desde que el usuario lo cargó.
     * Retorna un redirect con error si hay conflicto, null si todo está bien.
     */
    protected function checkOptimisticLock(
        Request $request,
        Model $model,
        string $entityLabel = 'Este registro'
    ): ?RedirectResponse {
        if (! $request->filled('lock_version')) {
            return null;
        }

        $lockVersion = Carbon::parse($request->string('lock_version'));

        if ($model->updated_at->equalTo($lockVersion)) {
            return null;
        }

        $editor = 'otro usuario';

        if (! empty($model->actualizado_por)) {
            $user = \App\Models\User::find($model->actualizado_por);
            $editor = $user?->name ?? 'otro usuario';
        }

        $hora = $model->updated_at
            ->setTimezone(config('app.timezone', 'UTC'))
            ->format('H:i');

        return back()->withErrors([
            'lock_conflict' => "{$entityLabel} fue modificado por {$editor} a las {$hora}. Recarga la página para ver los cambios más recientes.",
        ]);
    }
}
