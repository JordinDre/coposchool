import React, { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface DecimalInputProps {
  value?: number;
  onChange?: (value: number) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  min?: number;
  max?: number;
  allowZero?: boolean;
  decimalPlaces?: number;
}

const DecimalInput = React.forwardRef<HTMLInputElement, DecimalInputProps>(
  ({
    className,
    value,
    onChange,
    onBlur,
    placeholder = "0.00",
    disabled = false,
    min = 0,
    max,
    allowZero = true,
    decimalPlaces = 4,
    ...props
  }, ref) => {
    // editValue: string mientras está enfocado (el usuario escribe), null cuando no está enfocado
    // Usar useRef en lugar de useState para no causar re-renders al pasar de null a string y viceversa
    const editValueRef = React.useRef<string | null>(null);
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

    // Derivar el valor mostrado directamente del prop cuando no está editando
    // Esto elimina el useEffect + setState del ciclo de render anterior
    const getFormattedProp = (v: number | undefined | null): string => {
      if (v === undefined || v === null) return '';
      if (v === 0 && !allowZero) return '';
      const numValue = Number(v);
      if (isNaN(numValue)) return '';
      return numValue.toFixed(decimalPlaces).replace(/\.?0+$/, '') || '0';
    };

    const displayValue = editValueRef.current !== null
      ? editValueRef.current
      : getFormattedProp(value);

    const formatInputValue = useCallback((val: string): string => {
      let cleaned = val.replace(/[^0-9.]/g, '');
      const parts = cleaned.split('.');
      if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('');
      }
      if (parts.length === 2 && parts[1].length > decimalPlaces) {
        const finalParts = cleaned.split('.');
        cleaned = finalParts[0] + '.' + finalParts[1].substring(0, decimalPlaces);
      }
      return cleaned;
    }, [decimalPlaces]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatInputValue(e.target.value);
      editValueRef.current = formatted;
      forceUpdate();

      if (formatted !== '' && formatted !== '.' && formatted !== '-') {
        const numValue = parseFloat(formatted);
        if (!isNaN(numValue)) {
          onChange?.(numValue);
        }
      }
    }, [formatInputValue, onChange]);

    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      // Al enfocar, comenzar edición con el valor actual formateado
      editValueRef.current = getFormattedProp(value);
      forceUpdate();
      // Seleccionar todo el texto
      e.target.select();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, allowZero, decimalPlaces]);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      const current = editValueRef.current ?? '';
      let finalNum: number;

      if (current === '' || current === '.' || current === '-') {
        finalNum = allowZero ? 0 : Math.max(min, 0.0001);
      } else {
        finalNum = parseFloat(current);
        if (isNaN(finalNum)) {
          finalNum = allowZero ? 0 : Math.max(min, 0.0001);
        } else if (finalNum < min) {
          finalNum = allowZero ? min : Math.max(min, 0.0001);
        } else if (max !== undefined && finalNum > max) {
          finalNum = max;
        }
      }

      // Salir del modo edición — el display vuelve a derivarse del prop
      editValueRef.current = null;
      forceUpdate();
      onChange?.(finalNum);
      onBlur?.(e);
    }, [onChange, onBlur, min, max, allowZero]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowedKeys = [
        'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Tab', 'Enter', 'Home', 'End', '.'
      ];
      if (allowedKeys.includes(e.key)) return;
      if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
      if (!/^[0-9]$/.test(e.key)) e.preventDefault();
    }, []);

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(className)}
        {...props}
      />
    );
  }
);

DecimalInput.displayName = 'DecimalInput';

export { DecimalInput };
