<!DOCTYPE html>
<html>
<head>
    <title>Arqueo Caja {{ $caja->codigo }}</title>
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

        .text-left {
            text-align: left;
        }

        .text-right {
            text-align: right;
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
        @if($caja->bodega && $caja->bodega->nombre_comercial)
        <div>{{ $caja->bodega->nombre_comercial }}</div>
        @endif
        @if($configuracion && $configuracion->digifact_tax_id)
        <div>NIT: {{ $configuracion->digifact_tax_id }}</div>
        @endif
        @if($caja->bodega && $caja->bodega->direccion)
        <div>{{ $caja->bodega->direccion }}</div>
        @endif
        @if($caja->bodega && $caja->bodega->municipio)
        <div>
            {{ $caja->bodega->municipio->nombre ?? '' }}
            @if($caja->bodega->municipio->departamento)
            , {{ $caja->bodega->municipio->departamento->nombre }}
            @endif
            @if($caja->bodega->codigo_postal)
            , {{ $caja->bodega->codigo_postal }}
            @endif
        </div>
        @endif
    </div>

    <div class="documento-titulo">ARQUEO DE CAJA #{{ $caja->codigo }}</div>

    <div class="salto">
        <div class="info-line"><strong>Fecha Arqueo:</strong> {{ $arqueo->created_at->format('Y-m-d H:i:s') }}</div>
        <div class="info-line"><strong>Usuario:</strong> {{ $caja->user->name ?? 'N/A' }}</div>
        <div class="info-line"><strong>Bodega:</strong> {{ $caja->bodega->nombre ?? 'N/A' }}</div>
        <div class="info-line"><strong>Arqueado por:</strong> {{ $arqueo->creadoPor->name ?? 'N/A' }}</div>
        @if($arqueo->autorizadoPor)
        <div class="info-line"><strong>Autorizado por:</strong> {{ $arqueo->autorizadoPor->name }}</div>
        @endif
    </div>

    <div class="salto">
        <div class="info-line"><strong>Saldo Esperado:</strong> Q{{ number_format($ventasEfectivo, 2) }}</div>
        <div class="info-line"><strong>Total Contado:</strong> Q{{ number_format($arqueo->total_contado, 2) }}</div>
        <div class="info-line"><strong>Diferencia:</strong> Q{{ number_format($arqueo->diferencia, 2) }}</div>
        @if($arqueo->sobrante > 0)
        <div class="info-line"><strong>Sobrante:</strong> Q{{ number_format($arqueo->sobrante, 2) }}</div>
        @endif
    </div>

    @if($billetes->isNotEmpty())
    <div class="salto">
        <div style="font-weight: bold; margin-bottom: 3px;">Billetes</div>
        <table>
            <tr>
                <th>Denominación</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
            </tr>
            @foreach($billetes as $billete)
            <tr>
                <td>Q{{ number_format($billete->denominacion, 2) }}</td>
                <td>{{ $billete->cantidad }}</td>
                <td>Q{{ number_format($billete->subtotal, 2) }}</td>
            </tr>
            @endforeach
        </table>
    </div>
    @endif

    @if($monedas->isNotEmpty())
    <div class="salto">
        <div style="font-weight: bold; margin-bottom: 3px;">Monedas</div>
        <table>
            <tr>
                <th>Denominación</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
            </tr>
            @foreach($monedas as $moneda)
            <tr>
                <td>Q{{ number_format($moneda->denominacion, 2) }}</td>
                <td>{{ $moneda->cantidad }}</td>
                <td>Q{{ number_format($moneda->subtotal, 2) }}</td>
            </tr>
            @endforeach
        </table>
    </div>
    @endif

    @if($arqueo->observaciones)
    <div class="salto">
        <div style="font-weight: bold; margin-bottom: 3px;">Observaciones:</div>
        <div class="text-left" style="font-size: 9px;">{{ $arqueo->observaciones }}</div>
    </div>
    @endif

    <div class="salto" style="font-size: 9px;">
        <div>Gracias</div>
    </div>
</body>
</html>
