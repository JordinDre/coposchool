import { useCallback, useEffect, useRef } from 'react';

interface UseGlobalBarcodeScannerProps {
    onBarcodeScanned: (code: string) => void;
    minLength?: number;
    maxLength?: number;
    debounceTime?: number;
    enabled?: boolean;
}

export function useGlobalBarcodeScanner({
    onBarcodeScanned,
    minLength = 4,
    maxLength = 20,
    debounceTime = 100,
    enabled = true,
}: UseGlobalBarcodeScannerProps) {
    const lastKeystrokeTimeRef = useRef<number>(0);
    const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentCodeRef = useRef<string>('');

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!enabled) return;

            // Verificar si hay algún input enfocado
            const activeElement = document.activeElement;
            const isInputFocused =
                activeElement &&
                (activeElement.tagName === 'INPUT' ||
                    activeElement.tagName === 'TEXTAREA' ||
                    activeElement.tagName === 'SELECT' ||
                    (activeElement as HTMLElement).contentEditable === 'true');

            // Si hay un input enfocado, no procesar (el input maneja su propia detección)
            if (isInputFocused) {
                return;
            }

            // Manejar Enter como terminador de escaneo
            if (e.key === 'Enter') {
                if (currentCodeRef.current.length >= minLength) {
                    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
                    const code = currentCodeRef.current;
                    currentCodeRef.current = '';
                    onBarcodeScanned(code);
                }
                return;
            }

            // Solo procesar teclas alfanuméricas y caracteres comunes en códigos de barras
            if (!/^[a-zA-Z0-9\-_.+/]$/.test(e.key)) {
                return;
            }

            const now = Date.now();
            const timeSinceLastKeystroke = now - lastKeystrokeTimeRef.current;

            // Si han pasado más de 100ms desde la última tecla, reiniciar el código
            // (100ms es más tolerante que 50ms para scanners lentos)
            if (timeSinceLastKeystroke > 100) {
                currentCodeRef.current = '';
            }

            lastKeystrokeTimeRef.current = now;
            currentCodeRef.current += e.key;

            // Limpiar timeout anterior
            if (scanTimeoutRef.current) {
                clearTimeout(scanTimeoutRef.current);
            }

            // Si el código tiene la longitud mínima, podría ser un escaneo
            if (currentCodeRef.current.length >= minLength) {
                scanTimeoutRef.current = setTimeout(() => {
                    const finalTimeSinceLastKeystroke = Date.now() - lastKeystrokeTimeRef.current;

                    if (finalTimeSinceLastKeystroke >= debounceTime && currentCodeRef.current.length >= minLength) {
                        onBarcodeScanned(currentCodeRef.current);
                        currentCodeRef.current = '';
                    }
                }, debounceTime);
            }

            // Limitar la longitud máxima para evitar acumulación excesiva
            if (currentCodeRef.current.length > maxLength) {
                currentCodeRef.current = currentCodeRef.current.slice(-maxLength);
            }
        },
        [onBarcodeScanned, minLength, maxLength, debounceTime, enabled],
    );

    useEffect(() => {
        if (!enabled) return;

        document.addEventListener('keydown', handleKeyDown, true);

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
            if (scanTimeoutRef.current) {
                clearTimeout(scanTimeoutRef.current);
            }
        };
    }, [handleKeyDown, enabled]);

    return {
        clearCode: () => {
            currentCodeRef.current = '';
        },
    };
}
