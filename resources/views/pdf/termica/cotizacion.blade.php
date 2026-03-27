<!DOCTYPE html>
<html>
<head>
    <title>Cotización {{ $cotizacion->id }}</title>
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
    </style>
</head>
<body>
    @php
        $configuracion = \App\Models\Configuracion::first();
    @endphp

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
        @if($cotizacion->bodega && $cotizacion->bodega->nombre_comercial)
        <div>{{ $cotizacion->bodega->nombre_comercial }}</div>
        @endif
        @if($configuracion && $configuracion->digifact_tax_id)
        <div>NIT: {{ $configuracion->digifact_tax_id }}</div>
        @endif
        @if($cotizacion->bodega && $cotizacion->bodega->direccion)
        <div>{{ $cotizacion->bodega->direccion }}</div>
        @endif
        @if($cotizacion->bodega && $cotizacion->bodega->municipio)
        <div>
            {{ $cotizacion->bodega->municipio->nombre ?? '' }}
            @if($cotizacion->bodega->municipio->departamento)
            , {{ $cotizacion->bodega->municipio->departamento->nombre }}
            @endif
            @if($cotizacion->bodega->codigo_postal)
            , {{ $cotizacion->bodega->codigo_postal }}
            @endif
        </div>
        @endif
    </div>

    <div class="documento-titulo">COTIZACIÓN #{{ $cotizacion->id }}</div>
    
    @php
        $fechaValidez = $cotizacion->created_at->copy()->addDays(15);
    @endphp
    <div class="info-line" style="font-size: 8px; color: #666; margin-top: 4px;">
        <strong>Válida hasta:</strong> {{ $fechaValidez->format('d/m/Y') }}
    </div>

    <div class="salto">
        <div class="info-line"><strong>Fecha:</strong> {{ $cotizacion->created_at->format('Y-m-d H:i:s') }}</div>
        @if($cotizacion->caja)
        <div class="info-line"><strong>Caja:</strong> {{ $cotizacion->caja->codigo }}</div>
        @endif
        <div class="info-line"><strong>Bodega:</strong> {{ $cotizacion->bodega->nombre ?? 'N/A' }}</div>
    </div>

    <div class="salto">
        <div class="info-line"><strong>NIT Cliente:</strong> {{ $cotizacion->nit ?? 'CF' }}</div>
        <div class="info-line"><strong>Nombre:</strong> {{ $cotizacion->nombre ?? 'CONSUMIDOR FINAL' }}</div>
    </div>

    <div class="salto">
        <div class="info-line"><strong>Vendedor:</strong> {{ $cotizacion->creadoPor->name ?? 'N/A' }}</div>
    </div>

    <table>
        <tr>
            <th>Cant</th>
            <th>Bonif.</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Total</th>
        </tr>
        @foreach ($cotizacion->detalles as $dt)
            <tr>
                <td>{{ $dt->cantidad }}</td>
                <td>{{ $dt->bonificacion ?? 0 }}</td>
                <td style="text-align: left; font-size: 8px;">
                    @if($dt->producto_id)
                        {{ $dt->producto->codigo ?? 'N/A' }} - {{ $dt->producto->nombre ?? 'N/A' }}
                    @elseif($dt->servicio_id)
                        {{ ($dt->servicio->codigo ? $dt->servicio->codigo . ' - ' : '') }}{{ $dt->servicio->nombre ?? 'N/A' }}
                    @else
                        N/A
                    @endif
                </td>
                <td>Q{{ number_format($dt->precio, 2) }}</td>
                <td>Q{{ number_format($dt->subtotal, 2) }}</td>
            </tr>
        @endforeach
        <tr>
            <td></td>
            <td></td>
            <td style="text-align: right;">SUBTOTAL</td>
            <td></td>
            <td>Q{{ number_format($cotizacion->subtotal, 2) }}</td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td style="text-align: right;">TOTAL</td>
            <td></td>
            <td>Q{{ number_format($cotizacion->total, 2) }}</td>
        </tr>
    </table>

    @if($cotizacion->observacion)
    <div class="salto">
        <div style="font-weight: bold; font-size: 9px;">OBSERVACIONES:</div>
        <div style="font-size: 8px;">{{ $cotizacion->observacion }}</div>
    </div>
    @endif

    <div class="salto" style="font-size: 9px;">
        <div><strong>Este documento tiene validez hasta el {{ $fechaValidez->format('d/m/Y') }}</strong></div>
        <div style="margin-top: 4px;">Esta es una cotización, no constituye una venta</div>
    </div>
</body>
</html>
