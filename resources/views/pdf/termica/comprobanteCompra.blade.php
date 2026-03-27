<!DOCTYPE html>
<html>
<head>
    <title>Compra {{ $compra->id }}</title>
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
        @if($compra->bodega && $compra->bodega->nombre_comercial)
        <div>{{ $compra->bodega->nombre_comercial }}</div>
        @endif
        @if($configuracion && $configuracion->digifact_tax_id)
        <div>NIT: {{ $configuracion->digifact_tax_id }}</div>
        @endif
        @if($compra->bodega && $compra->bodega->direccion)
        <div>{{ $compra->bodega->direccion }}</div>
        @endif
        @if($compra->bodega && $compra->bodega->municipio)
        <div>
            {{ $compra->bodega->municipio->nombre ?? '' }}
            @if($compra->bodega->municipio->departamento)
            , {{ $compra->bodega->municipio->departamento->nombre }}
            @endif
            @if($compra->bodega->codigo_postal)
            , {{ $compra->bodega->codigo_postal }}
            @endif
        </div>
        @endif
    </div>

    <div class="documento-titulo">COMPROBANTE DE COMPRA #{{ $compra->id }}</div>

    <div class="salto">
        <div class="info-line"><strong>Fecha:</strong> {{ $compra->created_at->format('Y-m-d H:i:s') }}</div>
        <div class="info-line"><strong>Bodega:</strong> {{ $compra->bodega->nombre ?? 'N/A' }}</div>
        <div class="info-line"><strong>Estado:</strong> {{ $compra->estado?->value ?? 'N/A' }}</div>
    </div>

    <div class="salto">
        <div class="info-line"><strong>NIT Proveedor:</strong> {{ $compra->proveedor->nit ?? 'N/A' }}</div>
        <div class="info-line"><strong>Nombre:</strong> {{ $compra->proveedor->name ?? 'N/A' }}</div>
    </div>

    <div class="salto">
        <div class="info-line"><strong>Comprador:</strong> {{ $compra->creadoPor->name ?? 'N/A' }}</div>
    </div>

    <table>
        <tr>
            <th>Cant</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Total</th>
        </tr>
        @foreach ($compra->detalles as $dt)
            <tr>
                <td>{{ $dt->cantidad }}</td>
                <td style="text-align: left; font-size: 8px;">
                    {{ $dt->producto->codigo ?? 'N/A' }} - {{ $dt->producto->nombre ?? 'N/A' }}
                </td>
                <td>Q{{ number_format($dt->precio, 2) }}</td>
                <td>Q{{ number_format($dt->subtotal, 2) }}</td>
            </tr>
        @endforeach
        <tr>
            <td></td>
            <td style="text-align: right;">SUBTOTAL</td>
            <td></td>
            <td>Q{{ number_format($compra->subtotal, 2) }}</td>
        </tr>
        <tr>
            <td></td>
            <td style="text-align: right;">TOTAL</td>
            <td></td>
            <td>Q{{ number_format($compra->total, 2) }}</td>
        </tr>
    </table>

    @if($compra->observacion)
    <div class="salto">
        <div style="font-weight: bold; font-size: 9px;">OBSERVACIONES:</div>
        <div style="font-size: 8px;">{{ $compra->observacion }}</div>
    </div>
    @endif

    <div class="salto" style="font-size: 9px;">
        <div>Gracias por su compra</div>
    </div>
</body>
</html>
