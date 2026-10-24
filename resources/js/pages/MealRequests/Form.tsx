import { useEffect, useMemo, useState } from 'react';
import { DatePicker } from '@/components/ui/date-picker';
import { Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft, CalendarDays, Check, ChevronDown, ChevronUp, Image as ImageIcon,
    Save, Search, Utensils, Users, X, UserRound
} from 'lucide-react';

type Area = { id: number; name: string };
type Meal = {
    id: number;
    name: string;
    ingredients: string | null;
    photo_path: string | null;
    active: boolean;
};
type Person = {
    id: number;
    first_name: string;
    last_name: string;
    id_number: string | number | null;
    area_id: number | null;
    position?: { id: number; name: string } | null;
};
type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
type Item = {
    personnel_id: number;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
};
type ExistingItem = {
    personnel_id: number;
    meal_id: number | null;
    day: string;
};

type ExistingRequest = {
    id: number;
    area_id: number;
    week_start: string;
    monday_meal_id: number | null;
    tuesday_meal_id: number | null;
    wednesday_meal_id: number | null;
    thursday_meal_id: number | null;
    friday_meal_id: number | null;
    items: ExistingItem[];
};

const days: { key: Day; label: string; short: string }[] = [
    { key: 'monday', label: 'Lunes', short: 'LUN' },
    { key: 'tuesday', label: 'Martes', short: 'MAR' },
    { key: 'wednesday', label: 'Miércoles', short: 'MIÉ' },
    { key: 'thursday', label: 'Jueves', short: 'JUE' },
    { key: 'friday', label: 'Viernes', short: 'VIE' },
];

function localDate(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function mondayOf(date: Date) {
    const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
    return localDate(result);
}

function buildItems( people: Person[], areaId: string, meals: Meal[], existing: ExistingRequest | undefined, weekStart: string ): Item[] {
    if (!areaId) return [];

    return people
        .filter(person => String(person.area_id) === areaId)
        .map(person => {
            const item: Item = {
                personnel_id: person.id,
                monday: '',
                tuesday: '',
                wednesday: '',
                thursday: '',
                friday: '',
            };

            for (const old of (existing?.items ?? []).filter(row => row.personnel_id === person.id)) {
                const start = new Date(`${weekStart}T12:00:00`);
                const target = new Date(`${old.day.slice(0, 10)}T12:00:00`);
                const offset = Math.round((target.getTime() - start.getTime()) / 86400000);
                const day = days[offset]?.key;

                if (day) {
                    item[day] = old.meal_id == null ? '' : String(old.meal_id);
                }
            }

            return item;
        });
}

function photoUrl(meal: Meal) {
    return meal.photo_path ? `/storage/${meal.photo_path.replace(/^\/+/, '')}` : null;
}

export default function MealRequestForm({ areas, meals, personnel, mealRequest }: {
    areas: Area[];
    meals: Meal[];
    personnel: Person[];
    mealRequest?: ExistingRequest;
}) {
    const isEditing = Boolean(mealRequest);
    const initialWeek = mealRequest?.week_start?.slice(0, 10) ?? '';
    const [dayApplied, setDayApplied] = useState(false);
    const [selectedStartDate, setSelectedStartDate] = useState(mealRequest?.week_start?.slice(0, 10) ?? '');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
    const [activeDay, setActiveDay] = useState<Day>('monday');
    const [showOptional, setShowOptional] = useState(false);
    const [expandedPeople, setExpandedPeople] = useState<number[]>([]);
    const [globalMeals, setGlobalMeals] = useState<Record<Day, string>>({
        monday: String(mealRequest?.monday_meal_id ?? ''),
        tuesday: String(mealRequest?.tuesday_meal_id ?? ''),
        wednesday: String(mealRequest?.wednesday_meal_id ?? ''),
        thursday: String(mealRequest?.thursday_meal_id ?? ''),
        friday: String(mealRequest?.friday_meal_id ?? ''),
    });

    const initialAreaId = mealRequest?.area_id != null ? String(mealRequest.area_id) : (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('area_id') ?? '' : '');

    const form = useForm<{ area_id: string; week_start: string; items: Item[] }>({
        area_id: initialAreaId,
        week_start: initialWeek,
        items: buildItems(
            personnel,
            initialAreaId,
            meals,
            mealRequest,
            initialWeek,
        ),
    });

    const selectedPeople = useMemo(
        () => personnel.filter(person => String(person.area_id) === form.data.area_id),
        [personnel, form.data.area_id],
    );
    const filteredPeople = useMemo(() => {
        const query = searchTerm.trim().toLocaleLowerCase();
        if (!query) return selectedPeople;
        return selectedPeople.filter(person =>
            `${person.first_name} ${person.last_name} ${person.id_number ?? ''} ${person.position?.name ?? ''}`
                .toLocaleLowerCase().includes(query),
        );
    }, [selectedPeople, searchTerm]);
    const mealById = (id: string) => meals.find(meal => String(meal.id) === id);
    const itemByPerson = (personId: number) => form.data.items.find(item => item.personnel_id === personId);

    useEffect(() => {if (!form.data.area_id) {form.setData('items', []); return;}
        form.setData(
            'items',
            buildItems(
                personnel,
                form.data.area_id,
                meals,
                mealRequest,
                form.data.week_start,
            ),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data.area_id]);

    function applyDayToAll(day: Day) {
        const mealId = globalMeals[day];

        if (!mealId) return;

        form.setData(
            'items',
            form.data.items.map(item => ({...item, [day]: mealId})),
        );
    }

    function handleApplyDay() {
        applyDayToAll(activeDay);
        setDayApplied(true);
        setTimeout(() => setDayApplied(false), 1800);
    }

    function applyWeekToAll() {
        form.setData('items', form.data.items.map(item => ({ ...item, ...globalMeals })));
    }

    function updateMeal(personnelId: number, day: Day, mealId: string) {
        form.setData('items', form.data.items.map(item =>
            item.personnel_id === personnelId ? { ...item, [day]: mealId } : item,
        ));
    }

    function resetPerson(personnelId: number) {
        form.setData('items', form.data.items.map(item => {
            if (item.personnel_id !== personnelId) return item;
            return { ...item, ...globalMeals };
        }));
    }

    function submit(event: React.FormEvent) {
        event.preventDefault();

        form.transform(data => ({
            ...data,
            global_meals: {
                monday: globalMeals.monday || null,
                tuesday: globalMeals.tuesday || null,
                wednesday: globalMeals.wednesday || null,
                thursday: globalMeals.thursday || null,
                friday: globalMeals.friday || null,
            },
        }));

        const options = {
            onError: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        };

        if (isEditing && mealRequest) {
            form.put(route('meal-requests.update', mealRequest.id), options);
        } else {
            form.post(route('meal-requests.store'), options);
        }
    }

    const inputClass = 'mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15';
    const showGeneralMenu = Boolean(selectedStartDate);
    const showPersonnel = showGeneralMenu && Boolean(form.data.area_id);

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Utensils className="h-4 w-4" />
                        Gestión de alimentación <span>/</span> Solicitudes semanales
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                        {isEditing ? 'Editar solicitud semanal' : 'Planificar menú semanal'}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Organiza las comidas por día y personaliza las asignaciones cuando sea necesario.
                    </p>
                </div>
                <Link href={route('meal-requests.index')} className="inline-flex items-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-muted">
                    <ArrowLeft className="h-4 w-4" /> Volver a solicitudes
                </Link>
            </header>

            {Object.keys(form.errors).length > 0 && (
                <div className="space-y-1 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                    <p className="font-semibold">Revisa los datos del formulario.</p>
                    {Object.entries(form.errors).map(([key, error]) => <p key={key}>{error}</p>)}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:grid-cols-3">
                    {/* Semana */}
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            <CalendarDays size={21} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Semana
                            </p>

                            <DatePicker
                                placeholder="Seleccione una fecha"
                                value={ selectedStartDate ? new Date(`${selectedStartDate}T12:00:00`) : undefined }
                                onChange={(value) => {
                                    if (!value) {
                                        setSelectedStartDate('');
                                        form.setData('week_start', '');
                                        return;
                                    }

                                    const year = value.getFullYear();
                                    const month = String(value.getMonth() + 1).padStart(2, '0');
                                    const date = String(value.getDate()).padStart(2, '0');
                                    const selectedDate = `${year}-${month}-${date}`;

                                    setSelectedStartDate(selectedDate);
                                    form.setData('week_start', mondayOf(value));
                                }}
                            />
                        </div>
                    </div>

                    {/* Área */}
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                            <CalendarDays size={21} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Área
                            </p>

                            <select
                                value={form.data.area_id}
                                onChange={(e) => form.setData('area_id', e.target.value)}
                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            >
                                <option value="">Seleccionar área</option>
                                {areas.map((area) => (
                                    <option key={area.id} value={area.id}>
                                        {area.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    {/* Personal */}
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-violet-50 p-3 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                            <UserRound size={21} />
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Personal
                            </p>

                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                                {selectedPeople.length} trabajadores
                            </p>
                        </div>
                    </div>
                </section>

                {showGeneralMenu && (
                    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 dark:border-slate-800 dark:bg-card">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold">Menú general de la semana</h2>
                                <p className="mt-1 max-w-3xl text-sm text-slate-500">
                                    Selecciona la comida de cada día. La estructura está preparada para incorporar ensaladas, bebidas, acompañantes y postres cuando estén disponibles en el sistema.
                                </p>
                            </div>

                            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                Aplicación general
                            </span>
                        </div>

                        {!meals.length ? (
                            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                                No hay comidas activas disponibles. Registra o activa comidas antes de continuar.
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {days.map((day, index) => {
                                        const startDate = selectedStartDate ? new Date(`${selectedStartDate}T12:00:00`) : null;

                                        if (startDate) {
                                            startDate.setDate(startDate.getDate() + index);
                                        }

                                        const dateLabel = startDate ? startDate.toLocaleDateString('es-VE', { day: '2-digit', month: 'short'}) : 'Sin fecha';

                                        return (
                                            <button
                                                key={day.key}
                                                type="button"
                                                onClick={() => setActiveDay(day.key)}
                                                className={`min-w-[105px] rounded-xl border px-4 py-3 text-left transition ${
                                                    activeDay === day.key
                                                        ? 'border-emerald-700 bg-emerald-700 text-white shadow-sm'
                                                        : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-card dark:hover:bg-muted'
                                                }`}
                                            >
                                                <span className="block text-sm font-semibold">
                                                    {startDate ? startDate.toLocaleDateString('es-VE', {weekday: 'long'}).replace(/^./, letter => letter.toUpperCase()) : day.label}
                                                </span>

                                                <span className={`mt-0.5 block text-xs ${activeDay === day.key ? 'text-emerald-100' : 'text-slate-500'}`}>
                                                    {dateLabel}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
                                    {(() => {
                                        const meal = mealById(globalMeals[activeDay]);
                                        const photo = meal ? photoUrl(meal) : null;

                                        return (
                                            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                                                <button
                                                    type="button"
                                                    onClick={() => meal && setSelectedMeal(meal)}
                                                    disabled={!meal}
                                                    className="group relative block h-52 w-full overflow-hidden bg-muted text-left sm:h-64"
                                                >
                                                    {photo ? (
                                                        <img
                                                            src={photo}
                                                            alt={meal?.name ?? ''}
                                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                                                            <ImageIcon className="h-9 w-9" />
                                                            <span className="text-sm">Sin comida seleccionada</span>
                                                        </div>
                                                    )}

                                                    <span className="absolute bottom-3 right-3 rounded-full bg-black/65 p-2 text-white">
                                                        <ImageIcon className="h-4 w-4" />
                                                    </span>
                                                </button>

                                                <div className="space-y-3 p-4">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                                            Comida principal
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() => meal && setSelectedMeal(meal)}
                                                            disabled={!meal}
                                                            className="text-sm font-semibold text-emerald-700 hover:underline disabled:opacity-50 dark:text-emerald-400"
                                                        >
                                                            Ver ingredientes
                                                        </button>
                                                    </div>

                                                    <select
                                                        value={globalMeals[activeDay]}
                                                        onChange={event => setGlobalMeals(prev => ({ ...prev, [activeDay]: event.target.value, }))}
                                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-background dark:text-foreground"
                                                    >
                                                        <option value="">Seleccionar comida...</option>

                                                        {meals.map(option => (
                                                            <option key={option.id} value={option.id}>
                                                                {option.name}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    <p className="text-sm text-slate-500">
                                                        {meal ? meal.ingredients || 'No hay ingredientes registrados para esta comida.' : 'Selecciona una comida para consultar sus ingredientes.'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold">Complementos del día</h3>
                                            <span className="text-xs text-slate-500">
                                                {days.find(day => day.key === activeDay)?.label}
                                            </span>
                                        </div>

                                        {(['Ensalada', 'Bebida'] as const).map(category => (
                                            <div
                                                key={category}
                                                className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 opacity-75 dark:border-slate-700"
                                            >
                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800">
                                                    <Utensils className="h-5 w-5" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        {category}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        Pendiente de catálogo
                                                    </p>
                                                </div>

                                                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500 dark:bg-slate-800">
                                                    Próximamente
                                                </span>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => setShowOptional(prev => !prev)}
                                            className="flex w-full items-center justify-between rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-muted"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Utensils className="h-4 w-4" />
                                                {showOptional ? 'Ocultar postre opcional' : 'Agregar / mostrar postre opcional'}
                                            </span>

                                            <ChevronDown
                                                className={`h-4 w-4 transition-transform ${showOptional ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {showOptional && (
                                            <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800">
                                                    <Utensils className="h-5 w-5" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Postre opcional
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        Pendiente de catálogo
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleApplyDay}
                                            disabled={!form.data.area_id || !selectedPeople.length || !globalMeals[activeDay]}
                                            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                                                dayApplied ? 'scale-[0.98] bg-emerald-500' : 'bg-emerald-700 hover:bg-emerald-800 active:scale-[0.97]'
                                            }`}
                                        >
                                            {dayApplied ? (
                                                <>
                                                    <Check className="h-5 w-5 animate-bounce" />
                                                    ¡Menú aplicado!
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="h-4 w-4 transition-transform duration-200 group-active:scale-125" />
                                                    Aplicar menú del {days.find(day => day.key === activeDay)?.label.toLowerCase()} a todos
                                                </>
                                            )}
                                        </button>

                                        <p className="text-xs leading-5 text-slate-500">
                                            Cada día comienza sin comida seleccionada. Al aplicar el menú, los trabajadores usarán la comida general de ese día.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </section>
                )}

                {showPersonnel && (
                    <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-primary/10 p-3 text-primary"><Users className="h-5 w-5" /></div>
                                <div><h2 className="font-semibold">Trabajadores y excepciones</h2><p className="text-sm text-muted-foreground">Modifica la comida de una persona sin cambiar el menú general.</p></div>
                            </div>
                            <div className="flex flex-wrap gap-2 text-sm">
                                <span className="rounded-full bg-muted px-3 py-1.5"><strong>{selectedPeople.length}</strong> trabajadores</span>
                                <span className="rounded-full border border-amber-400/50 bg-amber-50 px-3 py-1.5 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300">Excepción = comida diferente</span>
                            </div>
                        </div>

                        {!form.data.area_id ? (
                            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Selecciona un área para ver sus trabajadores.</div>
                        ) : !selectedPeople.length ? (
                            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No hay trabajadores asociados a esta área.</div>
                        ) : (
                            <>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input type="search" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Buscar por nombre, cédula o cargo..." className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                                </div>
                                <div className="space-y-3">
                                    {filteredPeople.map(person => {
                                        const item = itemByPerson(person.id);
                                        if (!item) return null;
                                        const isExpanded = expandedPeople.includes(person.id);
                                        const exceptions = days.filter(day => item[day.key] !== globalMeals[day.key]).length;
                                        return (
                                            <article key={person.id} className={`overflow-hidden rounded-xl border transition ${exceptions ? 'border-amber-400/60' : ''}`}>
                                                <button type="button" onClick={() => setExpandedPeople(prev => isExpanded ? prev.filter(id => id !== person.id) : [...prev, person.id])} className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-muted/40">
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">{person.first_name.charAt(0)}{person.last_name.charAt(0)}</div>
                                                        <div className="min-w-0"><p className="truncate font-semibold">{person.first_name} {person.last_name}</p><p className="truncate text-sm text-muted-foreground">{person.id_number ? `C.I. ${person.id_number}` : 'Sin cédula'}{person.position?.name ? ` · ${person.position.name}` : ''}</p></div>
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-3">
                                                        {exceptions > 0 ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">{exceptions} {exceptions === 1 ? 'excepción' : 'excepciones'}</span> : <span className="hidden rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground sm:inline">Menú general</span>}
                                                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                                    </div>
                                                </button>
                                                {isExpanded && (
                                                    <div className="border-t bg-muted/20 p-4">
                                                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><p className="text-sm text-muted-foreground">Comida asignada para cada día</p><button type="button" onClick={() => resetPerson(person.id)} className="text-xs font-semibold text-primary hover:underline">Restablecer menú general</button></div>
                                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                                            {days.map(day => {
                                                                const meal = mealById(item[day.key]);
                                                                const photo = meal ? photoUrl(meal) : null;
                                                                const differs = item[day.key] !== globalMeals[day.key];
                                                                return (
                                                                    <div key={day.key} className={`overflow-hidden rounded-xl border bg-background ${differs ? 'border-amber-400/70' : ''}`}>
                                                                        <div className="flex items-center justify-between gap-2 px-3 py-2"><span className="text-sm font-semibold">{day.label}</span>{differs && <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">Excepción</span>}</div>
                                                                        <button type="button" onClick={() => meal && setSelectedMeal(meal)} disabled={!meal} className="block aspect-[16/9] w-full overflow-hidden bg-muted">
                                                                            {photo ? <img src={photo} alt={meal?.name ?? ''} className="h-full w-full object-cover transition hover:scale-105" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><ImageIcon className="h-6 w-6" /></div>}
                                                                        </button>
                                                                        <div className="space-y-2 p-3"><p className="min-h-10 line-clamp-2 text-sm font-medium">{meal?.name ?? 'Sin asignar'}</p>
                                                                            <select
                                                                                aria-label={`${day.label}: comida de ${person.first_name} ${person.last_name}`}
                                                                                className="h-10 w-full rounded-lg border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                                                                                value={item[day.key]}
                                                                                onChange={event => updateMeal(person.id, day.key, event.target.value)}
                                                                            >
                                                                                <option value="">— Sin asignar —</option>
                                                                                {meals.map(option => (
                                                                                    <option key={option.id} value={option.id}>
                                                                                        {option.name}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                            {meal && <button type="button" onClick={() => setSelectedMeal(meal)} className="text-xs font-medium text-primary hover:underline">Ver ingredientes</button>}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </article>
                                        );
                                    })}
                                    {!filteredPeople.length && <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No hay trabajadores que coincidan con la búsqueda.</p>}
                                </div>
                            </>
                        )}
                    </section>
                )}

                <div className="flex flex-wrap justify-end gap-3 border-t pt-5">
                    <Link href={route('meal-requests.index')} className="rounded-xl border px-5 py-2.5 text-sm font-medium transition hover:bg-muted">Cancelar</Link>
                    <button type="submit" disabled={form.processing || !selectedPeople.length || !meals.length} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50">
                        <Save className="h-4 w-4" /> {form.processing ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Registrar solicitud'}
                    </button>
                </div>
            </form>

            {selectedMeal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" onClick={() => setSelectedMeal(null)}>
                    <div role="dialog" aria-modal="true" aria-label={`Detalles de ${selectedMeal.name}`} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-background shadow-2xl" onClick={event => event.stopPropagation()}>
                        <div className="flex items-center justify-between border-b p-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Detalle del menú</p><h2 className="text-lg font-semibold">{selectedMeal.name}</h2></div><button type="button" onClick={() => setSelectedMeal(null)} className="rounded-full p-2 transition hover:bg-muted" aria-label="Cerrar"><X className="h-5 w-5" /></button></div>
                        {photoUrl(selectedMeal) ? <img src={photoUrl(selectedMeal)!} alt={selectedMeal.name} className="max-h-[50vh] w-full bg-muted object-contain" /> : <div className="flex h-48 items-center justify-center gap-3 bg-muted text-muted-foreground"><ImageIcon className="h-10 w-10" />Sin fotografía</div>}
                        <div className="space-y-3 p-5"><div><h3 className="mb-1 text-sm font-semibold">Ingredientes</h3><p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">{selectedMeal.ingredients || 'No se han registrado ingredientes.'}</p></div><div className="flex justify-end"><button type="button" onClick={() => setSelectedMeal(null)} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Cerrar</button></div></div>
                    </div>
                </div>
            )}
        </div>
    );
}
