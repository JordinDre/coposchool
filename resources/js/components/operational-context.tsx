import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCaja } from '@/hooks/use-can';
import { usePage } from '@inertiajs/react';
import { Building2, Check, Copy, ExternalLink, ShoppingBag, Wallet } from 'lucide-react';
import { useState } from 'react';

export function OperationalContext() {
    const caja = useCaja();
    const { configuracion } = usePage().props as { configuracion?: { catalogoPublico?: boolean; ecommercePublico?: boolean } };
    const catalogEnabled = configuracion?.catalogoPublico ?? false;
    const ecommerceEnabled = configuracion?.ecommercePublico ?? false;
    const isEcommerce = ecommerceEnabled;

    const catalogUrl =
        typeof window !== 'undefined' ? `${window.location.origin}${isEcommerce ? '/' : '/catalogo'}` : isEcommerce ? '/' : '/catalogo';

    const [copied, setCopied] = useState(false);

    const copyCatalogUrl = () => {
        const fallback = () => {
            const el = document.createElement('textarea');
            el.value = catalogUrl;
            el.style.position = 'fixed';
            el.style.opacity = '0';
            document.body.appendChild(el);
            el.focus();
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        if (navigator.clipboard) {
            navigator.clipboard
                .writeText(catalogUrl)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch(fallback);
        } else {
            fallback();
        }
    };

    if (!caja.activa && !catalogEnabled) return null;

    return (
        <div className="flex items-center gap-2">
            {caja.activa && (
                <>
                    <Badge variant="outline" className="gap-1.5 bg-sidebar-accent/50 text-sidebar-foreground">
                        <Building2 className="size-3.5 text-muted-foreground" />
                        <span className="hidden text-muted-foreground sm:inline">Bodega:</span>
                        <span className="font-medium">{caja.activa.bodega_nombre ?? caja.activa.bodega_id}</span>
                    </Badge>
                    <Badge variant="outline" className="gap-1.5 bg-sidebar-accent/50 text-sidebar-foreground">
                        <Wallet className="size-3.5 text-muted-foreground" />
                        <span className="hidden text-muted-foreground sm:inline">Caja:</span>
                        <span className="font-medium">{caja.activa.codigo}</span>
                    </Badge>
                </>
            )}

            {catalogEnabled && (
                <>
                    {/* Móvil: solo ícono que abre el catálogo/tienda */}
                    <a
                        href={catalogUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex cursor-pointer items-center rounded-md border bg-sidebar-accent/50 p-1 text-muted-foreground transition-colors hover:text-foreground sm:hidden"
                        title={isEcommerce ? 'Ver tienda en línea' : 'Ver catálogo'}
                    >
                        <ShoppingBag className="size-4" />
                    </a>

                    {/* sm+: badge completo con texto, copiar y abrir */}
                    <div className="hidden h-9 items-center gap-0 rounded-md border bg-sidebar-accent/50 px-3.5 text-sidebar-foreground sm:flex">
                        <ShoppingBag className="mr-1.5 size-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{isEcommerce ? 'Tienda en línea' : 'Catálogo'}</span>
                        <div className="mx-1.5 h-3 w-px bg-border" />
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={copyCatalogUrl}
                                    className="flex cursor-pointer items-center rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Copiar link {isEcommerce ? 'de la tienda' : 'del catálogo'}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <a
                                    href={catalogUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-0.5 flex cursor-pointer items-center rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <ExternalLink className="size-4" />
                                </a>
                            </TooltipTrigger>
                            <TooltipContent>{isEcommerce ? 'Abrir tienda en línea' : 'Abrir catálogo'}</TooltipContent>
                        </Tooltip>
                    </div>
                </>
            )}
        </div>
    );
}
