import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';

interface Permission {
    id: number;
    name: string;
    display_name?: string;
}

interface User {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
    users?: User[];
}

const groupLabels: Record<string, string> = {
    personnel: 'Personal',
    users: 'Usuarios',
    roles: 'Roles',
    permissions: 'Permisos',
    positions: 'Cargos',
    Meals: 'Comidas',
};

const formatGroupName = (group: string) => {
    return groupLabels[group]
        ?? group.charAt(0).toUpperCase() + group.slice(1);
};

interface Props {
    role: Role;
}

export default function Show({ role }: Props) {

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Roles',
            href: '/roles',
        },
        {
            title: role.name,
            href: `/roles/${role.id}`,
        },
    ];

    const permissionGroups = role.permissions.reduce(
        (groups, permission) => {
            const module = permission.name
                .split('.')[0]
                .toLowerCase();

            if (!groups[module]) {
                groups[module] = [];
            }

            groups[module].push(permission);

            return groups;
        },
        {} as Record<string, Permission[]>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Rol - ${role.name}`} />
            <div className="p-6 space-y-6">
                {/* HEADER */}
                <div>
                    <h1 className="text-2xl font-bold">
                        {role.name}
                    </h1>

                    <p className="text-muted-foreground">
                        Información detallada del rol y sus permisos asignados.
                    </p>
                </div>

                {/* INFORMACIÓN GENERAL */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Información general
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    ID del rol
                                </p>

                                <p className="font-semibold">
                                    #{role.id}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Nombre
                                </p>

                                <p className="font-semibold">
                                    {role.name}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Permisos asignados
                                </p>

                                <p className="font-semibold">
                                    {role.permissions.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>


                {/* PERMISOS */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Permisos asignados
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {Object.keys(permissionGroups).length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.entries(permissionGroups).map(
                                    ([group, permissions]) => (
                                        <div
                                            key={group}
                                            className="rounded-xl border p-4 space-y-3 bg-muted/50"
                                        >

                                            <div className="flex items-center justify-between">

                                                <h3 className="font-semibold">
                                                    {formatGroupName(group)}
                                                </h3>

                                                <Badge>
                                                    {permissions.length}
                                                </Badge>

                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {permissions.map(
                                                    permission => (

                                                        <Badge
                                                            key={permission.id}
                                                            variant="secondary"
                                                        >
                                                            {permission.display_name ?? permission.name}
                                                        </Badge>

                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">
                                Este rol no tiene permisos asignados.
                            </p>

                        )}
                    </CardContent>
                </Card>

                {/* USUARIOS */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Usuarios con este rol
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {role.users && role.users.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {role.users.map(user => (
                                    <Link
                                        key={user.id}
                                        href={route('users.show', user.id)}
                                    >
                                        <Badge
                                            variant="outline"
                                            className="cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground"
                                        >
                                            {user.name}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">
                                No hay usuarios asignados a este rol.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}