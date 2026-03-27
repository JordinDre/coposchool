<?php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class CentralDomainServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $centralDomains = collect(config('tenancy.central_domains', []))
            ->filter()
            ->unique()
            ->values();

        foreach ($centralDomains as $index => $domain) {
            Route::domain($domain)
                ->middleware('web')
                ->group(function () use ($index) {
                    $landing = Route::get('/', fn () => view('landing'));

                    if ($index === 0) {
                        $landing->name('landing');
                    }
                });
        }
    }
}
