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
     * La unidad actualmente activa.
     * Primero busca la unidad cuyo rango de fechas incluye hoy.
     * Si estamos en una brecha entre bimestres, devuelve el más recientemente iniciado.
     */
    public static function actual(): ?self
    {
        $exacta = static::whereNull('deleted_at')
            ->whereNotNull('fecha_inicio')
            ->whereNotNull('fecha_fin')
            ->whereDate('fecha_inicio', '<=', today())
            ->whereDate('fecha_fin', '>=', today())
            ->orderBy('orden')
            ->first();

        if ($exacta) {
            return $exacta;
        }

        // Brecha entre bimestres: devuelve la más recientemente iniciada antes de hoy.
        return static::whereNull('deleted_at')
            ->whereNotNull('fecha_inicio')
            ->whereDate('fecha_inicio', '<=', today())
            ->orderBy('fecha_inicio', 'desc')
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
