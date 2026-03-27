import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { Check, Plus, Search, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
// import { route } from 'ziggy-js';

// Helper function para manejar rutas de manera segura
const getRoute = (routeName: string, params: Record<string, unknown> = {}) => {
    // En el entorno de build, usar URLs directas
    if (typeof window === 'undefined' || !(window as unknown as { route?: (name: string, params: Record<string, unknown>) => string }).route) {
        // Fallback para build
        return `/${routeName}`;
    }
    return (window as unknown as { route: (name: string, params: Record<string, unknown>) => string }).route(routeName, params);
};

interface SelectWithCreateProps {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    searchRoute: string;
    createRoute: string;
    createFieldName: string;
    displayField?: string;
    idField?: string;
    className?: string;
    flash?: {
        created_item?: {
            type: 'categoria' | 'marca' | 'presentacion' | 'proveedor' | 'atributo' | 'concepto';
            id: number;
            nombre?: string;
            name?: string;
        };
    };
}

interface Option {
    id: number;
    [key: string]: string | number;
}

export default function SelectWithCreate({
    value: selectedValue, // Se usa internamente para manejar el estado
    onValueChange,
    placeholder = 'Buscar...',
    label,
    required = false,
    disabled = false,
    searchRoute,
    createRoute,
    createFieldName,
    displayField = 'nombre',
    idField = 'id',
    className = '',
    flash,
}: SelectWithCreateProps) {
    const [opciones, setOpciones] = useState<Option[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [mostrarOpciones, setMostrarOpciones] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [creando, setCreando] = useState(false);
    const [opcionSeleccionada, setOpcionSeleccionada] = useState<Option | null>(null);
    const [opcionPreseleccionada, setOpcionPreseleccionada] = useState<Option | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Cargar opciones por defecto
    const cargarOpcionesPorDefecto = useCallback(async () => {
        setCargando(true);
        try {
            const response = await fetch(`${getRoute(searchRoute)}?q=`);
            if (response.ok) {
                const data = await response.json();
                setOpciones(data.slice(0, 5));
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
                    setOpciones(data);
                    setOpcionPreseleccionada(data.length > 0 ? data[0] : null);
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
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setMostrarOpciones(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Cargar opción seleccionada cuando hay un valor pero no está en las opciones
    const cargarOpcionSeleccionada = useCallback(
        async (valor: string) => {
            if (!valor) {
                return;
            }

            try {
                // Buscar el proveedor por ID
                const response = await fetch(`${getRoute(searchRoute)}?q=&id=${encodeURIComponent(valor)}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        const opcionEncontrada = data.find((op: Option) => op[idField].toString() === valor);
                        if (opcionEncontrada) {
                            setOpcionSeleccionada(opcionEncontrada);
                            // Agregar a las opciones si no existe
                            setOpciones((prev) => {
                                const existe = prev.some((op) => op[idField].toString() === valor);
                                if (!existe) {
                                    return [opcionEncontrada, ...prev];
                                }
                                return prev;
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('Error al cargar opción seleccionada:', error);
            }
        },
        [searchRoute, idField],
    );

    // Sincronizar con el valor externo
    useEffect(() => {
        if (selectedValue) {
            // Primero verificar si la opción ya está en las opciones cargadas
            const opcionExistente = opciones.find((opcion) => opcion[idField].toString() === selectedValue);
            if (opcionExistente) {
                setOpcionSeleccionada(opcionExistente);
            } else if (!opcionSeleccionada || opcionSeleccionada[idField].toString() !== selectedValue) {
                // Solo cargar desde el servidor si no está en las opciones y no es la misma que ya está seleccionada
                cargarOpcionSeleccionada(selectedValue);
            }
        } else if (!selectedValue) {
            setOpcionSeleccionada(null);
        }
    }, [selectedValue, opciones, idField, opcionSeleccionada, cargarOpcionSeleccionada]);

    // Ref para evitar bucles infinitos
    const processedItemsRef = useRef<Set<number>>(new Set());

    // Manejar elemento creado desde flash (solo para el tipo correcto)
    useEffect(() => {
        if (!flash?.created_item) {
            return;
        }

        const createdItem = flash.created_item;

        // Determinar si este select debe reaccionar al elemento creado
        const shouldReact =
            (createRoute.includes('categorias') && createdItem.type === 'categoria') ||
            (createRoute.includes('marcas') && createdItem.type === 'marca') ||
            (createRoute.includes('presentaciones') && createdItem.type === 'presentacion') ||
            (createRoute.includes('proveedores') && createdItem.type === 'proveedor') ||
            (createRoute.includes('atributos') && createdItem.type === 'atributo') ||
            (createRoute.includes('conceptos-seguimiento') && createdItem.type === 'concepto');

        console.log('🎯 Should react:', shouldReact, 'createRoute:', createRoute, 'type:', createdItem.type);

        if (shouldReact && !processedItemsRef.current.has(createdItem.id)) {
            // Marcar como procesado para evitar procesamiento múltiple
            processedItemsRef.current.add(createdItem.id);

            // Obtener el nombre del elemento creado
            const nombre = createdItem.nombre || createdItem.name || '';

            const opcionFormateada = {
                [idField]: createdItem.id,
                [displayField]: nombre,
            } as Option;

            // Agregar a las opciones si no existe
            setOpciones((prev) => {
                const existe = prev.some((op) => op[idField] === createdItem.id);
                if (!existe) {
                    return [opcionFormateada, ...prev];
                }
                return prev;
            });

            // Seleccionar automáticamente
            onValueChange(createdItem.id.toString());
            setOpcionSeleccionada(opcionFormateada);
            setBusqueda('');
            setMostrarOpciones(false);
        }
    }, [flash, createRoute, idField, displayField, onValueChange]);

    // Crear nueva opción
    // Crear nueva opción usando Inertia (maneja CSRF automáticamente)
    const crearOpcion = (nombre: string) => {
        setCreando(true);
        router.post(
            getRoute(createRoute),
            { [createFieldName]: nombre },
            {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onSuccess: (page: any) => {
                    // Buscar el elemento creado en la respuesta
                    const createdItem = page.props.flash?.created_item;

                    if (createdItem) {
                        // Verificar si este select debe reaccionar al elemento creado
                        const shouldReact =
                            (createRoute.includes('categorias') && createdItem.type === 'categoria') ||
                            (createRoute.includes('marcas') && createdItem.type === 'marca') ||
                            (createRoute.includes('presentaciones') && createdItem.type === 'presentacion') ||
                            (createRoute.includes('proveedores') && createdItem.type === 'proveedor') ||
                            (createRoute.includes('atributos') && createdItem.type === 'atributo') ||
                            (createRoute.includes('conceptos-seguimiento') && createdItem.type === 'concepto');

                        if (shouldReact) {
                            // Obtener el nombre del elemento creado
                            const nombreElemento = createdItem.nombre || createdItem.name || '';

                            const opcionFormateada = {
                                [idField]: createdItem.id,
                                [displayField]: nombreElemento,
                            } as Option;

                            // Agregar a las opciones si no existe
                            setOpciones((prev) => {
                                const existe = prev.some((op) => op[idField] === createdItem.id);
                                if (!existe) {
                                    return [opcionFormateada, ...prev];
                                }
                                return prev;
                            });

                            // Seleccionar automáticamente
                            onValueChange(createdItem.id.toString());
                            setOpcionSeleccionada(opcionFormateada);
                        }
                    }

                    setBusqueda('');
                    setMostrarOpciones(false);
                    setCreando(false);
                },
                onError: (errors: Record<string, string>) => {
                    console.error('Error al crear elemento:', errors);
                    toast.error('Error al crear elemento', {
                        description: (errors as Record<string, string>)[createFieldName] || 'Error desconocido',
                        duration: 6000,
                    });
                    setCreando(false);
                },
                onFinish: () => {
                    setCreando(false);
                },
            },
        );
    };

    // Manejar teclas
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (opcionPreseleccionada) {
                onValueChange(opcionPreseleccionada[idField].toString());
                setOpcionSeleccionada(opcionPreseleccionada);
                setBusqueda('');
                setMostrarOpciones(false);

                // Desplazar el input hacia abajo para mostrar toda la información
                setTimeout(() => {
                    if (inputRef.current) {
                        inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            } else if (busqueda.trim()) {
                crearOpcion(busqueda.trim());
            }
        } else if (e.key === 'Escape') {
            setMostrarOpciones(false);
            setBusqueda('');
        }
    };

    // Seleccionar opción existente
    const seleccionarOpcion = (opcion: Option) => {
        onValueChange(opcion[idField].toString());
        setOpcionSeleccionada(opcion);
        setBusqueda('');
        setMostrarOpciones(false);

        // Desplazar el input hacia abajo para mostrar toda la información
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    // Limpiar selección
    const limpiarSeleccion = () => {
        onValueChange('');
        setOpcionSeleccionada(null);
        setBusqueda('');
    };

    // Determinar el label a mostrar (agregar asterisco si es required y no lo tiene)
    const displayLabel = label ? (required && !label.endsWith(' *') ? `${label} *` : label) : undefined;

    const hayCoincidenciaExacta = opciones.some((o) => (o[displayField] as string).toLowerCase() === busqueda.trim().toLowerCase());

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {displayLabel && <Label className="text-sm font-medium">{displayLabel}</Label>}
            <div className="relative">
                <Search className="absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={opcionSeleccionada ? (opcionSeleccionada[displayField] as string) : busqueda}
                    onChange={(e) => {
                        if (opcionSeleccionada) {
                            setBusqueda(e.target.value);
                            setOpcionSeleccionada(null);
                        } else {
                            setBusqueda(e.target.value);
                        }
                        setMostrarOpciones(true);
                    }}
                    onFocus={() => {
                        if (opcionSeleccionada) {
                            setBusqueda(opcionSeleccionada[displayField] as string);
                            setOpcionSeleccionada(null);
                        }
                        setMostrarOpciones(true);
                        if (opciones.length === 0) {
                            cargarOpcionesPorDefecto();
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={disabled || creando}
                    className="pr-10 pl-10"
                    autoComplete="off"
                />
                {opcionSeleccionada && (
                    <button
                        type="button"
                        onClick={limpiarSeleccion}
                        disabled={disabled || creando}
                        className="absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                        title="Limpiar selección"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Dropdown de opciones */}
            {mostrarOpciones && (
                <div className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                    {cargando ? (
                        <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted border-t-primary"></div>
                            Buscando...
                        </div>
                    ) : (
                        <>
                            {/* Opción de crear — solo si el texto no coincide exactamente */}
                            {busqueda.trim() && !hayCoincidenciaExacta && (
                                <div className="border-b border-border">
                                    <button
                                        type="button"
                                        onClick={() => crearOpcion(busqueda.trim())}
                                        disabled={creando}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-primary transition-colors hover:bg-accent"
                                    >
                                        {creando ? (
                                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted border-t-primary"></div>
                                        ) : (
                                            <Plus className="h-3.5 w-3.5" />
                                        )}
                                        {creando ? 'Creando...' : `Crear "${busqueda.trim()}"`}
                                    </button>
                                </div>
                            )}

                            {/* Opciones existentes */}
                            {opciones.length > 0 ? (
                                <div className="py-1">
                                    {opciones.map((opcion) => (
                                        <button
                                            key={opcion[idField]}
                                            type="button"
                                            onClick={() => seleccionarOpcion(opcion)}
                                            className={`flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-accent ${
                                                opcionPreseleccionada?.id === opcion.id ? 'bg-accent' : ''
                                            }`}
                                        >
                                            <span className="text-left">{opcion[displayField]}</span>
                                            {opcionSeleccionada?.[idField] === opcion[idField] && <Check className="h-3.5 w-3.5 text-primary" />}
                                        </button>
                                    ))}
                                </div>
                            ) : !busqueda.trim() ? (
                                <p className="px-3 py-2 text-sm text-muted-foreground">Escribe para buscar o crear</p>
                            ) : null}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
