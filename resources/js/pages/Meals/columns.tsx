
import { ColumnDef } from '@tanstack/react-table';
import { Link, router } from '@inertiajs/react';
import { Pencil, LockKeyhole, LockKeyholeOpen, } from 'lucide-react';
import { notify } from '@/lib/notify';
import { Can } from '@/components/can';
import { useState } from 'react';
import { Image } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export interface Meal {
    id: number;
    name: string;
    ingredients: string;
    photo_path: string | null;
    active: boolean;
}

function toggleActive(meal: Meal) {
    router.patch(
        route('meals.toggle-active', meal.id),
        {},
        {
            preserveScroll: true,
            onSuccess: () => {notify.success(`La comida ha sido ${meal.active ? 'desactivada' : 'activada'} correctamente.`);},
            onError: () => {notify.error('No se pudo cambiar el estado de la comida.');},
        },
    );
}

function MealPhoto({ meal }: { meal: Meal }) {
    const [open, setOpen] = useState(false);

    if (!meal.photo_path) {
        return (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <Image className="h-6 w-6" />
            </div>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                title="Ampliar fotografía"
                className="group relative block overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md"
            >
                <img
                    src={`/storage/${meal.photo_path}`}
                    alt={meal.name}
                    className="h-16 w-16 object-cover transition-transform duration-200 group-hover:scale-110 sm:h-20 sm:w-20"
                />
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setOpen(false)} >
                    <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Cerrar fotografía"
                            className="absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground shadow-lg transition-colors hover:bg-muted"
                        >
                            <span className="text-xl leading-none">×</span>
                        </button>

                        <img
                            src={`/storage/${meal.photo_path}`}
                            alt={meal.name}
                            className="max-h-[85vh] max-w-[90vw] rounded-xl border border-white/20 object-contain shadow-2xl"
                        />

                        <p className="mt-3 text-center text-sm font-medium text-white">
                            {meal.name}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}

export const columns: ColumnDef<Meal>[] = [
    {
        accessorKey: 'photo_path',
        header: 'Foto',
        cell: ({ row }) => {
            const meal = row.original;

            return <MealPhoto meal={meal} />;
        },
    },
    {
        accessorKey: 'name',
        header: 'Nombre',
    },
    {
        accessorKey: 'ingredients',
        header: 'Ingredientes',
        cell: ({ row }) => (
            <div className="max-w-xs truncate" title={row.original.ingredients}>
                {row.original.ingredients}
            </div>
        ),
    },
    {
        id: 'status',
        header: () => <div className="text-right">Estado</div>,
        cell: ({ row }) => {
            const active = row.original.active;

            return (
                <div className="flex justify-end">
                    <span className={`rounded px-2 py-1 text-xs ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
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
            const meal = row.original;

            return (
                <div className="flex items-center justify-end gap-2">
                    <Can permission="meals.edit">
                        <Link
                            href={route('meals.edit', meal.id)}
                            title="Editar"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background text-yellow-600 transition-all hover:border-yellow-300 hover:bg-yellow-50 hover:text-yellow-700"
                        >
                            <Pencil className="h-4 w-4" />
                        </Link>
                    </Can>

                    <Can permission="meals.toggle-status">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button
                                    type="button"
                                    title={meal.active ? 'Desactivar' : 'Activar'}
                                    className={`group inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background transition-colors ${
                                        meal.active
                                            ? 'text-green-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600'
                                            : 'text-red-600 hover:border-green-300 hover:bg-green-50 hover:text-green-600'
                                    }`}
                                >
                                    {meal.active ? (
                                        <>
                                            <LockKeyholeOpen className="h-4 w-4 group-hover:hidden" />
                                            <LockKeyhole className="hidden h-4 w-4 group-hover:block" />
                                        </>
                                    ) : (
                                        <>
                                            <LockKeyhole className="h-4 w-4 group-hover:hidden" />
                                            <LockKeyholeOpen className="hidden h-4 w-4 group-hover:block" />
                                        </>
                                    )}
                                </button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        {meal.active ? '¿Desactivar comida?' : '¿Activar comida?'}
                                    </AlertDialogTitle>

                                    <AlertDialogDescription>
                                        {meal.active
                                            ? 'La comida dejará de estar disponible para nuevas solicitudes. Las solicitudes anteriores se conservarán.'
                                            : 'La comida volverá a estar disponible para nuevas solicitudes.'}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancelar
                                    </AlertDialogCancel>

                                    <AlertDialogAction onClick={() => toggleActive(meal)} >
                                        {meal.active
                                            ? 'Desactivar comida'
                                            : 'Activar comida'}
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
