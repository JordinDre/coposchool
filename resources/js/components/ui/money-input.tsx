import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MoneyInputProps {
    value: string | number;
    onChange: (value: string) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    min?: number;
    max?: number;
    step?: number;
    prefix?: string;
    suffix?: string;
    allowNegative?: boolean;
    decimalPlaces?: number;
}

export default function MoneyInput({
    value,
    onChange,
    onBlur,
    placeholder = "0.00",
    disabled = false,
    className,
    min = 0,
    max,
    prefix = "",
    suffix = "",
    decimalPlaces = 2,
}: MoneyInputProps) {
    const [displayValue, setDisplayValue] = useState('');

    // Convertir el valor inicial a string para mostrar
    useEffect(() => {
        const stringValue = typeof value === 'number' ? value.toString() : value;
        setDisplayValue(stringValue);
    }, [value]);

    // Función para limpiar ceros iniciales
    const cleanLeadingZeros = useCallback((val: string): string => {
        if (!val) return '';
        
        // Si el valor es solo "0", lo mantenemos
        if (val === '0') return '0';
        
        // Si el valor es "0." seguido de dígitos, lo mantenemos
        if (val.startsWith('0.')) return val;
        
        // Si el valor tiene ceros iniciales seguidos de dígitos, los eliminamos
        const cleaned = val.replace(/^0+(?=\d)/, '');
        
        // Si después de limpiar queda vacío, devolvemos cadena vacía
        return cleaned;
    }, []);

    // Función para validar y formatear el input
    const formatInputValue = useCallback((val: string): string => {
        // Permitir solo números y punto decimal
        let cleaned = val.replace(/[^0-9.]/g, '');
        
        // Solo permitir un punto decimal
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Limitar decimales según decimalPlaces
        if (parts.length === 2 && parts[1].length > decimalPlaces) {
            const finalParts = cleaned.split('.');
            cleaned = finalParts[0] + '.' + finalParts[1].substring(0, decimalPlaces);
        }
        
        return cleaned;
    }, [decimalPlaces]);

    // Manejar cambios en el input
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const formatted = formatInputValue(inputValue);
        const cleaned = cleanLeadingZeros(formatted);
        
        setDisplayValue(cleaned);
        onChange(cleaned);
    }, [formatInputValue, cleanLeadingZeros, onChange]);

    // Manejar cuando el usuario termina de escribir
    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        
        // Si está vacío, establecer como "0"
        if (displayValue === '' || displayValue === '0') {
            setDisplayValue('0');
            onChange('0');
        } else {
            // Aplicar limpieza final
            const finalCleaned = cleanLeadingZeros(displayValue);
            if (finalCleaned !== displayValue) {
                setDisplayValue(finalCleaned);
                onChange(finalCleaned);
            }
            
            // Validar valores mínimos/máximos
            const numValue = parseFloat(finalCleaned) || 0;
            if (numValue < min) {
                const minValue = min.toString();
                setDisplayValue(minValue);
                onChange(minValue);
            } else if (max && numValue > max) {
                const maxValue = max.toString();
                setDisplayValue(maxValue);
                onChange(maxValue);
            }
        }
        
        if (onBlur) {
            onBlur(e);
        }
    }, [displayValue, cleanLeadingZeros, onChange, onBlur, min, max]);

    // Manejar cuando el usuario hace foco
    const handleFocus = useCallback(() => {
        // No necesitamos hacer nada especial en focus
    }, []);

    return (
        <div className="relative">
            {prefix && (
                <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-500 text-sm">
                    {prefix}
                </span>
            )}
            <Input
                type="text" // Usar text en lugar de number para mejor control
                inputMode="decimal" // Mostrar teclado numérico en móviles
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    prefix ? 'pl-8' : '',
                    suffix ? 'pr-8' : '',
                    className
                )}
            />
            {suffix && (
                <span className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-500 text-sm">
                    {suffix}
                </span>
            )}
        </div>
    );
}
