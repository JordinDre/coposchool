<?php

namespace App\Providers;

use App\Models\Materia;
use App\Models\Nota;
use App\Models\Seccion;
use App\Models\Unidad;
use App\Models\User;
use App\Policies\MateriaPolicy;
use App\Policies\NotaPolicy;
use App\Policies\SeccionPolicy;
use App\Policies\UnidadPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        User::class => UserPolicy::class,
        Seccion::class => SeccionPolicy::class,
        Materia::class => MateriaPolicy::class,
        Unidad::class => UnidadPolicy::class,
        Nota::class => NotaPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
