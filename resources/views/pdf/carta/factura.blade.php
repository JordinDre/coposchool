<!DOCTYPE html>
<html>
<head>
    <title>Venta {{ $venta->id }}</title>
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
                @if(isset($esAnulada) && $esAnulada)
                    <span style="color: red;">VENTA ANULADA</span><br>
                    <span style="font-size: 20px;">#{{ $venta->id }}</span>
                @else
                    VENTA #{{ $venta->id }}
                @endif
            </div>
            <div class="salto">
                <div>Fecha de Emisión: {{ $venta->created_at->format('Y-m-d') }}</div>
                <div>Hora: {{ $venta->created_at->format('H:i:s') }}</div>
                @if($venta->fecha_vencimiento)
                <div style="font-weight: bold; color: #d32f2f;">Fecha de Vencimiento: {{ \Carbon\Carbon::parse($venta->fecha_vencimiento)->format('Y-m-d') }}</div>
                @endif
            </div>
            <div class="salto">
                <div>Caja: {{ $venta->caja->codigo ?? 'N/A' }}</div>
                <div>Bodega: {{ $venta->bodega->nombre ?? 'N/A' }}</div>
            </div>
            @if($factura)
            <div class="salto">
                <div style="font-weight: bold;">DOCUMENTO ELECTRÓNICO</div>
                @if(isset($esAnulada) && $esAnulada)
                    <div style="font-weight: bold; color: red; margin: 5px 0;">ESTE DOCUMENTO HA SIDO ANULADO</div>
                @endif
                <div>Autorización: {{ $factura->fel_autorizacion }}</div>
                <div>Serie: {{ $factura->fel_serie }} - Número: {{ $factura->fel_numero }}</div>
                @if($factura->fel_fecha)
                <div>Fecha Autorización: {{ $factura->fel_fecha }}</div>
                @endif
                @if(isset($anulacion) && $anulacion && $anulacion->motivo)
                <div style="margin-top: 5px; font-weight: bold;">Motivo de Anulación:</div>
                <div style="font-size: 10px;">{{ $anulacion->motivo }}</div>
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
                <th>B/S</th>
                <th>Código</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Total</th>
            </tr>
            @foreach ($venta->detalles as $detalle)
                <tr>
                    <td>{{ $detalle->cantidad }}</td>
                    <td>{{ $detalle->bonificacion ?? 0 }}</td>
                    <td style="text-align: center;">
                        @if($detalle->producto_id)
                            B
                        @elseif($detalle->servicio_id)
                            S
                        @else
                            -
                        @endif
                    </td>
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
                    <td style="text-align: right;">Q{{ number_format($detalle->subtotal, 2) }}</td>
                </tr>
            @endforeach
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td style="text-align: right;">SUBTOTAL</td>
                <td></td>
                <td style="text-align: right;">Q{{ number_format($venta->subtotal, 2) }}</td>
            </tr>
            @if($venta->envio && $venta->envio > 0)
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td style="text-align: right;">ENVÍO</td>
                <td></td>
                <td style="text-align: right;">Q{{ number_format($venta->envio, 2) }}</td>
            </tr>
            @endif
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td style="text-align: right;">TOTAL</td>
                <td></td>
                <td style="text-align: right;">Q{{ number_format($venta->total, 2) }}</td>
            </tr>
        </table>
    </section>

    @if($venta->observacion)
    <footer style="margin-top: 30px">
        <span style="font-weight: bold">OBSERVACIONES:</span> {{ $venta->observacion }}
    </footer>
    @endif

    @if($factura)
    <footer style="margin-top: 20px; text-align: center; font-size: 10px;">
        @if(isset($esAnulada) && $esAnulada)
            <div style="font-weight: bold; margin-bottom: 5px; color: red;">VENTA ELECTRÓNICA ANULADA</div>
        @else
            <div style="font-weight: bold; margin-bottom: 5px;">VENTA ELECTRÓNICA AUTORIZADA</div>
        @endif
        <div>Autorización: {{ $factura->fel_autorizacion }}</div>
        <div>Serie: {{ $factura->fel_serie }} - Número: {{ $factura->fel_numero }}</div>
        @if($factura->fel_fecha)
        <div>Fecha de Autorización: {{ $factura->fel_fecha }}</div>
        @endif
        @if(isset($anulacion) && $anulacion && $anulacion->motivo)
        <div style="margin-top: 10px; padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9;">
            <div style="font-weight: bold; margin-bottom: 5px;">Motivo de Anulación:</div>
            <div style="font-size: 9px; text-align: left;">{{ $anulacion->motivo }}</div>
        </div>
        @endif
        <div style="margin-top: 5px; font-size: 9px;">
            @if(isset($esAnulada) && $esAnulada)
                Este documento ha sido anulado electrónicamente
            @else
                Este documento ha sido autorizado electrónicamente por la SAT
            @endif
        </div>
    </footer>
    @endif
</body>
</html>
