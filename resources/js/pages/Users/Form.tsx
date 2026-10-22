import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";

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

interface Personnel {
    id: number;
    first_name: string;
    last_name: string;
    email: string | null;
    document_type: string;
    id_number: string;
    position?: {
        id: number;
        name: string;
    } | null;
}

interface Props {
    personnels?: Personnel[];
    roles?: Role[];
    permissionGroups?: PermissionGroup[];
    data: any;
    setData: any;
    errors: any;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    submitLabel?: string;
}

                            /* =======================================================
                                                CREATE FORM
                            ======================================================= */

export function FormCreate({data, 
                            setData, 
                            errors, 
                            processing, 
                            personnels = [], 
                            roles = [], 
                            permissionGroups = [], 
                            onSubmit, submitLabel = 'Guardar',
                            }: Props) {

    const [showExtraPermissions, setShowExtraPermissions] = useState(false);
    const selectedRole = roles.find( (role: any) => role.name === data.role );
    const rolePermissions = selectedRole?.permissions ?? [];
    const togglePermission = (permission: string) => {
        setData(
            'permissions',
            data.permissions.includes(permission) ? data.permissions.filter((p: string) => p !== permission) : [...data.permissions, permission]
        );
    };
    const getExtraPermissions = (permissions: any[]) => {
        return permissions.filter(
            permission => !rolePermissions.some( (rolePermission: any) => rolePermission.name === permission.name )
        );
    };
    const formatGroupName = (group: string) => {
        const labels: Record<string, string> = {
            Personnel: 'Personal',
            Users: 'Usuarios',
            Roles: 'Roles',
            Permissions: 'Permisos',
            Positions: 'Cargos',
        };

        return labels[group] ?? group.charAt(0).toUpperCase() + group.slice(1);
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* PERSONA */}
                <div>
                    <Label>
                        Persona <span className="text-red-500">*</span>
                    </Label>

                    <Select
                        value={data.personnel_id}
                        onValueChange={(value) => {
                            const selected = personnels.find( (p: any) => String(p.id) === value );
                            setData('personnel_id', value);
                            setData('email', selected?.email ?? '');
                            setData('document_type', selected?.document_type ?? 'V');
                            setData('document_number', selected?.id_number ?? '');
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione una persona" />
                        </SelectTrigger>

                        <SelectContent>
                            {personnels.map((personnel: any) => (
                                <SelectItem key={personnel.id} value={String(personnel.id)} >
                                    {personnel.first_name} {personnel.last_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {errors.personnel_id && (<p className="text-red-500 text-sm mt-2">{errors.personnel_id}</p>)}
                </div>

                {/* CÉDULA */}
                <div>
                    <Label>
                        Cédula <span className="text-red-500">*</span>
                    </Label>

                    <div className="flex">
                        <Select
                            value={data.document_type}
                            onValueChange={(value) => {
                                setData('document_type', value);

                                const selected = personnels.find( (p: any) => p.document_type === value && p.id_number === data.document_number );
                                if (selected) {
                                    setData( 'personnel_id', String(selected.id) );
                                    setData( 'email', selected.email ?? '' );
                                } else {
                                    setData('personnel_id', '');
                                    setData('email', '');
                                }
                            }}
                        >
                            <SelectTrigger className="w-20 rounded-r-none border-r-0">
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="V">V</SelectItem>
                                <SelectItem value="E">E</SelectItem>
                            </SelectContent>
                        </Select>

                        <Input
                            className="flex-1 rounded-l-none"
                            placeholder="Número de cédula"
                            maxLength={15}
                            value={ data.document_number.replace( /\B(?=(\d{3})+(?!\d))/g, "." ) }
                            onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, '');
                                setData( 'document_number', raw );
                                const selected = personnels.find( (p: any) => p.document_type === data.document_type && p.id_number === raw );
                                if (selected) {
                                    setData( 'personnel_id', String(selected.id) );
                                    setData( 'email', selected.email ?? '' );
                                } else {
                                    setData( 'personnel_id', '' );
                                    setData( 'email', '');
                                }
                            }}
                        />
                    </div>

                    {errors.document_type && (<p className="text-red-500 text-sm mt-2">{errors.document_type}</p>)}
                    {errors.document_number && (<p className="text-red-500 text-sm mt-2">{errors.document_number}</p>)}
                </div>

                {/* CARGO */}
                <div>
                    <Label>Cargo</Label>
                    <Input
                        value={personnels.find((p) => String(p.id) === String(data.personnel_id))?.position?.name ?? ''}
                        disabled
                        placeholder="Seleccione un trabajador"
                    />
                </div>

                {/* USERNAME */}
                <div>
                    <Label>
                        Nombre de usuario <span className="text-red-500">*</span>
                    </Label>

                    <Input
                        placeholder="Ingrese un nombre de usuario"
                        value={data.username}
                        onChange={(e) => setData( 'username', e.target.value )}
                    />

                    {errors.username && (<p className="text-red-500 text-sm mt-2">{errors.username}</p>)}
                </div>


                {/* EMAIL */}
                <div>
                    <Label>
                        Correo electrónico
                    </Label>

                    <Input value={data.email || ''} disabled />
                </div>

                {/* ROL */}
                <div>
                    <Label>
                        Roles y permisos <span className="text-red-500">*</span>
                    </Label>

                    <Select
                        value={data.role}
                        onValueChange={(value) => {
                            setData( 'role', value );
                            setData( 'permissions', []);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione un rol" />
                        </SelectTrigger>

                        <SelectContent>
                            {roles.map((role: any) => (
                                <SelectItem key={role.id} value={role.name} >
                                    {role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {errors.role && (<p className="text-red-500 text-sm mt-2">{errors.role}</p>)}
                </div>
            </div>

            {/* SWITCH PERMISOS EXTRAS */}
            {data.role && (
                <div className="rounded-xl border p-4 bg-muted/40">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-base">
                                Permisos adicionales
                            </Label>

                            <p className="text-sm text-muted-foreground">
                                Agrega permisos extras a este usuario sin modificar los permisos del rol.
                            </p>

                            <p className="text-sm text-muted-foreground mt-1">
                                Los permisos asignados por el rol se mantienen como permisos predeterminados y no pueden eliminarse desde aquí. Solo puedes agregar nuevos permisos adicionales.
                            </p>
                        </div>

                        <Switch checked={showExtraPermissions} onCheckedChange={setShowExtraPermissions} />
                    </div>
                </div>
            )}

            {/* PERMISOS */}
            {showExtraPermissions && data.role && (
                <div className="space-y-6">

                    {/* PERMISOS ADICIONALES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {permissionGroups.map((group: any) => {
                            const roleGroupPermissions = group.permissions.filter((permission: any) => rolePermissions.some((rolePermission: any) => rolePermission.name === permission.name));
                            const extraPermissions = group.permissions.filter((permission: any) => !rolePermissions.some((rolePermission: any) => rolePermission.name === permission.name));

                            if ( !roleGroupPermissions.length && !extraPermissions.length ) {
                                return null;
                            }

                            const enabled = roleGroupPermissions.length > 0 || extraPermissions.some( (permission: any) => data.permissions.includes( permission.name ) );

                            return (
                                <div key={group.name} className="rounded-xl border p-4 space-y-4 bg-muted/70">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">
                                            {formatGroupName(group.name)}
                                        </h3>

                                        <Switch
                                            checked={enabled}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    const viewPermission = extraPermissions.find( (permission: any) => permission.name.endsWith('.view') );
                                                    if ( viewPermission && !data.permissions.includes( viewPermission.name ) ) {
                                                        setData( 'permissions', [...data.permissions, viewPermission.name] );
                                                    }
                                                } else {
                                                    setData( 'permissions', data.permissions.filter((p: string) => !extraPermissions.some((permission: any) => permission.name === p)));
                                                }
                                            }}
                                        />
                                    </div>

                                    {enabled && (
                                        <div className="space-y-2 pt-2 border-t">
                                            {group.permissions.map(
                                                (permission: any) => {
                                                    const inherited = rolePermissions.some(
                                                        (p: any) =>
                                                            p.name === permission.name
                                                    );

                                                    return (
                                                        <label key={permission.id} className="flex items-center gap-3 rounded-lg p-2 cursor-pointer hover:bg-muted">
                                                            <input
                                                                type="checkbox"
                                                                checked={ inherited || data.permissions.includes( permission.name ) }
                                                                disabled={inherited}
                                                                onChange={() => togglePermission( permission.name )}
                                                            />

                                                            <span className="text-sm flex items-center gap-2">
                                                                {permission.display_name}
                                                                {inherited && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        (Rol)
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </label>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* PASSWORD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label>
                        Contraseña <span className="text-red-500">*</span>
                    </Label>

                    <Input
                        type="password"
                        placeholder="Ingrese una contraseña"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    {errors.password && (<p className="text-red-500 text-sm mt-2">{errors.password}</p>)}
                </div>

                <div>
                    <Label>
                        Confirmar contraseña <span className="text-red-500">*</span>
                    </Label>

                    <Input
                        type="password"
                        placeholder="Repita la contraseña"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />
                </div>
            </div>

            {/* BOTONES */}
            <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Cancelar
                </Button>

                <Button type="submit" disabled={processing}>
                    {processing ? 'Guardando...' : submitLabel}
                </Button>
            </div>
        </form>
    );
}







                        /* =======================================================
                                                    EDIT FORM
                        ======================================================= */

export function FormEdit({
                        data,
                        setData,
                        errors,
                        processing,
                        personnels = [],
                        roles = [],
                        permissionGroups = [],
                        onSubmit,
                        submitLabel = 'Actualizar',
                    }: any) {

    const [showExtraPermissions, setShowExtraPermissions] = useState( data.permissions?.length > 0 );
    const selectedRole = roles.find((role: any) => role.name === data.role);
    const rolePermissions = selectedRole?.permissions ?? [];
    const togglePermission = (permission: string ) => {setData( 'permissions', data.permissions.includes(permission) ? data.permissions.filter((p: string) => p !== permission) : [...data.permissions, permission]); };
    const formatGroupName = ( group: string ) => {
        const labels: Record<string, string> = {
            Personnel: 'Personal',
            Users: 'Usuarios',
            Roles: 'Roles',
            Permissions: 'Permisos',
            Positions: 'Cargos',
        };
        return labels[group] ?? group;
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* PERSONA */}
                <div>
                    <Label>
                        Persona <span className="text-red-500">*</span>
                    </Label>

                    <Select value={data.personnel_id} onValueChange={(value) => {
                            const selected = personnels.find((p: any) => String(p.id) === value);
                            setData('personnel_id', value);
                            setData( 'email', selected?.email ?? '' );
                            setData( 'document_type', selected?.document_type ?? 'V' );
                            setData( 'document_number', selected?.id_number ?? '' );
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione una persona" />
                        </SelectTrigger>

                        <SelectContent>
                            {personnels.map((personnel: any) => (
                                <SelectItem key={personnel.id} value={String(personnel.id)} >
                                    {personnel.first_name} {personnel.last_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {errors.personnel_id && (<p className="mt-2 text-sm text-red-500">{errors.personnel_id}</p>)}
                </div>


                {/* CÉDULA */}
                <div>
                    <Label>
                        Cédula <span className="text-red-500">*</span>
                    </Label>

                    <div className="flex">
                        <Select
                            value={data.document_type}
                            onValueChange={(value) => {
                                setData( 'document_type', value );
                                const selected = personnels.find( (p: any) => p.document_type === value && p.id_number === data.document_number );
                                if (selected) {
                                    setData( 'personnel_id', String(selected.id) );
                                    setData( 'email', selected.email ?? '' );
                                } else {
                                    setData( 'personnel_id', '' );
                                    setData( 'email', '' );
                                }
                            }}
                        >
                            <SelectTrigger className="w-20 rounded-r-none border-r-0">
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="V">V</SelectItem>
                                <SelectItem value="E">E</SelectItem>
                            </SelectContent>
                        </Select>

                        <Input
                            className="flex-1 rounded-l-none"
                            placeholder="Número de cédula"
                            maxLength={15}
                            value={data.document_number.replace( /\B(?=(\d{3})+(?!\d))/g, "." )}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, '');
                                setData( 'document_number', raw );
                                const selected = personnels.find((p: any) => p.document_type === data.document_type && p.id_number === raw);
                                if (selected) {
                                    setData( 'personnel_id', String(selected.id) );
                                    setData( 'email', selected.email ?? '' );
                                } else {
                                    setData( 'personnel_id', '');
                                    setData( 'email', '' );
                                }
                            }}
                        />
                    </div>

                    {errors.document_type && (<p className="mt-2 text-sm text-red-500">{errors.document_type}</p>)}
                    {errors.document_number && (<p className="mt-2 text-sm text-red-500">{errors.document_number}</p>)}
                </div>

                {/* CARGO */}
                <div>
                    <Label>Cargo</Label>
                    <Input value={personnels.find((p: Personnel) => String(p.id) === String(data.personnel_id))?.position?.name ?? ''} disabled placeholder="Sin cargo asignado" />
                </div>

                {/* USUARIO */}
                <div>
                    <Label>
                        Nombre de usuario <span className="text-red-500">*</span>
                    </Label>

                    <Input value={data.username} onChange={(e) => setData( 'username', e.target.value )} />

                    {errors.username && (<p className="mt-2 text-sm text-red-500">{errors.username}</p>)}
                </div>

                {/* EMAIL */}
                <div>
                    <Label>
                        Correo electrónico
                    </Label>

                    <Input value={data.email} disabled />
                </div>

                {/* ROL */}
                <div>
                    <Label>
                        Rol <span className="text-red-500">*</span>
                    </Label>

                    <Select value={data.role} onValueChange={(value) => setData('role', value)} >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione un rol" />
                        </SelectTrigger>

                        <SelectContent>
                            {roles.map((role: Role) => (
                                <SelectItem key={role.id} value={role.name} >
                                    {role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>

                    </Select>

                    {errors.role && (<p className="mt-2 text-sm text-red-500">{errors.role}</p>)}
                </div>
            </div>

            {/* SWITCH PERMISOS EXTRAS */}
            {data.role && (
                <div className="rounded-xl border p-4 bg-muted/40">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-base">
                                Permisos adicionales
                            </Label>

                            <p className="text-sm text-muted-foreground">
                                Agrega permisos extras a este usuario sin modificar los permisos del rol.
                            </p>

                            <p className="text-sm text-muted-foreground mt-1">
                                Los permisos asignados por el rol se mantienen como permisos predeterminados y no pueden eliminarse desde aquí. Solo puedes agregar nuevos permisos adicionales.
                            </p>
                        </div>

                        <Switch
                            checked={showExtraPermissions}
                            onCheckedChange={(checked) => {
                                setShowExtraPermissions(checked);
                                if (!checked) {
                                    setData('permissions', []);
                                }
                            }}
                        />
                    </div>
                </div>
            )}

            {/* PERMISOS */}
            {showExtraPermissions && data.role && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {permissionGroups.map((group: any) => {
                            const roleGroupPermissions = group.permissions.filter((permission: any) => rolePermissions.some((rolePermission: any) => rolePermission.name === permission.name));
                            const extraPermissions =group.permissions.filter((permission: any) => !rolePermissions.some((rolePermission: any) => rolePermission.name === permission.name));

                            if (
                                !roleGroupPermissions.length &&
                                !extraPermissions.length
                            ) {
                                return null;
                            }

                            const enabled = roleGroupPermissions.length > 0 || extraPermissions.some((permission: any) => data.permissions.includes(permission.name));

                            return (
                                <div key={group.name} className="rounded-xl border p-4 space-y-4 bg-muted/70">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">
                                            {formatGroupName(group.name)}
                                        </h3>

                                        <Switch
                                            checked={enabled}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    const viewPermission = extraPermissions.find((permission: any) => permission.name.endsWith('.view'));

                                                    if ( viewPermission && !data.permissions.includes( viewPermission.name ) ) {
                                                        setData( 'permissions', [ ...data.permissions, viewPermission.name, ] );
                                                    }
                                                } else {
                                                    setData( 'permissions', data.permissions.filter((p: string) => !extraPermissions.some((permission: any) => permission.name === p)) );
                                                }
                                            }}
                                        />
                                    </div>

                                    {enabled && (
                                        <div className="space-y-2 pt-2 border-t">
                                            {group.permissions.map(
                                                (permission: any) => {
                                                    const inherited = rolePermissions.some((p: any) => p.name === permission.name);

                                                    return (
                                                        <label key={permission.id} className="flex items-center gap-3 rounded-lg p-2 cursor-pointer hover:bg-muted">
                                                            <input
                                                                type="checkbox"
                                                                checked={ inherited || data.permissions.includes( permission.name ) }
                                                                disabled={inherited}
                                                                onChange={() => togglePermission(permission.name)}
                                                            />

                                                            <span className="text-sm flex items-center gap-2">
                                                                {permission.display_name}

                                                                {inherited && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        (Rol)
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </label>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}


            {/* CONTRASEÑA */}
            <div className="rounded-xl border p-5 space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium">
                            Contraseña
                        </h3>

                        <p className="text-sm text-muted-foreground">
                            Cambie la contraseña únicamente si es necesario.
                        </p>
                    </div>

                    {!data.change_password ? (
                        <Button type="button" variant="outline" onClick={() => setData( 'change_password', true )}>
                            Cambiar contraseña
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setData( 'change_password', false );
                                setData( 'password', '' );
                                setData( 'password_confirmation', '' );
                            }}
                        >
                            Cancelar cambio
                        </Button>
                    )}
                </div>
                {data.change_password && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>
                                Nueva contraseña
                            </Label>

                            <Input
                                type="password"
                                placeholder="Ingrese la nueva contraseña"
                                value={data.password}
                                onChange={(e) => setData( 'password', e.target.value )}
                            />

                            {errors.password && (<p className="mt-2 text-sm text-red-500">{errors.password}</p>)}
                        </div>

                        <div>
                            <Label>
                                Confirmar contraseña
                            </Label>

                            <Input
                                type="password"
                                placeholder="Confirme la contraseña"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation',e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* BOTONES */}
            <div className="flex justify-end gap-3 border-t pt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                >
                    Cancelar
                </Button>

                <Button type="submit" disabled={processing} >
                    {processing ? 'Actualizando...' : submitLabel}
                </Button>
            </div>
        </form>
    );
}