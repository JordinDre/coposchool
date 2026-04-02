<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class NotasExport implements FromArray, WithColumnWidths, WithEvents
{
    private $config;

    public function __construct(
        private readonly mixed $seccion,
        private readonly mixed $materia,
        private readonly mixed $unidades,
        private readonly mixed $estudiantes,
        private readonly mixed $notas,
    ) {
        $this->config = \App\Models\Configuracion::cached();
    }

    public function array(): array
    {
        $rows = [];

        foreach ($this->estudiantes as $idx => $estudiante) {
            $estudianteNotas = $this->notas->get($estudiante->id, collect());

            $lookup = [];
            foreach ($estudianteNotas as $n) {
                $lookup[$n->unidad_id] = (float) $n->nota;
            }

            $row = [
                $idx + 1,
                $estudiante->name.($estudiante->deleted_at ? ' (INACTIVO)' : ''),
            ];

            $sum = 0;
            $count = 0;

            foreach ($this->unidades as $u) {
                $nota = $lookup[$u->id] ?? null;
                $row[] = $nota ?? '';
                if ($nota !== null) {
                    $sum += $nota;
                    $count++;
                }
            }

            $row[] = $count > 0 ? round($sum / $count, 1) : '';

            $rows[] = $row;
        }

        return $rows;
    }

    public function columnWidths(): array
    {
        $widths = [
            'A' => 6,
            'B' => 45,
        ];

        $colIndex = 3;
        foreach ($this->unidades as $u) {
            $widths[Coordinate::stringFromColumnIndex($colIndex)] = 14;
            $colIndex++;
        }

        $widths[Coordinate::stringFromColumnIndex($colIndex)] = 10;

        return $widths;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $numUnidades = $this->unidades->count();
                $lastColIndex = 3 + $numUnidades;
                $lastCol = Coordinate::stringFromColumnIndex($lastColIndex);

                $sheet->insertNewRowBefore(1, 5);

                // Row 1: school name
                $nombreFull = trim(($this->config->nombre_completo ?? '').' '.($this->config->abreviatura ?? ''));
                $sheet->mergeCells("A1:{$lastCol}1");
                $sheet->setCellValue('A1', $nombreFull ?: 'COPOSCHOOL');
                $sheet->getStyle('A1')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 12],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                // Row 2: section + materia
                $sheet->mergeCells("A2:{$lastCol}2");
                $sheet->setCellValue('A2', strtoupper($this->seccion->nombre).'  ·  '.strtoupper($this->materia->nombre));
                $sheet->getStyle('A2')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 11],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                // Row 3: ciclo escolar
                $sheet->mergeCells("A3:{$lastCol}3");
                $sheet->setCellValue('A3', 'Ciclo Escolar '.$this->seccion->ciclo_escolar);
                $sheet->getStyle('A3')->applyFromArray([
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                    'font' => ['size' => 10, 'color' => ['rgb' => '666666']],
                ]);

                // Row 5: column headers
                $sheet->setCellValue('A5', 'No.');
                $sheet->setCellValue('B5', 'NOMBRE DEL ESTUDIANTE');

                $col = 3;
                foreach ($this->unidades as $u) {
                    $cell = Coordinate::stringFromColumnIndex($col).'5';
                    $sheet->setCellValue($cell, $u->nombre);
                    $col++;
                }

                $promCell = Coordinate::stringFromColumnIndex($col).'5';
                $sheet->setCellValue($promCell, 'PROMEDIO');

                $sheet->getStyle("A5:{$lastCol}5")->applyFromArray([
                    'font' => ['bold' => true, 'size' => 10],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E293B']],
                    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FFFFFF']]],
                ]);

                $sheet->getRowDimension(5)->setRowHeight(22);

                // Data rows styling
                $highestRow = $sheet->getHighestRow();
                $sheet->getStyle("A6:{$lastCol}{$highestRow}")->applyFromArray([
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'DDDDDD']]],
                    'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                ]);

                for ($row = 6; $row <= $highestRow; $row++) {
                    // Zebra
                    if ($row % 2 === 0) {
                        $sheet->getStyle("A{$row}:{$lastCol}{$row}")->applyFromArray([
                            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F8FAFC']],
                        ]);
                    }

                    // # centered
                    $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                    // Grade columns
                    for ($c = 3; $c <= $lastColIndex; $c++) {
                        $cellRef = Coordinate::stringFromColumnIndex($c).$row;
                        $val = $sheet->getCell($cellRef)->getValue();

                        $style = ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]];

                        if (is_numeric($val) && (float) $val < 60) {
                            $style['font'] = ['color' => ['rgb' => 'DC2626']];
                        }

                        if ($c === $lastColIndex) {
                            $style['font'] = array_merge($style['font'] ?? [], ['bold' => true]);
                            $sheet->getStyle("A{$row}:{$lastCol}{$row}")->applyFromArray([
                                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F1F5F9']],
                            ]);
                        }

                        $sheet->getStyle($cellRef)->applyFromArray($style);
                    }
                }

                $sheet->setTitle('Notas');
            },
        ];
    }
}
