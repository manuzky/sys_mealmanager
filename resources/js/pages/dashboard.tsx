import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Users, Utensils } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

type Area = {
    id: number;
    name: string;
    description: string | null;
    personnels_count: number;
};

type Props = {
    areas: Area[];
};

const colors = [
    {
        bar: 'bg-emerald-500',
        icon: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        button: 'hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300',
    },
    {
        bar: 'bg-blue-500',
        icon: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        button: 'hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/50 dark:hover:text-blue-300',
    },
    {
        bar: 'bg-violet-500',
        icon: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
        button: 'hover:border-violet-500 hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950/50 dark:hover:text-violet-300',
    },
    {
        bar: 'bg-amber-500',
        icon: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        button: 'hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/50 dark:hover:text-amber-300',
    },
    {
        bar: 'bg-rose-500',
        icon: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
        button: 'hover:border-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50 dark:hover:text-rose-300',
    },
];

export default function Dashboard({ areas }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <header>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Planificación de comidas
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Selecciona un área para preparar su menú semanal.
                    </p>
                </header>

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold">
                            Áreas de trabajo
                        </h2>
                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                            {areas.length} {areas.length === 1 ? 'área' : 'áreas'}
                        </span>
                    </div>

                    {areas.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-8 text-center">
                            <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                            <h3 className="font-semibold">No hay áreas disponibles</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Las áreas activas aparecerán aquí.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {areas.map((area, index) => {
                                const color = colors[index % colors.length];

                                return (
                                    <article
                                        key={area.id}
                                        className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <div className={`h-1 ${color.bar}`} />

                                        <div className="flex flex-1 flex-col p-4">
                                            <div className="mb-3 flex items-center justify-between">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color.icon}`}>
                                                    <Utensils className="h-5 w-5" />
                                                </div>

                                                <span className="text-xs font-medium text-muted-foreground">
                                                    Área #{area.id}
                                                </span>
                                            </div>

                                            <h3 className="text-base font-semibold leading-snug">
                                                {area.name}
                                            </h3>

                                            <p className="mt-1 line-clamp-2 min-h-10 text-sm text-muted-foreground">
                                                {area.description || 'Sin descripción registrada.'}
                                            </p>

                                            <div className="mt-3 flex items-center gap-2 text-sm">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-semibold">
                                                    {area.personnels_count}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {area.personnels_count === 1
                                                        ? 'trabajador'
                                                        : 'trabajadores'}
                                                </span>
                                            </div>

                                            <div className="mt-4 border-t pt-3">
                                                <Link
                                                    href={`/meal-requests/create?area_id=${area.id}`}
                                                    className={`inline-flex w-full items-center justify-between rounded-lg border border-transparent px-3 py-2 text-sm font-semibold transition-colors ${color.button}`}
                                                >
                                                    Crear planificación
                                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </AppLayout>
    );
}