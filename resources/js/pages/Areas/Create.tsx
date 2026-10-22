
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { notify } from '@/lib/notify';
import Form from './Form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Áreas', href: '/areas' },
    { title: 'Nueva área', href: '/areas/create' },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('areas.store'), {
            preserveScroll: true,
            onSuccess: () => {notify.success('Área creada correctamente.');},
            onError: () => {notify.error('Revisa los datos del formulario.');},
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva área" />
            <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Nueva área</h1>
                    <Link href={route('areas.index')}>
                        <Button variant="outline">Volver</Button>
                    </Link>
                </div>
                <div className="max-w-2xl rounded-xl border p-6">
                    <Form {...{ data, setData, submit, processing, errors }} />
                </div>
            </div>
        </AppLayout>
    );
}
