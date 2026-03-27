<!DOCTYPE html>
<html>
<head>
    <title>Arqueo Caja {{ $caja->codigo }}</title>
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
            font-weight: bold;
        }

        td {
            text-align: center;
        }

        tr:last-child td {
            font-weight: bold;
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
            <div style="font-weight: bold; font-size: 25px;">ARQUEO DE CAJA #{{ $caja->codigo }}</div>
            <div class="salto">
                <div>Fecha: {{ $arqueo->created_at->format('Y-m-d') }}</div>
                <div>Hora: {{ $arqueo->created_at->format('H:i:s') }}</div>
            </div>
            <div class="salto">
                <div><strong>Arqueado por:</strong> {{ $arqueo->creadoPor->name ?? 'N/A' }}</div>
                @if($arqueo->autorizadoPor)
                <div><strong>Autorizado por:</strong> {{ $arqueo->autorizadoPor->name }}</div>
                @endif
            </div>
        </div>
    </header>

    <section class="salto">
        <div><strong>Resumen del Arqueo</strong></div>
        <div>Saldo Esperado: Q{{ number_format($ventasEfectivo, 2) }}</div>
        <div>Total Contado: Q{{ number_format($arqueo->total_contado, 2) }}</div>
        <div>Diferencia: Q{{ number_format($arqueo->diferencia, 2) }}</div>
        @if($arqueo->sobrante > 0)
        <div><strong>Sobrante: Q{{ number_format($arqueo->sobrante, 2) }}</strong></div>
        @endif
    </section>

    @if($billetes->isNotEmpty())
    <section class="salto">
        <div><strong>Billetes</strong></div>
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
                <td style="text-align: right;">Q{{ number_format($billete->subtotal, 2) }}</td>
            </tr>
            @endforeach
        </table>
    </section>
    @endif

    @if($monedas->isNotEmpty())
    <section class="salto">
        <div><strong>Monedas</strong></div>
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
                <td style="text-align: right;">Q{{ number_format($moneda->subtotal, 2) }}</td>
            </tr>
            @endforeach
        </table>
    </section>
    @endif

    @if($arqueo->observaciones)
    <section class="salto">
        <div><strong>Observaciones:</strong></div>
        <div class="text-left">{{ $arqueo->observaciones }}</div>
    </section>
    @endif
</body>
</html>
