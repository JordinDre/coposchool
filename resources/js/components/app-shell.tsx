import { SidebarProvider } from '@/components/ui/sidebar';
import type { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';

interface AppShellProps extends PropsWithChildren {
    variant?: 'header' | 'sidebar';
}

export function AppShell({ variant = 'sidebar', children }: AppShellProps) {
    const { sidebarOpen } = usePage<PageProps>().props;

    if (variant === 'header') {
        return <div className="flex h-screen w-full flex-col">{children}</div>;
    }

    return (
        <SidebarProvider defaultOpen={sidebarOpen}>
            <div className="flex h-screen w-full">{children}</div>
        </SidebarProvider>
    );
}
