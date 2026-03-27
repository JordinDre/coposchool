import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface IntegerInputProps {
  value?: number;
  onChange?: (value: number) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  min?: number;
  max?: number;
  allowZero?: boolean;
}

const IntegerInput = React.forwardRef<HTMLInputElement, IntegerInputProps>(
  ({ 
    className, 
    value, 
    onChange, 
    onBlur,
    placeholder = "0",
    disabled = false,
    min = 0, 
    max, 
    allowZero = true, 
    ...props 
  }, ref) => {
    const [displayValue, setDisplayValue] = useState('');

    // Convertir el valor inicial a string para mostrar
    useEffect(() => {
      const stringValue = value?.toString() || '0';
      setDisplayValue(stringValue);
    }, [value]);

    // Función para limpiar ceros iniciales
    const cleanLeadingZeros = useCallback((val: string): string => {
      if (!val) return '';
      
      // Si el valor es solo "0", lo mantenemos
      if (val === '0') return '0';
      
      // Si el valor tiene ceros iniciales seguidos de dígitos, los eliminamos
      const cleaned = val.replace(/^0+(?=\d)/, '');
      
      // Si después de limpiar queda vacío, devolvemos cadena vacía
      return cleaned;
    }, []);

    // Función para validar y formatear el input
    const formatInputValue = useCallback((val: string): string => {
      // Permitir solo números enteros
      const cleaned = val.replace(/[^0-9]/g, '');
      return cleaned;
    }, []);

    // Manejar cambios en el input
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formatted = formatInputValue(inputValue);
      const cleaned = cleanLeadingZeros(formatted);
      
      setDisplayValue(cleaned);
      
      // Si está vacío, no llamar onChange para permitir que el usuario borre completamente
      if (cleaned === '') {
        return;
      }
      
      // Convertir a número y llamar onChange
      const numValue = parseInt(cleaned, 10) || 0;
      onChange?.(numValue);
    }, [formatInputValue, cleanLeadingZeros, onChange]);

    // Manejar cuando el usuario termina de escribir
    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      
      // Si está vacío, establecer el valor mínimo apropiado
      if (displayValue === '') {
        const defaultValue = allowZero ? 0 : Math.max(min, 1);
        setDisplayValue(defaultValue.toString());
        onChange?.(defaultValue);
      } else if (displayValue === '0' && !allowZero) {
        // Si es 0 y no se permite cero, establecer el valor mínimo
        const defaultValue = Math.max(min, 1);
        setDisplayValue(defaultValue.toString());
        onChange?.(defaultValue);
      } else {
        // Aplicar limpieza final
        const finalCleaned = cleanLeadingZeros(displayValue);
        if (finalCleaned !== displayValue) {
          setDisplayValue(finalCleaned);
          const numValue = parseInt(finalCleaned, 10) || 0;
          onChange?.(numValue);
        }
        
        // Validar valores mínimos/máximos
        const numValue = parseInt(finalCleaned, 10) || 0;
        if (numValue < min) {
          const minValue = allowZero ? min : Math.max(min, 1);
          setDisplayValue(minValue.toString());
          onChange?.(minValue);
        } else if (max && numValue > max) {
          setDisplayValue(max.toString());
          onChange?.(max);
        }
      }
      
      if (onBlur) {
        onBlur(e);
      }
    }, [displayValue, cleanLeadingZeros, onChange, onBlur, min, max, allowZero]);

    // Manejar cuando el usuario hace foco
    const handleFocus = useCallback(() => {
      // No necesitamos hacer nada especial en focus
    }, []);

    // Manejar teclas del teclado
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevenir teclas que no sean números, backspace, delete, arrow keys, tab, etc.
      const allowedKeys = [
        'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Tab', 'Enter', 'Home', 'End'
      ];
      
      if (allowedKeys.includes(e.key)) {
        return;
      }

      // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
        return;
      }

      // Solo permitir números
      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
      }
    }, []);

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          disabled && "disabled:text-gray-900 disabled:dark:text-gray-100",
          className
        )}
        {...props}
      />
    );
  }
);

IntegerInput.displayName = 'IntegerInput';

export { IntegerInput };
