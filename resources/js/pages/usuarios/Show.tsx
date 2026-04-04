import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCan } from '@/hooks/use-can';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Edit, Mail, Phone, User } from 'lucide-react';
import React from 'react';

interface Role {
    id: number;
    name: string;
}

interface ShowProps {
    user: {
        id: number;
        name: string;
        email: string;
        telefono?: string;
        deleted_at?: string;
        created_at: string;
        updated_at: string;
        roles?: Role[];
        creador?: { id: number; name: string } | null;
        actualizador?: { id: number; name: string } | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Usuarios', href: '/usuarios' },
    { title: 'Ver Usuario', href: '#' },
];

Show.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default function Show({ user }: ShowProps) {
    const { can } = useCan();

    return (
        <>
            <Head title={user.name} />
            <div className="space-y-6 p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            <h1 className="text-xl font-semibold">{user.name}</h1>
                            {user.deleted_at && <Badge variant="destructive">Inactivo</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            {user.email}
                        </div>
                        {user.telefono && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                {user.telefono}
                            </div>
                        )}
                        <div className="flex flex-wrap gap-1 pt-1">
                            {(user.roles || []).map((r) => (
                                <Badge key={r.id} variant="outline" className="capitalize">
                                    {r.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    {can('editar usuarios') && !user.deleted_at && (
                        <Link href={route('usuarios.edit', user.id)}>
                            <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="grid gap-4 text-sm sm:grid-cols-2 md:max-w-md">
                    <div>
                        <span className="text-muted-foreground">Creado:</span>
                        <span className="ml-2">{formatDate(user.created_at)}</span>
                        {user.creador && <span className="ml-1 text-muted-foreground">por {user.creador.name}</span>}
                    </div>
                    <div>
                        <span className="text-muted-foreground">Actualizado:</span>
                        <span className="ml-2">{formatDate(user.updated_at)}</span>
                        {user.actualizador && <span className="ml-1 text-muted-foreground">por {user.actualizador.name}</span>}
                    </div>
                </div>
            </div>
        </>
    );
}
