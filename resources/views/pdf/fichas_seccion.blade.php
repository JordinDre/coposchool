<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Fichas Académicas — {{ $seccion->nombre }}</title>
    <style>
        @page { margin: 2.5cm 2.8cm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111827; background: #fff; line-height: 1.5; }
        .page-break { page-break-after: always; }

        /* ── Letterhead ── */
        .lh           { display: table; width: 100%; border-bottom: 2px solid #111827; padding-bottom: 14px; margin-bottom: 28px; }
        .lh-left      { display: table-cell; vertical-align: bottom; }
        .lh-school    { font-size: 17px; font-weight: bold; color: #111827; letter-spacing: -0.3px; }
        .lh-subtitle  { font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; margin-top: 4px; }
        .lh-right     { display: table-cell; width: 140px; text-align: right; vertical-align: bottom; }
        .lh-date-lbl  { font-size: 8px; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; }
        .lh-date      { font-size: 10px; color: #374151; margin-top: 3px; }

        /* ── Student info block ── */
        .student-block      { margin-bottom: 28px; }
        .block-title        { font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.12em; color: #9ca3af; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 14px; }
        .info-row           { display: table; width: 100%; margin-bottom: 8px; }
        .info-key           { display: table-cell; width: 90px; font-size: 10px; color: #9ca3af; vertical-align: top; }
        .info-val           { display: table-cell; font-size: 11px; color: #111827; vertical-align: top; }
        .info-val.name      { font-size: 13px; font-weight: bold; }
        .badge-inactive     { font-size: 8.5px; color: #dc2626; font-weight: normal; margin-left: 6px; }

        /* ── Grades section ── */
        .grades-title       { font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.12em; color: #9ca3af; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 14px; }

        /* ── Grades table ── */
        .tbl                { width: 100%; border-collapse: collapse; }
        .tbl thead th       { background: #111827; color: #f9fafb; padding: 9px 11px; font-size: 9px; font-weight: bold; text-align: center; letter-spacing: 0.04em; }
        .tbl thead th.mat   { text-align: left; }
        .tbl thead th.prom  { background: #030712; }
        .tbl tbody tr:nth-child(even) td { background: #f9fafb; }
        .tbl tbody td       { padding: 9px 11px; font-size: 10.5px; border-bottom: 1px solid #f3f4f6; color: #374151; vertical-align: middle; }
        .tbl tbody td.nota  { text-align: center; font-family: 'Courier New', monospace; font-weight: bold; font-size: 11px; }
        .tbl tbody td.prom  { text-align: center; font-family: 'Courier New', monospace; font-weight: bold; font-size: 11.5px; background: #f3f4f6; }
        .tbl tbody tr:nth-child(even) td.prom { background: #e9eaec; }
        .nota-pass          { color: #111827; }
        .nota-mid           { color: #b45309; }
        .nota-fail          { color: #dc2626; }
        .nota-empty         { color: #d1d5db; font-weight: normal; }
        .code               { font-size: 8.5px; color: #9ca3af; margin-right: 5px; }

        /* ── Footer ── */
        .footer             { display: table; width: 100%; margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
        .sig-cell           { display: table-cell; width: 50%; vertical-align: bottom; }
        .sig-line           { border-top: 1px solid #9ca3af; width: 170px; padding-top: 5px; font-size: 8.5px; color: #9ca3af; }
        .meta-cell          { display: table-cell; text-align: right; vertical-align: bottom; }
        .meta-text          { font-size: 8.5px; color: #d1d5db; line-height: 1.6; }

        .empty-msg          { text-align: center; color: #9ca3af; font-size: 10px; padding: 30px 0; }
    </style>
</head>
<body>
@php
    $tenant   = tenancy()->tenant;
    $colegio  = $tenant->company_name ?? 'CopoSchool';
    $hoy      = now()->locale('es')->isoFormat('D [de] MMMM [de] YYYY');
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

{{-- Letterhead --}}
<div class="lh">
    <div class="lh-left">
        <div class="lh-school">{{ $colegio }}</div>
        <div class="lh-subtitle">Ficha Académica &mdash; {{ $seccion->nombre }} &nbsp;·&nbsp; {{ ucfirst($seccion->ciclo) }} {{ $seccion->ciclo_escolar }}</div>
    </div>
    <div class="lh-right">
        <div class="lh-date-lbl">Fecha de emisión</div>
        <div class="lh-date">{{ $hoy }}</div>
    </div>
</div>

{{-- Student data --}}
<div class="student-block">
    <div class="block-title">Datos del Estudiante</div>
    <div class="info-row">
        <div class="info-key">Nombre</div>
        <div class="info-val name">
            {{ $estudiante->name }}
            @if($estudiante->deleted_at)<span class="badge-inactive">(Inactivo)</span>@endif
        </div>
    </div>
    <div class="info-row">
        <div class="info-key">Correo</div>
        <div class="info-val">{{ $estudiante->email }}</div>
    </div>
    @if($estudiante->telefono)
    <div class="info-row">
        <div class="info-key">Teléfono</div>
        <div class="info-val">{{ $estudiante->telefono }}</div>
    </div>
    @endif
    <div class="info-row">
        <div class="info-key">Sección</div>
        <div class="info-val">{{ $seccion->nombre }} &nbsp;·&nbsp; {{ ucfirst($seccion->ciclo) }} {{ $seccion->ciclo_escolar }}</div>
    </div>
</div>

{{-- Grades --}}
<div class="grades-title">Calificaciones por Unidad</div>

@if($materias->count() > 0 && $unidades->count() > 0)
<table class="tbl">
    <thead>
        <tr>
            <th class="mat" style="width:38%">Materia</th>
            @foreach($unidades as $u)
                <th style="width:{{ round(53 / $unidades->count(), 1) }}%">
                    {{ $u->orden }}. {{ Str::limit($u->nombre, 12) }}
                </th>
            @endforeach
            <th class="prom" style="width:9%">Prom.</th>
        </tr>
    </thead>
    <tbody>
        @foreach($materias as $m)
        @php
            $rowNotas = [];
            foreach ($unidades as $u) {
                $rowNotas[] = $lookup[$m->id][$u->id] ?? null;
            }
            $filled   = array_filter($rowNotas, fn ($n) => $n !== null);
            $promedio = count($filled) > 0 ? round(array_sum($filled) / count($filled), 1) : null;
        @endphp
        <tr>
            <td>
                @if($m->codigo)<span class="code">{{ $m->codigo }}</span>@endif{{ $m->nombre }}
            </td>
            @foreach($rowNotas as $nota)
            <td class="nota">
                @if($nota !== null)
                    <span class="{{ $nota >= 60 ? 'nota-pass' : ($nota >= 50 ? 'nota-mid' : 'nota-fail') }}">{{ number_format($nota, 0) }}</span>
                @else
                    <span class="nota-fail">0</span>
                @endif
            </td>
            @endforeach
            <td class="prom">
                @if($promedio !== null)
                    <span class="{{ $promedio >= 60 ? 'nota-pass' : ($promedio >= 50 ? 'nota-mid' : 'nota-fail') }}">{{ number_format($promedio, 1) }}</span>
                @else
                    <span class="nota-fail">0</span>
                @endif
            </td>
        </tr>
        @endforeach
    </tbody>
</table>
@else
    <div class="empty-msg">No hay materias o unidades registradas para esta sección.</div>
@endif

{{-- Footer --}}
<div class="footer">
    <div class="sig-cell">
        <div class="sig-line">Firma y sello</div>
    </div>
    <div class="meta-cell">
        <div class="meta-text">{{ $colegio }}<br>Documento generado automáticamente</div>
    </div>
</div>

@if(!$loop->last)
    <div class="page-break"></div>
@endif
@endforeach

</body>
</html>
