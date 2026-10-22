import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { notify } from '@/lib/notify';
import { FormCreate } from './Form';
import { Info } from "lucide-react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";

interface Personnel {
    id: number;
    first_name: string;
    last_name: string;
    email: string | null;
    id_number: string;
    document_type: string;
    position?: {
        id: number;
        name: string;
    } | null;
}

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
    data: any;
    setData: any;
    errors: any;
    processing: boolean;
    personnels: Personnel[];
    roles: Role[];
    permissionGroups: PermissionGroup[];
    onSubmit: (e: React.FormEvent) => void;
    submitLabel: string;
}

export default function Create({
    personnels,
    roles,
    permissionGroups,
}: Props) {

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Usuarios',
            href: '/users',
        },
        {
            title: 'Crear',
            href: '/users/create',
        },
    ];

    const { data, setData, post, processing, errors } = useForm({
        personnel_id: '',
        document_type: 'V',
        document_number: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
        permissions: [] as string[],
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('users.store'), {
            preserveScroll: true,

            onSuccess: () => {
                notify.success(
                    'Usuario creado correctamente'
                );
            },

            onError: () => {
                notify.error(
                    'Revisa los campos marcados'
                );
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Usuario" />

            <div className="p-6 max-w-7xl space-y-6">

                <div className="flex items-center gap-2 mb-4 pl-2">
                    <h1 className="text-xl font-semibold">
                        Crear Usuario
                    </h1>

                    <HoverCard openDelay={200}>
                        <HoverCardTrigger asChild>
                            <button
                                type="button"
                                className="text-red-500 hover:text-red-600 transition-colors"
                            >
                                <Info className="h-5 w-5" />
                            </button>
                        </HoverCardTrigger>

                        <HoverCardContent className="w-96">
                            <div className="space-y-3">
                                <h4 className="font-semibold">
                                    Antes de continuar
                                </h4>

                                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                                    <li>
                                        Los campos marcados con <span className="font-bold text-red-500">*</span> son obligatorios.
                                    </li>
                                    <li>
                                        El nombre de usuario debe ser <strong>único</strong> dentro del sistema.
                                    </li>
                                    <li>
                                        Debe seleccionar un <strong>rol</strong> para asignar sus permisos base.
                                    </li>
                                    <li>
                                        Puede agregar permisos adicionales al usuario sin modificar los permisos del rol.
                                    </li>
                                    <li>
                                        En la lista de <strong>Personal</strong> solo aparecen trabajadores sin usuario asociado.
                                    </li>
                                </ul>
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                </div>

                <FormCreate
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    personnels={personnels}
                    roles={roles}
                    permissionGroups={permissionGroups}
                    onSubmit={submit}
                    submitLabel="Guardar"
                />

            </div>
        </AppLayout>
    );
}