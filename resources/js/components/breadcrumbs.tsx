import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link } from '@inertiajs/react';
import { Fragment } from 'react';

export function Breadcrumbs({ breadcrumbs }: { breadcrumbs: BreadcrumbItemType[] }) {
    // En móvil mostrar solo los últimos 2 items, en desktop todos
    const visibleBreadcrumbs =
        typeof window !== 'undefined' && window.innerWidth < 640 && breadcrumbs.length > 2 ? breadcrumbs.slice(-2) : breadcrumbs;

    return (
        <>
            {breadcrumbs.length > 0 && (
                <Breadcrumb className="text-xs sm:text-sm">
                    <BreadcrumbList>
                        {visibleBreadcrumbs.map((item, index) => {
                            const isLast = index === visibleBreadcrumbs.length - 1;
                            return (
                                <Fragment key={index}>
                                    <BreadcrumbItem className="max-w-[120px] truncate sm:max-w-none">
                                        {isLast ? (
                                            <BreadcrumbPage className="truncate">{item.title}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild>
                                                <Link href={item.href} className="truncate">
                                                    {item.title}
                                                </Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!isLast && <BreadcrumbSeparator className="shrink-0" />}
                                </Fragment>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            )}
        </>
    );
}
