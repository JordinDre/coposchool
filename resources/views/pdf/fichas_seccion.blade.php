<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Fichas Académicas — {{ $seccion->nombre }}</title>
    <style>
        @page { 
            margin: 0.5cm 1.2cm; 
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: Arial, Helvetica, sans-serif; 
            font-size: 11px; 
            color: #000; 
            background: #fff; 
            line-height: 1.1; 
        }
        .page-break { page-break-after: always; }

        /* ── Header ── */
        .header-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 5px;
        }
        .header-logo { 
            width: 80px; 
            vertical-align: middle; 
        }
        .header-center { 
            text-align: center; 
            vertical-align: middle; 
            font-weight: bold;
        }
        .header-center div { margin-bottom: 2px; }
        .school-name { font-size: 13px; text-transform: uppercase; }
        .school-info { font-size: 11px; text-transform: uppercase; }
        .school-phone { font-size: 10px; }
        .school-cycle-desc { font-size: 11px; }

        .report-title { 
            text-align: center; 
            font-weight: bold; 
            font-size: 12px; 
            margin-top: 10px;
            text-decoration: underline;
        }
        .report-cycle { 
            text-align: center; 
            font-weight: bold; 
            font-size: 12px; 
            margin-bottom: 10px;
        }

        /* ── Student Information ── */
        .info-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 15px;
        }
        .info-label { 
            width: 180px; 
            font-weight: bold; 
            padding: 4px;
            font-size: 14px;
            text-align: right;
            padding-right: 20px;
        }
        .info-value { 
            padding: 4px 10px;
            font-size: 14px;
            font-weight: bold;
            background-color: #fcf305;
            border: 2px solid #000;
            text-align: center;
            width: 450px;
        }
        .info-spacer { height: 5px; }

        .clave-box-container {
            text-align: right;
            margin-bottom: 5px;
        }
        .clave-box {
            display: inline-block;
            border: 1px solid #000;
            padding: 4px 15px;
            font-weight: bold;
            font-size: 11px;
        }

        /* ── Grades Table ── */
        .grades-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px;
        }
        .grades-table th { 
            background-color: #fcf305; 
            border: 1px solid #000; 
            padding: 3px; 
            font-size: 11px; 
            text-align: center;
            font-weight: bold;
        }
        .grades-table td { 
            border: 1px solid #000; 
            padding: 3px 6px; 
            font-size: 12px;
            height: 20px;
        }
        .text-center { text-align: center; }
        .col-no { width: 40px; text-align: center; }
        .col-area { width: auto; font-weight: normal; }
        .col-nota { width: 100px; text-align: center; font-weight: normal; }

        /* ── Footer ── */
        .footer-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 30px;
        }
        .footer-cell { 
            width: 33.33%; 
            text-align: center; 
            vertical-align: bottom;
        }
        .signature-line { 
            border-top: 1px solid #000; 
            width: 80%; 
            margin: 0 auto 5px; 
        }
        .signature-role { font-weight: bold; font-size: 9px; margin-bottom: 40px; }
        .signature-name { font-weight: bold; font-size: 10px; }

        .seal-circle {
            width: 70px;
            height: 70px;
            border: 2px solid #000;
            border-radius: 50%;
            margin: 0 auto;
            text-align: center;
            font-weight: bold;
            font-size: 8px;
            display: block;
            padding-top: 18px;
        }

        .legal-text {
            font-size: 8.5px;
            margin-top: 10px;
            line-height: 1.3;
        }

        .slogan-text {
            text-align: center;
            font-style: italic;
            font-size: 11px;
            margin-top: 20px;
            color: #333;
        }

        .maestro-guia-container {
            margin-top: 15px;
            text-align: center;
        }
        .maestro-guia-box {
            display: inline-block;
            border: 1px solid #000;
            width: 250px;
            height: 40px;
            margin-left: 20px;
            vertical-align: top;
            text-align: left;
            padding: 5px;
            font-size: 11px;
            font-weight: bold;
        }
        .maestro-guia-label {
            display: inline-block;
            font-weight: bold;
            font-size: 11px;
            vertical-align: top;
            margin-top: 5px;
        }
    </style>
</head>
<body>

@php
    $config = $configuracion;
    $nombreFull = ($config->nombre_completo ?? '') . ' ' . ($config->abreviatura ?? '');
    $cicloActual = $config->ciclo_actual ?? date('Y');
    $bimUnidades = $unidades->take(4);
    $materias = $seccion->materias;
@endphp

@foreach($estudiantes as $estudiante)
@php
    $estudianteNotas = $notas->get($estudiante->id, collect());
    $lookup = [];
    foreach ($estudianteNotas as $n) {
        $lookup[$n->materia_id][$n->unidad_id] = $n->nota;
    }
@endphp

{{-- Header --}}
<table class="header-table">
    <tr>
        <td class="header-logo">
            <img src="{{ public_path('images/ministerio-educacion.png') }}" alt="MINEDUC" style="max-height: 70px;">
        </td>
        <td class="header-center">
            <div class="school-name">{{ $nombreFull ?: ($config->nombre_empresa ?? 'COPOSCHOOL') }}</div>
            <div class="school-info">{{ $config->descripcion_establecimiento }}</div>
            <div class="school-info">{{ $config->direccion ?? '' }}</div>
            <div class="school-phone">Teléfono {{ $config->telefono ?? '' }}</div>
            <div class="school-cycle-desc">{{ $config->descripcion_ciclo }}</div>
        </td>
        <td class="header-logo" style="text-align: right;">
            @if($config->logo_url)
                <img src="{{ Str::startsWith($config->logo_url, 'http') ? $config->logo_url : public_path($config->logo_url) }}" alt="Logo" style="max-height: 70px;">
            @endif
        </td>
    </tr>
</table>

<div class="report-title">HOJA INFORMATIVA DE CALIFICACIONES</div>
<div class="report-cycle">CICLO {{ $cicloActual }}</div>

<div class="clave-box-container">
    <div class="clave-box" style="border: none; padding-right: 40px;">CLAVE</div>
</div>

<table class="info-table" style="border-collapse: separate; border-spacing: 0 5px;">
    <tr>
        <td class="info-label">ALUMNO(A)</td>
        <td class="info-value">{{ strtoupper($estudiante->name) }}</td>
    </tr>
    <tr>
        <td class="info-label">GRADO Y SECCIÓN</td>
        <td class="info-value">{{ strtoupper($seccion->nombre) }}</td>
    </tr>
</table>

{{-- Grades Table --}}
<table class="grades-table">
    <thead>
        <tr>
            <th class="col-no">No.</th>
            <th class="col-area" style="text-align: left;">Área o subárea</th>
            @foreach($bimUnidades as $u)
                <th class="col-nota">Notas {{ $u->orden }} BIM</th>
            @endforeach
            @if($bimUnidades->count() < 4)
                @for($i = $bimUnidades->count() + 1; $i <= 4; $i++)
                    <th class="col-nota">Notas {{ $i }} BIM</th>
                @endfor
            @endif
        </tr>
    </thead>
    <tbody>
        @php 
            $bimTotals = [1 => 0, 2 => 0, 3 => 0, 4 => 0];
            $bimCounts = [1 => 0, 2 => 0, 3 => 0, 4 => 0];
        @endphp
        @foreach($materias as $idx => $m)
        <tr>
            <td class="text-center">{{ $idx + 1 }}</td>
            <td style="font-weight: bold;">{{ $m->nombre }}</td>
            @foreach($bimUnidades as $u)
                @php 
                    $nota = $lookup[$m->id][$u->id] ?? null;
                    if ($nota !== null) {
                        $bimTotals[$u->orden] += $nota;
                        $bimCounts[$u->orden]++;
                    }
                @endphp
                <td class="text-center">
                    {{ $nota !== null ? number_format($nota, 0) : '' }}
                </td>
            @endforeach
            @if($bimUnidades->count() < 4)
                @for($i = $bimUnidades->count() + 1; $i <= 4; $i++)
                    <td></td>
                @endfor
            @endif
        </tr>
        @endforeach
        
        @for($i = count($materias) + 1; $i <= 15; $i++)
        <tr>
            <td class="text-center">{{ $i }}</td>
            <td>
                @if($i == 15)
                    <div style="text-align: right; font-weight: bold; padding-right: 10px;">PROMEDIO:</div>
                @endif
            </td>
            @foreach($bimUnidades as $u)
                <td class="text-center">
                    @if($i == 13 && $bimCounts[$u->orden] > 0)
                        {{ number_format($bimTotals[$u->orden] / $bimCounts[$u->orden], 1) }}
                    @elseif($i == 15 && $u->orden == 4 && count($bimCounts) > 0)
                        @php 
                            $totalSum = array_sum($bimTotals);
                            $totalCount = array_sum($bimCounts);
                        @endphp
                        @if($totalCount > 0)
                            {{ number_format($totalSum / $totalCount, 1) }}
                        @endif
                    @endif
                </td>
            @endforeach
            @if($bimUnidades->count() < 4)
                @for($j = $bimUnidades->count() + 1; $j <= 4; $j++)
                    <td></td>
                @endfor
            @endif
        </tr>
        @endfor
    </tbody>
</table>

<div class="maestro-guia-container">
    <div class="maestro-guia-label">Maestro(a) Guía</div>
    <div class="maestro-guia-box">
        {{-- Placeholder for maestro guia name --}}
    </div>
</div>

{{-- Legal text --}}
<div class="legal-text">
    De conformidad con el Reglamento General de Evaluación del Ministerio de Educación, las Áreas y Subáreas se aprueban con el punteo mínimo de sesenta (60) puntos.<br>
    Para los usos legales que al interesado convenga se extiende la presente en la ciudad de {{ $config->direccion ? explode(',', $config->direccion)[0] : '' }}, a los {{ now()->locale('es')->isoFormat('D [de] MMMM [de] YYYY') }}.
</div>

{{-- Footer --}}
<table class="footer-table">
    <tr>
        <td class="footer-cell">
            <div class="signature-role">Coordinador(a) Académico</div>
            <div class="signature-line"></div>
            <div class="signature-name">{{ $config->coordinador_nombre ?? '________________________' }}</div>
        </td>
        <td class="footer-cell">
            <div class="seal-circle">
                <br>DIRECCIÓN<br>
                @if($config->abreviatura) {{ $config->abreviatura }} @endif
            </div>
        </td>
        <td class="footer-cell">
            <div class="signature-role">Director</div>
            <div class="signature-line"></div>
            <div class="signature-name">{{ $config->director_nombre ?? '________________________' }}</div>
        </td>
    </tr>
</table>

@if($config->eslogan)
    <div class="slogan-text">
        {{ $config->eslogan }}
    </div>
@endif

@if(!$loop->last)
    <div class="page-break"></div>
@endif
@endforeach

</body>
</html>
