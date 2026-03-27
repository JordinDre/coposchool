<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Lab404\Impersonate\Models\Impersonate;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasRoles, Impersonate, LogsActivity, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'telefono',
        'creado_por',
        'actualizado_por',
        'eliminado_por',
        'sessions_invalidated_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'sessions_invalidated_at' => 'datetime',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "Usuario {$eventName}")
            ->dontSubmitEmptyLogs();
    }

    // ========== Relaciones Escolares ==========

    /**
     * Sección a la que pertenece el estudiante.
     */
    public function seccion(): BelongsTo
    {
        return $this->belongsTo(Seccion::class);
    }

    /**
     * Secciones donde el estudiante está inscrito.
     */
    public function secciones(): BelongsToMany
    {
        return $this->belongsToMany(Seccion::class, 'seccion_user', 'user_id', 'seccion_id')
            ->withTimestamps();
    }

    /**
     * Materias que imparte el catedrático (en distintas secciones).
     */
    public function materiasComoDocente(): BelongsToMany
    {
        return $this->belongsToMany(Materia::class, 'materia_seccion', 'catedratico_id', 'materia_id')
            ->withPivot('seccion_id')
            ->withTimestamps();
    }

    /**
     * Notas del estudiante.
     */
    public function notas(): HasMany
    {
        return $this->hasMany(Nota::class, 'estudiante_id');
    }

    /**
     * Notas registradas por el catedrático.
     */
    public function notasRegistradas(): HasMany
    {
        return $this->hasMany(Nota::class, 'catedratico_id');
    }

    /**
     * Tareas creadas por el catedrático.
     */
    public function tareasCreadas(): HasMany
    {
        return $this->hasMany(Tarea::class, 'catedratico_id');
    }

    /**
     * Notas de tareas del estudiante.
     */
    public function tareaNotas(): HasMany
    {
        return $this->hasMany(TareaNota::class, 'estudiante_id');
    }

    // ========== Relaciones de Auditoría ==========

    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creado_por');
    }

    public function actualizador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actualizado_por');
    }

    public function eliminador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'eliminado_por');
    }

    // ========== Métodos de Utilidad ==========

    /**
     * Determinar si el usuario puede impersonar a otros usuarios.
     */
    public function canImpersonate(): bool
    {
        return $this->hasAnyRole(['administrador', 'super-admin']);
    }

    /**
     * Determinar si el usuario puede ser impersonado.
     */
    public function canBeImpersonated(): bool
    {
        return ! $this->hasAnyRole(['administrador', 'super-admin']);
    }

    /**
     * Verificar si el usuario tiene un permiso en la BD (directo o a través de roles).
     */
    protected function hasPermissionInDb(string $permissionName): bool
    {
        $permission = Permission::where('name', $permissionName)->first();

        if (! $permission) {
            return false;
        }

        $hasDirectPermission = $this->permissions()
            ->where('permissions.id', $permission->id)
            ->exists();

        if ($hasDirectPermission) {
            return true;
        }

        return $this->roles()
            ->whereHas('permissions', function ($query) use ($permission) {
                $query->where('permissions.id', $permission->id);
            })
            ->exists();
    }

    /**
     * Sobrescribe can() para verificar primero en la BD sin caché.
     *
     * @param  string|array|\Spatie\Permission\Contracts\Permission  $permission
     * @param  string|null  $guardName
     */
    public function can($permission, $guardName = null): bool
    {
        if (is_string($permission)) {
            if ($this->hasPermissionInDb($permission)) {
                return true;
            }
        }

        return parent::can($permission, $guardName);
    }
}
