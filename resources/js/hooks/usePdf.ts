import { useCallback, useState } from 'react';

interface UsePdfOptions {
    onError?: (error: string) => void;
    onSuccess?: () => void;
}

export function usePdf(options: UsePdfOptions = {}) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generatePdfUrl = useCallback((route: string) => {
        return `${window.location.origin}/${route}`;
    }, []);

    const openPdf = useCallback(
        async (route: string) => {
            setIsLoading(true);
            setError(null);

            try {
                const pdfUrl = generatePdfUrl(route);

                // Verificar que la URL sea válida
                const response = await fetch(pdfUrl, { method: 'HEAD' });
                if (!response.ok) {
                    throw new Error('No se pudo cargar el PDF');
                }

                options.onSuccess?.();
                return pdfUrl;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                setError(errorMessage);
                options.onError?.(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [generatePdfUrl, options],
    );

    const downloadPdf = useCallback(
        async (route: string, fileName: string) => {
            setIsLoading(true);
            setError(null);

            try {
                const pdfUrl = generatePdfUrl(route);

                const response = await fetch(pdfUrl);
                if (!response.ok) {
                    throw new Error('No se pudo descargar el PDF');
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                window.URL.revokeObjectURL(url);
                options.onSuccess?.();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                setError(errorMessage);
                options.onError?.(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [generatePdfUrl, options],
    );

    return {
        isLoading,
        error,
        openPdf,
        downloadPdf,
        generatePdfUrl,
    };
}
