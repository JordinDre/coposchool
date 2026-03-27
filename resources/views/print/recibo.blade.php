<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Recibo {{ $numero_recibo }}</title>
    <style>
        @page { margin: 1cm 1.2cm; size: letter landscape; }

        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 0;
            color: #111;
            line-height: 1.4;
        }

        .outer {
            border: 2px solid #333;
            padding: 0;
        }

        /* Top header row */
        .header-table { width: 100%; border-collapse: collapse; border-bottom: 1px solid #333; }
        .header-empresa { padding: 10px 12px; vertical-align: top; }
        .empresa-nombre { font-weight: bold; font-size: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        .empresa-sub { font-size: 11px; color: #333; margin-top: 3px; }
        .header-derecha { padding: 6px 10px; vertical-align: top; text-align: right; width: 38%; border-left: 1px solid #333; }

        /* Date grid */
        .fecha-table { border-collapse: collapse; margin-bottom: 6px; float: right; }
        .fecha-table th { border: 1px solid #333; padding: 2px 10px; font-size: 10px; text-align: center; font-weight: bold; }
        .fecha-table td { border: 1px solid #333; padding: 3px 10px; font-size: 14px; text-align: center; font-weight: bold; }

        /* Recibo # and amount row */
        .recibo-row { width: 100%; border-collapse: collapse; border-bottom: 1px solid #333; }
        .recibo-titulo-cell { padding: 8px 12px; text-align: center; vertical-align: middle; }
        .recibo-titulo { font-weight: bold; font-size: 17px; letter-spacing: 1px; }
        .recibo-numero { font-weight: bold; font-size: 17px; color: #b91c1c; }
        .recibo-monto-cell { padding: 6px 12px; text-align: right; vertical-align: middle; border-left: 1px solid #333; width: 22%; }
        .monto-box { border: 1.5px solid #333; display: inline-block; padding: 4px 14px; font-weight: bold; font-size: 16px; }

        /* Body fields */
        .fields-table { width: 100%; border-collapse: collapse; }
        .field-label { padding: 5px 12px 5px 12px; white-space: nowrap; vertical-align: bottom; width: 20%; font-size: 12px; }
        .field-value { padding: 5px 12px 5px 0; border-bottom: 1px solid #555; vertical-align: bottom; font-size: 12px; }
        .field-value-obs { padding: 5px 12px 5px 0; border-bottom: 1px solid #ccc; vertical-align: bottom; font-size: 12px; min-height: 20px; }

        /* Bottom section */
        .bottom-table { width: 100%; border-collapse: collapse; border-top: 1px solid #333; }
        .bottom-saldos { vertical-align: top; padding: 0; width: 30%; border-right: 1px solid #333; }
        .bottom-right { vertical-align: top; padding: 10px 14px; }

        /* Saldos */
        .saldos { width: 100%; border-collapse: collapse; }
        .saldos td { padding: 4px 8px; font-size: 11px; border-bottom: 1px solid #333; }
        .s-label { font-weight: bold; border-right: 1px solid #333; width: 55%; }
        .s-value { text-align: right; }
        .saldos tr:last-child td { border-bottom: none; }

        /* Firmas */
        .lote-txt { font-size: 12px; margin-bottom: 16px; }
        .firmas-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        .firma-cell { text-align: center; padding: 0 10px; vertical-align: bottom; }
        .firma-f { font-size: 11px; margin-bottom: 2px; }
        .firma-line { border-bottom: 1px solid #333; height: 28px; margin-bottom: 3px; }
        .firma-label { font-size: 10px; font-weight: bold; }
    </style>
</head>
<body>
<div class="outer">

    {{-- ── CABECERA ─────────────────────────────────────────── --}}
    <table class="header-table">
        <tr>
            <td class="header-empresa">
                <div class="empresa-nombre">{{ $empresa_nombre }}</div>
                @if($empresa_direccion)
                <div class="empresa-sub">{{ $empresa_direccion }}</div>
                @endif
                @if($empresa_telefono)
                <div class="empresa-sub">Tels. {{ $empresa_telefono }}</div>
                @endif
            </td>
            <td class="header-derecha">
                <table class="fecha-table">
                    <tr>
                        <th>DIA</th>
                        <th>MES</th>
                        <th>AÑO</th>
                    </tr>
                    <tr>
                        <td>{{ $dia }}</td>
                        <td>{{ $mes }}</td>
                        <td>{{ $anio }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- ── RECIBO # + MONTO ─────────────────────────────────── --}}
    <table class="recibo-row">
        <tr>
            <td class="recibo-titulo-cell">
                <span class="recibo-titulo">RECIBO</span>
                <span class="recibo-numero">&nbsp;&nbsp;N<sup>o</sup> {{ $numero_recibo }}</span>
            </td>
            <td class="recibo-monto-cell">
                <div class="monto-box">{{ $simbolo_moneda }} {{ $monto }}</div>
            </td>
        </tr>
    </table>

    {{-- ── CAMPOS ───────────────────────────────────────────── --}}
    <table class="fields-table">
        <tr>
            <td class="field-label">Recibí de:</td>
            <td class="field-value">{{ $cliente_nombre }}</td>
        </tr>
        <tr>
            <td class="field-label">La cantidad de:</td>
            <td class="field-value" style="text-transform: capitalize;">{{ $monto_letras }}</td>
        </tr>
        <tr>
            <td class="field-label">Por:</td>
            <td class="field-value">
                {{ ucfirst($concepto) }} de
                @if($bien_referencia !== '—' && $bien_nombre !== $bien_referencia){{ $bien_referencia }} — @endif{{ $bien_nombre }}
            </td>
        </tr>
        <tr>
            <td class="field-label">Observaciones:</td>
            <td class="field-value-obs">{{ $observaciones ?: '' }}</td>
        </tr>
    </table>

    {{-- ── SALDOS + FIRMAS ─────────────────────────────────── --}}
    <table class="bottom-table">
        <tr>
            <td class="bottom-saldos">
                <table class="saldos">
                    <tr>
                        <td class="s-label">PRECIO</td>
                        <td class="s-value">{{ $simbolo_moneda }} {{ $precio_total }}</td>
                    </tr>
                    <tr>
                        <td class="s-label">ABONO</td>
                        <td class="s-value">{{ $simbolo_moneda }} {{ $monto }}</td>
                    </tr>
                    <tr>
                        <td class="s-label">SALDO ANTERIOR</td>
                        <td class="s-value">{{ $simbolo_moneda }} {{ $saldo_anterior }}</td>
                    </tr>
                    <tr>
                        <td class="s-label">SALDO ACTUAL</td>
                        <td class="s-value">{{ $simbolo_moneda }} {{ $saldo_actual }}</td>
                    </tr>
                </table>
            </td>
            <td class="bottom-right">
                <div class="lote-txt">
                    Lote Número:&nbsp;&nbsp;
                    <span style="font-weight:bold; font-size:15px; border-bottom:1px solid #333; display:inline-block; min-width:60px; text-align:center; padding:0 6px;">{{ $lote_numero }}</span>
                </div>
                <table class="firmas-table">
                    <tr>
                        <td class="firma-cell">
                            <div class="firma-f">f.</div>
                            <div class="firma-line"></div>
                            <div class="firma-label">ENCARGADO</div>
                        </td>
                        <td class="firma-cell">
                            <div class="firma-f">f.</div>
                            <div class="firma-line"></div>
                            <div class="firma-label">DEUDOR</div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

</div>
</body>
</html>
