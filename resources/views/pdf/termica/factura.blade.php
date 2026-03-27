<!DOCTYPE html>
<html>
<head>
    <title>Venta {{ $venta->id }}</title>
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <meta http-equiv="content-type" content="text-html; charset=utf-8">
    <style>
        @page {
            margin: 0.5cm 0.3cm;
            font-family: Arial, sans-serif;
            font-size: 10px;
        }

        body {
            margin: 0;
            padding: 5px;
            text-align: center;
            font-size: 10px;
        }

        .salto {
            margin-top: 8px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }

        th,
        td {
            padding: 4px 2px;
            border: 0.5px solid black;
            text-align: center;
            font-size: 9px;
        }

        th {
            font-weight: bold;
        }

        tr:last-child td {
            font-weight: bold;
        }

        .empresa-nombre {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 2px;
        }

        .documento-titulo {
            font-weight: bold;
            font-size: 14px;
            margin: 8px 0;
        }

        .info-line {
            margin: 2px 0;
            font-size: 9px;
        }

        .fel-box {
            border: 0.5px solid black;
            padding: 5px;
            margin-top: 8px;
            font-size: 8px;
        }
    </style>
</head>
<body>
    <div class="salto">
        @if($configuracion)
            @php
                $logoMedia = $configuracion->getFirstMedia('logo');
                $logoUrl = null;
                if ($logoMedia) {
                    $logoUrl = $logoMedia->getUrl();
                    // Asegurar que sea una URL absoluta completa
                    if ($logoUrl && !preg_match('/^https?:\/\//', $logoUrl)) {
                        $logoUrl = \Illuminate\Support\Facades\Storage::disk('s3')->url($logoMedia->getPath());
                    }
                }
            @endphp
            @if($logoUrl)
            <div style="margin-bottom: 8px; text-align: center;">
                <img src="{{ $logoUrl }}" alt="Logo" style="max-height: 50px; max-width: 150px; object-fit: contain;" />
            </div>
            @endif
        @endif
        @if($configuracion && $configuracion->nombre_empresa)
        <div class="empresa-nombre">{{ $configuracion->nombre_empresa }}</div>
        @elseif($configuracion && $configuracion->razon_social)
        <div class="empresa-nombre">{{ $configuracion->razon_social }}</div>
        @endif
        @if($venta->bodega && $venta->bodega->nombre_comercial)
        <div>{{ $venta->bodega->nombre_comercial }}</div>
        @endif
        @if($configuracion && $configuracion->digifact_tax_id)
        <div>NIT: {{ $configuracion->digifact_tax_id }}</div>
        @endif
        @if($venta->bodega && $venta->bodega->direccion)
        <div>{{ $venta->bodega->direccion }}</div>
        @endif
        @if($venta->bodega && $venta->bodega->municipio)
        <div>
            {{ $venta->bodega->municipio->nombre ?? '' }}
            @if($venta->bodega->municipio->departamento)
            , {{ $venta->bodega->municipio->departamento->nombre }}
            @endif
            @if($venta->bodega->codigo_postal)
            , {{ $venta->bodega->codigo_postal }}
            @endif
        </div>
        @endif
    </div>

    <div class="documento-titulo">
        @if(isset($esAnulada) && $esAnulada)
            VENTA ANULADA #{{ $venta->id }}
        @else
            VENTA #{{ $venta->id }}
        @endif
    </div>

    @if($factura)
    <div class="fel-box">
        <div style="font-weight: bold;">DOCUMENTO ELECTRÓNICO</div>
        @if(isset($esAnulada) && $esAnulada)
            <div style="font-weight: bold; color: red; margin-bottom: 3px;">ESTE DOCUMENTO HA SIDO ANULADO</div>
        @endif
        <div>Autorización: {{ $factura->fel_autorizacion }}</div>
        <div>Serie: {{ $factura->fel_serie }} - Número: {{ $factura->fel_numero }}</div>
        @if($factura->fel_fecha)
        <div>Fecha: {{ $factura->fel_fecha }}</div>
        @endif
        @if(isset($anulacion) && $anulacion && $anulacion->motivo)
        <div style="margin-top: 5px; font-weight: bold;">Motivo de Anulación:</div>
        <div style="font-size: 7px;">{{ $anulacion->motivo }}</div>
        @endif
    </div>
    @endif

    <div class="salto">
        <div class="info-line"><strong>Fecha:</strong> {{ $venta->created_at->format('Y-m-d H:i:s') }}</div>
        @if($venta->fecha_vencimiento)
        <div class="info-line" style="font-weight: bold; color: #d32f2f;"><strong>Fecha de Vencimiento:</strong> {{ \Carbon\Carbon::parse($venta->fecha_vencimiento)->format('Y-m-d') }}</div>
        @endif
        <div class="info-line"><strong>Caja:</strong> {{ $venta->caja->codigo ?? 'N/A' }}</div>
        <div class="info-line"><strong>Bodega:</strong> {{ $venta->bodega->nombre ?? 'N/A' }}</div>
    </div>

    <div class="salto">
        <div class="info-line"><strong>NIT Cliente:</strong> {{ $venta->nit ?? 'CF' }}</div>
        <div class="info-line"><strong>Nombre:</strong> {{ $venta->nombre ?? 'CONSUMIDOR FINAL' }}</div>
    </div>

    <div class="salto">
        <div class="info-line"><strong>Vendedor:</strong> {{ $venta->creadoPor->name ?? 'N/A' }}</div>
    </div>

    <table>
        <tr>
            <th>Cant</th>
            <th>Bonif.</th>
            <th>B/S</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Total</th>
        </tr>
        @foreach ($venta->detalles as $detalle)
            <tr>
                <td>{{ $detalle->cantidad }}</td>
                <td>{{ $detalle->bonificacion ?? 0 }}</td>
                <td style="text-align: center; font-size: 8px;">
                    @if($detalle->producto_id)
                        B
                    @elseif($detalle->servicio_id)
                        S
                    @else
                        -
                    @endif
                </td>
                <td style="text-align: left; font-size: 8px;">
                    @if($detalle->producto_id)
                        {{ $detalle->producto->codigo ?? 'N/A' }} - {{ $detalle->producto->nombre ?? 'N/A' }}
                    @elseif($detalle->servicio_id)
                        {{ ($detalle->servicio->codigo ? $detalle->servicio->codigo . ' - ' : '') }}{{ $detalle->servicio->nombre ?? 'N/A' }}
                    @else
                        N/A
                    @endif
                </td>
                <td>Q{{ number_format($detalle->precio, 2) }}</td>
                <td>Q{{ number_format($detalle->subtotal, 2) }}</td>
            </tr>
        @endforeach
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td style="text-align: right;">SUBTOTAL</td>
            <td></td>
            <td>Q{{ number_format($venta->subtotal, 2) }}</td>
        </tr>
        @if($venta->envio && $venta->envio > 0)
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td style="text-align: right;">ENVÍO</td>
            <td></td>
            <td>Q{{ number_format($venta->envio, 2) }}</td>
        </tr>
        @endif
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td style="text-align: right;">TOTAL</td>
            <td></td>
            <td>Q{{ number_format($venta->total, 2) }}</td>
        </tr>
    </table>

    @if($venta->observacion)
    <div class="salto">
        <div style="font-weight: bold; font-size: 9px;">OBSERVACIONES:</div>
        <div style="font-size: 8px;">{{ $venta->observacion }}</div>
    </div>
    @endif

    @if($factura)
    <div class="salto fel-box">
        @if(isset($esAnulada) && $esAnulada)
            <div style="font-weight: bold; color: red; margin-bottom: 3px;">VENTA ELECTRÓNICA ANULADA</div>
        @else
            <div style="font-weight: bold;">VENTA ELECTRÓNICA</div>
        @endif
        <div>Autorización: {{ $factura->fel_autorizacion }}</div>
        <div>Serie: {{ $factura->fel_serie }} - Número: {{ $factura->fel_numero }}</div>
        @if($factura->fel_fecha)
        <div>Fecha Autorización: {{ $factura->fel_fecha }}</div>
        @endif
        @if(isset($anulacion) && $anulacion && $anulacion->motivo)
        <div style="margin-top: 5px; font-weight: bold;">Motivo de Anulación:</div>
        <div style="font-size: 7px;">{{ $anulacion->motivo }}</div>
        @endif
        <div style="margin-top: 5px; font-size: 7px;">
            @if(isset($esAnulada) && $esAnulada)
                Este documento ha sido anulado electrónicamente
            @else
                Autorizado electrónicamente por la SAT
            @endif
        </div>
    </div>
    @endif

    <div class="salto" style="font-size: 9px;">
        <div>Gracias por su compra</div>
    </div>
</body>
</html>
