
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import MealRequestForm from './Form';

interface Props {
    areas: { id: number; name: string }[];
    meals: {
        id: number;
        name: string;
        ingredients: string | null;
        photo_path: string | null;
        active: boolean;
    }[];
    personnel: {
        id: number;
        first_name: string;
        last_name: string;
        id_number: string | number | null;
        area_id: number | null;
        position?: { id: number; name: string } | null;
    }[];
    mealRequest: {
        id: number;
        area_id: number;
        week_start: string;
        monday_meal_id: number | null;
        tuesday_meal_id: number | null;
        wednesday_meal_id: number | null;
        thursday_meal_id: number | null;
        friday_meal_id: number | null;
        items: {
            personnel_id: number;
            meal_id: number | null;
            day: string;
        }[];
    };
}

export default function Edit({ mealRequest, ...props }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Solicitudes semanales', href: '/meal-requests' },
        {
            title: 'Editar solicitud',
            href: `/meal-requests/${mealRequest.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar solicitud semanal" />
            <MealRequestForm {...props} mealRequest={mealRequest} />
        </AppLayout>
    );
}
