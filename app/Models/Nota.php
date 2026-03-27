<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Nota extends Model
{
    use LogsActivity, SoftDeletes;

    protected $table = 'notas';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "Nota {$eventName}")
            ->dontSubmitEmptyLogs();
    }

    protected $fillable = [
        'estudiante_id',
        'materia_id',
        'unidad_id',
        'seccion_id',
        'catedratico_id',
        'nota',
        'observaciones',
    ];

    protected function casts(): array
    {
        return [
            'nota' => 'decimal:2',
        ];
    }

    /**
     * Estudiante al que pertenece la nota.
     */
    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estudiante_id');
    }

    /**
     * Materia de la nota.
     */
    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }

    /**
     * Unidad de la nota.
     */
    public function unidad(): BelongsTo
    {
        return $this->belongsTo(Unidad::class);
    }

    /**
     * Sección de la nota.
     */
    public function seccion(): BelongsTo
    {
        return $this->belongsTo(Seccion::class);
    }

    /**
     * Catedrático que registró la nota.
     */
    public function catedratico(): BelongsTo
    {
        return $this->belongsTo(User::class, 'catedratico_id');
    }
}
