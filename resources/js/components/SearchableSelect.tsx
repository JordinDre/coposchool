import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, Search, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// Helper function para manejar rutas de manera segura
const getRoute = (routeName: string, params: Record<string, unknown> = {}) => {
    // En el entorno de build, usar URLs directas
    if (typeof window === 'undefined' || !(window as unknown as { route?: (name: string, params: Record<string, unknown>) => string }).route) {
        // Fallback para build
        return `/${routeName}`;
    }
    return (window as unknown as { route: (name: string, params: Record<string, unknown>) => string }).route(routeName, params);
};

interface SearchableSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    searchRoute: string;
    displayField?: string;
    idField?: string;
    className?: string;
}

interface Option {
    id: number;
    [key: string]: string | number;
}

export default function SearchableSelect({
    value: selectedValue,
    onValueChange,
    placeholder = 'Buscar...',
    label,
    disabled = false,
    searchRoute,
    displayField = 'nombre',
    idField = 'id',
    className = '',
}: SearchableSelectProps) {
    const [opciones, setOpciones] = useState<Option[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [mostrarOpciones, setMostrarOpciones] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [opcionSeleccionada, setOpcionSeleccionada] = useState<Option | null>(null);
    const [opcionPreseleccionada, setOpcionPreseleccionada] = useState<Option | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
    const isClickingOptionRef = useRef(false);

    // Cargar opción seleccionada si hay un valor
    const cargarOpcionSeleccionada = useCallback(
        async (id: string) => {
            if (!id) {
                setOpcionSeleccionada(null);
                return;
            }

            setCargando(true);
            try {
                // Buscar todas las opciones y encontrar la que coincide con el ID
                const response = await fetch(`${getRoute(searchRoute)}?q=`);
                if (response.ok) {
                    const data = await response.json();
                    const opcion = data.find((op: Option) => op[idField].toString() === id);
                    if (opcion) {
                        setOpcionSeleccionada(opcion);
                    } else {
                        // Si no se encuentra en las primeras opciones, buscar específicamente
                        const searchResponse = await fetch(`${getRoute(searchRoute)}?q=${encodeURIComponent(id)}`);
                        if (searchResponse.ok) {
                            const searchData = await searchResponse.json();
                            const foundOpcion = searchData.find((op: Option) => op[idField].toString() === id);
                            if (foundOpcion) {
                                setOpcionSeleccionada(foundOpcion);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error al cargar opción seleccionada:', error);
            } finally {
                setCargando(false);
            }
        },
        [searchRoute, idField],
    );

    // Cargar opciones por defecto
    const cargarOpcionesPorDefecto = useCallback(async () => {
        setCargando(true);
        try {
            const response = await fetch(`${getRoute(searchRoute)}?q=`);
            if (response.ok) {
                const data = await response.json();
                setOpciones(data.slice(0, 5)); // Solo las primeras 5
            }
        } catch (error) {
            console.error('Error al cargar opciones por defecto:', error);
        } finally {
            setCargando(false);
        }
    }, [searchRoute]);

    // Buscar opciones
    const buscarOpciones = useCallback(
        async (termino: string) => {
            if (!termino.trim()) {
                cargarOpcionesPorDefecto();
                return;
            }

            setCargando(true);
            try {
                const response = await fetch(`${getRoute(searchRoute)}?q=${encodeURIComponent(termino)}`);
                if (response.ok) {
                    const data = await response.json();
                    // Limitar resultados según la longitud del término de búsqueda
                    let limite = 5;
                    if (termino.length >= 5) {
                        limite = 20;
                    } else if (termino.length >= 3) {
                        limite = 10;
                    }

                    const opcionesLimitadas = data.slice(0, limite);
                    setOpciones(opcionesLimitadas);
                    setOpcionPreseleccionada(opcionesLimitadas.length > 0 ? opcionesLimitadas[0] : null);
                }
            } catch (error) {
                console.error('Error al buscar opciones:', error);
            } finally {
                setCargando(false);
            }
        },
        [searchRoute, cargarOpcionesPorDefecto],
    );

    // Debounce para la búsqueda
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (busqueda.trim()) {
                buscarOpciones(busqueda);
            } else {
                cargarOpcionesPorDefecto();
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [busqueda, buscarOpciones, cargarOpcionesPorDefecto]);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        if (!mostrarOpciones) return;

        const handleClickOutside = (event: MouseEvent) => {
            // Si estamos haciendo click en una opción, no hacer nada
            if (isClickingOptionRef.current) {
                isClickingOptionRef.current = false;
                return;
            }

            const target = event.target as HTMLElement;

            // Verificar si el clic fue en el contenedor
            if (containerRef.current?.contains(target)) {
                return;
            }

            // Cerrar el dropdown
            setMostrarOpciones(false);
        };

        // Usar mousedown en lugar de click para capturar antes
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [mostrarOpciones]);

    // Cargar opción seleccionada cuando cambia el valor
    useEffect(() => {
        if (selectedValue) {
            // Primero verificar si la opción ya está en las opciones cargadas
            const opcionExistente = opciones.find((op) => op[idField].toString() === selectedValue);
            if (opcionExistente) {
                setOpcionSeleccionada(opcionExistente);
            } else if (!opcionSeleccionada || opcionSeleccionada[idField].toString() !== selectedValue) {
                // Solo cargar desde el servidor si no está en las opciones y no es la misma que ya está seleccionada
                cargarOpcionSeleccionada(selectedValue);
            }
        } else {
            setOpcionSeleccionada(null);
        }
    }, [selectedValue, cargarOpcionSeleccionada, opciones, idField, opcionSeleccionada]);

    // Manejar teclas
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (opcionPreseleccionada) {
                seleccionarOpcion(opcionPreseleccionada);
            }
        } else if (e.key === 'Escape') {
            setMostrarOpciones(false);
            setBusqueda('');
        }
    };

    // Seleccionar opción existente
    const seleccionarOpcion = useCallback(
        (opcion: Option) => {
            // Marcar que estamos seleccionando
            isClickingOptionRef.current = true;

            // Cerrar el dropdown
            setMostrarOpciones(false);

            // Actualizar el valor externo
            onValueChange(opcion[idField].toString());

            // Actualizar el estado local
            setOpcionSeleccionada(opcion);
            setBusqueda('');

            // Resetear el flag después de un breve delay
            setTimeout(() => {
                isClickingOptionRef.current = false;
            }, 100);

            // Desplazar el input hacia abajo para mostrar toda la información
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        },
        [onValueChange, idField],
    );

    // Limpiar selección
    const limpiarSeleccion = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onValueChange('');
        setOpcionSeleccionada(null);
        setBusqueda('');
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {label && <Label className="text-sm font-medium">{label}</Label>}
            <div className="relative">
                <Search className="absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
                {opcionSeleccionada ? (
                    <Textarea
                        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                        placeholder={placeholder}
                        value={opcionSeleccionada[displayField] as string}
                        readOnly
                        disabled={disabled}
                        autoExpand
                        minHeight={40}
                        maxHeight={200}
                        className="min-h-[2.5rem] border-input bg-background pr-10 pl-10 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&]:min-h-[2.5rem] [&]:md:min-h-[2.5rem]"
                        rows={1}
                        onFocus={() => {
                            // Al hacer focus, permitir editar
                            setBusqueda(opcionSeleccionada[displayField] as string);
                            setOpcionSeleccionada(null);
                            setMostrarOpciones(true);
                        }}
                    />
                ) : (
                    <Input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        type="text"
                        placeholder={placeholder}
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setMostrarOpciones(true);
                        }}
                        onFocus={() => {
                            setMostrarOpciones(true);
                            if (opciones.length === 0) {
                                cargarOpcionesPorDefecto();
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                        className="pr-10 pl-10"
                    />
                )}
                {opcionSeleccionada && (
                    <button
                        type="button"
                        onClick={limpiarSeleccion}
                        disabled={disabled}
                        className="absolute top-1/2 right-3 z-10 -translate-y-1/2 cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                        title="Limpiar selección"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Dropdown de opciones - sin portal, relativo al contenedor */}
            {mostrarOpciones && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    {cargando && (
                        <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                            Buscando...
                        </div>
                    )}

                    {/* Mostrar opciones existentes */}
                    {!cargando && opciones.length > 0 && (
                        <div className="py-1">
                            {opciones.map((opcion) => (
                                <button
                                    key={opcion[idField]}
                                    type="button"
                                    onMouseDown={(e) => {
                                        // Marcar que estamos haciendo click en una opción
                                        isClickingOptionRef.current = true;
                                        e.preventDefault();
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        seleccionarOpcion(opcion);
                                    }}
                                    className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                        opcionPreseleccionada?.id === opcion.id
                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                            : 'text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    <span className="flex-1 text-left">{opcion[displayField]}</span>
                                    {opcionPreseleccionada?.id === opcion.id && <Check className="h-4 w-4" />}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Mensaje cuando no hay resultados */}
                    {!cargando && opciones.length === 0 && busqueda.trim() && (
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No se encontraron resultados</div>
                    )}
                    {!cargando && opciones.length === 0 && !busqueda.trim() && (
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Escribe para buscar</div>
                    )}
                </div>
            )}
        </div>
    );
}
