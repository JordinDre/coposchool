import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Función para formatear moneda
// Nota: Esta función se llama desde muchos lugares, por lo que no podemos usar hooks aquí
// En su lugar, usamos una variable global que se actualiza cuando cambia la página
let globalSimboloMoneda = 'Q'; // Valor por defecto: Quetzal guatemalteco

// Función para actualizar el símbolo de moneda globalmente
export const setGlobalSimboloMoneda = (simbolo: string) => {
    globalSimboloMoneda = simbolo || 'Q';
};

export const formatCurrency = (amount: number) => {
    return `${globalSimboloMoneda}${new Intl.NumberFormat('es-GT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)}`;
};

// Función para formatear fecha
export const formatDate = (value?: string | Date | null): string => {
    if (!value) {
        return '-';
    }

    // Evita errores de zona horaria con strings tipo "YYYY-MM-DD"
    if (typeof value === 'string') {
        const raw = value.trim();
        if (!raw) {
            return '-';
        }

        const ymd = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (ymd) {
            return `${ymd[3]}/${ymd[2]}/${ymd[1]}`;
        }

        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) {
            return raw;
        }

        return date.toLocaleString('es-GT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    }

    return value.toLocaleString('es-GT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

// Función para obtener el color del badge según el estado de venta, gasto o compra
export const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
        // Estados de ventas
        case 'pendiente':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'proceso':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
        case 'preparada':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
        case 'entregada':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'finalizada':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'anulada':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case 'devuelta completa':
            return 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300';
        case 'devuelta parcial':
            return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300';
        // Estados de gastos
        case 'pagado':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'anulado':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        // Estados de compras
        case 'recibida':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'confirmada':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        // Estados de ajustes
        case 'solicitado':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'autorizado':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'rechazado':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        // Estados de conversiones (solicitado ya está arriba)
        // Estados de traslados
        case 'enviado':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'recibido':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
        case 'confirmado':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
};

// Función para obtener el color del badge según el canal de venta
export const getCanalBadgeColor = (canal: string) => {
    switch (canal) {
        case 'web':
        case 'ecommerce':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
        case 'pos':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
};

// Convert Hex to HSL for Tailwind/Shadcn variables
export function hexToHSL(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '222.2 47.4% 11.2%'; // Default fallback

    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let h = 0,
        s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return `hsl(${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%)`;
}

export function getContrastColor(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '#ffffff';

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    // Calculate electrical/luminance
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#000000' : '#ffffff';
}
