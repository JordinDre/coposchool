<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class GenericExport implements FromArray, WithColumnWidths, WithHeadings, WithStyles
{
    protected array $data;

    protected array $headings;

    public function __construct(array $data, array $headings)
    {
        $this->data = $data;
        $this->headings = $headings;
    }

    public function array(): array
    {
        return $this->data;
    }

    public function headings(): array
    {
        return $this->headings;
    }

    public function styles(Worksheet $sheet): array
    {
        $styles = [
            1 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E3F2FD'],
                ],
            ],
        ];

        // Habilitar ajuste de texto y saltos de línea en todas las celdas de datos
        $highestRow = $sheet->getHighestRow();
        $highestColumn = $sheet->getHighestColumn();

        for ($row = 2; $row <= $highestRow; $row++) {
            for ($col = 'A'; $col <= $highestColumn; $col++) {
                $cell = $sheet->getCell("{$col}{$row}");
                $value = $cell->getValue();

                // Si el valor contiene saltos de línea, habilitar wrap text
                if (is_string($value) && strpos($value, "\n") !== false) {
                    $styles["{$col}{$row}"] = [
                        'alignment' => [
                            'wrapText' => true,
                            'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_TOP,
                        ],
                    ];
                }
            }
        }

        return $styles;
    }

    public function columnWidths(): array
    {
        // Establecer ancho automático para todas las columnas
        $widths = [];
        $columnCount = count($this->headings);

        for ($i = 0; $i < $columnCount; $i++) {
            $column = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i + 1);
            $widths[$column] = 15; // Ancho por defecto
        }

        return $widths;
    }
}
