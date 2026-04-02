<?php

namespace App\Exports;

use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithDrawings;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;

class ConsolidadoExport implements FromArray, WithColumnWidths, WithDrawings, WithEvents
{
    private $config;

    public function __construct(
        private readonly mixed $seccion,
        private readonly mixed $unidad,
        private readonly mixed $materias,
        private readonly mixed $estudiantes,
        private readonly mixed $notas,
    ) {
        $this->config = \App\Models\Configuracion::cached();
    }

    public function array(): array
    {
        // Headers are handled in AfterSheet for better control
        // We only provide the data rows starting from row 9
        $rows = [];

        foreach ($this->estudiantes as $idx => $estudiante) {
            $estudianteNotas = $this->notas->get($estudiante->id, collect());
            $lookup = [];
            foreach ($estudianteNotas as $n) {
                $lookup[$n->materia_id] = (float) $n->nota;
            }

            $sum = 0;
            $count = 0;

            $row = [
                $idx + 1,
                $estudiante->name.($estudiante->deleted_at ? ' (INACTIVO)' : ''),
            ];

            foreach ($this->materias as $m) {
                $nota = $lookup[$m->id] ?? null;
                $row[] = $nota ?? '';
                if ($nota !== null) {
                    $sum += $nota;
                    $count++;
                }
            }

            // Promedio column
            $row[] = $count > 0 ? round($sum / $count, 1) : '';

            $rows[] = $row;
        }

        return $rows;
    }

    public function columnWidths(): array
    {
        $widths = [
            'A' => 6,  // No.
            'B' => 45, // Name
        ];

        $colIndex = 3;
        foreach ($this->materias as $m) {
            $widths[Coordinate::stringFromColumnIndex($colIndex)] = 4.5;
            $colIndex++;
        }

        $widths[Coordinate::stringFromColumnIndex($colIndex)] = 8; // Promedio

        return $widths;
    }

    public function drawings()
    {
        $drawings = [];

        if ($this->config->logo_url) {
            $path = Str::startsWith($this->config->logo_url, 'http')
                ? $this->config->logo_url
                : public_path($this->config->logo_url);

            if (file_exists($path)) {
                $drawing = new Drawing;
                $drawing->setName('Logo');
                $drawing->setDescription('Logo');
                $drawing->setPath($path);
                $drawing->setHeight(75);

                // Position logo at the end of the header
                $numMaterias = $this->materias->count();
                $logoColIndex = max(5, 2 + $numMaterias);
                $logoCol = Coordinate::stringFromColumnIndex($logoColIndex);

                $drawing->setCoordinates($logoCol.'1');
                $drawing->setOffsetX(10);
                $drawing->setOffsetY(10);
                $drawings[] = $drawing;
            }
        }

        return $drawings;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $numMaterias = $this->materias->count();
                $lastColIndex = 3 + $numMaterias;
                $lastCol = Coordinate::stringFromColumnIndex($lastColIndex);

                // ── INSERT HEADER ROWS ──
                $sheet->insertNewRowBefore(1, 8);

                // Row 1: School Name
                $nombreFull = ($this->config->nombre_completo ?? '').' '.($this->config->abreviatura ?? '');
                $sheet->mergeCells("A1:{$lastCol}1");
                $sheet->setCellValue('A1', $nombreFull ?: 'COPOSCHOOL');
                $sheet->getStyle('A1')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 12],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                // Row 2: Address
                $sheet->mergeCells("A2:{$lastCol}2");
                $sheet->setCellValue('A2', $this->config->direccion ?? '');
                $sheet->getStyle('A2')->applyFromArray([
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                // Row 3: Report Title
                $sheet->mergeCells("A3:{$lastCol}3");
                $sheet->setCellValue('A3', 'NOTAS DE BIMESTRE');
                $sheet->getStyle('A3')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 14],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                // Row 5: Subtitle
                $sheet->mergeCells('A5:G5');
                $sheet->setCellValue('A5', 'CALIFICACIONES DE ÁREAS Y SUBÁREAS');
                $sheet->getStyle('A5')->applyFromArray([
                    'borders' => ['outline' => ['borderStyle' => Border::BORDER_THIN]],
                    'font' => ['bold' => true],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                // Row 7: Section & Unit (Yellow boxes)
                // Section box (Left side)
                $sheet->mergeCells('A7:E7');
                $sheet->setCellValue('A7', strtoupper($this->seccion->nombre));
                $sheet->getStyle('A7')->applyFromArray([
                    'font' => ['bold' => true],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFFF00']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                    'borders' => ['outline' => ['borderStyle' => Border::BORDER_THIN]],
                ]);

                // Unit box (Right side - starting from G or lastCol if small)
                $unitStartIdx = max(7, $lastColIndex - 4);
                if ($unitStartIdx > 5) {
                    $unitStartCol = Coordinate::stringFromColumnIndex($unitStartIdx);
                    $sheet->mergeCells("{$unitStartCol}7:{$lastCol}7");
                    $sheet->setCellValue($unitStartCol, strtoupper($this->unidad->nombre.' '.$this->seccion->ciclo_escolar));
                    $sheet->getStyle("{$unitStartCol}7:{$lastCol}7")->applyFromArray([
                        'font' => ['bold' => true],
                        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFFF00']],
                        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                        'borders' => ['outline' => ['borderStyle' => Border::BORDER_THIN]],
                    ]);
                }

                // ── TABLE HEADERS (Row 8) ──
                $sheet->setCellValue('A8', 'No.');
                $sheet->setCellValue('B8', 'APELLIDOS Y NOMBRES');

                $sheet->getStyle('A8:B8')->applyFromArray([
                    'font' => ['bold' => true],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                ]);

                $col = 3;
                foreach ($this->materias as $m) {
                    $cell = Coordinate::stringFromColumnIndex($col).'8';
                    $sheet->setCellValue($cell, $m->nombre);
                    $sheet->getStyle($cell)->applyFromArray([
                        'font' => ['bold' => true, 'size' => 9],
                        'alignment' => [
                            'textRotation' => 90,
                            'horizontal' => Alignment::HORIZONTAL_CENTER,
                            'vertical' => Alignment::VERTICAL_BOTTOM,
                        ],
                        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                    ]);
                    $col++;
                }

                $promCell = Coordinate::stringFromColumnIndex($col).'8';
                $sheet->setCellValue($promCell, 'PROMEDIO');
                $sheet->getStyle($promCell)->applyFromArray([
                    'font' => ['bold' => true, 'size' => 10],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D9D9D9']],
                    'alignment' => [
                        'textRotation' => 90,
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                ]);

                $sheet->getRowDimension(8)->setRowHeight(120);

                // ── DATA STYLING ──
                $highestRow = $sheet->getHighestRow();
                $sheet->getStyle("A9:{$lastCol}{$highestRow}")->applyFromArray([
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                    'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                ]);

                for ($row = 9; $row <= $highestRow; $row++) {
                    // No. alignment
                    $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                    // Grades conditional formatting (Red if < 60)
                    for ($c = 3; $c <= $lastColIndex; $c++) {
                        $cellRef = Coordinate::stringFromColumnIndex($c).$row;
                        $val = $sheet->getCell($cellRef)->getValue();

                        $alignment = ['horizontal' => Alignment::HORIZONTAL_CENTER];
                        $font = [];

                        if (is_numeric($val) && $val < 60) {
                            $font['color'] = ['rgb' => 'FF0000'];
                        }

                        if ($c == $lastColIndex) {
                            $font['bold'] = true;
                        }

                        $sheet->getStyle($cellRef)->applyFromArray([
                            'font' => $font,
                            'alignment' => $alignment,
                        ]);
                    }
                }

                // Title properties
                $sheet->setTitle('Consolidado');
            },
        ];
    }
}
