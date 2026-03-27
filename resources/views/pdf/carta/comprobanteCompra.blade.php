<!DOCTYPE html>
<html>
<head>
    <title>Compra {{ $compra->id }}</title>
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

            <div class="salto">
                <div><strong>NIT Proveedor:</strong> {{ $compra->proveedor->nit ?? 'N/A' }}</div>
                <div><strong>Nombre:</strong> {{ $compra->proveedor->name ?? 'N/A' }}</div>
            </div>

            <div class="salto">
                <div><strong>Comprador:</strong> {{ $compra->creadoPor->name ?? 'N/A' }}</div>
            </div>
        </div>

        <div style="display: table-cell; width: 50%; text-align: right;">
            <div style="font-weight: bold; font-size: 25px;">COMPROBANTE DE COMPRA #{{ $compra->id }}</div>
            <div class="salto">
                <div>Fecha de Emisión: {{ $compra->created_at->format('Y-m-d') }}</div>
                <div>Hora: {{ $compra->created_at->format('H:i:s') }}</div>
            </div>
            <div class="salto">
                <div>Bodega: {{ $compra->bodega->nombre ?? 'N/A' }}</div>
                <div>Estado: {{ $compra->estado?->value ?? 'N/A' }}</div>
            </div>
        </div>
    </header>

    <section class="salto">
        <table>
            <tr>
                <th>Cantidad</th>
                <th>Código</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Total</th>
            </tr>
            @foreach ($compra->detalles as $dt)
                <tr>
                    <td>{{ $dt->cantidad }}</td>
                    <td>{{ $dt->producto->codigo ?? 'N/A' }}</td>
                    <td style="text-align: left;">{{ $dt->producto->nombre ?? 'N/A' }}</td>
                    <td style="text-align: right;">Q{{ number_format($dt->precio, 2) }}</td>
                    <td style="text-align: right;">Q{{ number_format($dt->subtotal, 2) }}</td>
                </tr>
            @endforeach
            <tr>
                <td></td>
                <td></td>
                <td style="text-align: right;">SUBTOTAL</td>
                <td></td>
                <td style="text-align: right;">Q{{ number_format($compra->subtotal, 2) }}</td>
            </tr>
            <tr>
                <td></td>
                <td></td>
                <td style="text-align: right;">TOTAL</td>
                <td></td>
                <td style="text-align: right;">Q{{ number_format($compra->total, 2) }}</td>
            </tr>
        </table>
    </section>

    @if($compra->observacion)
    <footer style="margin-top: 30px">
        <span style="font-weight: bold">OBSERVACIONES:</span> {{ $compra->observacion }}
    </footer>
    @endif
</body>
</html>
