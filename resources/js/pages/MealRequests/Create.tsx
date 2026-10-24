
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import MealRequestForm from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Solicitudes semanales', href: '/meal-requests' },
    { title: 'Nueva solicitud', href: '/meal-requests/create' },
];

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
}

export default function Create(props: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva solicitud semanal" />
            <MealRequestForm {...props} />
        </AppLayout>
    );
}
