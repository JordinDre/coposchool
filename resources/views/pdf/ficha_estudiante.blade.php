<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Ficha de Calificaciones</title>
    <style>
        @page {
            size: letter portrait;
            margin: 1.5cm 1.8cm;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            color: #111;
            background: #fff;
            line-height: 1.4;
        }

        /* Header */
        .hdr { width: 100%; border-collapse: collapse; }
        .hdr td { padding: 0; vertical-align: middle; }
        .hdr-logo { width: 90px; text-align: center; }
        .hdr-logo img { max-width: 82px; max-height: 82px; }
        .hdr-center { text-align: center; padding: 0 10px; }
        .school-name {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            line-height: 1.5;
        }
        .school-sub {
            font-size: 9px;
            color: #555;
            margin-top: 3px;
            text-transform: uppercase;
        }
        .school-detail { font-size: 8.5px; color: #666; margin-top: 2px; }

        /* Dividers */
        .rule-thick { width: 100%; border-top: 2.5px solid #111; margin: 7px 0 3px; }
        .rule-thin  { width: 100%; border-top: 1px solid #111; margin: 3px 0 6px; }

        /* Title */
        .doc-title {
            text-align: center;
            font-size: 13px;
            font-weight: bold;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin: 6px 0 2px;
        }
        .doc-year {
            text-align: center;
            font-size: 10.5px;
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
        }

        /* Info rows */
        .info-tbl { width: 100%; border-collapse: separate; border-spacing: 0 5px; margin-bottom: 6px; }
        .info-lbl {
            width: 140px;
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            padding-right: 12px;
            white-space: nowrap;
            vertical-align: middle;
        }
        .info-val {
            background: #f4f4f4;
            border: 1.5px solid #999;
            padding: 5px 14px;
            font-weight: bold;
            font-size: 11.5px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        /* Grades table */
        .grd { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        .grd th {
            background: #1a1a1a;
            color: #fff;
            border: 1px solid #1a1a1a;
            padding: 5px 4px;
            font-size: 8.5px;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .grd th.th-left { text-align: left; padding-left: 8px; }
        .grd td {
            border: 1px solid #ccc;
            padding: 3px 5px;
            height: 19px;
            vertical-align: middle;
            font-size: 9.5px;
        }
        .grd tr:nth-child(even) td { background: #f6f6f6; }
        .grd tr.row-avg td {
            background: #1a1a1a;
            color: #fff;
            border-color: #1a1a1a;
            font-weight: bold;
        }
        .td-no  { width: 28px; text-align: center; color: #777; font-size: 8.5px; }
        .td-area { text-align: left; padding-left: 8px; font-weight: bold; }
        .td-nota { text-align: center; font-weight: bold; }
        .pass { color: #14532d; }
        .warn { color: #78350f; }
        .fail { color: #7f1d1d; }
        .empty { color: #bbb; font-weight: normal; }

        /* Teacher box */
        .teacher-tbl { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .teacher-lbl {
            font-size: 8.5px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            padding-right: 8px;
            white-space: nowrap;
            vertical-align: middle;
            color: #444;
        }
        .teacher-box {
            border: 1px solid #aaa;
            height: 36px;
            padding: 6px 10px;
            font-size: 9px;
            font-weight: bold;
        }

        /* Legal */
        .legal {
            font-size: 8px;
            color: #444;
            line-height: 1.6;
            text-align: justify;
            margin-bottom: 16px;
        }

        /* Signatures */
        .sig-tbl { width: 100%; border-collapse: collapse; }
        .sig-cell { width: 33.33%; text-align: center; vertical-align: bottom; padding: 0 6px; }
        .sig-role {
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            color: #555;
            margin-bottom: 30px;
        }
        .sig-line { border-top: 1px solid #111; width: 90%; margin: 0 auto 4px; }
        .sig-name { font-size: 8.5px; font-weight: bold; color: #111; }
        .seal-img { width: 64px; height: 64px; border-radius: 50%; border: 2px solid #111; margin: 0 auto 4px; display: block; }
        .seal-circle {
            width: 64px;
            height: 64px;
            border: 2px solid #111;
            border-radius: 50%;
            margin: 0 auto 4px;
            text-align: center;
            font-size: 7px;
            font-weight: bold;
            padding-top: 22px;
            line-height: 1.4;
        }

        /* Slogan */
        .slogan {
            text-align: center;
            font-style: italic;
            font-size: 9.5px;
            color: #444;
            margin-top: 14px;
        }
    </style>
</head>
<body>

@php
    use Illuminate\Support\Str;

    $config     = $configuracion;
    $nombreFull = trim(($config->nombre_completo ?? '') . ' ' . ($config->abreviatura ?? ''));
    $ciclo      = $config->ciclo_actual ?? date('Y');

    // Materias deduplicadas de todas las secciones
    $materiasMap = [];
    foreach ($estudiante->secciones as $sec) {
        foreach ($sec->materias as $mat) {
            $materiasMap[$mat->id] = $mat;
        }
    }
    $materiasList = array_values($materiasMap);

    // Notas: [materia_id][unidad_id] => nota
    $lookup = [];
    foreach ($notas as $n) {
        $lookup[$n->materia_id][$n->unidad_id] = $n->nota;
    }

    // Columnas ordenadas
    $cols  = $unidades->sortBy('orden')->values();
    $roman = ['I','II','III','IV','V','VI','VII','VIII'];

    $seccion = $estudiante->secciones->first();
    $minRows = max(12, count($materiasList));

    // Totales por bimestre
    $totals = [];
    $counts = [];
    foreach ($cols as $u) { $totals[$u->id] = 0; $counts[$u->id] = 0; }
    foreach ($materiasList as $m) {
        foreach ($cols as $u) {
            $nota = $lookup[$m->id][$u->id] ?? null;
            if ($nota !== null) { $totals[$u->id] += $nota; $counts[$u->id]++; }
        }
    }

    // Logo
    $logoPath = null;
    if ($config->logo_url) {
        $raw = $config->logo_url;
        $p   = Str::startsWith($raw, 'http') ? $raw : public_path($raw);
        if (Str::startsWith($raw, 'http') || file_exists($p)) $logoPath = $p;
    }
@endphp

{{-- HEADER --}}
<table class="hdr">
    <tr>
        <td class="hdr-logo">
            @if($logoPath)
                <img src="{{ $logoPath }}" alt="Logo">
            @endif
        </td>
        <td class="hdr-center">
            <div class="school-name">{{ $nombreFull ?: ($config->nombre_empresa ?? 'INSTITUCIÓN EDUCATIVA') }}</div>
            @if($config->descripcion_establecimiento)
                <div class="school-sub">{{ $config->descripcion_establecimiento }}</div>
            @endif
            @if($config->direccion)
                <div class="school-detail">{{ $config->direccion }}</div>
            @endif
            @if($config->telefono)
                <div class="school-detail">Tel. {{ $config->telefono }}</div>
            @endif
            @if($config->descripcion_ciclo)
                <div class="school-detail">{{ $config->descripcion_ciclo }}</div>
            @endif
        </td>
        <td class="hdr-logo">
            {{-- slot for second logo --}}
        </td>
    </tr>
</table>

<table style="width:100%; border-collapse:collapse; margin:7px 0 3px;"><tr><td style="border-top:2.5px solid #111; padding:0;"></td></tr></table>
<div class="doc-title">Hoja Informativa de Calificaciones</div>
<div class="doc-year">Ciclo {{ $ciclo }}</div>
<table style="width:100%; border-collapse:collapse; margin:3px 0 6px;"><tr><td style="border-top:1px solid #111; padding:0;"></td></tr></table>

{{-- STUDENT INFO --}}
<table class="info-tbl">
    <tr>
        <td class="info-lbl">Alumno(a)</td>
        <td class="info-val">{{ strtoupper($estudiante->name) }}</td>
    </tr>
    <tr><td colspan="2" style="height:5px;"></td></tr>
    <tr>
        <td class="info-lbl">Grado y Sección</td>
        <td class="info-val">{{ strtoupper($seccion ? $seccion->nombre : 'SIN ASIGNAR') }}</td>
    </tr>
</table>

{{-- GRADES TABLE --}}
<table class="grd">
    <thead>
        <tr>
            <th class="td-no">No.</th>
            <th class="th-left">Área o Subárea</th>
            @foreach($cols as $u)
                <th style="width:{{ max(55, intval(240 / $cols->count())) }}px;">
                    Notas {{ $roman[$u->orden - 1] ?? $u->orden }} BIM
                </th>
            @endforeach
        </tr>
    </thead>
    <tbody>
        @foreach($materiasList as $idx => $m)
        <tr>
            <td class="td-no">{{ $idx + 1 }}</td>
            <td class="td-area">{{ $m->nombre }}</td>
            @foreach($cols as $u)
                @php $nota = $lookup[$m->id][$u->id] ?? null; @endphp
                <td class="td-nota">
                    @if($nota !== null)
                        @php $n = (float)$nota; @endphp
                        <span class="{{ $n >= 60 ? 'pass' : ($n >= 50 ? 'warn' : 'fail') }}">
                            {{ number_format($n, 0) }}
                        </span>
                    @else
                        <span class="empty">—</span>
                    @endif
                </td>
            @endforeach
        </tr>
        @endforeach

        @for($i = count($materiasList) + 1; $i <= $minRows; $i++)
        <tr>
            <td class="td-no">{{ $i }}</td>
            <td class="td-area"></td>
            @foreach($cols as $u)<td class="td-nota"></td>@endforeach
        </tr>
        @endfor

        <tr class="row-avg">
            <td class="td-no"></td>
            <td style="text-align:right; padding-right:10px; font-size:8px; letter-spacing:0.5px;">PROMEDIO</td>
            @foreach($cols as $u)
                <td class="td-nota">
                    {{ $counts[$u->id] > 0 ? number_format($totals[$u->id] / $counts[$u->id], 1) : '—' }}
                </td>
            @endforeach
        </tr>
    </tbody>
</table>

{{-- TEACHER / GUIDE --}}
<table class="teacher-tbl">
    <tr>
        <td class="teacher-lbl">Maestro(a) Guía</td>
        <td class="teacher-box">&nbsp;</td>
    </tr>
</table>

{{-- LEGAL --}}
<div class="legal">
    De conformidad con el Reglamento General de Evaluación del Ministerio de Educación, las Áreas y Subáreas se aprueban con el punteo mínimo de sesenta (60) puntos.
    Para los usos legales que al interesado convenga, se extiende la presente en
    {{ $config->direccion ? explode(',', $config->direccion)[0] : 'la ciudad' }},
    a los {{ now()->locale('es')->isoFormat('D [de] MMMM [del] YYYY') }}.
</div>

{{-- SIGNATURES --}}
<table class="sig-tbl">
    <tr>
        <td class="sig-cell">
            <div class="sig-role">Coordinador(a) Académico(a)</div>
            <div class="sig-line"></div>
            <div class="sig-name">{{ $config->coordinador_nombre ?? '________________________________' }}</div>
        </td>
        <td class="sig-cell">
            @if($logoPath)
                <img src="{{ $logoPath }}" alt="Sello" class="seal-img">
            @else
                <div class="seal-circle">DIRECCIÓN<br>{{ $config->abreviatura ?? '' }}</div>
            @endif
        </td>
        <td class="sig-cell">
            <div class="sig-role">Director(a)</div>
            <div class="sig-line"></div>
            <div class="sig-name">{{ $config->director_nombre ?? '________________________________' }}</div>
        </td>
    </tr>
</table>

@if($config->eslogan)
<div class="slogan">{{ $config->eslogan }}</div>
@endif

</body>
</html>
