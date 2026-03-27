<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Lista de Inscritos — {{ $seccion->nombre }}</title>
    <style>
        @page { margin: 2.5cm 2.8cm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111827; background: #fff; line-height: 1.5; }

        /* ── Letterhead ── */
        .lh          { display: table; width: 100%; border-bottom: 2px solid #111827; padding-bottom: 14px; margin-bottom: 28px; }
        .lh-left     { display: table-cell; vertical-align: bottom; }
        .lh-school   { font-size: 17px; font-weight: bold; color: #111827; letter-spacing: -0.3px; }
        .lh-sub      { font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; margin-top: 4px; }
        .lh-right    { display: table-cell; width: 140px; text-align: right; vertical-align: bottom; }
        .lh-lbl      { font-size: 8px; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; }
        .lh-date     { font-size: 10px; color: #374151; margin-top: 3px; }

        /* ── Section info ── */
        .sec-bar       { display: table; width: 100%; border-left: 3px solid #111827; padding-left: 12px; margin-bottom: 24px; }
        .sec-nombre    { font-size: 14px; font-weight: bold; }
        .sec-meta      { font-size: 9.5px; color: #6b7280; margin-top: 3px; }

        /* ── Table ── */
        .tbl                { width: 100%; border-collapse: collapse; }
        .tbl thead th       { background: #111827; color: #f9fafb; padding: 9px 11px; font-size: 9px; font-weight: bold; letter-spacing: 0.04em; text-align: left; }
        .tbl thead th.ctr   { text-align: center; }
        .tbl tbody tr:nth-child(even) td { background: #f9fafb; }
        .tbl tbody td       { padding: 9px 11px; font-size: 10.5px; border-bottom: 1px solid #f3f4f6; color: #374151; vertical-align: middle; }
        .tbl tbody td.num   { text-align: center; color: #9ca3af; font-size: 10px; width: 36px; }
        .tbl tbody td.name  { font-weight: 500; color: #111827; }
        .tbl tbody td.muted { color: #6b7280; }
        .badge-inactive     { font-size: 8.5px; color: #dc2626; margin-left: 6px; font-weight: normal; }
        .dash-line          { border-bottom: 1px dotted #d1d5db; height: 24px; display: block; }

        /* ── Summary ── */
        .summary    { margin-top: 24px; display: table; width: 100%; }
        .sum-cell   { display: table-cell; vertical-align: top; }
        .sum-right  { display: table-cell; width: 200px; vertical-align: top; text-align: right; }
        .sum-label  { font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; }
        .sum-val    { font-size: 22px; font-weight: bold; color: #111827; line-height: 1.2; }
        .sum-sub    { font-size: 9px; color: #6b7280; }

        /* ── Footer ── */
        .footer     { display: table; width: 100%; margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
        .sig-cell   { display: table-cell; width: 50%; vertical-align: bottom; }
        .sig-line   { border-top: 1px solid #9ca3af; width: 170px; padding-top: 5px; font-size: 8.5px; color: #9ca3af; }
        .meta-cell  { display: table-cell; text-align: right; vertical-align: bottom; }
        .meta-text  { font-size: 8.5px; color: #d1d5db; line-height: 1.6; }
    </style>
</head>
<body>
@php
    $tenant   = tenancy()->tenant;
    $colegio  = $tenant->company_name ?? 'CopoSchool';
    $hoy      = now()->locale('es')->isoFormat('D [de] MMMM [de] YYYY');
    $activos  = $estudiantes->where('deleted_at', null)->count();
    $inactivos = $estudiantes->whereNotNull('deleted_at')->count();
@endphp

{{-- Letterhead --}}
<div class="lh">
    <div class="lh-left">
        <div class="lh-school">{{ $colegio }}</div>
        <div class="lh-sub">Lista de Estudiantes Inscritos</div>
    </div>
    <div class="lh-right">
        <div class="lh-lbl">Fecha de emisión</div>
        <div class="lh-date">{{ $hoy }}</div>
    </div>
</div>

{{-- Section info --}}
<div class="sec-bar">
    <div class="sec-nombre">{{ $seccion->nombre }}</div>
    <div class="sec-meta">{{ ucfirst($seccion->ciclo) }} &nbsp;·&nbsp; {{ $seccion->ciclo_escolar }}</div>
</div>

{{-- Student table --}}
<table class="tbl">
    <thead>
        <tr>
            <th class="ctr">#</th>
            <th>Nombre completo</th>
            <th>Correo electrónico</th>
            <th>Teléfono</th>
            <th>Estado</th>
        </tr>
    </thead>
    <tbody>
        @forelse($estudiantes as $i => $est)
        <tr>
            <td class="num">{{ $i + 1 }}</td>
            <td class="name">
                {{ $est->name }}
            </td>
            <td class="muted">{{ $est->email }}</td>
            <td class="muted">{{ $est->telefono ?? '—' }}</td>
            <td>
                @if($est->deleted_at)
                    <span style="color:#dc2626; font-size:9px; font-weight:bold; text-transform:uppercase; letter-spacing:0.06em;">Inactivo</span>
                @else
                    <span style="color:#15803d; font-size:9px; font-weight:bold; text-transform:uppercase; letter-spacing:0.06em;">Activo</span>
                @endif
            </td>
        </tr>
        @empty
        <tr>
            <td colspan="5" style="text-align:center; color:#9ca3af; padding:24px;">Sin estudiantes inscritos en esta sección.</td>
        </tr>
        @endforelse
    </tbody>
</table>

{{-- Summary --}}
<div class="summary">
    <div class="sum-cell">
        <div class="sum-label">Total inscritos</div>
        <div class="sum-val">{{ $estudiantes->count() }}</div>
        <div class="sum-sub">{{ $activos }} activos · {{ $inactivos }} inactivos</div>
    </div>
    <div class="sum-right">
        <div class="sum-label">Firma del encargado</div>
        <div class="dash-line" style="margin-top:20px;"></div>
    </div>
</div>

{{-- Footer --}}
<div class="footer">
    <div class="sig-cell">
        <div class="sig-line">Firma y sello de dirección</div>
    </div>
    <div class="meta-cell">
        <div class="meta-text">{{ $colegio }}<br>Documento generado automáticamente</div>
    </div>
</div>

</body>
</html>
