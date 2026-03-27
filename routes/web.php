<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Central Domain Routes
|--------------------------------------------------------------------------
|
| Estas son las rutas del dominio central establecidas en el .env.
| Son páginas públicas e informativas sobre el sistema.
|
| IMPORTANTE: Route::domain() da clave única 'APP_DOMAIN/' en el
| RouteCollection y garantiza prioridad al cargarse antes que las
| rutas tenant (que se registran vía booted() callback).
|
*/

// Las rutas de los dominios centrales (landing page, etc.)
// se registran dinámicamente en:
// App\Providers\CentralDomainServiceProvider.php
