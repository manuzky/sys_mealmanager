
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { Can } from '@/components/can';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { columns, Meal } from './columns';
import { Pagination } from '@/components/pagination';
import { Search } from 'lucide-react';

interface PaginatedMeals {
    data: Meal[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface Props {
    meals: PaginatedMeals;
    filters: {
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Comidas',
        href: '/meals',
    },
];

export default function Index({ meals, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = () => {
        router.get(
            route('meals.index'),
            { search },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Comidas" />

            <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">
                        Comidas
                    </h1>

                    <Can permission="meals.create">
                        <Link href={route('meals.create')}>
                            <Button>
                                Nueva comida
                            </Button>
                        </Link>
                    </Can>
                </div>

                <div className="flex max-w-sm">
                    <Input
                        placeholder="Buscar comida..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                        className="rounded-r-none"
                    />

                    <Button
                        size="icon"
                        onClick={handleSearch}
                        className="rounded-l-none"
                        title="Buscar"
                    >
                        <Search className="h-4 w-4" />
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    data={meals.data}
                />

                <Pagination links={meals.links} />
            </div>
        </AppLayout>
    );
}
