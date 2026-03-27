<!DOCTYPE html>
<html lang="es-GT" class="scroll-smooth">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>CopoSchool | Sistema de Gestión Escolar</title>
    <meta name="description" content="Plataforma educativa integral para institutos y colegios. Gestiona secciones, materias, notas, catedráticos y estudiantes desde un solo lugar.">
    <meta name="robots" content="index, follow">
    <meta name="author" content="COPO">
    <link rel="canonical" href="{{ url('/') }}">

    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url('/') }}">
    <meta property="og:title" content="CopoSchool | Sistema de Gestión Escolar">
    <meta property="og:description" content="Administra tu institución educativa de manera eficiente: secciones, materias, notas, reportes de impresión y más.">
    <meta property="og:image" content="{{ asset('images/logo.png') }}">

    <link rel="icon" type="image/png" href="{{ asset('images/icon.png') }}">
    <link rel="apple-touch-icon" href="{{ asset('images/icon.png') }}">
    <meta name="theme-color" content="#0c2340">

    <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,800&display=swap" rel="stylesheet">

    @vite(['resources/css/app.css'])

    <style>
        /* ── Tokens base (Adaptados a CopoSchool) ── */
        :root {
            --vi:   12  35  64;   /* Navy */
            --vi-l: 21 74 115;    /* Navy Light */
            --vi-d: 5 15 30;      /* Navy Dark */
            --gold: 212 160 23;   /* Gold */
            --gold-l: 240 191 64; /* Gold Light */
            
            --slate-50: 248 250 252;
            --slate-100: 241 245 249;
            --slate-200: 226 232 240;
            --slate-500: 100 116 139;
            --slate-900: 15 23 42;
        }

        html { background: #fff; scroll-behavior: smooth; }
        html.dark { background: #020617; }

        /* ── Typography & Spacing ── */
        body { font-feature-settings: "cv02", "cv03", "cv04", "cv11"; }
        .section-padding { padding-top: 5rem; padding-bottom: 5rem; }
        @media (min-width: 640px) { .section-padding { padding-top: 8rem; padding-bottom: 8rem; } }

        /* ── Colores por módulo ── */
        .mc-indigo  { --mc: 12 35 64; }
        .mc-amber   { --mc: 212 160 23; }
        .mc-violet  { --mc: 124 58 237; }
        .mc-emerald { --mc: 5 150 105;  }
        .mc-sky     { --mc: 2 132 199;  }

        .mod-icon {
            background: rgb(var(--mc) / 0.08);
            border: 1px solid rgb(var(--mc) / 0.15);
        }
        .dark .mod-icon {
            background: rgb(var(--mc) / 0.12);
            border-color: rgb(var(--mc) / 0.20);
        }
        .mod-label { color: rgb(var(--mc)); }
        .dark .mod-label { color: rgb(var(--mc) / 0.9); }
        .mod-check { color: rgb(var(--mc) / 0.7); }
        .dark .mod-check { color: rgb(var(--mc) / 0.6); }

        /* ── Modern Minimalist Elements ── */
        .grad-text {
            background: linear-gradient(135deg, rgb(var(--vi)) 0%, #1e4a73 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .dark .grad-text {
            background: linear-gradient(135deg, #fff 0%, rgb(var(--gold)) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .btn-primary {
            background: rgb(var(--vi));
            color: #fff;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-primary:hover {
            background: rgb(var(--vi-d));
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(12, 35, 64, 0.15);
        }
        
        .btn-gold {
            background: rgb(var(--gold));
            color: rgb(var(--vi));
            font-weight: 700;
            transition: all 0.2s;
        }
        .btn-gold:hover {
            background: rgb(var(--gold-l));
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(212, 160, 23, 0.2);
        }

        .nav-scrolled {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: saturate(180%) blur(12px);
            border-bottom: 1px solid rgba(15, 23, 42, 0.05);
        }
        .dark .nav-scrolled {
            background: rgba(2, 6, 23, 0.8);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .card-minimal {
            background: #fff;
            border: 1px solid rgb(var(--slate-200));
            border-radius: 1.25rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dark .card-minimal {
            background: rgba(255, 255, 255, 0.02);
            border-color: rgba(255, 255, 255, 0.08);
        }
        .card-minimal:hover {
            border-color: rgb(var(--gold) / 0.3);
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05);
            transform: translateY(-4px);
        }

        .eyebrow {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            background: rgb(var(--gold) / 0.1);
            color: rgb(var(--gold));
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.025em;
            text-transform: uppercase;
        }

        .reveal-up {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .reveal-up.active {
            opacity: 1;
            transform: translateY(0);
        }

        .desktop-frame {
            border-radius: 0.75rem;
            overflow: hidden;
            border: 2px solid #f1f5f9;
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
            background: #fff;
        }
        .dark .desktop-frame {
            border-color: rgba(255,255,255,0.05);
            background: #000;
        }
        
        .phone-mockup {
            width: 230px;
            height: 494px;
            background: #000;
            border-radius: 32px;
            border: 6px solid #18181b;
            position: relative;
            overflow: hidden;
            box-shadow: 0 40px 80px -20px rgba(0,0,0,0.3);
            margin: 0 auto;
        }
        .phone-mockup img { width: 100%; height: 100%; object-fit: cover; }
    </style>
</head>
<body class="font-sans antialiased bg-white text-gray-900 dark:bg-[#05050d] dark:text-gray-100">

<header id="nav" class="fixed inset-x-0 top-0 z-50 transition-all duration-200">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center gap-6">
        <a href="#" class="flex-shrink-0" aria-label="CopoSchool — inicio">
            <img src="/images/logo.png"      alt="COPO logo" class="h-7 dark:hidden"       width="120" height="28">
            <img src="/images/logoLigth.png" alt="COPO logo" class="h-7 hidden dark:block" width="120" height="28">
        </a>

        <nav class="hidden md:flex items-center gap-0.5 ml-2">
            @foreach(['#modulos' => 'Módulos', '#plataforma' => 'Plataforma', '#faq' => 'FAQ'] as $href => $label)
            <a href="{{ $href }}" class="px-3.5 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-black/[.04] dark:hover:bg-white/[.05] transition-colors">
                {{ $label }}
            </a>
            @endforeach
            <a href="https://copo.io" class="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-[#0c2340] dark:text-[#d4a017] hover:bg-black/[.04] dark:hover:bg-white/[.05] rounded-lg transition-colors">
                <img src="/images/iconLigth.png" alt="COPO icon" class="h-4 w-4 dark:hidden">
                <img src="/images/icon.png" alt="COPO icon" class="h-4 w-4 hidden dark:block">
                Regresar a COPO.io
            </a>
        </nav>

        <div class="flex items-center gap-2 ml-auto">
            <button id="theme-btn" class="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-black/[.04] dark:hover:bg-white/[.06]">
                <svg class="h-4 w-4 dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
                <svg class="h-4 w-4 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            </button>
            <a href="{{ route('login') }}" class="hidden sm:inline-flex text-sm font-medium text-gray-600 dark:text-gray-300 px-4 py-2 hover:text-gray-900 transition-colors">Iniciar sesión</a>
            <a href="{{ route('login') }}" class="btn-primary px-5 py-2 rounded-lg text-sm font-bold">Acceder al sistema</a>
        </div>
    </div>
</header>

<section class="section-padding min-h-[90vh] flex items-center relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 w-full">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
            <div class="reveal-up">
                <div class="eyebrow mb-6">Sistema educativo institucional</div>
                <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
                    Gestión escolar<br><span class="grad-text">inteligente para tu institución.</span>
                </h1>
                <p class="text-xl text-gray-500 dark:text-gray-400 max-w-lg mb-10 leading-relaxed">
                    CopoSchool centraliza secciones, materias, notas, catedráticos y estudiantes en una plataforma segura, rápida y fácil de usar.
                </p>
                <div class="flex flex-col sm:flex-row gap-4">
                    <a href="{{ route('login') }}" class="btn-primary px-8 py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                        Ingresar al sistema
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                    </a>
                    <a href="#modulos" class="inline-flex items-center justify-center px-8 py-4 rounded-xl text-lg font-bold border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">Ver módulos</a>
                </div>
            </div>
            <div class="relative reveal-up stagger-2">
                <div class="desktop-frame">
                    <img src="/images/dashboard-dark.png" alt="CopoSchool Dashboard">
                </div>
                <div class="absolute -bottom-6 -left-6 scale-75 sm:scale-100">
                    <div class="phone-mockup border-[#d4a017]/20">
                        <img src="/images/dashboard-movil-dark.png" alt="CopoSchool Mobile">
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<div class="border-y border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div class="flex flex-wrap justify-center gap-12 sm:gap-20">
            <div class="text-center">
                <p class="text-3xl font-bold text-[#d4a017]">100%</p>
                <p class="text-sm text-gray-500 uppercase tracking-widest font-semibold">En la nube</p>
            </div>
            <div class="text-center">
                <p class="text-3xl font-bold text-[#d4a017]">Multi</p>
                <p class="text-sm text-gray-500 uppercase tracking-widest font-semibold">Sede por institución</p>
            </div>
            <div class="text-center">
                <p class="text-3xl font-bold text-[#d4a017]">∞</p>
                <p class="text-sm text-gray-500 uppercase tracking-widest font-semibold">Estudiantes registrables</p>
            </div>
            <div class="text-center">
                <p class="text-3xl font-bold text-[#d4a017]">24/7</p>
                <p class="text-sm text-gray-500 uppercase tracking-widest font-semibold">Disponibilidad</p>
            </div>
        </div>
    </div>
</div>

<section id="modulos" class="section-padding">
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
        <div class="max-w-2xl mb-16">
            <div class="eyebrow mb-4">Módulos del sistema</div>
            <h2 class="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Todo lo que necesita tu institución</h2>
            <p class="text-xl text-gray-500 dark:text-gray-400">Ocho módulos integrados que cubren el ciclo completo de gestión académica.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            @php
            $mods = [
                ['SEC', 'Secciones', 'Organiza grupos escolares por ciclo, nivel educativo y año. Asigna estudiantes y catedráticos con facilidad.', 'mc-indigo'],
                ['MAT', 'Materias', 'Crea y administra el catálogo de materias por sección. Asigna docentes y define cargas académicas.', 'mc-sky'],
                ['NOT', 'Notas y calificaciones', 'Registra y consulta notas por unidad y materia. Indicadores visuales de aprobación y reprobación.', 'mc-emerald'],
                ['UNI', 'Unidades', 'Divide el año académico en unidades evaluativas. Controla el avance por período con claridad.', 'mc-violet'],
                ['EST', 'Estudiantes', 'Perfiles completos de estudiantes, asignación de secciones, historial académico y datos personales.', 'mc-amber'],
                ['CAT', 'Catedráticos', 'Registro de docentes con asignación de materias, gestión de credenciales y control de acceso por rol.', 'mc-indigo'],
                ['USR', 'Usuarios y Roles', 'Control granular de permisos. Roles de super-admin, director, secretario, catedrático y estudiante.', 'mc-sky'],
                ['CFG', 'Configuración escolar', 'Personaliza nombre, logo, datos de impresión, director, firma y encabezados institucionales.', 'mc-amber'],
            ];
            @endphp
            @foreach($mods as $m)
            <div class="card-minimal p-8 group transition-all hover:scale-[1.02]">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm mb-6 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[#d4a017]">
                    {{ $m[0] }}
                </div>
                <h3 class="text-xl font-bold mb-2">{{ $m[1] }}</h3>
                <p class="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">{{ $m[2] }}</p>
            </div>
            @endforeach
        </div>
    </div>
</section>

<section id="plataforma" class="section-padding bg-gray-50 dark:bg-white/[0.01]">
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
            <div class="reveal-up">
                <div class="eyebrow mb-6">Arquitectura multi-tenant</div>
                <h2 class="text-4xl sm:text-5xl font-bold tracking-tight mb-6">Una plataforma, cada institución con su propio espacio</h2>
                <p class="text-xl text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    Cada colegio o instituto opera de forma completamente aislada. Sus datos, su configuración y su dominio.
                </p>
                <div class="space-y-4">
                    @foreach([
                        ['🏫', 'Base de datos independiente', 'Los datos de cada institución están completamente separados.'],
                        ['🎨', 'Marca personalizada', 'Logo, favicon y nombre institucional propios en cada tenant.'],
                        ['🔒', 'Roles y permisos por institución', 'Super-admin, director, secretario, catedrático y estudiante.'],
                        ['📋', 'Auditoría completa de cambios', 'Registro de actividad de cada acción realizada en el sistema.']
                    ] as $p)
                    <div class="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                        <span class="text-2xl">{{ $p[0] }}</span>
                        <div>
                            <p class="font-bold text-sm">{{ $p[1] }}</p>
                            <p class="text-xs text-gray-500">{{ $p[2] }}</p>
                        </div>
                    </div>
                    @endforeach
                </div>
            </div>
            <div class="reveal-up stagger-2">
                <div class="desktop-frame border-[#d4a017]/20">
                    <img src="/images/table-dark.png" alt="Data Management">
                </div>
            </div>
        </div>
    </div>
</section>

{{-- ── CÓMO FUNCIONA ── --}}
<section class="section-padding">
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
        <div class="max-w-2xl mb-16">
            <div class="eyebrow mb-4">Proceso de inicio</div>
            <h2 class="text-4xl sm:text-5xl font-bold tracking-tight mb-4">En 3 pasos, tu institución lista para operar</h2>
            <p class="text-xl text-gray-500 dark:text-gray-400">Configuración rápida y sin complicaciones técnicas.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            @foreach([
                ['01', 'Configura tu institución', 'Ingresa el nombre, logo, datos del director y encabezados para documentos de impresión.'],
                ['02', 'Crea secciones y materias', 'Define tus grupos escolares, asigna materias por sección y vincula a los catedráticos responsables.'],
                ['03', 'Registra estudiantes y notas', 'Inscribe estudiantes en secciones, inicia el registro de calificaciones por unidad y monitorea el rendimiento.']
            ] as $step)
            <div class="card-minimal p-10 relative overflow-hidden group hover:border-[#d4a017]/40 transition-all">
                <div class="text-6xl font-black text-gray-100 dark:text-white/5 absolute -top-2 -right-2 tracking-tighter">{{ $step[0] }}</div>
                <h3 class="text-xl font-bold mb-4 relative z-10">{{ $step[1] }}</h3>
                <p class="text-gray-500 dark:text-gray-400 leading-relaxed text-sm relative z-10">{{ $step[2] }}</p>
            </div>
            @endforeach
        </div>
    </div>
</section>

<section class="section-padding text-center">
    <div class="max-w-3xl mx-auto px-5">
        <div class="eyebrow mb-6">¿Listo para empezar?</div>
        <h2 class="text-4xl sm:text-5xl font-bold mb-6">Tu institución merece una gestión moderna.</h2>
        <p class="text-xl text-gray-500 dark:text-gray-400 mb-10">Accede al sistema y comienza a gestionar tu institución educativa de forma eficiente desde hoy.</p>
        <a href="{{ route('login') }}" class="btn-gold px-10 py-5 rounded-xl text-xl font-bold shadow-xl">Ingresar al sistema</a>
    </div>
</section>

<footer class="bg-[#0c2340] text-white py-16">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-8">
        <a href="#" aria-label="CopoSchool — volver al inicio">
            <img src="{{ asset('images/logoLigth.png') }}" alt="COPO logo" class="h-7" width="120" height="28">
        </a>
        <p class="text-sm text-gray-400">&copy; {{ date('Y') }} CopoSchool. Parte del ecosistema COPO.</p>
        <div class="flex gap-6">
            <a href="{{ route('login') }}" class="text-sm text-gray-400 hover:text-white transition-colors">Login</a>
            <a href="https://copo.io" class="text-sm text-gray-400 hover:text-white transition-colors">Copo.io</a>
        </div>
    </div>
</footer>

<script>
    // Dark mode logic
    if (localStorage.getItem('copo-theme') === 'dark') document.documentElement.classList.add('dark');
    document.getElementById('theme-btn').addEventListener('click', () => {
        const dark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('copo-theme', dark ? 'dark' : 'light');
    });

    // Reveal animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('active');
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
</script>

</body>
</html>
