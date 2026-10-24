import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Clock3,
    Coffee,
    Utensils,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Meal {
    id: number;
    name: string;
    ingredients?: string | null;
    photo_path?: string | null;
}

interface Personnel {
    id: number;
    first_name: string;
    last_name: string;
    id_number?: string | null;
    position?: { name: string } | null;
}

interface MealRequestItem {
    id: number;
    personnel_id: number;
    meal_id: number | null;
    day: string;
    personnel: Personnel | null;
    meal: Meal | null;
}

interface MealRequest {
    id: number;
    week_start: string;
    created_at: string;
    area: { id: number; name: string } | null;
    creator: { name: string } | null;
    monday_meal: Meal | null;
    tuesday_meal: Meal | null;
    wednesday_meal: Meal | null;
    thursday_meal: Meal | null;
    friday_meal: Meal | null;
    items: MealRequestItem[];
}

interface Props {
    mealRequest: MealRequest;
}

const days = [
    { key: 'monday', label: 'Lunes', short: 'LUN' },
    { key: 'tuesday', label: 'Martes', short: 'MAR' },
    { key: 'wednesday', label: 'Miércoles', short: 'MIÉ' },
    { key: 'thursday', label: 'Jueves', short: 'JUE' },
    { key: 'friday', label: 'Viernes', short: 'VIE' },
] as const;

type DayKey = (typeof days)[number]['key'];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Solicitudes de comida', href: route('meal-requests.index') },
    { title: 'Detalle de solicitud', href: '#' },
];

function formatDate(value?: string | null) {
    if (!value) return 'No disponible';

    const date = new Date(`${value.slice(0, 10)}T12:00:00`);

    return date.toLocaleDateString('es-VE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

function getMeal(request: MealRequest, key: DayKey) {
    const meals: Record<DayKey, Meal | null> = {
        monday: request.monday_meal,
        tuesday: request.tuesday_meal,
        wednesday: request.wednesday_meal,
        thursday: request.thursday_meal,
        friday: request.friday_meal,
    };

    return meals[key];
}

function normalizeDate(value: string) {
    return value.slice(0, 10);
}

function getDayDate(weekStart: string, offset: number) {
    const date = new Date(`${normalizeDate(weekStart)}T12:00:00`);
    date.setDate(date.getDate() + offset);

    return date.toLocaleDateString('es-VE', {
        day: '2-digit',
        month: 'short',
    });
}

export default function Show({ mealRequest }: Props) {
    const personnelMap = new Map<number, Personnel>();

    mealRequest.items.forEach((item) => {
        if (item.personnel) {
            personnelMap.set(item.personnel.id, item.personnel);
        }
    });

    const personnel = Array.from(personnelMap.values()).sort((a, b) =>
        `${a.first_name} ${a.last_name}`.localeCompare(
            `${b.first_name} ${b.last_name}`,
            'es',
        ),
    );

    const itemsByPersonAndDay = new Map<string, MealRequestItem>();

    mealRequest.items.forEach((item) => {
        itemsByPersonAndDay.set(
            `${item.personnel_id}-${normalizeDate(item.day)}`,
            item,
        );
    });

    const getPersonMeal = (personnelId: number, dayIndex: number) => {
        const date = new Date(`${normalizeDate(mealRequest.week_start)}T12:00:00`);
        date.setDate(date.getDate() + dayIndex);

        const dateKey = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, '0'),
            String(date.getDate()).padStart(2, '0'),
        ].join('-');

        return itemsByPersonAndDay.get(`${personnelId}-${dateKey}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Solicitud #${mealRequest.id}`} />

            <div className="min-h-screen bg-muted/30">
                <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
                    {/* Encabezado */}
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                                <ClipboardList className="h-6 w-6" />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Solicitudes de comida / Detalle
                                </p>
                                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                                    Solicitud #{mealRequest.id}
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Consulta del menú y las comidas asignadas.
                                </p>
                            </div>
                        </div>

                        <Button variant="outline" asChild>
                            <Link href={route('meal-requests.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver al listado
                            </Link>
                        </Button>
                    </div>

                    {/* Resumen */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-muted-foreground">Área solicitante</p>
                                    <p className="truncate font-semibold">
                                        {mealRequest.area?.name ?? 'Área no disponible'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600">
                                    <CalendarDays className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-muted-foreground">Semana de inicio</p>
                                    <p className="font-semibold">{formatDate(mealRequest.week_start)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-muted-foreground">Trabajadores</p>
                                    <p className="font-semibold">
                                        {personnel.length} {personnel.length === 1 ? 'persona' : 'personas'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-amber-500/10 p-3 text-amber-600">
                                    <Clock3 className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-muted-foreground">Registrada por</p>
                                    <p className="truncate font-semibold">
                                        {mealRequest.creator?.name ?? 'Usuario no disponible'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Menú general */}
                    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                        <div className="flex items-center gap-3 border-b p-5 sm:p-6">
                            <div className="rounded-xl bg-primary/10 p-3 text-primary">
                                <Utensils className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Menú general de la semana</h2>
                                <p className="text-sm text-muted-foreground">
                                    Comidas establecidas para cada día.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-5">
                            {days.map((day, index) => {
                                const meal = getMeal(mealRequest, day.key);

                                return (
                                    <div
                                        key={day.key}
                                        className="group rounded-xl border bg-background p-4 transition-colors hover:border-primary/40"
                                    >
                                        <div className="mb-4 flex items-center justify-between">
                                            <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold tracking-wide text-primary">
                                                {day.short}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {getDayDate(mealRequest.week_start, index)}
                                            </span>
                                        </div>

                                        {meal ? (
                                            <>
                                                <div className="mb-4 overflow-hidden rounded-xl border bg-muted">
                                                    {meal.photo_path ? (
                                                        <img
                                                            src={`/storage/${meal.photo_path.replace(/^\/?storage\//, '')}`}
                                                            alt={meal.name}
                                                            className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
                                                            <Utensils className="h-9 w-9 opacity-40" />
                                                            <span className="text-xs">Sin fotografía</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <h3 className="font-semibold">{meal.name}</h3>

                                                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                                    {meal.ingredients || 'Sin descripción adicional.'}
                                                </p>

                                                <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Menú asignado
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex min-h-32 flex-col items-center justify-center text-center">
                                                <Utensils className="mb-3 h-7 w-7 text-muted-foreground/40" />
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Sin comida asignada
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Asignaciones individuales */}
                    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                        <div className="flex flex-col justify-between gap-3 border-b p-5 sm:flex-row sm:items-center sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-violet-500/10 p-3 text-violet-600">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">Asignaciones por trabajador</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Detalle de comidas de cada persona durante la semana.
                                    </p>
                                </div>
                            </div>

                            <span className="w-fit rounded-full bg-muted px-3 py-1 text-sm font-medium">
                                {personnel.length} trabajadores
                            </span>
                        </div>

                        {personnel.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[850px] text-sm">
                                    <thead className="bg-muted/50 text-left">
                                        <tr>
                                            <th className="px-5 py-4 font-semibold">Trabajador</th>
                                            {days.map((day) => (
                                                <th key={day.key} className="px-4 py-4 font-semibold">
                                                    {day.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y">
                                        {personnel.map((person) => (
                                            <tr key={person.id} className="transition-colors hover:bg-muted/30">
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold">
                                                        {person.first_name} {person.last_name}
                                                    </p>
                                                    {person.id_number && (
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            C.I. {person.id_number}
                                                        </p>
                                                    )}
                                                    {person.position?.name && (
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {person.position.name}
                                                        </p>
                                                    )}
                                                </td>

                                                {days.map((day, index) => {
                                                    const item = getPersonMeal(person.id, index);
                                                    const assignedMeal = item?.meal ?? null;
                                                    const generalMeal = getMeal(mealRequest, day.key);
                                                    const isCustom =
                                                        assignedMeal !== null &&
                                                        assignedMeal.id !== generalMeal?.id;

                                                    return (
                                                        <td key={day.key} className="px-4 py-4 align-top">
                                                            {assignedMeal ? (
                                                                <div className="space-y-1.5">
                                                                    <p className="font-medium">
                                                                        {assignedMeal.name}
                                                                    </p>
                                                                    {isCustom && (
                                                                        <span className="inline-flex rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                                                                            Personalizada
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                                                                    Sin comida
                                                                </span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center px-6 py-14 text-center">
                                <div className="mb-4 rounded-2xl bg-muted p-4">
                                    <Users className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="font-semibold">Sin trabajadores asignados</h3>
                                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                    Esta solicitud no contiene trabajadores con asignaciones registradas.
                                </p>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 border-t bg-muted/20 px-5 py-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                Comida personalizada respecto al menú general
                            </span>
                            <span>Las comidas no asignadas aparecen como «Sin comida».</span>
                        </div>
                    </section>

                    {/* Pie */}
                    <div className="flex flex-col justify-between gap-3 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center">
                        <div>
                            <p className="text-sm font-medium">¿Necesitas modificar esta solicitud?</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Puedes volver al listado para continuar administrándola.
                            </p>
                        </div>

                        <Button variant="outline" asChild>
                            <Link href={route('meal-requests.edit', mealRequest.id)}>
                                Volver a editar
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
