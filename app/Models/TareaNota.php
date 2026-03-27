<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class TareaNota extends Model
{
    use LogsActivity, SoftDeletes;

    protected $table = 'tarea_notas';

    protected $fillable = [
        'tarea_id',
        'estudiante_id',
        'nota',
        'observaciones',
    ];

    protected $casts = [
        'nota' => 'decimal:2',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Nota de tarea {$eventName}")
            ->dontSubmitEmptyLogs();
    }

    public function tarea(): BelongsTo
    {
        return $this->belongsTo(Tarea::class);
    }

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estudiante_id');
    }
}
