<!DOCTYPE html>
<html>
<head>
    <title>Caja {{ $caja->codigo }}</title>
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

    <div class="documento-titulo">COMPROBANTE DE CAJA #{{ $caja->codigo }}</div>

    <div class="salto">
        <div class="info-line"><strong>Fecha:</strong> {{ $caja->created_at->format('Y-m-d H:i:s') }}</div>
        <div class="info-line"><strong>Usuario:</strong> {{ $caja->user->name ?? 'N/A' }}</div>
        <div class="info-line"><strong>Bodega:</strong> {{ $caja->bodega->nombre ?? 'N/A' }}</div>
        <div class="info-line"><strong>Estado:</strong> {{ $caja->estado?->value ?? 'N/A' }}</div>
        <div class="info-line"><strong>Saldo Inicial:</strong> Q{{ number_format($caja->saldo_inicial, 2) }}</div>
    </div>

    <div class="salto">
        <div class="info-line"><strong>Total Ventas:</strong> Q{{ number_format($caja->ventas->sum('total'), 2) }}</div>
        <div class="info-line"><strong>Cantidad Ventas:</strong> {{ $caja->ventas->count() }}</div>
        <div class="info-line"><strong>Total Gastos:</strong> Q{{ number_format($caja->gastos->sum('monto'), 2) }}</div>
        <div class="info-line"><strong>Cantidad Gastos:</strong> {{ $caja->gastos->count() }}</div>
    </div>

    {{-- Desglose de ventas por método de pago (sin cajas) --}}
    @if(isset($ventasPorMetodo) && array_sum($ventasPorMetodo) > 0)
    <div class="salto" style="border-top: 1px dashed black; padding-top: 5px;">
        <div style="font-weight: bold; margin-bottom: 3px;">Ventas por Método de Pago</div>
        @foreach($ventasPorMetodo as $metodo => $total)
            @if($total > 0 && !str_contains($metodo, 'caja'))
            <div class="info-line">
                <strong>{{ ucfirst($metodo) }}:</strong> 
                Q{{ number_format($total, 2) }}
            </div>
            @endif
        @endforeach
    </div>
    @endif

    <table>
        <tr>
            <th>Concepto</th>
            <th>Cant</th>
            <th>Monto</th>
            <th>Total</th>
        </tr>
        @foreach ($caja->ventas as $venta)
            <tr>
                <td style="text-align: left; font-size: 8px;">Venta #{{ $venta->id }}</td>
                <td>1</td>
                <td>Q{{ number_format($venta->total, 2) }}</td>
                <td>Q{{ number_format($venta->total, 2) }}</td>
            </tr>
        @endforeach
        @foreach ($caja->gastos as $gasto)
            <tr>
                <td style="text-align: left; font-size: 8px;">{{ $gasto->concepto ?? 'Gasto' }}</td>
                <td>1</td>
                <td>Q{{ number_format($gasto->monto, 2) }}</td>
                <td>Q{{ number_format($gasto->monto, 2) }}</td>
            </tr>
        @endforeach
        <tr>
            <td></td>
            <td></td>
            <td style="text-align: right;">SALDO FINAL</td>
            <td>Q{{ number_format($caja->saldo_inicial + $caja->ventas->sum('total') - $caja->gastos->sum('monto'), 2) }}</td>
        </tr>
    </table>

    <div class="salto" style="font-size: 9px;">
        <div>Gracias</div>
    </div>
</body>
</html>
