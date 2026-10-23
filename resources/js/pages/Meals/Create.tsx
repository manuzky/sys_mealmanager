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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Comidas', href: '/meals' },
    { title: 'Crear', href: '/meals/create' },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        ingredients: string;
        photo: File | null;
    }>({
        name: '',
        ingredients: '',
        photo: null,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();

        post(route('meals.store'), {
            forceFormData: true,
            onSuccess: () => {
                notify.success('Comida creada correctamente');
            },
            onError: () => {
                notify.error('Revisa los datos del formulario');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear comida" />

            <div className="w-full p-6 lg:p-8">
                <div className="mb-4 flex items-center gap-2 pl-2">
                    <h1 className="text-xl font-semibold">Crear comida</h1>

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
                    submitLabel="Guardar"
                />
            </div>
        </AppLayout>
    );
}