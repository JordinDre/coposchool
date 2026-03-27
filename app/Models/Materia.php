<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Materia extends Model
{
    use LogsActivity, SoftDeletes;

    protected $table = 'materias';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "Materia {$eventName}")
            ->dontSubmitEmptyLogs();
    }

    protected $fillable = [
        'nombre',
        'descripcion',
        'codigo',
    ];

    /**
     * Secciones donde se imparte esta materia, incluyendo el catedrático asignado.
     */
    public function secciones(): BelongsToMany
    {
        return $this->belongsToMany(Seccion::class, 'materia_seccion', 'materia_id', 'seccion_id')
            ->withPivot('catedratico_id')
            ->withTimestamps();
    }

    /**
     * Catedráticos que imparten esta materia (en distintas secciones).
     */
    public function catedraticos(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'materia_seccion', 'materia_id', 'catedratico_id')
            ->withPivot('seccion_id')
            ->withTimestamps();
    }

    /**
     * Notas registradas para esta materia.
     */
    public function notas(): HasMany
    {
        return $this->hasMany(Nota::class);
    }

    /**
     * Tareas registradas para esta materia.
     */
    public function tareas(): HasMany
    {
        return $this->hasMany(Tarea::class);
    }
}
