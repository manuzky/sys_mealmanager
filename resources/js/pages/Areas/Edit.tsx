
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { notify } from '@/lib/notify';
import Form from './Form';

interface Props {
    area: { id: number; name: string; description: string | null };
}

export default function Edit({ area }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: area.name,
        description: area.description ?? '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Áreas', href: '/areas' },
        { title: 'Editar área', href: `/areas/${area.id}/edit` },
    ];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('areas.update', area.id), {
            preserveScroll: true,
            onSuccess: () => {notify.success('Área actualizada correctamente.');},
            onError: () => {notify.error('Revisa los datos del formulario.');},
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar área" />
            <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Editar área</h1>
                    <Link href={route('areas.index')}>
                        <Button variant="outline">Volver</Button>
                    </Link>
                </div>
                <div className="max-w-2xl rounded-xl border p-6">
                    <Form
                        data={data}
                        setData={setData}
                        submit={submit}
                        processing={processing}
                        errors={errors}
                        submitLabel="Guardar cambios"
                    />
                </div>
            </div>
        </AppLayout>
    );
}
