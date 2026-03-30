import { PdfSheet } from '@/components/PdfSheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePdf } from '@/hooks/usePdf';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import React, { useState } from 'react';

interface Seccion {
    id: number;
    nombre: string;
    ciclo: string;
    ciclo_escolar: number;
}


interface Props {
    secciones: Seccion[];
    canGenerarSeccion: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Reportes', href: '/reportes' }];

Index.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

interface ReportCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    selectors: React.ReactNode;
    onGenerate: () => void;
    disabled: boolean;
    label: string;
}

function ReportCard({ icon, title, description, selectors, onGenerate, disabled, label }: ReportCardProps) {
    return (
        <div className="flex flex-col rounded-lg border bg-card">
            {/* Icon strip */}
            <div className="flex items-start gap-3 border-b px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">{icon}</div>
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold selection:leading-tight">{title}</h2>
                    <p className="mt-1 text-xs leading-snug text-muted-foreground">{description}</p>
                </div>
            </div>

            {/* Selectors + action */}
            <div className="flex flex-1 flex-col justify-between gap-4 px-5 py-4">
                <div className="space-y-3">{selectors}</div>
                <Button size="sm" disabled={disabled} onClick={onGenerate} className="w-full">
                    {label}
                </Button>
            </div>
        </div>
    );
}

function SeccionSelect({ secciones, value, onChange }: { secciones: Seccion[]; value: string; onChange: (v: string) => void }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Sección</label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar sección…" />
                </SelectTrigger>
                <SelectContent>
                    {secciones.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                            {s.nombre}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

export default function Index({ secciones, canGenerarSeccion }: Props) {
    const { generatePdfUrl } = usePdf();

    // Fichas por sección
    const [fichasId, setFichasId] = useState('');
    const [showFichas, setShowFichas] = useState(false);

    const seccionFor = (id: string) => secciones.find((s) => String(s.id) === id) ?? null;

    const fichasUrl = fichasId ? generatePdfUrl(`reportes/fichas-seccion?seccion_id=${fichasId}`) : '';

    const fichasSec = seccionFor(fichasId);

    const seccionLabel = (sec: Seccion | null) => (sec ? `${sec.nombre} · ${sec.ciclo_escolar}` : '');

    const handleVerConsolidado = () => {
        router.visit(route('reportes.consolidado-view'));
    };

    const handleVerConsolidadoMaterias = () => {
        router.visit(route('reportes.consolidado-materias'));
    };

    return (
        <>
            <Head title="Reportes" />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-semibold">Reportes</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Genera documentos PDF para imprimir o archivar.</p>
                </div>

                {canGenerarSeccion && (
                    <>
                        <div>
                            <h2 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Reportes por sección</h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Fichas por sección */}
                                <ReportCard
                                    icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                                    title="Fichas académicas"
                                    description="Ficha individual de cada estudiante con sus calificaciones por unidad."
                                    selectors={<SeccionSelect secciones={secciones} value={fichasId} onChange={setFichasId} />}
                                    disabled={!fichasId}
                                    label="Ver fichas"
                                    onGenerate={() => setShowFichas(true)}
                                />

                                {/* Consolidado */}
                                <ReportCard
                                    icon={<FileSpreadsheet className="h-4 w-4 text-muted-foreground" />}
                                    title="Consolidado de notas"
                                    description="Visualiza en el navegador y exporta a Excel el consolidado de notas por sección y unidad."
                                    selectors={null}
                                    disabled={false}
                                    label="Ver Consolidado"
                                    onGenerate={handleVerConsolidado}
                                />

                                {/* Consolidado por Materia */}
                                <ReportCard
                                    icon={<FileSpreadsheet className="h-4 w-4 text-muted-foreground" />}
                                    title="Consolidado por materia"
                                    description="Matriz completa de notas: todas las materias × todos los bimestres con promedios finales por estudiante."
                                    selectors={null}
                                    disabled={false}
                                    label="Ver Consolidado por Materia"
                                    onGenerate={handleVerConsolidadoMaterias}
                                />
                            </div>
                        </div>
                    </>
                )}

                {!canGenerarSeccion && secciones.length === 0 && (
                    <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
                        No tienes permisos para generar reportes de sección.
                    </div>
                )}
            </div>

            {/* PDF side-sheets */}
            <PdfSheet
                open={showFichas}
                onOpenChange={(open) => {
                    if (!open) setShowFichas(false);
                }}
                title={fichasSec ? `Fichas — ${fichasSec.nombre} ${fichasSec.ciclo_escolar}` : 'Fichas por sección'}
                description={fichasSec ? seccionLabel(fichasSec) : undefined}
                pdfUrl={fichasUrl}
                fileName={fichasSec ? `fichas-${fichasSec.nombre.toLowerCase().replace(/\s+/g, '-')}-${fichasSec.ciclo_escolar}.pdf` : 'fichas.pdf'}
            >
                {null}
            </PdfSheet>
        </>
    );
}
