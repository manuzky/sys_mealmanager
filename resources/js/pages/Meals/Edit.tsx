import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { notify } from '@/lib/notify';
import { Info } from 'lucide-react';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';
import Form from './Form';

interface Meal {
    id: number;
    name: string;
    ingredients: string;
    photo_path: string | null;
    active: boolean;
}

interface Props {
    meal: Meal;
}

export default function Edit({ meal }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Comidas', href: '/meals' },
        { title: 'Editar', href: route('meals.edit', meal.id) },
    ];

    const { data, setData, put, processing, errors } = useForm<{
        name: string;
        ingredients: string;
        photo: File | null;
    }>({
        name: meal.name ?? '',
        ingredients: meal.ingredients ?? '',
        photo: null,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();

        put(route('meals.update', meal.id), {
            forceFormData: true,
            onSuccess: () => {
                notify.success('Comida actualizada correctamente');
            },
            onError: () => {
                notify.error('Revisa los datos del formulario');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar comida" />

            <div className="w-full p-6 lg:p-8">
                <div className="mb-4 flex items-center gap-2 pl-2">
                    <h1 className="text-xl font-semibold">Editar comida</h1>

                    <HoverCard openDelay={200}>
                        <HoverCardTrigger asChild>
                            <button
                                type="button"
                                className="text-red-500 transition-colors hover:text-red-600"
                            >
                                <Info className="h-5 w-5" />
                            </button>
                        </HoverCardTrigger>

                        <HoverCardContent className="w-72">
                            <p className="text-sm text-muted-foreground">
                                Los campos marcados con{' '}
                                <span className="font-bold text-red-500">*</span>{' '}
                                son obligatorios.
                            </p>
                        </HoverCardContent>
                    </HoverCard>
                </div>

                <Form
                    data={data}
                    setData={setData}
                    submit={submit}
                    processing={processing}
                    errors={errors}
                    currentPhoto={meal.photo_path}
                    submitLabel="Actualizar"
                />
            </div>
        </AppLayout>
    );
}