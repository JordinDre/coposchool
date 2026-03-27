<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>@yield('title')</title>
        @vite(['resources/css/app.css'])
    </head>
    <body >
        <!-- Header -->
        <div class="bg-red-600 text-white px-6 py-4">
            <div class="flex items-center">
                <span class="font-semibold text-lg">{{ config('app.name') }}</span>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
            <div class="max-w-4xl w-full">
                <!-- Error Message Section -->
                <div class="text-center mb-12">
                    <div class="mb-6">
                        <h1 class="text-8xl md:text-9xl font-bold text-gray-900 dark:text-white mb-4">
                            @yield('code')
                        </h1>
                        <h2 class="text-3xl md:text-4xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                            @yield('title')
                        </h2>
                        <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            @yield('description')
                        </p>
                    </div>
                    
                    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a href="{{ route('dashboard') }}" 
                           class="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
                            </svg>
                            Ir al Dashboard
                        </a>
                        
                        <a href="{{ url()->previous() }}" 
                           class="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                            </svg>
                            Página Anterior
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
