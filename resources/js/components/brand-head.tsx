import type { PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';

interface BrandHeadProps {
    title?: string;
}

export default function BrandHead({ title }: BrandHeadProps) {
    const { branding } = usePage<PageProps>().props;

    const pageTitle = title ? `${title} - ${branding.company.name}` : branding.company.name;
    const favicon = branding.icon?.favicon ?? '/images/icon.png';
    const appleTouchIcon = branding.icon?.apple_touch ?? favicon;

    return (
        <Head>
            <title>{pageTitle}</title>

            {/* Favicon — uses tenant logo when available */}
            <link rel="icon" type="image/png" sizes="32x32" href={favicon} />
            <link rel="icon" type="image/png" sizes="16x16" href={favicon} />

            {/* Apple Touch Icon — uses tenant logo when available */}
            <link rel="apple-touch-icon" href={appleTouchIcon} />

            {/* Meta tags adicionales */}
            <meta name="application-name" content={branding.company.name} />
            <meta name="apple-mobile-web-app-title" content={branding.company.name} />
        </Head>
    );
}
