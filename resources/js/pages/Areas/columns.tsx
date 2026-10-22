
import { type ColumnDef } from '@tanstack/react-table';
import { router, Link } from '@inertiajs/react';
import { Building2, Pencil, Power, PowerOff, Trash2 } from 'lucide-react';
import { Can } from '@/components/can';
import { notify } from '@/lib/notify';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from '@/components/ui/alert-dialog';

export interface Area {
    id: number;
    name: string;
    description: string | null;
    active: boolean;
    personnels_count: number;
}

export const columns: ColumnDef<Area>[] = [
    {
        accessorKey: 'name',
        header: 'Nombre',
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{row.original.name}</span>
            </div>
        ),
    },
    {
        accessorKey: 'description',
        header: 'Descripción',
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {row.original.description || '—'}
            </span>
        ),
    },
    {
        accessorKey: 'personnels_count',
        header: 'Personal asignado',
        cell: ({ row }) => (
            <span className="inline-flex min-w-8 justify-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                {row.original.personnels_count}
            </span>
        ),
    },
    {
        accessorKey: 'active',
        header: () => <div className="text-right">Estado</div>,
        cell: ({ row }) => {
            const active = row.original.active;

            return (
                <div className="flex justify-end">
                    <span className={`rounded px-2 py-1 text-xs ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {active ? 'Activa' : 'Inactiva'}
                    </span>
                </div>
            );
        },
    },
    {
        id: 'actions',
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => {
            const area = row.original;

            return (
                <div className="flex items-center justify-end gap-2">
                    <Can permission="areas.edit">
                        <Link
                            href={route('areas.edit', area.id)}
                            title="Editar área"
                            className="
                                inline-flex h-9 w-9 items-center justify-center
                                rounded-md border bg-background text-yellow-600
                                transition-colors hover:border-yellow-300
                                hover:bg-yellow-50 hover:text-yellow-700
                            "
                        >
                            <Pencil className="h-4 w-4" />
                        </Link>
                    </Can>

                    <Can permission="areas.toggle-status">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button
                                    type="button"
                                    title={area.active ? 'Desactivar área' : 'Activar área'}
                                    className={`
                                        group inline-flex h-9 w-9 items-center justify-center
                                        rounded-md border bg-background transition-colors
                                        ${
                                            area.active
                                                ? 'text-green-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600'
                                                : 'text-red-600 hover:border-green-300 hover:bg-green-50 hover:text-green-600'
                                        }
                                    `}
                                >
                                    {area.active ? (
                                        <>
                                            <Power className="h-4 w-4 group-hover:hidden" />
                                            <PowerOff className="hidden h-4 w-4 group-hover:block" />
                                        </>
                                    ) : (
                                        <>
                                            <PowerOff className="h-4 w-4 group-hover:hidden" />
                                            <Power className="hidden h-4 w-4 group-hover:block" />
                                        </>
                                    )}
                                </button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        {area.active ? '¿Desactivar área?' : '¿Activar área?'}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {area.active
                                            ? `El área "${area.name}" quedará inactiva. No estará disponible para nuevas asignaciones mientras permanezca desactivada.`
                                            : `El área "${area.name}" volverá a estar disponible para asignaciones.`}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => {
                                            router.patch(
                                                route('areas.toggle-status', area.id),
                                                {},
                                                {
                                                    preserveScroll: true,
                                                    onSuccess: () => {notify.success(area.active ? 'Área desactivada correctamente.' : 'Área activada correctamente.');},
                                                    onError: () => {notify.error('No se pudo cambiar el estado del área.');},
                                                }
                                            );
                                        }}
                                    >
                                        {area.active ? 'Desactivar área' : 'Activar área'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </Can>

                    <Can permission="areas.delete">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button
                                    type="button"
                                    title="Eliminar área"
                                    className="
                                        inline-flex h-9 w-9 items-center justify-center
                                        rounded-md border bg-background text-red-600
                                        transition-colors hover:border-red-300
                                        hover:bg-red-50 hover:text-red-700
                                    "
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar área?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        ¿Seguro que deseas eliminar el área "{area.name}"?
                                        Esta acción no se puede deshacer. Si tiene personal
                                        asignado, no podrá eliminarse.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => {
                                            router.delete(
                                                route('areas.destroy', area.id),
                                                {
                                                    preserveScroll: true,
                                                    onSuccess: () => {notify.success('Área eliminada correctamente.');},
                                                    onError: () => {notify.error('No se pudo eliminar el área.');},
                                                }
                                            );
                                        }}
                                    >
                                        Eliminar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </Can>
                </div>
            );
        },
    },
];
