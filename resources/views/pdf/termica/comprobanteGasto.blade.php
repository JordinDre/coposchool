<!DOCTYPE html>
<html>
<head>
    <title>Gasto {{ $gasto->id }}</title>
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
        @if($configuracion && $configuracion->digifact_tax_id)
        <div>NIT: {{ $configuracion->digifact_tax_id }}</div>
        @endif
    </div>

    <div class="documento-titulo">COMPROBANTE DE GASTO #{{ $gasto->id }}</div>

    <div class="salto">
        <div class="info-line"><strong>Fecha:</strong> {{ $gasto->created_at->format('Y-m-d H:i:s') }}</div>
        <div class="info-line"><strong>Caja:</strong> {{ $gasto->caja->codigo ?? 'N/A' }}</div>
        <div class="info-line"><strong>Estado:</strong> {{ $gasto->estado?->value ?? 'N/A' }}</div>
        <div class="info-line"><strong>Concepto:</strong> {{ $gasto->concepto ?? 'Sin concepto' }}</div>
    </div>

    <div class="salto">
        <div class="info-line"><strong>Registrado por:</strong> {{ $gasto->creadoPor->name ?? 'N/A' }}</div>
    </div>

    <table>
        <tr>
            <th>Concepto</th>
            <th>Cant</th>
            <th>Precio</th>
            <th>Total</th>
        </tr>
        <tr>
            <td style="text-align: left; font-size: 8px;">{{ $gasto->concepto ?? 'Gasto' }}</td>
            <td>1</td>
            <td>Q{{ number_format($gasto->monto, 2) }}</td>
            <td>Q{{ number_format($gasto->monto, 2) }}</td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td style="text-align: right;">TOTAL</td>
            <td>Q{{ number_format($gasto->monto, 2) }}</td>
        </tr>
    </table>

    <div class="salto">
        <div class="info-line"><strong>Método:</strong> {{ $gasto->pagos->first()->metodo ?? 'N/A' }}</div>
        <div class="info-line"><strong>Referencia:</strong> {{ $gasto->pagos->first()->referencia ?? 'Sin referencia' }}</div>
        <div class="info-line"><strong>Banco:</strong> {{ $gasto->pagos->first()->banco->nombre ?? 'N/A' }}</div>
    </div>

    @if($gasto->observacion)
    <div class="salto">
        <div style="font-weight: bold; font-size: 9px;">OBSERVACIONES:</div>
        <div style="font-size: 8px;">{{ $gasto->observacion }}</div>
    </div>
    @endif

    <div class="salto" style="font-size: 9px;">
        <div>Gracias</div>
    </div>
</body>
</html>
