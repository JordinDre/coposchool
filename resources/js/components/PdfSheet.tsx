'use client';

import { Download, FileText, Printer } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface PdfSheetProps {
    title: string;
    description?: string;
    pdfUrl: string;
    fileName: string;
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function PdfSheet({ title, description, pdfUrl, fileName, children, open, onOpenChange }: PdfSheetProps) {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;
    const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = React.useCallback(() => {
        const iframe = document.querySelector('iframe[title="' + title + '"]') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.print();
        }
    }, [title]);

    // Detectar Command+P o Control+P cuando el sheet está abierto
    React.useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            // Detectar Command+P (Mac) o Control+P (Windows/Linux)
            if ((event.metaKey || event.ctrlKey) && event.key === 'p') {
                event.preventDefault();
                handlePrint();
            }
        };

        // Agregar el event listener
        window.addEventListener('keydown', handleKeyDown);

        // Limpiar el event listener cuando el componente se desmonte o el sheet se cierre
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, handlePrint]);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            {children && <SheetTrigger asChild>{children}</SheetTrigger>}
            <SheetContent side="right" className="w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl">
                <div className="flex h-full flex-col">
                    <SheetHeader className="border-b pb-4">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            <div>
                                <SheetTitle>{title}</SheetTitle>
                                {description && <SheetDescription>{description}</SheetDescription>}
                            </div>
                        </div>
                    </SheetHeader>

                    <div className="mt-4 flex-1 overflow-hidden">
                        <iframe src={pdfUrl} className="h-full w-full rounded-lg border" title={title} />
                    </div>

                    <SheetFooter className="mt-4 border-t pt-4">
                        <div className="flex w-full gap-2">
                            <Button onClick={handleDownload} className="flex-1">
                                <Download className="mr-2 h-4 w-4" />
                                Descargar
                            </Button>
                            <Button onClick={handlePrint} className="flex-1 bg-blue-600 text-white hover:bg-blue-700">
                                <Printer className="mr-2 h-4 w-4" />
                                Imprimir
                            </Button>
                            <SheetClose asChild>
                                <Button variant="outline" className="flex-1">
                                    Cerrar
                                </Button>
                            </SheetClose>
                        </div>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>
    );
}
