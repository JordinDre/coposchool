import type { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { branding } = usePage<PageProps>().props;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                {branding.icon.favicon ? (
                    <img src={branding.icon.favicon} alt={`${branding.company.name} Logo`} className="h-5 w-5" />
                ) : (
                    <>
                        <img src="/images/iconLigth.png" alt="Logo" className="h-5 w-5 dark:hidden" />
                        <img src="/images/iconDark.png" alt="Logo" className="hidden h-5 w-5 dark:block" />
                    </>
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold dark:text-white">{branding.company.name || 'CopoSchool'}</span>
            </div>
        </>
    );
}
