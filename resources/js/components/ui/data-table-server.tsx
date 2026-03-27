import * as React from "react"
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

// Importar el tipo compartido
import type { ExtendedColumnDef } from '@/types'
import { router } from "@inertiajs/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useCan } from "@/hooks/use-can"
import { useTablePersistence } from "@/hooks/use-table-persistence"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  Columns,
} from "lucide-react"

/** ------------ Tipos base (sin any) ------------- */
export type ServerMeta = {
  page: number
  perPage: number
  total: number
  lastPage: number
  sortBy?: string | null
  sortDir?: "asc" | "desc" | null
}

type QueryValue = string | number | boolean | null | undefined
type QueryParams = Record<string, QueryValue>

/** Props del DataTable reutilizable */
interface DataTableServerProps<TData, TValue> {
  baseQuery?: Record<string, unknown>

  columns: ExtendedColumnDef<TData, TValue>[]
  rows?: TData[]
  meta: ServerMeta

  title?: string
  perPageOptions?: number[]
  persistFiltersInSession?: boolean
}


const DEFAULT_BASE_QUERY: Record<string, unknown> = {};
const DEFAULT_PER_PAGE_OPTIONS = [10, 20, 30, 40, 50, 100];

/** ------------ Componente ------------- */
export function DataTableServer<TData, TValue>({
  baseQuery = DEFAULT_BASE_QUERY,
  columns,
  rows,
  meta,
  title,
  perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
  persistFiltersInSession = false,
}: DataTableServerProps<TData, TValue>) {
  const data = Array.isArray(rows) ? rows : []
  const { can, canAll } = useCan()

  /** ===== Table Key para persistencia ===== */
  const tableKey = persistFiltersInSession && typeof window !== 'undefined' 
    ? window.location.pathname.replace(/\//g, '_').replace(/^_/, '')
    : `table_${title || 'default'}`

  /** ===== Loading bar ===== */
  const [loading, setLoading] = React.useState(false)

  /** ===== Calcular visibilidad inicial basada en permisos ===== */
  const calculateInitialVisibility = React.useCallback(() => {
    const initial: VisibilityState = {}
    
    // Ocultar columnas que requieren permisos específicos
    columns.forEach((col) => {
      if (col.permission) {
        let hasPermission = false
        
        if (Array.isArray(col.permission)) {
          if (col.requireAll) {
            hasPermission = canAll(col.permission)
          } else {
            hasPermission = can(col.permission)
          }
        } else {
          hasPermission = can(col.permission)
        }
        
        if (!hasPermission) {
          initial[col.id!] = false
        }
      }
    })
    
    return initial
  }, [columns, can, canAll])

  /** ===== Columnas visibles con persistencia (con lógica de permisos) ===== */
  const initialVisibility = React.useMemo(() => calculateInitialVisibility(), [calculateInitialVisibility])
  
  // Siempre llamamos al hook (regla de hooks de React)
  const { columnVisibility, setColumnVisibility } = useTablePersistence(
    tableKey, 
    initialVisibility, 
    persistFiltersInSession
  )

  // Ref para rastrear la visibilidad anterior y evitar recargas innecesarias
  const prevVisibilityRef = React.useRef<string | null>(null)
  const isInitialMount = React.useRef(true)
  
  // Recargar datos cuando cambie la visibilidad de columnas (solo si persistFiltersInSession está habilitado)
  React.useEffect(() => {
    if (!persistFiltersInSession) {
      return
    }

    const currentVisibility = JSON.stringify(columnVisibility)
    
    // Saltar el primer render
    if (isInitialMount.current) {
      isInitialMount.current = false
      prevVisibilityRef.current = currentVisibility
      return
    }
    
    // Solo recargar si realmente cambió la visibilidad
    if (prevVisibilityRef.current !== null && prevVisibilityRef.current !== currentVisibility) {
      // Pequeño delay para evitar múltiples peticiones cuando se cambian varias columnas rápidamente
      const timeoutId = setTimeout(() => {
        go({})
      }, 300)

      prevVisibilityRef.current = currentVisibility

      return () => clearTimeout(timeoutId)
    }
    
    // Actualizar la ref
    prevVisibilityRef.current = currentVisibility
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnVisibility, persistFiltersInSession])

  /** ===== Sorting visual (orden real en servidor) ===== */
  const [sorting, setSorting] = React.useState<SortingState>(() => 
    meta.sortBy ? [{ id: meta.sortBy, desc: meta.sortDir === "desc" }] : []
  )
  
  React.useEffect(() => {
    const newSorting = meta.sortBy ? [{ id: meta.sortBy, desc: meta.sortDir === "desc" }] : []
    setSorting(prevSorting => {
      // Solo actualizar si realmente cambió
      if (JSON.stringify(prevSorting) !== JSON.stringify(newSorting)) {
        return newSorting
      }
      return prevSorting
    })
  }, [meta.sortBy, meta.sortDir])

  const table = useReactTable({
    data,
    columns: columns as ColumnDef<TData, TValue>[],
    state: { sorting, columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  })

  /** ===== Helpers de query ===== */
  const readParam = <K extends keyof ServerMeta>(
    key: K,
    params: Partial<ServerMeta>
  ): QueryValue => {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const v = params[key]
      return (v as QueryValue) ?? undefined
    }
    const m = meta[key]
    return (m as QueryValue) ?? undefined
  }

  function go(params: Partial<ServerMeta>): void {
    // Obtener todos los parámetros actuales de la URL para preservar filtros
    const currentUrlParams = new URLSearchParams(window.location.search)
    
    const query: QueryParams = {
      ...(baseQuery as QueryParams),
      // 👇 Mantiene la página actual si no la cambias explícitamente
      page: params.page ?? meta.page,
      perPage: params.perPage ?? meta.perPage,
    }

    // Manejar sortBy y sortDir: incluir siempre para que el backend sepa cuando eliminarlos
    const sortBy = readParam("sortBy", params)
    const sortDir = readParam("sortDir", params)
    // Si son null, enviar como cadena vacía para que el backend los elimine de sesión
    query.sortBy = sortBy ?? ''
    query.sortDir = sortDir ?? ''

    // Preservar todos los filtros existentes de la URL actual (excepto los de paginación/ordenamiento)
    const paginationKeys = new Set(['page', 'perPage', 'sortBy', 'sortDir', 'columnas'])
    currentUrlParams.forEach((value, key) => {
      if (!paginationKeys.has(key) && value !== '') {
        query[key] = value
      }
    })

    // Agregar columnas visibles si están disponibles y la persistencia está habilitada
    if (persistFiltersInSession && typeof window !== 'undefined') {
      try {
        const path = window.location.pathname.replace(/\//g, '_').replace(/^_/, '')
        const storageKey = `table_${path}_column_visibility`
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const visibility = JSON.parse(stored)
          // Convertir el objeto de visibilidad a array de columnas visibles
          const visibleColumns = Object.entries(visibility)
            .filter(([, isVisible]) => isVisible !== false)
            .map(([columnId]) => columnId)
          
          if (visibleColumns.length > 0) {
            query.columnas = visibleColumns.join(',')
          }
        }
      } catch (error) {
        console.warn('Error loading column visibility for request:', error)
      }
    }

    router.visit(window.location.pathname, {
      method: "get",
      data: query,
      preserveScroll: true,
      preserveState: true,
      replace: true,
      onStart: () => setLoading(true),
      onFinish: () => setLoading(false),
    })
  }



  /** ===== Ordenar: asc -> desc -> none -> asc... (con aria-sort) ===== */
  function onHeaderClick(colId: string, canSort: boolean): void {
    if (!canSort) return
    
    const column = columns.find(col => col.id === colId)
    const sortField = column && 'accessorKey' in column ? String(column.accessorKey) : colId
    
    const current = meta.sortBy === sortField ? meta.sortDir : null
    const next: ServerMeta["sortDir"] =
      current === null ? "asc" : current === "asc" ? "desc" : null
    // NO tocamos page aquí: se conserva
    go({ sortBy: next ? sortField : null, sortDir: next })
  }


  /** ===== Ir a página ===== */
  // const [goto, setGoto] = React.useState<string>("") // Removed - no longer used

  const canPrev = meta.page > 1
  const canNext = meta.page < meta.lastPage

  return (
    <div className="w-full space-y-3 md:space-y-4">
      {/* Loading bar sutil */}
      {loading && (
        <div className="fixed inset-x-0 top-0 z-[100]">
          <div className="h-0.5 w-full bg-black/10">
            <div className="h-0.5 w-1/3 animate-pulse bg-black" />
          </div>
        </div>
      )}

      {/* Toolbar: título */}
      <div className="flex flex-wrap items-center gap-2">
        {title && <h2 className="text-base font-semibold sm:text-lg">{title}</h2>}
      </div>

      {/* Vista de Cards para móvil */}
      <div className="block lg:hidden">
        {table.getRowModel().rows.length > 0 ? (
          <div className="space-y-3">
            {table.getRowModel().rows.map((row) => (
              <Card key={row.id} className="overflow-hidden">
                <CardHeader className="w-full border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-0 pb-3 pt-0 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
                  <div className="flex w-full items-center justify-between gap-2 px-6 py-4">
                    <div className="flex-1 min-w-0">
                      {row.getVisibleCells().map((cell) => {
                        const colId = cell.column.id
                        if (colId === 'actions') return null
                        if (colId === 'id' || colId === 'cliente' || colId === 'nombre') {
                          return (
                            <div key={cell.id} className="flex items-center">
                              {flexRender(
                                cell.column.columnDef.cell ?? (({ getValue }) => <>{getValue()}</>),
                                cell.getContext()
                              )}
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                    {row.getVisibleCells().map((cell) => {
                      if (cell.column.id === 'actions') {
                        return (
                          <div key={cell.id} className="shrink-0">
                            {flexRender(
                              cell.column.columnDef.cell ?? (({ getValue }) => <>{getValue()}</>),
                              cell.getContext()
                            )}
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                </CardHeader>
                <CardContent className="space-y-0 pt-0">
                  {row.getVisibleCells().map((cell) => {
                    const colId = cell.column.id
                    if (colId === 'id' || colId === 'cliente' || colId === 'nombre' || colId === 'actions') return null
                    
                    // Render especial para la columna de productos
                    if (colId === 'productos') {
                      const productosContent = flexRender(
                        cell.column.columnDef.cell ?? (({ getValue }) => <>{getValue()}</>),
                        cell.getContext()
                      )
                      
                      return (
                        <div 
                          key={cell.id} 
                          className="border-b border-gray-200 bg-white px-4 py-3 last:border-0 dark:border-gray-700 dark:bg-gray-800"
                        >
                          <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                            Productos
                          </div>
                          <div className="mt-2">
                            {productosContent}
                          </div>
                        </div>
                      )
                    }
                    
                    return (
                      <div 
                        key={cell.id} 
                        className={`border-b border-gray-200 bg-white px-4 py-3 last:border-0 dark:border-gray-700 dark:bg-gray-800`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                            {(() => {
                              const foundCol = columns.find((col) => col.id === colId);
                              return typeof foundCol?.header === 'string' ? foundCol.header : colId;
                            })()}
                          </div>
                          <div className="flex-1 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                            {flexRender(
                              cell.column.columnDef.cell ?? (({ getValue }) => <>{getValue()}</>),
                              cell.getContext()
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center text-muted-foreground">
            No hay resultados.
          </div>
        )}
      </div>

      {/* Tabla: header estándar (sin hover), body con modo oscuro + aria-sort */}
      <div className="hidden w-full overflow-hidden rounded-md border border-border lg:block">
        <Table className="w-full bg-background text-xs sm:text-sm">
          <TableHeader className="sticky top-0 z-10 bg-muted/50 dark:bg-muted/30">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="[&_th]:py-2">
                {hg.headers.map((header) => {
                  const colId = header.column.id
                  const canSort = header.column.getCanSort() !== false
                  
                  // Obtener el accessorKey de la columna para comparar con meta.sortBy
                  const column = columns.find(col => col.id === colId)
                  const sortField = column && 'accessorKey' in column ? String(column.accessorKey) : colId
                  
                  const isThis = meta.sortBy === sortField
                  const dir = isThis ? meta.sortDir : null

                  return (
                    <TableHead
                      key={header.id}
                      onClick={() => onHeaderClick(colId, canSort)}
                      role="columnheader"
                      aria-sort={
                        meta.sortBy === sortField
                          ? dir === "asc"
                            ? "ascending"
                            : dir === "desc"
                              ? "descending"
                              : "none"
                          : "none"
                      }
                      className={`font-semibold text-foreground ${
                        canSort ? "cursor-pointer select-none hover:bg-transparent" : ""
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          dir === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : dir === "desc" ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                          )
                        )}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          {/* Empty state */}
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  className={`transition-colors hover:bg-muted/40 [&_td]:py-2.5 ${
                    index % 2 === 0 ? 'bg-white dark:bg-black' : 'bg-gray-50 dark:bg-gray-900'
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="align-middle text-foreground">
                      {flexRender(
                        cell.column.columnDef.cell ??
                          (({ getValue }) => <>{getValue()}</>),
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Columnas visibles + Paginación */}
      <div className="flex flex-col gap-3 md:gap-4">
        {/* Desktop: Una sola fila, Mobile/Tablet: Apilado */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
          {/* Fila 1: Columnas (izq) y Por página (der) en móvil, solo Columnas en desktop */}
          <div className="flex items-center justify-between lg:justify-start">
            {/* Columnas */}
            <div className="flex items-center ">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Columns className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Columnas</span>
                    <span className="sm:hidden">Cols</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {table
                    .getAllLeafColumns()
                    .filter((col) => col.getCanHide())
                    .map((col) => (
                      <DropdownMenuCheckboxItem
                        key={col.id}
                        className="capitalize cursor-pointer"
                        checked={col.getIsVisible()}
                        onCheckedChange={(v) => col.toggleVisibility(!!v)}
                        onSelect={(e) => e.preventDefault()}
                      >
                        {typeof col.columnDef.header === 'string' 
                          ? col.columnDef.header 
                          : col.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Por página - visible en móvil/tablet */}
            <div className="flex items-center gap-2 lg:hidden">
              <span className="text-xs text-muted-foreground sm:text-sm">{meta.total} registro(s)</span>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm">Por página</span>
                <select
                  className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground sm:text-sm md:h-8"
                  value={meta.perPage}
                  onChange={(e) => go({ perPage: Number(e.target.value) })}
                >
                  {perPageOptions.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Fila 2: Paginación centrada en móvil/tablet */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 lg:hidden">
          <Button
            variant="outline" size="icon" className="size-9 md:size-8"
            onClick={() => go({ page: 1 })}
            disabled={!canPrev}
            aria-label="Primera página"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline" size="icon" className="size-9 md:size-8"
            onClick={() => go({ page: meta.page - 1 })}
            disabled={!canPrev}
            aria-label="Página anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>

          {/* Números de página */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {(() => {
              const pages = []
              const totalPages = meta.lastPage
              const currentPage = meta.page
              
              // En móvil mostrar solo página actual y adyacentes
              const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
              const startPage = isMobile 
                ? Math.max(1, currentPage - 1)
                : Math.max(1, currentPage - 2)
              const endPage = isMobile
                ? Math.min(totalPages, currentPage + 1)
                : Math.min(totalPages, currentPage + 2)
              
              // Siempre mostrar primera página si no está en el rango
              if (startPage > 1) {
                pages.push(
                  <Button
                    key={1}
                    variant={1 === currentPage ? "default" : "outline"}
                    size="sm"
                    className="h-9 w-8 text-xs md:h-8 md:text-sm"
                    onClick={() => go({ page: 1 })}
                  >
                    1
                  </Button>
                )
                if (startPage > 2) {
                  pages.push(<span key="ellipsis1" className="px-1 text-xs sm:px-2 sm:text-sm">...</span>)
                }
              }
              
              // Mostrar páginas en el rango
              for (let i = startPage; i <= endPage; i++) {
                if (i !== 1 || startPage === 1) { // Evitar duplicar página 1
                  pages.push(
                    <Button
                      key={i}
                      variant={i === currentPage ? "default" : "outline"}
                      size="sm"
                      className="h-9 w-8 text-xs md:h-8 md:text-sm"
                      onClick={() => go({ page: i })}
                    >
                      {i}
                    </Button>
                  )
                }
              }
              
              // Siempre mostrar última página si no está en el rango
              if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                  pages.push(<span key="ellipsis2" className="px-1 text-xs sm:px-2 sm:text-sm">...</span>)
                }
                pages.push(
                  <Button
                    key={totalPages}
                    variant={totalPages === currentPage ? "default" : "outline"}
                    size="sm"
                    className="h-9 w-8 text-xs md:h-8 md:text-sm"
                    onClick={() => go({ page: totalPages })}
                  >
                    {totalPages}
                  </Button>
                )
              }
              
              return pages
            })()}
          </div>

          <Button
            variant="outline" size="icon" className="size-9 md:size-8"
            onClick={() => go({ page: meta.page + 1 })}
            disabled={!canNext}
            aria-label="Página siguiente"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline" size="icon" className="size-9 md:size-8"
            onClick={() => go({ page: meta.lastPage })}
            disabled={!canNext}
            aria-label="Última página"
          >
            <ChevronsRight className="size-4" />
          </Button>
          </div>

          {/* Desktop: Por página y Paginación centrada */}
          <div className="hidden lg:flex items-center justify-center gap-4">
            {/* Por página en desktop */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground sm:text-sm">{meta.total} registro(s)</span>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm">Por página</span>
                <select
                  className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground sm:text-sm md:h-8"
                  value={meta.perPage}
                  onChange={(e) => go({ perPage: Number(e.target.value) })}
                >
                  {perPageOptions.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Paginación centrada */}
            <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="outline" size="icon" className="size-9 md:size-8"
            onClick={() => go({ page: 1 })}
            disabled={!canPrev}
            aria-label="Primera página"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline" size="icon" className="size-9 md:size-8"
            onClick={() => go({ page: meta.page - 1 })}
            disabled={!canPrev}
            aria-label="Página anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>

          {/* Números de página */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {(() => {
              const pages = []
              const totalPages = meta.lastPage
              const currentPage = meta.page
              
              // En móvil mostrar solo página actual y adyacentes
              const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
              const startPage = isMobile 
                ? Math.max(1, currentPage - 1)
                : Math.max(1, currentPage - 2)
              const endPage = isMobile
                ? Math.min(totalPages, currentPage + 1)
                : Math.min(totalPages, currentPage + 2)
              
              // Siempre mostrar primera página si no está en el rango
              if (startPage > 1) {
                pages.push(
                  <Button
                    key={1}
                    variant={1 === currentPage ? "default" : "outline"}
                    size="sm"
                    className="h-9 w-8 text-xs md:h-8 md:text-sm"
                    onClick={() => go({ page: 1 })}
                  >
                    1
                  </Button>
                )
                if (startPage > 2) {
                  pages.push(
                    <span key="ellipsis-start" className="px-1 text-xs text-muted-foreground">...</span>
                  )
                }
              }
              
              // Páginas del rango
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <Button
                    key={i}
                    variant={i === currentPage ? "default" : "outline"}
                    size="sm"
                    className="h-9 w-8 text-xs md:h-8 md:text-sm"
                    onClick={() => go({ page: i })}
                  >
                    {i}
                  </Button>
                )
              }
              
              // Siempre mostrar última página si no está en el rango
              if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                  pages.push(
                    <span key="ellipsis-end" className="px-1 text-xs text-muted-foreground">...</span>
                  )
                }
                pages.push(
                  <Button
                    key={totalPages}
                    variant={totalPages === currentPage ? "default" : "outline"}
                    size="sm"
                    className="h-9 w-8 text-xs md:h-8 md:text-sm"
                    onClick={() => go({ page: totalPages })}
                  >
                    {totalPages}
                  </Button>
                )
              }
              
              return pages
            })()}
          </div>

          <Button
            variant="outline" size="icon" className="size-9 md:size-8"
            onClick={() => go({ page: meta.page + 1 })}
            disabled={!canNext}
            aria-label="Página siguiente"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline" size="icon" className="size-9 md:size-8"
            onClick={() => go({ page: meta.lastPage })}
            disabled={!canNext}
            aria-label="Última página"
          >
            <ChevronsRight className="size-4" />
          </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
