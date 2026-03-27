<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Configuracion extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "Configuración {$eventName}")
            ->dontSubmitEmptyLogs();
    }

    protected $table = 'configuraciones';

    protected $fillable = [
        'nombre_empresa',
        'logo_url',
        'favicon_url',
        'email',
        'telefono',
        'direccion',
        'codigo_establecimiento',
        'nivel_educativo',
        'director_nombre',
        'firma_cargo',
        'encabezado_impresion',
        'pie_impresion',
    ];

    /**
     * Obtiene la configuración del tenant desde caché.
     * Si no existe ningún registro, retorna null.
     */
    public static function cached(): ?static
    {
        return cache()->rememberForever('configuracion', fn (): ?static => static::first());
    }

    /**
     * Limpia el caché de configuración.
     */
    public static function clearCache(): void
    {
        cache()->forget('configuracion');
    }

    /**
     * Limpia el caché automáticamente al guardar o eliminar.
     */
    protected static function booted(): void
    {
        static::saved(fn () => static::clearCache());
        static::deleted(fn () => static::clearCache());
    }
}
