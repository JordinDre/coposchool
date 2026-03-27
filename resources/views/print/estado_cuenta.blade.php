<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Estado de Cuenta - {{ $contrato['numero'] }}</title>
    <style>
        @page { margin: 1cm 1.2cm; }

        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            margin: 0;
            padding: 0;
            color: #222;
        }

        /* Header */
        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .empresa-nombre { font-weight: bold; font-size: 16px; }
        .empresa-sub { font-size: 10px; color: #555; margin-top: 3px; }
        .doc-titulo { font-weight: bold; font-size: 20px; color: #1a1a1a; text-align: right; }
        .doc-numero { font-weight: bold; font-size: 15px; color: #b91c1c; text-align: right; }
        .doc-fecha { font-size: 10px; color: #555; text-align: right; margin-top: 4px; }

        /* Info boxes */
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        .info-box { border: 1px solid #ccc; border-radius: 3px; padding: 8px 10px; vertical-align: top; width: 50%; }
        .info-box-inner { width: 100%; border-collapse: collapse; }
        .info-box h3 {
            margin: 0 0 6px 0;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #555;
            border-bottom: 1px solid #ddd;
            padding-bottom: 4px;
        }
        .info-row-label { font-weight: bold; color: #555; white-space: nowrap; padding: 2px 8px 2px 0; font-size: 11px; width: 40%; }
        .info-row-value { font-size: 11px; padding: 2px 0; }

        /* Payments table */
        .section-title { font-size: 12px; font-weight: bold; margin: 14px 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; }
        table.pagos { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        table.pagos th, table.pagos td { border: 0.5px solid #aaa; padding: 5px 7px; font-size: 10px; }
        table.pagos th { background-color: #f0f0f0; font-weight: bold; text-align: left; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }

        /* Summary box */
        .summary-outer { width: 100%; border-collapse: collapse; }
        .summary-spacer { width: 55%; }
        .summary-box { border: 1px solid #ccc; border-radius: 3px; padding: 8px 12px; background: #fafafa; width: 45%; vertical-align: top; }
        .summary-inner { width: 100%; border-collapse: collapse; }
        .summary-row-label { font-size: 11px; padding: 3px 0; color: #333; }
        .summary-row-value { font-size: 11px; padding: 3px 0; text-align: right; }
        .summary-sep td { border-bottom: 1px dotted #bbb; padding-bottom: 5px; }
        .summary-total td { border-top: 1.5px solid #333; padding-top: 5px; font-weight: bold; font-size: 13px; }

        /* Badge */
        .badge { padding: 1px 6px; border-radius: 3px; font-size: 10px; font-weight: bold; }
        .badge-green { background: #d1fae5; color: #065f46; }
        .badge-red { background: #fee2e2; color: #991b1b; }
        .badge-blue { background: #dbeafe; color: #1e40af; }
        .badge-gray { background: #f3f4f6; color: #374151; }

        .empty { text-align: center; color: #777; font-style: italic; padding: 16px; border: 1px dashed #ccc; }
        .notas-box { margin-top: 16px; border: 1px solid #ddd; border-radius: 3px; padding: 8px 10px; font-size: 10px; color: #555; }
    </style>
</head>
<body>

    {{-- ── CABECERA ──────────────────────────────────────────── --}}
    <table class="header-table">
        <tr>
            <td style="width:55%; vertical-align:top;">
                <div class="empresa-nombre">{{ $empresa_nombre }}</div>
                <div class="empresa-sub">Estado de Cuenta</div>
            </td>
            <td style="width:45%; vertical-align:top;">
                <div class="doc-titulo">ESTADO DE CUENTA</div>
                <div class="doc-numero">{{ $contrato['numero'] }}</div>
                <div class="doc-fecha">Generado: {{ date('d/m/Y H:i') }}</div>
            </td>
        </tr>
    </table>

    {{-- ── INFO BOXES ────────────────────────────────────────── --}}
    <table class="info-table">
        <tr>
            <td class="info-box" style="padding-right: 6px;">
                <h3>Contrato</h3>
                <table class="info-box-inner">
                    <tr>
                        <td class="info-row-label">Número:</td>
                        <td class="info-row-value">{{ $contrato['numero'] }}</td>
                    </tr>
                    <tr>
                        <td class="info-row-label">Estado:</td>
                        <td class="info-row-value">
                            @php
                                $estadoClass = match($contrato['estado']) {
                                    'vigente'   => 'badge-green',
                                    'mora'      => 'badge-red',
                                    'liquidado' => 'badge-blue',
                                    default     => 'badge-gray',
                                };
                                $estadoLabel = match($contrato['estado']) {
                                    'vigente'   => 'Vigente',
                                    'mora'      => 'En mora',
                                    'liquidado' => 'Liquidado',
                                    'cancelado' => 'Cancelado',
                                    default     => $contrato['estado'],
                                };
                            @endphp
                            <span class="badge {{ $estadoClass }}">{{ $estadoLabel }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="info-row-label">Fecha inicio:</td>
                        <td class="info-row-value">{{ date('d/m/Y', strtotime($contrato['fecha_inicio'])) }}</td>
                    </tr>
                    @if(!empty($contrato['plazo_meses']))
                    <tr>
                        <td class="info-row-label">Plazo:</td>
                        <td class="info-row-value">{{ $contrato['plazo_meses'] }} cuotas</td>
                    </tr>
                    @endif
                    @if(!empty($contrato['cuota_mensual']))
                    <tr>
                        <td class="info-row-label">Cuota mensual:</td>
                        <td class="info-row-value">{{ $simbolo_moneda }} {{ number_format($contrato['cuota_mensual'], 2) }}</td>
                    </tr>
                    @endif
                </table>
            </td>
            <td style="width: 8px;"></td>
            <td class="info-box" style="padding-left: 6px;">
                <h3>Cliente y Bien</h3>
                <table class="info-box-inner">
                    <tr>
                        <td class="info-row-label">Cliente:</td>
                        <td class="info-row-value">{{ $contrato['cliente']['name'] ?? '—' }}</td>
                    </tr>
                    @if(!empty($contrato['cliente']['nit']))
                    <tr>
                        <td class="info-row-label">NIT:</td>
                        <td class="info-row-value">{{ $contrato['cliente']['nit'] }}</td>
                    </tr>
                    @endif
                    <tr>
                        <td class="info-row-label" style="padding-top:6px;">Bien:</td>
                        <td class="info-row-value" style="padding-top:6px;">{{ $contrato['bien']['nombre'] ?? '—' }}</td>
                    </tr>
                    @if(!empty($contrato['bien']['referencia']))
                    <tr>
                        <td class="info-row-label">Referencia:</td>
                        <td class="info-row-value" style="font-family: monospace;">{{ $contrato['bien']['referencia'] }}</td>
                    </tr>
                    @endif
                    <tr>
                        <td class="info-row-label">Tipo:</td>
                        <td class="info-row-value" style="text-transform: capitalize;">{{ $contrato['bien']['tipo'] ?? '—' }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- ── HISTORIAL DE PAGOS ────────────────────────────────── --}}
    <div class="section-title">Historial de Pagos</div>

    @if(count($contrato['pagos']) > 0)
    <table class="pagos">
        <thead>
            <tr>
                <th class="text-center" style="width: 35px;">No.</th>
                <th style="width: 70px;">Fecha</th>
                <th style="width: 70px;">Concepto</th>
                <th style="width: 70px;">Método</th>
                <th>Referencia / Notas</th>
                <th class="text-right" style="width: 90px;">Monto</th>
            </tr>
        </thead>
        <tbody>
            @foreach($contrato['pagos'] as $i => $pago)
            <tr>
                <td class="text-center">{{ $i + 1 }}</td>
                <td>{{ date('d/m/Y', strtotime($pago['fecha'])) }}</td>
                <td style="text-transform: capitalize;">{{ $pago['concepto'] ?? '—' }}</td>
                <td style="text-transform: capitalize;">{{ $pago['metodo_pago'] ?? '—' }}</td>
                <td style="color: #555;">
                    @if(!empty($pago['referencia'])){{ $pago['referencia'] }}@endif
                    @if(!empty($pago['referencia']) && !empty($pago['notas'])) · @endif
                    @if(!empty($pago['notas'])){{ $pago['notas'] }}@endif
                    @if(empty($pago['referencia']) && empty($pago['notas']))—@endif
                </td>
                <td class="text-right" style="font-weight: bold;">{{ $simbolo_moneda }} {{ number_format($pago['monto'], 2) }}</td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="5" class="text-right" style="font-weight: bold; background: #f0f0f0;">TOTAL PAGADO</td>
                <td class="text-right" style="font-weight: bold; background: #f0f0f0;">{{ $simbolo_moneda }} {{ number_format($contrato['total_pagado'], 2) }}</td>
            </tr>
        </tfoot>
    </table>
    @else
    <div class="empty">No hay pagos registrados.</div>
    @endif

    {{-- ── RESUMEN FINANCIERO ────────────────────────────────── --}}
    <table class="summary-outer">
        <tr>
            <td class="summary-spacer"></td>
            <td class="summary-box">
                <table class="summary-inner">
                    <tr>
                        <td class="summary-row-label">Precio total:</td>
                        <td class="summary-row-value">{{ $simbolo_moneda }} {{ number_format($contrato['precio_total'], 2) }}</td>
                    </tr>
                    <tr>
                        <td class="summary-row-label">Enganche:</td>
                        <td class="summary-row-value">{{ $simbolo_moneda }} {{ number_format($contrato['enganche'], 2) }}</td>
                    </tr>
                    <tr class="summary-sep">
                        <td class="summary-row-label">Saldo financiado:</td>
                        <td class="summary-row-value">{{ $simbolo_moneda }} {{ number_format($contrato['saldo_financiado'], 2) }}</td>
                    </tr>
                    @if(!empty($contrato['tasa_interes']) && $contrato['tasa_interes'] > 0)
                    <tr>
                        <td class="summary-row-label">Tasa de interés:</td>
                        <td class="summary-row-value">{{ $contrato['tasa_interes'] }}% anual</td>
                    </tr>
                    @endif
                    <tr>
                        <td class="summary-row-label" style="color: #059669;">Total pagado:</td>
                        <td class="summary-row-value" style="color: #059669; font-weight: bold;">{{ $simbolo_moneda }} {{ number_format($contrato['total_pagado'], 2) }}</td>
                    </tr>
                    <tr class="summary-total">
                        <td class="summary-row-label">Saldo pendiente:</td>
                        <td class="summary-row-value">{{ $simbolo_moneda }} {{ number_format($contrato['saldo_actual'], 2) }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    @if(!empty($contrato['notas']))
    <div class="notas-box">
        <strong>Notas:</strong> {{ $contrato['notas'] }}
    </div>
    @endif

</body>
</html>
