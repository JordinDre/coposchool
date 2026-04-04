import { Switch } from '@/components/ui/switch';
import { useSimpleMode } from '@/hooks/use-simple-mode';
import { Accessibility } from 'lucide-react';

export default function SimpleModeToggle() {
    const { simpleMode, toggleSimpleMode } = useSimpleMode();

    return (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-background p-1.5 shadow-sm">
                    <Accessibility className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-0.5">
                    <p className="text-sm leading-none font-medium focus:outline-none">Modo simple</p>
                    <p className="text-xs text-muted-foreground">
                        Sin barra lateral — navegación con botones grandes y acciones rápidas desde el inicio
                    </p>
                </div>
            </div>
            <Switch checked={simpleMode} onCheckedChange={toggleSimpleMode} aria-label="Activar modo simple" />
        </div>
    );
}
