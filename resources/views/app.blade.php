<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }

                // Global protection against back-button cache (bfcache)
                window.addEventListener('pageshow', function(event) {
                    if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
                        window.location.reload();
                    }
                });
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        @php
            $tenantName = config('app.name');
            $faviconUrl = '/images/icon.png';
            if (function_exists('tenancy') && tenancy()->initialized) {
                $tenantConfig = \App\Models\Configuracion::cached();
                if ($tenantConfig) {
                    $tenantName = $tenantConfig->nombre_empresa ?? config('app.name');
                    $faviconUrl = $tenantConfig->favicon_url
                        ?? $tenantConfig->logo_url
                        ?? '/images/icon.png';
                }
            }
        @endphp

        <title inertia>{{ $tenantName }}</title>

        {{-- PWA / App name meta tags — use tenant name so sharing shows the business name --}}
        <meta name="application-name" content="{{ $tenantName }}">
        <meta name="apple-mobile-web-app-title" content="{{ $tenantName }}">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="theme-color" content="#ffffff">
        <meta property="og:site_name" content="{{ $tenantName }}">

        <link rel="manifest" href="/manifest.webmanifest">
        <link rel="icon" type="image/png" href="{{ $faviconUrl }}">
        <link rel="apple-touch-icon" href="{{ $faviconUrl }}">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
