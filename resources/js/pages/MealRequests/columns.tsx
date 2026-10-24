
import { Link } from '@inertiajs/react';
import { CalendarDays, Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Area {
    id: number;
    name: string;
}

export interface MealRequest {
    id: number;
    area_id: number;
    week_start: string;
    area: Area | null;
    creator: { name: string } | null;
    created_at: string;
}

export function formatDate(date: string) {
    return new Date(`${date.slice(0, 10)}T12:00:00`).toLocaleDateString(
        'es-VE',
        {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        },
    );
}

export const columns = [
    {
        key: 'area',
        header: 'Área',
        render: (item: MealRequest) => (
            <span className="font-medium">
                {item.area?.name ?? 'Área no disponible'}
            </span>
        ),
    },
    {
        key: 'week_start',
        header: 'Semana',
        render: (item: MealRequest) => (
            <span className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-2.5 py-1.5 text-primary">
                <CalendarDays className="h-4 w-4" />
                {formatDate(item.week_start)}
            </span>
        ),
    },
    {
        key: 'creator',
        header: 'Registrada por',
        render: (item: MealRequest) => (
            <span className="text-muted-foreground">
                {item.creator?.name ?? 'Usuario no disponible'}
            </span>
        ),
    },
    {
        key: 'created_at',
        header: 'Fecha de registro',
        render: (item: MealRequest) => (
            <span className="text-muted-foreground">
                {formatDate(item.created_at)}
            </span>
        ),
    },
    {
        key: 'actions',
        header: 'Acciones',
        className: 'text-right',
        render: (item: MealRequest) => (
            <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                    <Link href={route('meal-requests.show', item.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                    </Link>
                </Button>

                <Button variant="outline" size="sm" asChild>
                    <Link href={route('meal-requests.edit', item.id)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                    </Link>
                </Button>
            </div>
        ),
    },
];
