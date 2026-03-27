import BrandHead from '@/components/brand-head';
import type { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title }: PropsWithChildren<AuthLayoutProps>) {
    const { branding } = usePage<PageProps>().props;

    return (
        <>
            <BrandHead title={title} />
            <div className="relative grid min-h-screen flex-col items-center justify-center px-1 py-2 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:max-w-none lg:grid-cols-2 lg:px-0 lg:py-0">
                {/* Panel izquierdo con logo */}
                <div className="relative hidden h-full flex-col items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-8 lg:flex xl:p-12">
                    <Link href={route('tenant.home')} className="flex items-center justify-center transition-opacity hover:opacity-90">
                        <div className="flex items-center justify-center rounded-xl bg-white p-5 shadow-xl transition-transform hover:scale-105 xl:p-6">
                            <img src="/images/logo.png" alt="Logo" className="h-14 w-auto xl:h-16" />
                        </div>
                    </Link>
                </div>

                {/* Panel derecho con el formulario */}
                <div className="flex w-full items-center justify-center p-2 sm:p-6 md:p-8 lg:p-8 xl:p-10">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-3 sm:space-y-5 md:max-w-2xl md:space-y-6 lg:max-w-lg lg:space-y-6">
                        <Link
                            href={route('tenant.home')}
                            className="relative z-20 mb-2 flex items-center justify-center transition-opacity hover:opacity-80 sm:mb-5 sm:h-20 md:mb-6 md:h-24"
                        >
                            <img src={branding?.logo?.light || '/images/icon.png'} alt="Logo" className="h-12 w-auto sm:h-16 md:h-20 dark:hidden" />
                            <img
                                src={branding?.logo?.dark || '/images/icon.png'}
                                alt="Logo"
                                className="hidden h-12 w-auto sm:h-16 md:h-20 dark:block"
                            />
                        </Link>
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
