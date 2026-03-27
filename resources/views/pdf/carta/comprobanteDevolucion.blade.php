<!DOCTYPE html>
<html>
<head>
    <title>Devolución {{ $venta->id }}</title>
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
    <header style="display: table; width: 100%;">
        <div style="display: table-cell; width: 50%;">
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

            <div class="salto">
                <div><strong>NIT Cliente:</strong> {{ $venta->nit ?? 'CF' }}</div>
                <div><strong>Nombre:</strong> {{ $venta->nombre ?? 'CONSUMIDOR FINAL' }}</div>
            </div>

            <div class="salto">
                <div><strong>Vendedor:</strong> {{ $venta->creadoPor->name ?? 'N/A' }}</div>
            </div>
        </div>

        <div style="display: table-cell; width: 50%; text-align: right;">
            <div style="font-weight: bold; font-size: 25px;">COMPROBANTE DE DEVOLUCIÓN #{{ $venta->id }}</div>
            <div class="salto">
                <div>Fecha de Emisión: {{ $venta->updated_at->format('Y-m-d') }}</div>
                <div>Hora: {{ $venta->updated_at->format('H:i:s') }}</div>
            </div>
            <div class="salto">
                <div>Caja: {{ $venta->caja->codigo ?? 'N/A' }}</div>
                <div>Bodega: {{ $venta->bodega->nombre ?? 'N/A' }}</div>
                <div>Estado: {{ ucfirst(str_replace('_', ' ', $venta->estado)) }}</div>
            </div>
        </div>
    </header>

    @if($venta->motivo)
    <section class="salto" style="padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9;">
        <div style="font-weight: bold; margin-bottom: 5px;">MOTIVO DE DEVOLUCIÓN:</div>
        <div style="font-size: 11px;">{{ $venta->motivo }}</div>
    </section>
    @endif

    <section class="salto">
        <table>
            <tr>
                <th>Cantidad</th>
                <th>Código</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Total</th>
            </tr>
            @php
                $subtotalDevuelto = 0;
                $totalDevuelto = 0;
            @endphp
            @foreach ($venta->detalles as $detalle)
                @if($detalle->devuelto && $detalle->devuelto > 0)
                    @php
                        $subtotalDevuelto += $detalle->devuelto * $detalle->precio;
                        $totalDevuelto += $detalle->devuelto * $detalle->precio;
                    @endphp
                    <tr>
                        <td>{{ $detalle->devuelto }}</td>
                        <td>{{ $detalle->producto->codigo ?? 'N/A' }}</td>
                        <td style="text-align: left;">{{ $detalle->producto->nombre ?? 'N/A' }}</td>
                        <td style="text-align: right;">Q{{ number_format($detalle->precio, 2) }}</td>
                        <td style="text-align: right;">Q{{ number_format($detalle->devuelto * $detalle->precio, 2) }}</td>
                    </tr>
                @endif
            @endforeach
            <tr>
                <td></td>
                <td></td>
                <td style="text-align: right;">SUBTOTAL</td>
                <td></td>
                <td style="text-align: right;">Q{{ number_format($subtotalDevuelto, 2) }}</td>
            </tr>
            <tr>
                <td></td>
                <td></td>
                <td style="text-align: right;">TOTAL</td>
                <td></td>
                <td style="text-align: right;">Q{{ number_format($totalDevuelto, 2) }}</td>
            </tr>
        </table>
    </section>

    @if($venta->observacion)
    <footer style="margin-top: 30px">
        <span style="font-weight: bold">OBSERVACIONES:</span> {{ $venta->observacion }}
    </footer>
    @endif
</body>
</html>
