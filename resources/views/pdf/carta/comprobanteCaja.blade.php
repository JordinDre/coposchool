<!DOCTYPE html>
<html>
<head>
    <title>Caja {{ $caja->codigo }}</title>
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <meta http-equiv="content-type" content="text-html; charset=utf-8">
    <style>
        @page {
            margin: 0.8cm 0.6cm;
            font-family: Arial, sans-serif;
            font-size: 12px;
        }

        .salto {
            margin-top: 14px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            padding: 6px;
            border: 0.5px solid black;
        }

        th {
            text-align: center;
        }

        td {
            text-align: center;
        }

        tr:last-child td {
            font-weight: bold;
        }
    </style>
</head>
<body>
    @php
        $configuracion = \App\Models\Configuracion::first();
    @endphp

    <header style="display: table; width: 100%;">
        <div style="display: table-cell; width: 50%;">
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
                    <div style="margin-bottom: 10px;">
                        <img src="{{ $logoUrl }}" alt="Logo" style="max-height: 60px; max-width: 200px; object-fit: contain;" />
                    </div>
                    @endif
                @endif
                @if($configuracion && $configuracion->nombre_empresa)
                <div style="font-weight: bold; font-size: 16px;">{{ $configuracion->nombre_empresa }}</div>
                @elseif($configuracion && $configuracion->razon_social)
                <div style="font-weight: bold; font-size: 16px;">{{ $configuracion->razon_social }}</div>
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

            <div class="salto">
                <div><strong>Usuario:</strong> {{ $caja->user->name ?? 'N/A' }}</div>
                <div><strong>Bodega:</strong> {{ $caja->bodega->nombre ?? 'N/A' }}</div>
            </div>
        </div>

        <div style="display: table-cell; width: 50%; text-align: right;">
            <div style="font-weight: bold; font-size: 25px;">COMPROBANTE DE CAJA #{{ $caja->codigo }}</div>
            <div class="salto">
                <div>Fecha de Apertura: {{ $caja->created_at->format('Y-m-d') }}</div>
                <div>Hora: {{ $caja->created_at->format('H:i:s') }}</div>
            </div>
            <div class="salto">
                <div>Estado: {{ $caja->estado?->value ?? 'N/A' }}</div>
                <div>Saldo Inicial: Q{{ number_format($caja->saldo_inicial, 2) }}</div>
            </div>
        </div>
    </header>

    {{-- Desglose de ventas por método de pago (sin cajas) --}}
    @if(isset($ventasPorMetodo) && array_sum($ventasPorMetodo) > 0)
    <section class="salto">
        <div><strong>Ventas por Método de Pago</strong></div>
        @foreach($ventasPorMetodo as $metodo => $total)
            @if($total > 0 && !str_contains($metodo, 'caja'))
            <div>{{ ucfirst($metodo) }}: Q{{ number_format($total, 2) }}</div>
            @endif
        @endforeach
    </section>
    @endif

    <section class="salto">
        <table>
            <tr>
                <th>Concepto</th>
                <th>Cantidad</th>
                <th>Monto</th>
                <th>Total</th>
            </tr>
            @foreach ($caja->ventas as $venta)
                <tr>
                    <td style="text-align: left;">Venta #{{ $venta->id }}</td>
                    <td>1</td>
                    <td style="text-align: right;">Q{{ number_format($venta->total, 2) }}</td>
                    <td style="text-align: right;">Q{{ number_format($venta->total, 2) }}</td>
                </tr>
            @endforeach
            @foreach ($caja->gastos as $gasto)
                <tr>
                    <td style="text-align: left;">{{ $gasto->concepto ?? 'Gasto' }}</td>
                    <td>1</td>
                    <td style="text-align: right;">Q{{ number_format($gasto->monto, 2) }}</td>
                    <td style="text-align: right;">Q{{ number_format($gasto->monto, 2) }}</td>
                </tr>
            @endforeach
            <tr>
                <td></td>
                <td></td>
                <td style="text-align: right;">SALDO FINAL</td>
                <td style="text-align: right;">Q{{ number_format($caja->saldo_inicial + $caja->ventas->sum('total') - $caja->gastos->sum('monto'), 2) }}</td>
            </tr>
        </table>
    </section>
</body>
</html>
