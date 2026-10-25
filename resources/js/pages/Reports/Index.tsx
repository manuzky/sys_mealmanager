import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { CalendarDays, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    weeks: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reportes', href: route('reports.index') },
];

function formatDate(value: string) {
    return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString(
        'es-VE',
        { day: '2-digit', month: 'long', year: 'numeric' },
    );
}

export default function Index({ weeks }: Props) {
    const [weekStart, setWeekStart] = useState(weeks[0] ?? '');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reportes" />

            <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Reportes
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Genera documentos para la planificación y el control de comidas.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <section className="rounded-2xl border bg-card p-6 shadow-sm">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <FileText className="h-6 w-6" />
                        </div>

                        <h2 className="text-lg font-bold">
                            Reporte para el chef
                        </h2>

                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            Consolidado de comidas por día y área, con las
                            cantidades que deben prepararse y los trabajadores
                            asignados a cada comida.
                        </p>

                        <div className="mt-6 space-y-2">
                            <label
                                htmlFor="week_start"
                                className="text-sm font-medium"
                            >
                                Semana de la solicitud
                            </label>

                            <div className="relative">
                                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                <select
                                    id="week_start"
                                    value={weekStart}
                                    onChange={(event) =>
                                        setWeekStart(event.target.value)
                                    }
                                    className="h-11 w-full rounded-md border bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                >
                                    {weeks.length === 0 && (
                                        <option value="">
                                            No hay semanas registradas
                                        </option>
                                    )}

                                    {weeks.map((week) => (
                                        <option key={week} value={week}>
                                            Semana desde {formatDate(week)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <Button className="mt-5 w-full" disabled={!weekStart} asChild>
                            <a
                                href={route('reports.meals.chef.pdf', { week_start: weekStart })}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Ver reporte PDF
                            </a>
                        </Button>
                    </section>

                    <section className="rounded-2xl border border-dashed bg-muted/20 p-6">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                            <CalendarDays className="h-6 w-6" />
                        </div>

                        <h2 className="text-lg font-bold">
                            Reportes de comidas entregadas
                        </h2>

                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            En esta sección construiremos los reportes de
                            entregas reales, cantidades servidas y diferencias
                            respecto a las comidas planificadas.
                        </p>

                        <div className="mt-6 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                            Pendiente de implementación.
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}