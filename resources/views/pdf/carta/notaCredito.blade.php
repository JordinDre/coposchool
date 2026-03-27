<!DOCTYPE html>
<html>
<head>
    <title>Nota de Crédito {{ $venta->id }}</title>
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
            <div style="font-weight: bold; font-size: 25px;">
                NOTA DE CRÉDITO #{{ $venta->id }}
            </div>
            <div class="salto">
                <div>Fecha de Emisión: {{ $venta->updated_at->format('Y-m-d') }}</div>
                <div>Hora: {{ $venta->updated_at->format('H:i:s') }}</div>
            </div>
            <div class="salto">
                <div>Caja: {{ $venta->caja->codigo ?? 'N/A' }}</div>
                <div>Bodega: {{ $venta->bodega->nombre ?? 'N/A' }}</div>
            </div>
            @if($notaCredito)
            <div class="salto">
                <div style="font-weight: bold;">DOCUMENTO ELECTRÓNICO</div>
                <div>Autorización: {{ $notaCredito->fel_autorizacion }}</div>
                <div>Serie: {{ $notaCredito->fel_serie }} - Número: {{ $notaCredito->fel_numero }}</div>
                @if($notaCredito->fel_fecha)
                <div>Fecha Autorización: {{ $notaCredito->fel_fecha }}</div>
                @endif
                @if($facturaOriginal)
                <div style="margin-top: 5px; font-weight: bold;">Documento Origen:</div>
                <div>Serie: {{ $facturaOriginal->fel_serie }} - Número: {{ $facturaOriginal->fel_numero }}</div>
                <div>Autorización: {{ $facturaOriginal->fel_autorizacion }}</div>
                @endif
                @if($notaCredito->motivo)
                <div style="margin-top: 5px; font-weight: bold;">Motivo de Devolución:</div>
                <div style="font-size: 10px;">{{ $notaCredito->motivo }}</div>
                @endif
            </div>
            @endif
        </div>
    </header>

    <section class="salto">
        <table>
            <tr>
                <th>Cantidad</th>
                <th>Bonif.</th>
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
                        <td>{{ $detalle->bonificacion ?? 0 }}</td>
                        <td>
                            @if($detalle->producto_id)
                                {{ $detalle->producto->codigo ?? 'N/A' }}
                            @elseif($detalle->servicio_id)
                                {{ $detalle->servicio->codigo ?? 'N/A' }}
                            @else
                                N/A
                            @endif
                        </td>
                        <td style="text-align: left;">
                            @if($detalle->producto_id)
                                {{ $detalle->producto->nombre ?? 'N/A' }}
                            @elseif($detalle->servicio_id)
                                {{ $detalle->servicio->nombre ?? 'N/A' }}
                            @else
                                N/A
                            @endif
                        </td>
                        <td style="text-align: right;">Q{{ number_format($detalle->precio, 2) }}</td>
                        <td style="text-align: right;">Q{{ number_format($detalle->devuelto * $detalle->precio, 2) }}</td>
                    </tr>
                @endif
            @endforeach
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td style="text-align: right;">SUBTOTAL</td>
                <td></td>
                <td style="text-align: right;">Q{{ number_format($subtotalDevuelto, 2) }}</td>
            </tr>
            <tr>
                <td></td>
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

    @if($notaCredito)
    <footer style="margin-top: 20px; text-align: center; font-size: 10px;">
        <div style="font-weight: bold; margin-bottom: 5px;">NOTA DE CRÉDITO ELECTRÓNICA AUTORIZADA</div>
        <div>Autorización: {{ $notaCredito->fel_autorizacion }}</div>
        <div>Serie: {{ $notaCredito->fel_serie }} - Número: {{ $notaCredito->fel_numero }}</div>
        @if($notaCredito->fel_fecha)
        <div>Fecha de Autorización: {{ $notaCredito->fel_fecha }}</div>
        @endif
        @if($facturaOriginal)
        <div style="margin-top: 10px; padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9;">
            <div style="font-weight: bold; margin-bottom: 5px;">Documento Origen:</div>
            <div>Serie: {{ $facturaOriginal->fel_serie }} - Número: {{ $facturaOriginal->fel_numero }}</div>
            <div>Autorización: {{ $facturaOriginal->fel_autorizacion }}</div>
        </div>
        @endif
        @if($notaCredito->motivo)
        <div style="margin-top: 10px; padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9;">
            <div style="font-weight: bold; margin-bottom: 5px;">Motivo de Devolución:</div>
            <div style="font-size: 9px; text-align: left;">{{ $notaCredito->motivo }}</div>
        </div>
        @endif
        <div style="margin-top: 5px; font-size: 9px;">
            Este documento ha sido autorizado electrónicamente por la SAT
        </div>
    </footer>
    @endif
</body>
</html>
