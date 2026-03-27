import { PdfSheet } from '@/components/PdfSheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePdf } from '@/hooks/usePdf';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BarChart2, FileText, Users } from 'lucide-react';
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
    selector: React.ReactNode;
    onGenerate: () => void;
    disabled: boolean;
    label: string;
}

function ReportCard({ icon, title, description, selector, onGenerate, disabled, label }: ReportCardProps) {
    return (
        <div className="flex flex-col rounded-lg border bg-card">
            {/* Icon strip */}
            <div className="flex items-start gap-3 border-b px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    {icon}
                </div>
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold leading-tight">{title}</h2>
                    <p className="mt-1 text-xs text-muted-foreground leading-snug">{description}</p>
                </div>
            </div>

            {/* Selector + action */}
            <div className="flex flex-1 flex-col justify-between gap-4 px-5 py-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Sección
                    </label>
                    {selector}
                </div>
                <Button
                    size="sm"
                    disabled={disabled}
                    onClick={onGenerate}
                    className="w-full"
                >
                    {label}
                </Button>
            </div>
        </div>
    );
}

function SeccionSelect({ secciones, value, onChange }: { secciones: Seccion[]; value: string; onChange: (v: string) => void }) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar sección…" />
            </SelectTrigger>
            <SelectContent>
                {secciones.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                        {s.nombre} · {s.ciclo_escolar}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export default function Index({ secciones, canGenerarSeccion }: Props) {
    const { generatePdfUrl } = usePdf();

    // Fichas por sección
    const [fichasId,   setFichasId]   = useState('');
    const [showFichas, setShowFichas] = useState(false);

    // Resumen de rendimiento
    const [resumenId,   setResumenId]   = useState('');
    const [showResumen, setShowResumen] = useState(false);

    // Lista de inscritos
    const [listaId,   setListaId]   = useState('');
    const [showLista, setShowLista] = useState(false);

    const seccionFor = (id: string) => secciones.find((s) => String(s.id) === id) ?? null;

    const fichasUrl  = fichasId  ? generatePdfUrl(`reportes/fichas-seccion?seccion_id=${fichasId}`)  : '';
    const resumenUrl = resumenId ? generatePdfUrl(`reportes/resumen-rendimiento?seccion_id=${resumenId}`) : '';
    const listaUrl   = listaId   ? generatePdfUrl(`reportes/lista-inscritos?seccion_id=${listaId}`)  : '';

    const fichasSec  = seccionFor(fichasId);
    const resumenSec = seccionFor(resumenId);
    const listaSec   = seccionFor(listaId);

    const seccionLabel = (sec: Seccion | null) =>
        sec ? `${sec.nombre} · ${sec.ciclo_escolar}` : '';

    return (
        <>
            <Head title="Reportes" />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-semibold">Reportes</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Genera documentos PDF para imprimir o archivar.
                    </p>
                </div>

                {canGenerarSeccion && (
                    <>
                        <div>
                            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Reportes por sección
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                                {/* Fichas por sección */}
                                <ReportCard
                                    icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                                    title="Fichas académicas"
                                    description="Ficha individual de cada estudiante con sus calificaciones por unidad."
                                    selector={<SeccionSelect secciones={secciones} value={fichasId} onChange={setFichasId} />}
                                    disabled={!fichasId}
                                    label="Ver fichas"
                                    onGenerate={() => setShowFichas(true)}
                                />

                                {/* Resumen de rendimiento */}
                                <ReportCard
                                    icon={<BarChart2 className="h-4 w-4 text-muted-foreground" />}
                                    title="Resumen de rendimiento"
                                    description="Promedio por materia y unidad, con porcentaje de aprobados por sección."
                                    selector={<SeccionSelect secciones={secciones} value={resumenId} onChange={setResumenId} />}
                                    disabled={!resumenId}
                                    label="Ver resumen"
                                    onGenerate={() => setShowResumen(true)}
                                />

                                {/* Lista de inscritos */}
                                <ReportCard
                                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                                    title="Lista de inscritos"
                                    description="Nómina de estudiantes inscritos con correo y contacto."
                                    selector={<SeccionSelect secciones={secciones} value={listaId} onChange={setListaId} />}
                                    disabled={!listaId}
                                    label="Ver lista"
                                    onGenerate={() => setShowLista(true)}
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
                onOpenChange={(open) => { if (!open) setShowFichas(false); }}
                title={fichasSec ? `Fichas — ${fichasSec.nombre} ${fichasSec.ciclo_escolar}` : 'Fichas por sección'}
                description={fichasSec ? seccionLabel(fichasSec) : undefined}
                pdfUrl={fichasUrl}
                fileName={fichasSec ? `fichas-${fichasSec.nombre.toLowerCase().replace(/\s+/g, '-')}-${fichasSec.ciclo_escolar}.pdf` : 'fichas.pdf'}
            >
                {null}
            </PdfSheet>

            <PdfSheet
                open={showResumen}
                onOpenChange={(open) => { if (!open) setShowResumen(false); }}
                title={resumenSec ? `Rendimiento — ${resumenSec.nombre} ${resumenSec.ciclo_escolar}` : 'Resumen de rendimiento'}
                description={resumenSec ? seccionLabel(resumenSec) : undefined}
                pdfUrl={resumenUrl}
                fileName={resumenSec ? `resumen-${resumenSec.nombre.toLowerCase().replace(/\s+/g, '-')}-${resumenSec.ciclo_escolar}.pdf` : 'resumen.pdf'}
            >
                {null}
            </PdfSheet>

            <PdfSheet
                open={showLista}
                onOpenChange={(open) => { if (!open) setShowLista(false); }}
                title={listaSec ? `Inscritos — ${listaSec.nombre} ${listaSec.ciclo_escolar}` : 'Lista de inscritos'}
                description={listaSec ? seccionLabel(listaSec) : undefined}
                pdfUrl={listaUrl}
                fileName={listaSec ? `inscritos-${listaSec.nombre.toLowerCase().replace(/\s+/g, '-')}-${listaSec.ciclo_escolar}.pdf` : 'inscritos.pdf'}
            >
                {null}
            </PdfSheet>
        </>
    );
}
