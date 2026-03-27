<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Resumen de Rendimiento — {{ $seccion->nombre }}</title>
    <style>
        @page { margin: 2cm 2.2cm; size: letter landscape; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 10.5px; color: #111827; background: #fff; line-height: 1.5; }

        /* ── Letterhead ── */
        .lh          { display: table; width: 100%; border-bottom: 2px solid #111827; padding-bottom: 12px; margin-bottom: 24px; }
        .lh-left     { display: table-cell; vertical-align: bottom; }
        .lh-school   { font-size: 16px; font-weight: bold; color: #111827; letter-spacing: -0.3px; }
        .lh-sub      { font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; margin-top: 3px; }
        .lh-right    { display: table-cell; width: 150px; text-align: right; vertical-align: bottom; }
        .lh-lbl      { font-size: 7.5px; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; }
        .lh-date     { font-size: 9.5px; color: #374151; margin-top: 2px; }

        /* ── Section info ── */
        .sec-info    { display: table; width: 100%; margin-bottom: 20px; }
        .sec-cell    { display: table-cell; vertical-align: top; }
        .sec-right   { display: table-cell; width: 180px; text-align: right; vertical-align: top; }
        .info-row    { display: table; width: 100%; margin-bottom: 6px; }
        .info-key    { display: table-cell; width: 80px; font-size: 9px; color: #9ca3af; }
        .info-val    { display: table-cell; font-size: 10.5px; color: #111827; font-weight: 500; }

        /* ── Main table ── */
        .tbl             { width: 100%; border-collapse: collapse; }
        .tbl thead th    { background: #111827; color: #f9fafb; padding: 8px 10px; font-size: 8.5px; font-weight: bold; letter-spacing: 0.04em; }
        .tbl thead th.mat{ text-align: left; }
        .tbl thead th.num{ text-align: center; }
        .tbl thead th.prom-h { background: #030712; text-align: center; }
        .tbl thead th.pct-h  { background: #1f2937; text-align: center; }
        .tbl tbody tr:nth-child(even) td { background: #f9fafb; }
        .tbl tbody td    { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; font-size: 10px; color: #374151; vertical-align: middle; }
        .tbl tbody td.mat-cell  { font-size: 10.5px; }
        .tbl tbody td.nota-cell { text-align: center; font-family: 'Courier New', monospace; font-weight: bold; }
        .tbl tbody td.prom-cell { text-align: center; font-family: 'Courier New', monospace; font-weight: bold; font-size: 11px; background: #f3f4f6; }
        .tbl tbody td.pct-cell  { text-align: center; font-family: 'Courier New', monospace; font-weight: bold; }
        .tbl tbody tr:nth-child(even) td.prom-cell { background: #e9eaec; }
        .nota-pass   { color: #111827; }
        .nota-mid    { color: #b45309; }
        .nota-fail   { color: #dc2626; }
        .nota-empty  { color: #d1d5db; font-weight: normal; }
        .code        { font-size: 8px; color: #9ca3af; margin-right: 5px; }

        /* ── Summary row ── */
        .tbl tfoot td         { padding: 9px 10px; border-top: 2px solid #111827; font-size: 10px; font-weight: bold; background: #f9fafb; }
        .tbl tfoot td.sum-num { text-align: center; font-family: 'Courier New', monospace; }

        /* ── Footer ── */
        .footer      { display: table; width: 100%; margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e7eb; }
        .sig-cell    { display: table-cell; width: 50%; vertical-align: bottom; }
        .sig-line    { border-top: 1px solid #9ca3af; width: 160px; padding-top: 4px; font-size: 8px; color: #9ca3af; }
        .meta-cell   { display: table-cell; text-align: right; vertical-align: bottom; }
        .meta-text   { font-size: 8px; color: #d1d5db; line-height: 1.6; }
    </style>
</head>
<body>
@php
    $tenant  = tenancy()->tenant;
    $colegio = $tenant->company_name ?? 'CopoSchool';
    $hoy     = now()->locale('es')->isoFormat('D [de] MMMM [de] YYYY');

    // Global averages for footer
    $totalProm = $resumen->whereNotNull('promedio')->avg('promedio');
    $totalPct  = $resumen->whereNotNull('pct_aprobados')->avg('pct_aprobados');
@endphp

{{-- Letterhead --}}
<div class="lh">
    <div class="lh-left">
        <div class="lh-school">{{ $colegio }}</div>
        <div class="lh-sub">Resumen de Rendimiento Académico</div>
    </div>
    <div class="lh-right">
        <div class="lh-lbl">Fecha de emisión</div>
        <div class="lh-date">{{ $hoy }}</div>
    </div>
</div>

{{-- Section info --}}
<div class="sec-info">
    <div class="sec-cell">
        <div class="info-row">
            <div class="info-key">Sección</div>
            <div class="info-val">{{ $seccion->nombre }}</div>
        </div>
        <div class="info-row">
            <div class="info-key">Ciclo</div>
            <div class="info-val">{{ ucfirst($seccion->ciclo) }} {{ $seccion->ciclo_escolar }}</div>
        </div>
    </div>
    <div class="sec-right">
        <div class="info-row">
            <div class="info-key">Materias</div>
            <div class="info-val">{{ $resumen->count() }}</div>
        </div>
        <div class="info-row">
            <div class="info-key">Unidades</div>
            <div class="info-val">{{ $unidades->count() }}</div>
        </div>
    </div>
</div>

{{-- Main table --}}
<table class="tbl">
    <thead>
        <tr>
            <th class="mat" style="width:30%">Materia</th>
            @foreach($unidades as $u)
                <th class="num" style="width:{{ round(44 / max($unidades->count(), 1), 1) }}%">{{ $u->orden }}. {{ Str::limit($u->nombre, 10) }}</th>
            @endforeach
            <th class="prom-h" style="width:8%">Promedio</th>
            <th class="pct-h" style="width:9%">% Aprobados</th>
            <th class="num" style="width:9%">Notas reg.</th>
        </tr>
    </thead>
    <tbody>
        @foreach($resumen as $row)
        <tr>
            <td class="mat-cell">
                @if($row['materia']['codigo'])<span class="code">{{ $row['materia']['codigo'] }}</span>@endif
                {{ $row['materia']['nombre'] }}
            </td>
            @foreach($unidades as $u)
            @php $nota = $row['por_unidad'][$u->id] ?? null; @endphp
            <td class="nota-cell">
                @if($nota !== null)
                    <span class="{{ $nota >= 60 ? 'nota-pass' : ($nota >= 50 ? 'nota-mid' : 'nota-fail') }}">{{ number_format($nota, 1) }}</span>
                @else
                    <span class="nota-fail">0</span>
                @endif
            </td>
            @endforeach
            <td class="prom-cell">
                @if($row['promedio'] !== null)
                    <span class="{{ $row['promedio'] >= 60 ? 'nota-pass' : ($row['promedio'] >= 50 ? 'nota-mid' : 'nota-fail') }}">{{ number_format($row['promedio'], 1) }}</span>
                @else
                    <span class="nota-fail">0</span>
                @endif
            </td>
            <td class="pct-cell">
                @if($row['pct_aprobados'] !== null)
                    <span class="{{ $row['pct_aprobados'] >= 70 ? 'nota-pass' : ($row['pct_aprobados'] >= 50 ? 'nota-mid' : 'nota-fail') }}">{{ $row['pct_aprobados'] }}%</span>
                @else
                    <span class="nota-fail">0</span>
                @endif
            </td>
            <td class="nota-cell" style="color:#6b7280">{{ $row['registradas'] }}</td>
        </tr>
        @endforeach
    </tbody>
    @if($resumen->count() > 1)
    <tfoot>
        <tr>
            <td><strong>General</strong></td>
            @foreach($unidades as $u)
                <td></td>
            @endforeach
            <td class="sum-num">
                @if($totalProm !== null)
                    <span class="{{ $totalProm >= 60 ? 'nota-pass' : 'nota-fail' }}">{{ number_format($totalProm, 1) }}</span>
                @else —@endif
            </td>
            <td class="sum-num">
                @if($totalPct !== null)
                    <span class="{{ $totalPct >= 70 ? 'nota-pass' : ($totalPct >= 50 ? 'nota-mid' : 'nota-fail') }}">{{ number_format($totalPct, 0) }}%</span>
                @else —@endif
            </td>
            <td></td>
        </tr>
    </tfoot>
    @endif
</table>

{{-- Footer --}}
<div class="footer">
    <div class="sig-cell">
        <div class="sig-line">Firma y sello</div>
    </div>
    <div class="meta-cell">
        <div class="meta-text">{{ $colegio }}<br>Documento generado automáticamente</div>
    </div>
</div>

</body>
</html>
