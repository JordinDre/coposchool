import type { ServerMeta } from '@/components/ui/data-table-server';
import type { Config } from 'ziggy-js';

// ===== TIPOS BASE DE MODELOS =====
export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    telefono?: string;
    nit?: string;
    dpi?: string;
    razon_social?: string;
    credito?: boolean;
    credito_maximo?: number;
    credito_dias?: number;
    saldo?: number;
    creado_por?: number;
    actualizado_por?: number;
    eliminado_por?: number;
    deleted_at?: string;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
    roles?: Role[];
    direcciones?: Direccion[];
    creador?: User;
    actualizador?: User;
    eliminador?: User;
    bodegas?: Bodega[];
}

export interface Marca {
    id: number;
    nombre: string;
    created_at?: string;
    updated_at?: string;
}

export interface Categoria {
    id: number;
    nombre: string;
    created_at?: string;
    updated_at?: string;
}

export interface Presentacion {
    id: number;
    nombre: string;
    created_at?: string;
    updated_at?: string;
}

export interface Atributo {
    id: number;
    nombre: string;
    created_at?: string;
    updated_at?: string;
}

export interface Cliente extends User {
    nit: string;
    dpi?: string;
    razon_social: string;
    direcciones: Direccion[];
}

export interface Abono {
    id: number;
    cliente_id: number;
    monto: number;
    fecha: string;
    metodo: 'efectivo' | 'tarjeta' | 'transferencia' | 'deposito' | 'cheque';
    referencia?: string;
    nombre_cuenta?: string;
    banco_id?: number;
    observacion?: string;
    creado_por?: number;
    actualizado_por?: number;
    created_at: string;
    updated_at: string;
    banco?: {
        id: number;
        nombre: string;
    };
    creadoPor?: {
        id: number;
        name: string;
    };
}

export interface AbonoFormData {
    monto: number;
    fecha: string;
    metodo: 'efectivo' | 'tarjeta' | 'transferencia' | 'deposito' | 'cheque';
    referencia?: string;
    nombre_cuenta?: string;
    banco_id?: number | null;
    observacion?: string;
}

export interface Direccion {
    id: number;
    user_id: number;
    direccion: string;
    zona?: string;
    referencia: string;
    municipio_id: number;
    creado_por: number;
    actualizado_por: number;
    eliminado_por?: number;
    deleted_at?: string;
    created_at: string;
    updated_at: string;
    municipio?: Municipio;
    departamento?: Departamento;
    creador?: User;
    actualizador?: User;
    eliminador?: User;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    permissions: Permission[];
    users_count?: number;
    permissions_count?: number;
}

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

export interface AuthData {
    user: User | null;
    roles: string[];
    permissions: string[];
}

export interface MediaImage {
    id: number;
    url: string;
    thumb: string;
    preview: string;
    large: string;
    name: string;
    size: number;
}

export interface Producto {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    precio_venta: number;
    precio_compra: number;
    stock_minimo: number;
    stock_maximo: number;
    categoria_id?: number;
    marca_id?: number;
    presentacion_id?: number;
    proveedor_id?: number;
    creado_por: number;
    actualizado_por: number;
    created_at: string;
    updated_at: string;
    imagen_principal_url?: string | null;
    imagenes_urls?: MediaImage[];
    show_in_catalog: boolean;
}

export interface Venta {
    id: number;
    cliente_id?: number;
    caja_id?: number;
    bodega_id?: number;
    creado_por: number;
    canal: string;
    estado: string;
    tipo_pago?: 'contado' | 'credito';
    fecha_vencimiento?: string;
    subtotal: number;
    total: number;
    observacion?: string;
    referente?: string;
    created_at: string;
    updated_at: string;
}

export interface Compra {
    id: number;
    proveedor_id: number;
    bodega_id: number;
    creado_por: number;
    estado: string;
    subtotal: number;
    total: number;
    observacion?: string;
    created_at: string;
    updated_at: string;
}

export interface CompraDetalle {
    id: number;
    compra_id: number;
    producto_id: number;
    cantidad: number;
    bonificacion?: number;
    precio_venta: number;
    precio_compra: number;
    subtotal: number;
    created_at: string;
    updated_at: string;
}

// ===== TIPOS DE PÁGINA =====
export interface PageProps {
    name: string;
    auth: AuthData;
    ziggy: Config & {
        location: string;
    };
    sidebarOpen: boolean;
    flash: {
        success?: string;
        error?: string;
        info?: string;
        warning?: string;
        documentos?: string[];
    };
    branding: {
        logo: {
            light: string;
            dark: string;
        };
        icon: {
            favicon: string;
            apple_touch: string;
            logo_svg: string;
        };
        company: {
            name: string;
        };
    };
    demoUrl: string | null;
    configuracion?: {
        clientes?: boolean;
        servicios?: boolean;
        creditos?: boolean;
        traslados?: boolean;
        gastos?: boolean;
        conversiones?: boolean;
        simboloMoneda?: string;
        catalogoPublico?: boolean;
        ecommercePublico?: boolean;
        compuestos?: boolean;
        restaurante?: boolean;
        envioActivo?: boolean;
        costoEnvio?: number;
        envioGratisDesde?: number;
        metodosEntrega?: string[];
    };
    [key: string]: unknown;
}

// ===== RESTAURANTE =====
export interface Mesa {
    id: number;
    nombre: string;
    zona?: string;
    capacidad: number;
    activa: boolean;
    bodega_id?: number;
    bodega?: { id: number; nombre: string };
    venta_activa?: {
        id: number;
        estado: string;
        total: number;
    } | null;
}

export type EstadoOrden = 'pendiente' | 'proceso' | 'preparada' | 'enviada' | 'entregada' | 'finalizada';

export interface OrdenDetalle {
    id: number;
    nombre: string;
    cantidad: number;
    bonificacion: number;
    precio: number;
    subtotal: number;
    marca?: string | null;
    presentacion?: string | null;
    atributos?: string[];
}

export interface OrdenEstadoLog {
    estado_anterior: EstadoOrden;
    estado_nuevo: EstadoOrden;
    user_name: string | null;
    created_at: string;
}

export interface Orden {
    id: number;
    estado: EstadoOrden;
    canal: string;
    tipo_entrega?: string;
    mesa?: { id: number; nombre: string; zona?: string } | null;
    nombre?: string;
    total: number;
    observacion?: string | null;
    created_at: string;
    creado_por?: string;
    detalles: OrdenDetalle[];
    bodega_id?: number;
    bodega_nombre?: string;
    estado_logs: OrdenEstadoLog[];
}

// ===== TIPOS BASE =====
export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavItem {
    title: string;
    href?: string;
    icon?: React.ComponentType<{ className?: string }> | null;
    required?: string[];
    roles?: string[]; // Roles requeridos para mostrar el item
    configRequired?: string; // Configuración requerida (ej: 'clientes')
    items?: NavItem[]; // Para items anidados
    divider?: boolean; // Indica si debe haber un separador antes de este item
}

export interface ProductoRow {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    precio_venta: number;
    precio_compra: number;
    precio_variable: boolean;
    es_compuesto?: boolean;
    show_in_catalog: boolean;
    stock_minimo: number;
    stock_maximo: number;
    existencia?: number;
    categoria_id?: number;
    marca_id?: number;
    presentacion_id?: number;
    proveedor_id?: number;
    categoria?: {
        id: number;
        nombre: string;
    };
    marca?: {
        id: number;
        nombre: string;
    };
    presentacion?: {
        id: number;
        nombre: string;
    };
    proveedor?: {
        id: number;
        name: string;
        email?: string;
    };
    creado_por?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
    caja?: Pick<Caja, 'id' | 'codigo'>;
    inventario_por_bodega?: Record<
        number,
        {
            bodega_id: number;
            bodega_nombre: string;
            cantidad: number;
            es_stock_bajo: boolean;
        }
    >;
    paquetes_activos?: Array<{
        id: number;
        nombre: string;
        cantidad: number;
        precio: number;
        orden?: number;
    }>;
    precios_activos?: Array<{
        id: number;
        nombre: string;
        precio: number;
        orden?: number;
    }>;
    descuentos_activos?: Array<{
        id: number;
        nombre: string;
        porcentaje: number;
        orden?: number;
    }>;
    bonificaciones_activas?: Array<{
        id: number;
        nombre: string;
        cantidad_compra: number;
        cantidad_bonificacion: number;
        orden?: number;
    }>;
    atributos?: Array<{
        id: number;
        nombre: string;
    }>;
    deleted_at?: string;
    imagen_principal_url?: string | null;
    imagenes_urls?: MediaImage[];
    componentes?: Array<{
        id: number;
        codigo: string;
        nombre: string;
        imagen_principal_url?: string | null;
        marca?: { nombre: string };
        presentacion?: { nombre: string };
        existencia?: number;
        pivot?: { cantidad: number };
    }>;
    paquetes?: Array<{
        id: number;
        cantidad: number;
        precio: number;
        orden?: number;
        activo?: boolean;
        fecha_desde?: string | null;
        fecha_hasta?: string | null;
        deleted_at?: string | null;
    }>;
    precios?: Array<{
        id: number;
        nombre: string;
        precio: number;
        orden?: number;
        fecha_desde?: string | null;
        fecha_hasta?: string | null;
        deleted_at?: string | null;
    }>;
    descuentos?: Array<{
        id: number;
        nombre: string;
        porcentaje: number;
        orden?: number;
        fecha_desde?: string | null;
        fecha_hasta?: string | null;
        deleted_at?: string | null;
    }>;
    bonificaciones?: Array<{
        id: number;
        nombre: string;
        cantidad_compra: number;
        cantidad_bonificacion: number;
        orden?: number;
        fecha_desde?: string | null;
        fecha_hasta?: string | null;
        deleted_at?: string | null;
    }>;
}

export interface ProductoIndexProps {
    rows: ProductoRow[];
    bodegas: Array<{ id: number; nombre: string }>;
    meta: {
        page: number;
        lastPage: number;
        perPage: number;
        total: number;
        sortBy?: string | null;
        sortDir?: 'asc' | 'desc' | null;
    };
    filters: Record<string, never>;
}

// Interfaces para Productos
export interface ProductoFormData {
    lock_version?: string;
    codigo: string;
    nombre: string;
    descripcion: string;
    categoria_id: string;
    marca_id: string;
    presentacion_id: string;
    proveedor_id: string;
    precio_compra: string;
    precio_venta: string;
    precio_variable?: boolean;
    show_in_catalog?: boolean;
    stock_minimo: string;
    stock_maximo: string;
    atributos?: AtributoSimple[];
    imagenes?: File[];
    imagenes_eliminar?: number[];
    paquetes?: Array<{
        id?: number;
        cantidad: number | string;
        precio: number | string;
        orden?: number;
        activo?: boolean;
        fecha_desde?: string | null;
        fecha_hasta?: string | null;
        _eliminar?: boolean;
    }>;
    paquetes_eliminar?: number[];
    precios?: Array<{
        id?: number;
        nombre: string;
        precio: number | string;
        orden?: number;
        fecha_desde?: string | null;
        fecha_hasta?: string | null;
        _eliminar?: boolean;
    }>;
    precios_eliminar?: number[];
    descuentos?: Array<{
        id?: number;
        nombre: string;
        porcentaje: number | string;
        orden?: number;
        fecha_desde?: string | null;
        fecha_hasta?: string | null;
        _eliminar?: boolean;
    }>;
    descuentos_eliminar?: number[];
    bonificaciones?: Array<{
        id?: number;
        nombre: string;
        cantidad_compra: number;
        cantidad_bonificacion: number;
        orden?: number;
        fecha_desde?: string | null;
        fecha_hasta?: string | null;
        _eliminar?: boolean;
    }>;
    bonificaciones_eliminar?: number[];
    es_compuesto?: boolean;
    componentes?: Array<{
        producto_id: number | string;
        cantidad: number | string;
        codigo?: string;
        nombre?: string;
    }>;
}

export interface AtributoSimple {
    id: string;
    nombre: string;
}

export interface ProductoCreateProps {
    categorias: Array<{ id: number; nombre: string }>;
    marcas: Array<{ id: number; nombre: string }>;
    presentaciones: Array<{ id: number; nombre: string }>;
    proveedores: Array<{ id: number; name: string }>;
}

export interface ProductoEditProps {
    producto: ProductoRow;
    categorias: Array<{ id: number; nombre: string }>;
    marcas: Array<{ id: number; nombre: string }>;
    presentaciones: Array<{ id: number; nombre: string }>;
    proveedores: Array<{ id: number; name: string }>;
}

export interface GastoRow {
    id: number;
    concepto: string;
    detalle?: string;
    monto: number;
    fecha: string;
    estado: 'revision' | 'pendiente' | 'pagado' | 'anulado';
    caja_id?: number;
    creado_por: number | Pick<User, 'id' | 'name'>;
    actualizado_por: number;
    created_at: string;
    updated_at: string;
    caja?: Pick<Caja, 'id' | 'codigo'>;
}

export interface GastoIndexProps {
    rows: GastoRow[];
    meta: ServerMeta;
    filters: {
        bancos?: Array<Pick<Banco, 'id' | 'nombre'>>;
        cajasFondo?: Array<{ id: number; tipo: string; saldo: number; nombre: string }>;
    };
}

export interface GastoCreateProps {
    cajas: Array<Pick<Caja, 'id' | 'codigo'>>;
    bancos: Array<Pick<Banco, 'id' | 'nombre'>>;
    caja: {
        tiene_caja_abierta: boolean;
        activa: {
            id: number;
            codigo: string;
            bodega: { nombre: string };
        } | null;
    };
}

export interface GastoActionsProps {
    id: number;
    routeBase?: string;
    align?: 'start' | 'center' | 'end';
    disabled?: boolean;
}

export interface GastoFormData {
    lock_version: string;
    concepto: string;
    detalle: string;
    monto: string;
    fecha: string;
    estado: 'revision' | 'pendiente' | 'pagado' | 'anulado';
}

export interface GastoShowProps {
    gasto: {
        id: number;
        concepto: string;
        detalle?: string;
        monto: number;
        fecha: string;
        estado: string;
        caja?: {
            id: number;
            codigo: string;
        };
        creado_por?: {
            id: number;
            name: string;
        };
        actualizado_por?: number;
        created_at: string;
        updated_at: string;
    };
    cajas: Array<{ id: number; codigo: string }>;
    pagos: Array<{
        id: number;
        monto: number;
        cambio: number;
        impuesto: number;
        total: number;
        referencia?: string;
        fecha: string;
        metodo: string;
        nombre_cuenta?: string;
        banco?: {
            id: number;
            nombre: string;
        };
        creado_por?: {
            id: number;
            name: string;
        };
        created_at: string;
    }>;
}

export interface GastoEditProps {
    gasto: {
        id: number;
        concepto: string;
        detalle?: string;
        monto: number;
        fecha: string;
        estado: string;
        updated_at: string;
    };
    cajas?: Array<{ id: number; codigo: string }>;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export interface ProductoShowProps {
    producto: ProductoRow;
}

// ===== VENTAS =====
export interface VentaShowProps {
    venta: {
        id: number;
        nit?: string;
        nombre?: string;
        referente?: string;
        tipo_pago?: 'contado' | 'credito';
        fecha_vencimiento?: string;
        cf: boolean;
        caja?: {
            id: number;
            codigo: string;
        };
        bodega?: {
            id: number;
            nombre: string;
        };
        creado_por?: {
            id: number;
            name: string;
        };
        actualizado_por?: {
            id: number;
            name: string;
        };
        finalizado_por?: {
            id: number;
            name: string;
        };
        anulo_por?: {
            id: number;
            name: string;
        };
        devolvio_por?: {
            id: number;
            name: string;
        };
        finalizado_at?: string | null;
        anulado_at?: string | null;
        devuelto_at?: string | null;
        canal: string;
        estado: string;
        subtotal: number;
        total: number;
        observacion?: string;
        created_at: string;
        updated_at: string;
        detalles: Array<{
            id: number;
            producto?: {
                id: number;
                nombre: string;
                codigo: string;
                marca?: {
                    id: number;
                    nombre: string;
                };
                presentacion?: {
                    id: number;
                    nombre: string;
                };
                categoria?: {
                    id: number;
                    nombre: string;
                };
                atributos?: Array<{
                    id: number;
                    nombre: string;
                }>;
            };
            servicio?: {
                id: number;
                nombre: string;
                codigo?: string;
            };
            cantidad: number;
            precio: number;
            subtotal: number;
            devuelto?: number;
        }>;
        pagos?: Array<{
            id: number;
            metodo: string;
            monto: number;
            cambio?: number;
            total: number;
            referencia?: string;
            fecha: string;
            banco?: {
                id: number;
                nombre: string;
            };
            creado_por?: {
                id: number;
                name: string;
            };
        }>;
        facturas?: Array<{
            id: number;
            tipo: string;
            fel_tipo?: string;
            fel_autorizacion?: string;
            fel_serie?: string;
            fel_numero?: string;
            fel_fecha?: string;
            motivo?: string;
            created_at: string;
        }>;
    };
}

export interface VentaRow {
    id: number;
    nit?: string;
    nombre?: string;
    referente?: string;
    estado: string;
    canal?: string;
    tipo_entrega?: string;
    tipo_pago?: 'contado' | 'credito';
    fecha_vencimiento?: string;
    subtotal: number;
    total: number;
    observacion?: string;
    created_at: string;
    updated_at: string;
    bodega?: Pick<Bodega, 'id' | 'nombre'>;
    caja?: Pick<Caja, 'id' | 'codigo'>;
    creado_por?: Pick<User, 'id' | 'name'>;
    cliente?: Pick<User, 'id' | 'name'>;
    detalles?: Array<{
        id: number;
        producto_id?: number | null;
        servicio_id?: number | null;
        cantidad: number;
        precio: number;
        subtotal: number;
        producto?: {
            id: number;
            codigo: string;
            nombre: string;
            marca?: Pick<Marca, 'id' | 'nombre'>;
            categoria?: Pick<Categoria, 'id' | 'nombre'>;
            presentacion?: Pick<Presentacion, 'id' | 'nombre'>;
        };
        servicio?: {
            id: number;
            codigo?: string | null;
            nombre: string;
        };
    }>;
}

export interface VentaIndexProps {
    rows: VentaRow[];
    meta: ServerMeta;
    filters: {
        estados: string[];
        clientes: Array<Pick<User, 'id' | 'name' | 'email'>>;
        bodegas: Array<Pick<Bodega, 'id' | 'nombre'>>;
    };
}

export interface VentaActionsProps {
    id: number;
    estado: string;
    canal?: string;
    tipo_entrega?: string;
    routeBase?: string;
    align?: 'start' | 'center' | 'end';
    disabled?: boolean;
}

export interface VentaEditProps {
    venta: {
        id: number;
        cliente_id?: number | null;
        nit?: string;
        nombre?: string;
        referente?: string;
        cliente?: {
            id: number;
            name: string;
            email: string;
        };
        caja?: {
            id: number;
            codigo: string;
        };
        bodega?: {
            id: number;
            nombre: string;
        };
        creado_por?: {
            id: number;
            name: string;
        };
        canal: string;
        estado: string;
        tipo_pago?: 'contado' | 'credito';
        fecha_vencimiento?: string;
        subtotal: number;
        total: number;
        observacion?: string;
        created_at: string;
        updated_at: string;
        detalles: Array<{
            id: number;
            producto: {
                id: number;
                nombre: string;
                codigo: string;
            };
            cantidad: number;
            precio_unitario: number;
            subtotal: number;
        }>;
    };
    ventasPendientes: Array<{
        id: number;
        total: number;
        cantidad_items: number;
        updated_at: string;
        productos: Array<{ nombre: string; cantidad: number }>;
    }>;
    categorias: Array<{ id: number; nombre: string }>;
    marcas: Array<{ id: number; nombre: string }>;
    presentaciones: Array<{ id: number; nombre: string }>;
    bancos: Array<{ id: number; nombre: string }>;
    caja: {
        tiene_caja_abierta: boolean;
        activa: { id: number; codigo: string; bodega: { nombre: string } } | null;
    };
}

export interface ProductoActionsProps {
    id: number;
    routeBase?: string;
    align?: 'start' | 'center' | 'end';
    disabled?: boolean;
    isActive?: boolean;
}

// Interfaces para Pagos (mantener compatibilidad)
export interface PagoRow {
    id: number;
    monto: number;
    cambio: number;
    impuesto: number;
    total: number;
    referencia?: string;
    fecha: string;
    metodo: 'efectivo' | 'tarjeta' | 'transferencia' | 'deposito' | 'cheque';
    nombre_cuenta?: string;
    banco_id?: number;
    banco?: {
        id: number;
        nombre: string;
    };
    pagable_type: string;
    pagable_id: number;
    pagable?: {
        id: number;
        concepto?: string;
    };
    creado_por?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
}

export interface PagoIndexProps {
    rows: PagoRow[];
    meta: {
        page: number;
        lastPage: number;
        perPage: number;
        total: number;
        sortBy?: string | null;
        sortDir?: 'asc' | 'desc' | null;
    };
    filters: {
        bancos: Array<{ id: number; nombre: string }>;
    };
}

export interface PagoFormData {
    monto: string;
    cambio: string;
    total: string;
    referencia: string;
    fecha: string;
    metodo: 'efectivo' | 'tarjeta' | 'transferencia' | 'deposito' | 'cheque';
    nombre_cuenta: string;
    banco_id: string;
    pagable_type: string;
    pagable_id: string;
}

export interface PagoCreateProps {
    bancos: Array<{ id: number; nombre: string }>;
}

export interface PagoShowProps {
    pago: PagoRow;
}

export interface PagoActionsProps {
    id: number;
    routeBase?: string;
    align?: 'start' | 'center' | 'end';
    disabled?: boolean;
    bancos?: Array<{ id: number; nombre: string }>;
}

// Interface compartida

export interface CompraShowProps {
    compra: Compra & {
        proveedor?: Pick<User, 'id' | 'name' | 'email'>;
        bodega?: Pick<Bodega, 'id' | 'nombre'>;
        creado_por?: Pick<User, 'id' | 'name'>;
        actualizado_por?: Pick<User, 'id' | 'name'>;
        recibio_por?: Pick<User, 'id' | 'name'>;
        confirmo_por?: Pick<User, 'id' | 'name'>;
        anulo_por?: Pick<User, 'id' | 'name'>;
        recibida_at?: string | null;
        confirmado_at?: string | null;
        anulado_at?: string | null;
        detalles?: Array<
            Pick<CompraDetalle, 'id' | 'producto_id' | 'cantidad' | 'precio_venta' | 'precio_compra' | 'subtotal'> & {
                producto?: Pick<Producto, 'id' | 'nombre' | 'codigo'> & {
                    marca?: Pick<Marca, 'id' | 'nombre'>;
                    presentacion?: Pick<Presentacion, 'id' | 'nombre'>;
                    categoria?: Pick<Categoria, 'id' | 'nombre'>;
                    atributos?: Array<Pick<Atributo, 'id' | 'nombre'>>;
                };
            }
        >;
        pagos?: Array<
            Pick<Pago, 'id' | 'metodo' | 'monto' | 'cambio' | 'total' | 'referencia' | 'fecha'> & {
                banco?: Pick<Banco, 'id' | 'nombre'>;
                creado_por?: Pick<User, 'id' | 'name'>;
            }
        >;
    };
}

export interface CompraEditProps {
    compra: Compra & {
        detalles?: Array<
            Pick<CompraDetalle, 'id' | 'producto_id' | 'cantidad' | 'precio_venta' | 'precio_compra' | 'subtotal'> & {
                producto?: Pick<Producto, 'id' | 'nombre' | 'codigo'>;
            }
        >;
    };
    bodegas: Array<Pick<Bodega, 'id' | 'nombre'>>;
    // cajas: Array<Pick<Caja, 'id' | 'codigo'>>;
    proveedores: Array<Pick<User, 'id' | 'name' | 'email'>>;
}

export type CompraRow = Pick<Compra, 'id' | 'proveedor_id' | 'bodega_id' | 'creado_por' | 'estado' | 'subtotal' | 'created_at' | 'updated_at'> & {
    proveedor?: Pick<User, 'id' | 'name' | 'email'>;
    bodega?: Pick<Bodega, 'id' | 'nombre'>;
    creado_por?: Pick<User, 'id' | 'name'>;
    detalles?: Array<
        Pick<CompraDetalle, 'id' | 'producto_id' | 'cantidad' | 'precio_venta' | 'precio_compra' | 'subtotal'> & {
            producto?: {
                id: number;
                codigo: string;
                nombre: string;
                marca?: Pick<Marca, 'id' | 'nombre'>;
                categoria?: Pick<Categoria, 'id' | 'nombre'>;
                presentacion?: Pick<Presentacion, 'id' | 'nombre'>;
            };
        }
    >;
    pagos?: Array<{
        id: number;
        monto: number;
        cambio: number;
        total: number;
    }>;
};

export interface CompraFilters {
    estado?: string;
    // canal?: string;
    bodega_id?: number;
    // caja_id?: number;
    proveedor_id?: number;
    fecha_desde?: string;
    fecha_hasta?: string;
    total_min?: number;
    total_max?: number;
}

export interface CompraIndexProps {
    rows: CompraRow[];
    meta: ServerMeta;
    filters: {
        estados: string[];
    };
}

export interface CompraActionsProps {
    id: number;
    estado: string;
    subtotal?: number;
    pagos?: Array<{
        id: number;
        monto: number;
        cambio: number;
        total: number;
    }>;
    routeBase?: string;
    align?: 'start' | 'center' | 'end';
    disabled?: boolean;
}

export interface CompraCreateProps {
    bodegas: Array<Pick<Bodega, 'id' | 'nombre'>>;
    bancos: Array<Pick<Banco, 'id' | 'nombre'>>;
    proveedores: Array<Pick<User, 'id' | 'name' | 'email'>>;
    cajasFondo?: Array<{ id: number; tipo: string; saldo: number; nombre: string }>;
}

// ===== INVENTARIO =====
export interface Inventario {
    id: number;
    producto_id: number;
    bodega_id: number;
    cantidad: number;
    created_at: string;
    updated_at: string;
    producto?: Producto;
    bodega?: Bodega;
}

// ===== KARDEX =====
export interface Kardex {
    id: number;
    existencia_inicial: number;
    cantidad: number;
    existencia_final: number;
    kardexable_type: string;
    kardexable_id: number;
    producto_id?: number;
    bodega_id?: number;
    user_id?: number;
    evento: 'entrada' | 'salida';
    created_at: string;
    updated_at: string;
    kardexable?: unknown;
    producto?: Producto;
    bodega?: Bodega;
    user?: User;
}

export interface KardexIndexProps {
    rows: KardexRow[];
    meta: ServerMeta;
    filters: Record<string, never>;
}

export interface KardexRow {
    id: number;
    existencia_inicial: number;
    cantidad: number;
    existencia_final: number;
    kardexable_type: string;
    kardexable_id: number;
    producto_id?: number;
    producto?: {
        id: number;
        codigo: string;
        nombre?: string;
        categoria?: {
            id: number;
            nombre: string;
        };
        marca?: {
            id: number;
            nombre: string;
        };
        presentacion?: {
            id: number;
            nombre: string;
        };
    };
    bodega_id?: number;
    bodega?: Pick<Bodega, 'id' | 'nombre'>;
    user_id?: number;
    created_at: string;
    updated_at: string;
}

// ===== BODEGAS =====
export interface Bodega {
    id: number;
    nombre: string;
    tipo: 'bodega' | 'sucursal';
    telefono?: string;
    nombre_comercial?: string;
    direccion?: string;
    codigo_postal?: string;
    municipio_id: number;
    creado_por: number;
    actualizado_por: number;
    eliminado_por?: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    municipio?: Municipio;
    creadoPor?: User;
    actualizadoPor?: User;
    eliminadoPor?: User;
    cajas?: Caja[];
    ventas?: Venta[];
    compras?: Compra[];
    inventarios?: Inventario[];
    kardexes?: Kardex[];
    compraDetalles?: CompraDetalle[];
}

// ===== CAJAS =====
export interface Caja {
    id: number;
    codigo?: string;
    bodega_id: number;
    user_id: number;
    apertura_at: string;
    cierre_at?: string;
    saldo_inicial: number;
    created_at: string;
    updated_at: string;
    bodega?: Bodega;
    user?: User;
    ventas?: Venta[];
    gastos?: Gasto[];
    total_ventas?: number;
    total_gastos?: number;
    saldo_esperado?: number;
}

export interface CajaShowProps {
    caja: {
        id: number;
        codigo?: string;
        apertura_at: string;
        cierre_at?: string | null;
        saldo_inicial: number;
        total_ventas: number;
        total_gastos: number;
        saldo_esperado: number;
        bodega?: string;
        user?: string;
    };
    ventas: Array<{
        id: number;
        nombre?: string | null;
        nit?: string | null;
        estado: string;
        total: number;
        created_at: string;
        bodega?: string | null;
        creado_por?: string | null;
    }>;
    gastos: Array<{
        id: number;
        concepto: string;
        detalle?: string | null;
        monto: number;
        estado: string;
        fecha: string;
        creado_por?: string | null;
    }>;
    compras: Array<{
        id: number;
        proveedor?: string | null;
        estado: string;
        subtotal: number;
        created_at: string;
        bodega?: string | null;
    }>;
    totales: {
        gastos: number;
        compras: number;
    };
    ventasPorMetodo?: {
        efectivo: number;
        tarjeta: number;
        transferencia: number;
        deposito: number;
        cheque: number;
        'caja inversion': number;
        'caja ganancia': number;
        'caja chica': number;
    };
    ventasPorCategoria?: Array<{
        id: number;
        nombre: string;
        total: number;
    }>;
    ventasPorMarca?: Array<{
        id: number;
        nombre: string;
        total: number;
    }>;
    arqueo: {
        id: number;
        total_contado: number;
        diferencia: number;
        observaciones?: string | null;
        created_at: string;
        billetes: Array<{
            denominacion: number;
            cantidad: number;
            subtotal: number;
        }>;
        monedas: Array<{
            denominacion: number;
            cantidad: number;
            subtotal: number;
        }>;
    } | null;
}

// Tipos específicos para Cajas
export type CajaRow = Pick<Caja, 'id' | 'codigo' | 'apertura_at' | 'cierre_at' | 'saldo_inicial'> & {
    bodega?: Pick<Bodega, 'id' | 'nombre'>;
    user?: Pick<User, 'id' | 'name'>;
    total_ventas?: number;
    total_cambio?: number;
    diferencia?: number | null;
    ventas_por_metodo?: {
        efectivo: number;
        tarjeta: number;
        transferencia: number;
        deposito: number;
        cheque: number;
        'caja inversion': number;
        'caja ganancia': number;
        'caja chica': number;
    };
    ventas_por_categoria?: Array<{
        id: number;
        nombre: string;
        total: number;
    }>;
    ventas_por_marca?: Array<{
        id: number;
        nombre: string;
        total: number;
    }>;
};

export interface CajaFormData {
    bodega_id: string;
    saldo_inicial: string;
    prestamo_caja_fondo_id?: string;
    monto_prestamo?: string;
}

export interface CajaFilters {
    search?: string;
    estado?: string;
    bodega_id?: number;
    saldo_min?: number;
    saldo_max?: number;
    fecha_desde?: string;
    fecha_hasta?: string;
}

export interface CajaIndexProps {
    rows: CajaRow[];
    meta: ServerMeta;
    filters: {
        saldoInicial?: number;
        estados: string[];
    };
    caja: {
        activa: {
            id: number;
            codigo: string;
            bodega_id: number;
            bodega_nombre: string;
            saldo_inicial: number;
            apertura_at: string;
            user_id: number;
        } | null;
        tiene_caja_abierta: boolean;
        es_propietario_caja: boolean;
    };
}

// ===== PAGOS =====
export interface Pago {
    id: number;
    monto: number;
    cambio: number;
    impuesto: number;
    total: number;
    referencia?: string;
    fecha: string;
    metodo: 'efectivo' | 'tarjeta' | 'transferencia' | 'deposito' | 'cheque';
    nombre_cuenta?: string;
    banco_id?: number;
    pagable_type: string;
    pagable_id: number;
    creado_por: number;
    actualizado_por: number;
    eliminado_por?: number;
    created_at: string;
    updated_at: string;
    pagable?: unknown;
    banco?: Banco;
    creadoPor?: User;
    actualizadoPor?: User;
    eliminadoPor?: User;
}

// ===== BANCOS =====
export interface Banco {
    id: number;
    nombre: string;
    created_at: string;
    updated_at: string;
    pagos?: Pago[];
}

// ===== GASTOS =====
export interface Gasto {
    id: number;
    concepto: string;
    monto: number;
    estado: 'pendiente' | 'anulado' | 'autorizado';
    categoria_id?: number;
    caja_id?: number;
    caja_fondo_id?: number;
    creado_por: number;
    actualizado_por: number;
    eliminado_por?: number;
    autorizado_por?: number;
    created_at: string;
    updated_at: string;
    categoria?: {
        id: number;
        nombre: string;
    };
    caja?: {
        id: number;
        codigo: string;
    };
    caja_fondo?: {
        id: number;
        tipo: string;
        nombre: string;
    };
    creadoPor?: User;
    actualizadoPor?: User;
    eliminadoPor?: User;
    autorizadoPor?: User;
    pagable?: {
        id: number;
        concepto?: string;
        detalle?: string;
    };
}

// ===== UBICACIONES GEOGRÁFICAS =====
export interface Pais {
    id: number;
    nombre: string;
    creado_por: number;
    actualizado_por: number;
    eliminado_por?: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    creadoPor?: User;
    actualizadoPor?: User;
    eliminadoPor?: User;
    departamentos?: Departamento[];
}

export interface Departamento {
    id: number;
    nombre: string;
    pais_id: number;
    creado_por: number;
    actualizado_por: number;
    eliminado_por?: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    pais?: Pais;
    creadoPor?: User;
    actualizadoPor?: User;
    eliminadoPor?: User;
    municipios?: Municipio[];
}

export interface Municipio {
    id: number;
    nombre: string;
    departamento_id: number;
    creado_por: number;
    actualizado_por: number;
    eliminado_por?: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    departamento?: Departamento;
    creadoPor?: User;
    actualizadoPor?: User;
    eliminadoPor?: User;
    bodegas?: Bodega[];
}

// ===== DATA TABLE TYPES =====
export type ExtendedColumnDef<TData, TValue = unknown> = import('@tanstack/react-table').ColumnDef<TData, TValue> & {
    permission?: string | string[];
    requireAll?: boolean; // Si es true, requiere TODOS los permisos (AND), si es false, requiere CUALQUIERA (OR)
};

// ===== ACTIVIDAD TYPES =====
export interface Actividad {
    id: number;
    log_name: string | null;
    description: string;
    subject_type: string | null;
    event: string | null;
    subject_id: number | null;
    causer_type: string | null;
    causer_id: number | null;
    properties: Record<string, unknown> | null;
    batch_uuid: string | null;
    created_at: string;
    updated_at: string;
    causer?: User | null;
    subject?: Record<string, unknown> | null;
}

export interface ActividadIndexProps {
    activities: {
        data: Actividad[];
        meta: ServerMeta & {
            sortBy?: string;
            sortDir?: string;
        };
    };
    filters: {
        log_names: string[];
        subject_types: string[];
        users: Array<Pick<User, 'id' | 'name' | 'email'>>;
    };
}

export interface ActividadShowProps {
    activity: Actividad;
}

// ===== TIPOS DE INVENTARIO =====
export interface BodegaInventario {
    id: number;
    nombre: string;
    tipo: string;
    direccion: string;
    total_productos: number;
    cantidad_total: number;
    productos_stock_bajo: number;
}

export interface ProductoInventario {
    id: number;
    codigo: string;
    nombre: string;
    marca: string;
    categoria: string;
    presentacion: string;
    stock_minimo: number;
    stock_maximo: number;
    precio_compra: number;
    precio_venta: number;
    imagen_principal_url?: string | null;
    inventario_por_bodega: Record<
        number,
        {
            bodega_id: number;
            bodega_nombre: string;
            cantidad: number;
            es_stock_bajo: boolean;
        }
    >;
}

export interface InventarioIndexProps {
    bodegas: BodegaInventario[];
    productos: ProductoInventario[];
    meta: {
        page: number;
        lastPage: number;
        perPage: number;
        total: number;
        sortBy?: string | null;
        sortDir?: 'asc' | 'desc' | null;
    };
    filters: Record<string, never>;
}

// ===== TIPOS DE ROLES Y PERMISOS =====
// Role and Permission are now defined at the top of the file.

export interface RolesPermisosRow {
    id: number;
    name: string;
    permissions_count: number;
    users_count: number;
    created_at: string;
}

export interface RolesPermisosIndexProps {
    roles: Role[];
    permisos: Permission[];
    filters: {
        search?: string;
        role?: string;
    };
}

// ===== TIPOS PARA MÓDULO DE USUARIOS =====
// UserRow is duplicate of User.

export interface UserIndexProps {
    users: {
        data: User[];
        meta: ServerMeta;
    };
    roles: Role[];
    filters: {
        search?: string;
        role?: string;
        status?: string;
        sort_by?: string;
        sort_direction?: 'asc' | 'desc';
    };
}

export interface UserCreateProps {
    bodegas?: Array<{ id: number; nombre: string; codigo?: string; nombre_comercial?: string }>;
    roles: Role[];
}

export interface UserEditProps {
    bodegasAsignadas?: number[];
    bodegasAsignadasData?: Array<{ id: number; nombre: string; codigo?: string; nombre_comercial?: string }>;
    user: User;
    roles: Role[];
}

export interface UserFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    telefono: string;
    roles: number[];
}

// ===== TIPOS PARA TRASLADOS =====
export interface TrasladoDetalle {
    id: number;
    traslado_id: number;
    producto_id: number;
    cantidad: number;
}

export type TrasladoRow = {
    id: number;
    bodega_origen_id: number;
    bodega_destino_id: number;
    estado: string;
    observaciones: string | null;
    created_at: string;
    updated_at: string;
    bodega_origen?: Pick<Bodega, 'id' | 'nombre'>;
    bodega_destino?: Pick<Bodega, 'id' | 'nombre'>;
    creado_por?: Pick<User, 'id' | 'name'>;
    envio_por?: Pick<User, 'id' | 'name'>;
    recibio_por?: Pick<User, 'id' | 'name'>;
    anulo_por?: Pick<User, 'id' | 'name'>;
    enviado_at?: string | null;
    recibido_at?: string | null;
    anulado_at?: string | null;
    detalles?: Array<
        Pick<TrasladoDetalle, 'id' | 'producto_id' | 'cantidad'> & {
            producto?: {
                id: number;
                codigo: string;
                nombre: string;
                marca?: Pick<Marca, 'id' | 'nombre'>;
                categoria?: Pick<Categoria, 'id' | 'nombre'>;
                presentacion?: Pick<Presentacion, 'id' | 'nombre'>;
            };
        }
    >;
};

export interface TrasladoIndexProps {
    rows: TrasladoRow[];
    meta: ServerMeta;
    filters: {
        estados: string[];
    };
}

// ===== TIPOS PARA AJUSTES =====
export interface AjusteDetalle {
    id: number;
    ajuste_id: number;
    producto_id: number;
    tipo: string;
    cantidad_actual: number;
    cantidad_ajuste: number;
    cantidad_final: number;
}

export type AjusteRow = {
    id: number;
    bodega_id: number;
    tipo_ajuste: string;
    estado: string;
    motivo: string;
    created_at: string;
    updated_at: string;
    bodega?: Pick<Bodega, 'id' | 'nombre'>;
    creado_por?: Pick<User, 'id' | 'name'>;
    autorizado_por?: Pick<User, 'id' | 'name'>;
    solicitado_por?: Pick<User, 'id' | 'name'>;
    rechazo_por?: Pick<User, 'id' | 'name'>;
    anulo_por?: Pick<User, 'id' | 'name'>;
    solicitado_at?: string | null;
    autorizado_at?: string | null;
    rechazado_at?: string | null;
    anulado_at?: string | null;
    detalles?: Array<
        Pick<AjusteDetalle, 'id' | 'producto_id' | 'cantidad_ajuste' | 'cantidad_final'> & {
            producto?: {
                id: number;
                codigo: string;
                nombre: string;
                marca?: Pick<Marca, 'id' | 'nombre'>;
                categoria?: Pick<Categoria, 'id' | 'nombre'>;
                presentacion?: Pick<Presentacion, 'id' | 'nombre'>;
            };
        }
    >;
};

export interface AjusteIndexProps {
    rows: AjusteRow[];
    meta: ServerMeta;
    filters: {
        estados: string[];
        tipos_ajuste: string[];
    };
}

// ===== TIPOS PARA CONVERSIONES =====
export interface ConversionDetalle {
    id: number;
    conversion_id: number;
    producto_id: number;
    cantidad: number;
    tipo: 'suma' | 'resta';
}

export type ConversionRow = {
    id: number;
    bodega_id: number;
    estado: 'pendiente' | 'solicitado' | 'autorizado' | 'anulado';
    observaciones: string | null;
    creado_por_id: number;
    created_at: string;
    updated_at: string;
    bodega?: Pick<Bodega, 'id' | 'nombre'>;
    creado_por?: Pick<User, 'id' | 'name'>;
    autorizado_por?: Pick<User, 'id' | 'name'>;
    anulo_por?: Pick<User, 'id' | 'name'>;
    actualizado_por?: Pick<User, 'id' | 'name'>;
    autorizado_at?: string | null;
    anulado_at?: string | null;
    detalles?: Array<
        Pick<ConversionDetalle, 'id' | 'producto_id' | 'cantidad' | 'tipo'> & {
            producto?: {
                id: number;
                codigo: string;
                nombre: string;
                marca?: Pick<Marca, 'id' | 'nombre'>;
                categoria?: Pick<Categoria, 'id' | 'nombre'>;
                presentacion?: Pick<Presentacion, 'id' | 'nombre'>;
            };
        }
    >;
};

export interface ConversionIndexProps {
    rows: ConversionRow[];
    meta: ServerMeta;
    filters: {
        estados: string[];
    };
}

export interface ConversionCreateProps {
    bodegas: Array<Pick<Bodega, 'id' | 'nombre'>>;
}

export interface ConversionShowProps {
    conversion: ConversionRow;
}

// ===== TIPOS PARA COMPUESTOS =====
export interface CompuestoDetalle {
    id: number;
    compuesto_id: number;
    producto_id: number;
    cantidad: number;
    tipo: 'suma' | 'resta';
    producto?: {
        id: number;
        codigo: string;
        nombre: string;
        es_compuesto?: boolean;
        marca?: { id: number; nombre: string };
        categoria?: { id: number; nombre: string };
        presentacion?: { id: number; nombre: string };
        imagen_principal_url?: string | null;
    };
}

export interface CompuestoRow {
    id: number;
    bodega_id: number;
    estado: 'pendiente' | 'solicitado' | 'autorizado' | 'anulado' | 'rechazado';
    observaciones: string | null;
    created_at: string;
    updated_at: string;
    autorizado_at?: string | null;
    anulado_at?: string | null;
    rechazado_at?: string | null;
    solicitado_at?: string | null;
    bodega?: { id: number; nombre: string };
    creadoPor?: { id: number; name: string };
    autorizadoPor?: { id: number; name: string };
    anuloPor?: { id: number; name: string };
    actualizadoPor?: { id: number; name: string };
    rechazoPor?: { id: number; name: string };
    solicitadoPor?: { id: number; name: string };
    detalles?: CompuestoDetalle[];
}

// ===== TIPOS COMPARTIDOS (SHARED DATA) =====
export interface SharedData {
    auth: {
        user: User | null;
        roles: string[];
        permissions: string[];
        impersonating?: boolean;
        impersonator?: User | null;
    };
    [key: string]: unknown;
}

// ===== PRÉSTAMOS =====
export interface PrestamoPrestamable {
    tipo: 'compra' | 'caja' | 'usuario';
    id: number;
    // Para compras
    proveedor?: {
        id: number;
        name: string;
    };
    subtotal?: number;
    // Para cajas
    codigo?: string;
    usuario?: {
        id: number;
        name: string;
    };
    saldo_inicial?: number;
    // Común
    bodega?: {
        id: number;
        nombre: string;
    };
    fecha: string;
}

export interface Prestamo {
    id: number;
    prestamable?: PrestamoPrestamable;
    caja_fondo_id: number;
    monto: number;
    monto_pagado: number;
    saldo_pendiente: number;
    estado: 'revision' | 'pendiente' | 'pagado' | 'anulado';
    categoria_id?: number;
    descripcion?: string;
    caja_fondo?: {
        id: number;
        tipo: string;
        nombre: string;
    };
    categoria?: {
        id: number;
        nombre: string;
    };
    pagado_por?: {
        id: number;
        name: string;
    };
    pagado_at?: string | null;
    pagos?: Array<{
        id: number;
        monto: number;
        cambio: number;
        total: number;
        metodo: string;
        referencia?: string;
        banco?: {
            id: number;
            nombre: string;
        };
        nombre_cuenta?: string;
        fecha?: string;
        created_at: string;
    }>;
    created_at: string;
}

export interface PrestamoPago {
    id: number;
    prestamo_id: number;
    caja_fondo_id: number;
    categoria_id?: number;
    monto: number;
    descripcion?: string;
    created_at: string;
}

// ===== TIPOS PARA MÓDULO DE CLIENTES =====
export interface ClienteRow {
    id: number;
    name: string;
    email: string;
    telefono?: string;
    nit?: string;
    dpi?: string;
    razon_social?: string;
    credito?: boolean;
    credito_maximo?: number;
    credito_dias?: number;
    saldo?: number;
    creado_por?: number;
    actualizado_por?: number;
    eliminado_por?: number;
    deleted_at?: string;
    created_at: string;
    updated_at: string;
    direcciones?: Direccion[];
    creador?: User;
    actualizador?: User;
    eliminador?: User;
}

export interface ClienteIndexProps {
    clientes: {
        data: ClienteRow[];
        meta: ServerMeta;
    };
    filters: {
        search?: string;
        status?: string;
        sort_by?: string;
        sort_direction?: 'asc' | 'desc';
    };
}

export interface ClienteCreateProps {
    departamentos: Departamento[];
}

export interface ClienteEditProps {
    cliente: Cliente;
    departamentos: Departamento[];
}

export interface ClienteShowProps {
    cliente: Cliente;
    abonos?: Abono[];
    informacionCredito?: {
        credito_maximo: number;
        saldo: number;
        saldo_pendiente: number;
        credito_disponible: number;
        total_ventas_credito: number;
        total_abonos: number;
    };
    bancos?: Array<{ id: number; nombre: string }>;
}

export interface DireccionFormData {
    direccion?: string;
    zona?: string;
    referencia?: string;
    departamento_id?: number;
    municipio_id?: number;
}

export interface ClienteFormData {
    lock_version?: string;
    name: string;
    email?: string;
    telefono?: string;
    nit?: string;
    dpi?: string;
    razon_social?: string;
    credito?: boolean;
    credito_maximo?: number;
    credito_dias?: number;
    saldo?: number;
    direcciones?: DireccionFormData[];
}

// ===== RE-EXPORTAR TIPOS DE COMPONENTES =====
export type { ServerMeta } from '@/components/ui/data-table-server';
