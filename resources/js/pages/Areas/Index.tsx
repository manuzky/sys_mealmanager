
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { Can } from '@/components/can';
import { Pagination } from '@/components/pagination';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { columns, type Area } from './columns';

interface PaginatedAreas {
    data: Area[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    areas: PaginatedAreas;
    filters: { search?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Áreas', href: '/areas' },
];

export default function Index({ areas, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = () => {
        router.get(route('areas.index'), { search }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Áreas" />

            <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Áreas</h1>

                    <Can permission="areas.create">
                        <Link href={route('areas.create')}>
                            <Button>Nueva área</Button>
                        </Link>
                    </Can>
                </div>

                <div className="flex max-w-sm">
                    <Input
                        placeholder="Buscar área..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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

                <DataTable columns={columns} data={areas.data} />
                <Pagination links={areas.links} />
            </div>
        </AppLayout>
    );
}
