<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Unidad extends Model
{
    use LogsActivity, SoftDeletes;

    protected $table = 'unidades';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "Unidad {$eventName}")
            ->dontSubmitEmptyLogs();
    }

    protected $fillable = [
        'nombre',
        'descripcion',
        'orden',
        'ciclo_escolar',
        'fecha_inicio',
        'fecha_fin',
    ];

    protected function casts(): array
    {
        return [
            'orden' => 'integer',
            'ciclo_escolar' => 'integer',
            'fecha_inicio' => 'date',
            'fecha_fin' => 'date',
        ];
    }

    /**
     * La unidad actualmente activa (hoy entre fecha_inicio y fecha_fin).
     */
    public static function actual(): ?self
    {
        return static::whereNull('deleted_at')
            ->whereNotNull('fecha_inicio')
            ->whereNotNull('fecha_fin')
            ->whereDate('fecha_inicio', '<=', today())
            ->whereDate('fecha_fin', '>=', today())
            ->orderBy('orden')
            ->first();
    }

    /**
     * Notas de esta unidad.
     */
    public function notas(): HasMany
    {
        return $this->hasMany(Nota::class);
    }

    /**
     * Tareas de esta unidad.
     */
    public function tareas(): HasMany
    {
        return $this->hasMany(Tarea::class);
    }
}
