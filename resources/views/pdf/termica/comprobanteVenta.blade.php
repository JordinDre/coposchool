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

    <div class="documento-titulo">COMPROBANTE DE VENTA #{{ $venta->id }}</div>

    <div class="salto">
        <div class="info-line"><strong>Fecha:</strong> {{ $venta->created_at->format('Y-m-d H:i:s') }}</div>
        <div class="info-line"><strong>Caja:</strong> {{ $venta->caja->codigo ?? 'N/A' }}</div>
        <div class="info-line"><strong>Bodega:</strong> {{ $venta->bodega->nombre ?? 'N/A' }}</div>
        <div class="info-line"><strong>Estado:</strong> {{ $venta->estado?->value ?? 'N/A' }}</div>
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
            <th>Descripción</th>
            <th>Precio</th>
            <th>Total</th>
        </tr>
        @foreach ($venta->detalles as $dt)
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
            <td>Q{{ number_format($venta->subtotal, 2) }}</td>
        </tr>
        @if($venta->envio && $venta->envio > 0)
        <tr>
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

    <div class="salto" style="font-size: 9px;">
        <div>Gracias por su compra</div>
    </div>
</body>
</html>
