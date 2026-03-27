<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Tarea extends Model
{
    use LogsActivity, SoftDeletes;

    protected $table = 'tareas';

    protected $fillable = [
        'seccion_id',
        'materia_id',
        'unidad_id',
        'catedratico_id',
        'nombre',
        'descripcion',
        'valor',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Tarea {$eventName}")
            ->dontSubmitEmptyLogs();
    }

    public function seccion(): BelongsTo
    {
        return $this->belongsTo(Seccion::class);
    }

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }

    public function unidad(): BelongsTo
    {
        return $this->belongsTo(Unidad::class);
    }

    public function catedratico(): BelongsTo
    {
        return $this->belongsTo(User::class, 'catedratico_id');
    }

    public function notas(): HasMany
    {
        return $this->hasMany(TareaNota::class, 'tarea_id');
    }
}
