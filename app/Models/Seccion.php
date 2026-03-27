<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Seccion extends Model
{
    use LogsActivity, SoftDeletes;

    protected $table = 'secciones';

    /**
     * Include soft-deleted records in route model binding so that
     * methods like edit(), inscribir(), and asignarMaterias() can check
     * $seccion->trashed() themselves instead of getting a 404.
     */
    public function resolveRouteBinding($value, $field = null): ?self
    {
        return $this->withTrashed()->where($field ?? $this->getRouteKeyName(), $value)->first();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "Sección {$eventName}")
            ->dontSubmitEmptyLogs();
    }

    protected $fillable = [
        'nombre',
        'ciclo',
        'ciclo_escolar',
        'descripcion',
    ];

    protected function casts(): array
    {
        return [
            'ciclo_escolar' => 'integer',
        ];
    }

    /**
     * Materias que se imparten en esta sección, con el catedrático asignado.
     */
    public function materias(): BelongsToMany
    {
        return $this->belongsToMany(Materia::class, 'materia_seccion', 'seccion_id', 'materia_id')
            ->withPivot('catedratico_id')
            ->withTimestamps();
    }

    /**
     * Estudiantes inscritos en esta sección.
     */
    public function estudiantes(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'seccion_user', 'seccion_id', 'user_id')
            ->withTimestamps();
    }

    /**
     * Notas de esta sección.
     */
    public function notas(): HasMany
    {
        return $this->hasMany(Nota::class);
    }

    /**
     * Tareas registradas para esta sección.
     */
    public function tareas(): HasMany
    {
        return $this->hasMany(Tarea::class);
    }
}
