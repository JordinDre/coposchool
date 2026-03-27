<!DOCTYPE html>
<html>
<head>
    <title>Gasto {{ $gasto->id }}</title>
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
                @if($configuracion && $configuracion->digifact_tax_id)
                <div>NIT: {{ $configuracion->digifact_tax_id }}</div>
                @endif
            </div>

            <div class="salto">
                <div><strong>Concepto:</strong> {{ $gasto->concepto ?? 'Sin concepto' }}</div>
            </div>

            <div class="salto">
                <div><strong>Registrado por:</strong> {{ $gasto->creadoPor->name ?? 'N/A' }}</div>
            </div>
        </div>

        <div style="display: table-cell; width: 50%; text-align: right;">
            <div style="font-weight: bold; font-size: 25px;">COMPROBANTE DE GASTO #{{ $gasto->id }}</div>
            <div class="salto">
                <div>Fecha de Emisión: {{ $gasto->created_at->format('Y-m-d') }}</div>
                <div>Hora: {{ $gasto->created_at->format('H:i:s') }}</div>
            </div>
            <div class="salto">
                <div>Caja: {{ $gasto->caja->codigo ?? 'N/A' }}</div>
                <div>Estado: {{ $gasto->estado?->value ?? 'N/A' }}</div>
            </div>
        </div>
    </header>

    <section class="salto">
        <table>
            <tr>
                <th>Concepto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Total</th>
            </tr>
            <tr>
                <td style="text-align: left;">{{ $gasto->concepto ?? 'Gasto' }}</td>
                <td>1</td>
                <td style="text-align: right;">Q{{ number_format($gasto->monto, 2) }}</td>
                <td style="text-align: right;">Q{{ number_format($gasto->monto, 2) }}</td>
            </tr>
            <tr>
                <td></td>
                <td></td>
                <td style="text-align: right;">TOTAL</td>
                <td style="text-align: right;">Q{{ number_format($gasto->monto, 2) }}</td>
            </tr>
        </table>
    </section>

    <section class="salto">
        <div><strong>Datos de Pago</strong></div>
        <div>Método: {{ $gasto->pagos->first()->metodo ?? 'N/A' }}</div>
        <div>Referencia: {{ $gasto->pagos->first()->referencia ?? 'Sin referencia' }}</div>
        <div>Banco: {{ $gasto->pagos->first()->banco->nombre ?? 'N/A' }}</div>
    </section>

    @if($gasto->observacion)
    <footer style="margin-top: 30px">
        <span style="font-weight: bold">OBSERVACIONES:</span> {{ $gasto->observacion }}
    </footer>
    @endif
</body>
</html>
