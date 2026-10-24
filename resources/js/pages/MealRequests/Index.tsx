
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { Search, ClipboardList, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/pagination';
import { columns, type Area, type MealRequest } from './columns';

interface Props {
    requests: {
        data: MealRequest[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    areas: Area[];
    filters: {
        area_id?: string;
        week_start?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Solicitudes semanales', href: '/meal-requests' },
];

export default function Index({ requests, areas, filters }: Props) {
    const [areaId, setAreaId] = useState(filters.area_id ?? '');
    const [weekStart, setWeekStart] = useState(filters.week_start ?? '');

    function search(e: React.FormEvent) {
        e.preventDefault();

        router.get(
            route('meal-requests.index'),
            { area_id: areaId, week_start: weekStart },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    function clearFilters() {
        setAreaId('');
        setWeekStart('');

        router.get(route('meal-requests.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Solicitudes semanales" />

            <div className="w-full space-y-6 p-6 lg:p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <ClipboardList className="h-6 w-6" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Solicitudes semanales
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Planificación de comidas por área y semana.
                            </p>
                        </div>
                    </div>

                    <Button asChild>
                        <Link href={route('meal-requests.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva solicitud
                        </Link>
                    </Button>
                </div>

                <form
                    onSubmit={search}
                    className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm md:flex-row md:items-end"
                >
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">Área</label>
                        <select
                            value={areaId}
                            onChange={e => setAreaId(e.target.value)}
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                        >
                            <option value="">Todas las áreas</option>
                            {areas.map(area => (
                                <option key={area.id} value={area.id}>
                                    {area.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">
                            Inicio de semana
                        </label>
                        <input
                            type="date"
                            value={weekStart}
                            onChange={e => setWeekStart(e.target.value)}
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit">
                            <Search className="mr-2 h-4 w-4" />
                            Buscar
                        </Button>
                        <Button type="button" variant="outline" onClick={clearFilters}>
                            Limpiar
                        </Button>
                    </div>
                </form>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="border-b px-5 py-4">
                        <h2 className="font-semibold">Historial de solicitudes</h2>
                        <p className="text-sm text-muted-foreground">
                            {requests.data.length} solicitudes en esta página.
                        </p>
                    </div>

                    {requests.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        {columns.map(column => (
                                            <th
                                                key={column.key}
                                                className={`px-5 py-3 font-medium ${column.className ?? ''}`}
                                            >
                                                {column.header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {requests.data.map(item => (
                                        <tr
                                            key={item.id}
                                            className="transition-colors hover:bg-muted/30"
                                        >
                                            {columns.map(column => (
                                                <td
                                                    key={column.key}
                                                    className={`px-5 py-4 ${column.className ?? ''}`}
                                                >
                                                    {column.render(item)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                <ClipboardList className="h-7 w-7 text-muted-foreground" />
                            </div>

                            <h3 className="font-semibold">
                                No hay solicitudes registradas
                            </h3>
                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                Cuando registres la planificación de un área,
                                aparecerá aquí.
                            </p>

                            <Button asChild className="mt-4">
                                <Link href={route('meal-requests.create')}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Crear solicitud
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                <Pagination links={requests.links} />
            </div>
        </AppLayout>
    );
}
