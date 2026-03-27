<?php

namespace App\Http\Middleware;

use App\Models\Configuracion;
use App\Models\Unidad;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Lab404\Impersonate\Services\ImpersonateManager;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() ? [
                    'id'       => $request->user()->id,
                    'name'     => $request->user()->name,
                    'email'    => $request->user()->email,
                    'telefono' => $request->user()->telefono,
                    'avatar'   => $request->user()->avatar ?? null,
                ] : null,
                'roles' => $request->user() ? $request->user()->getRoleNames()->toArray() : [],
                'permissions' => $request->user() ? $request->user()->getPermissionsViaRoles()->pluck('name')->toArray() : [],
                'impersonating' => $request->user() && app(ImpersonateManager::class)->isImpersonating(),
                'impersonator' => $request->user() && app(ImpersonateManager::class)->isImpersonating()
                    ? [
                        'id'    => app(ImpersonateManager::class)->getImpersonator()->id,
                        'name'  => app(ImpersonateManager::class)->getImpersonator()->name,
                        'email' => app(ImpersonateManager::class)->getImpersonator()->email,
                    ]
                    : null,
            ],
            'branding' => function (): array {
                $config = (function_exists('tenancy') && tenancy()->initialized)
                    ? Configuracion::cached()
                    : null;

                $name    = $config?->nombre_empresa ?? config('app.name');
                $favicon = $config?->favicon_url ?? $config?->logo_url ?? '/images/icon.png';
                $logo    = $config?->logo_url ?? '/images/logo.png';

                return [
                    'logo'    => ['light' => $logo, 'dark' => $logo],
                    'icon'    => ['favicon' => $favicon, 'apple_touch' => $favicon, 'logo_svg' => ''],
                    'company' => ['name' => $name],
                ];
            },
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'unidadActual' => function (): ?array {
                if (! (function_exists('tenancy') && tenancy()->initialized)) {
                    return null;
                }
                $u = Unidad::actual();
                return $u ? [
                    'id'           => $u->id,
                    'nombre'       => $u->nombre,
                    'orden'        => $u->orden,
                    'fecha_inicio' => $u->fecha_inicio?->format('Y-m-d'),
                    'fecha_fin'    => $u->fecha_fin?->format('Y-m-d'),
                ] : null;
            },
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'info'    => fn () => $request->session()->get('info'),
                'warning' => fn () => $request->session()->get('warning'),
            ],
        ];
    }
}
