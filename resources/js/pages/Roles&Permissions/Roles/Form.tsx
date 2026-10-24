import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { notify } from '@/lib/notify';

interface Permission {
    id: number;
    name: string;
    display_name: string;
}

interface PermissionGroup {
    name: string;
    permissions: Permission[];
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

interface Props {
    permissionGroups: PermissionGroup[];
    role?: Role;
    submitLabel?: string;
}

const groupLabels: Record<string, string> = {
    Personnel: 'Personal',
    Users: 'Usuarios',
    Roles: 'Roles',
    Permissions: 'Permisos',
    Positions: 'Cargos',
    Meals: 'Comidas',
};

const formatGroupName = (group: string) => {
    return groupLabels[group]
        ?? group.charAt(0).toUpperCase() + group.slice(1);
};

export default function Form({
    submitLabel = 'Guardar',
    permissionGroups = [],
    role,
}: Props) {

    const [openGroups, setOpenGroups] = useState<string[]>(
        permissionGroups
            .filter(group =>
                group.permissions.some(permission =>
                    role?.permissions?.some(
                        p => p.name === permission.name
                    )
                )
            )
            .map(group => group.name)
    );

    const { data, setData, post, put, processing, errors } = useForm({
        name: role?.name ?? '',
        permissions: role?.permissions?.map(p => p.name) ?? [],
    });

    const togglePermission = (permission: string) => {
        setData(
            'permissions',
            data.permissions.includes(permission)
                ? data.permissions.filter(
                    p => p !== permission
                )
                : [
                    ...data.permissions,
                    permission
                ]
        );
    };

    const toggleGroup = (group: PermissionGroup) => {
        const enabled = group.permissions.some(permission =>
            data.permissions.includes(permission.name)
        );

        if (enabled) {
            setData(
                'permissions',
                data.permissions.filter(
                    p =>
                        !group.permissions.some(
                            permission =>
                                permission.name === p
                        )
                )
            );

            setOpenGroups(
                openGroups.filter(
                    name => name !== group.name
                )
            );
        } else {
            const viewPermission = group.permissions.find(
                permission =>
                    permission.name.endsWith('.view')
            );

            const newPermissions = [
                ...data.permissions,
                ...(viewPermission
                    ? [viewPermission.name]
                    : []
                )
            ];

            setData(
                'permissions',
                newPermissions
            );

            setOpenGroups([
                ...openGroups,
                group.name
            ]);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = {
            onSuccess: () => notify.success(
                role
                    ? 'Rol actualizado correctamente.'
                    : 'Rol creado correctamente.'
            ),
            onError: () => notify.error(
                role
                    ? 'No se pudo actualizar el rol.'
                    : 'No se pudo crear el rol.'
            ),
        };

        role
            ? put(route('roles.update', role.id), options)
            : post(route('roles.store'), options);
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* NOMBRE */}
            <div>
                <Label>
                    Nombre del rol
                </Label>

                <div className='grid grid-cols-1 lg:grid-cols-2'>
                    <Input value={data.name} onChange={(e) => setData( 'name', e.target.value ) } />
                </div>

                {errors.name && (
                    <p className="text-red-500 text-sm">
                        {errors.name}
                    </p>
                )}
            </div>

            {/* PERMISOS */}
            <div className="space-y-4">
                <Label className="text-base">
                    Permisos
                </Label>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {permissionGroups.map((group) => {
                        const enabled = group.permissions.some(permission =>
                            data.permissions.includes(
                                permission.name
                            )
                        );

                        return (
                            <div key={group.name} className=" rounded-xl border p-4 space-y-4 bg-muted/70">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">
                                        {formatGroupName(group.name)}
                                    </h3>

                                    <Switch
                                        checked={enabled}
                                        onCheckedChange={() =>
                                            toggleGroup(group)
                                        }
                                    />
                                </div>

                                {enabled && (
                                    <div className="space-y-2 pt-2 border-t">
                                        {group.permissions.map(
                                            (permission) => (

                                                <label key={permission.id} className=" flex items-center gap-3 rounded-lg p-2 cursor-pointer hover:bg-muted">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            data.permissions.includes(
                                                                permission.name
                                                            )
                                                        }
                                                        disabled={permission.name.endsWith('.view')}
                                                        onChange={() =>
                                                            togglePermission(
                                                                permission.name
                                                            )
                                                        }
                                                    />

                                                    <span className="text-sm">
                                                        {permission.display_name}
                                                    </span>

                                                </label>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* BOTONES */}

            <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                >
                    Cancelar
                </Button>

                <Button
                    type="submit"
                    disabled={processing}
                >
                    {processing
                        ? 'Guardando...'
                        : submitLabel}
                </Button>
            </div>

        </form>
    );
}