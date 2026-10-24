import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Can } from '@/components/can';
import {
    ArrowLeft,
    Pencil,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    User,
    IdCard,
    Cake,
    Venus,
    Mars,
    Heart,
    Building2,
    CalendarDays,
    Contact,
} from 'lucide-react';

interface Position {
    id: number;
    name: string;
}

interface Area {
    id: number;
    name: string;
}

interface Personnel {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    document_type: string;
    id_number: string;
    email: string | null;
    birth_date: string | null;
    gender: string;
    marital_status: string;
    phone: string | null;
    secondary_phone: string | null;
    address: string | null;
    status: string;
    photo: string | null;
    position?: Position | null;
    area?: Area | null;
}

interface Props {
    personnel: Personnel;
}

const formatDate = (date?: string | null) => {
    if (!date) return 'No registrada';

    const [year, month, day] = date.split('-').map(Number);

    return new Date(year, month - 1, day).toLocaleDateString('es-VE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};

const getAge = (date?: string | null) => {
    if (!date) return null;

    const [year, month, day] = date.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    if (
        today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    return `${age} años`;
};

const formatPhone = (phone?: string | null) => {
    if (!phone) return 'No registrado';

    const digits = phone.replace(/\D/g, '');

    return digits.length === 11
        ? `(${digits.slice(0, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`
        : phone;
};

const formatIdNumber = (id?: string | null) => {
    if (!id) return '—';

    return id.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const maritalStatuses: Record<string, string> = {
    single: 'Soltero(a)',
    married: 'Casado(a)',
    divorced: 'Divorciado(a)',
    widowed: 'Viudo(a)',
};

const statusConfig: Record<string, { label: string; className: string }> = {
    active: {
        label: 'Activo',
        className: 'border-green-200 bg-green-100 text-green-700',
    },
    inactive: {
        label: 'Inactivo',
        className: 'border-red-200 bg-red-100 text-red-700',
    },
    vacation: {
        label: 'Vacaciones',
        className: 'border-yellow-200 bg-yellow-100 text-yellow-700',
    },
    suspended: {
        label: 'Suspendido',
        className: 'border-orange-200 bg-orange-100 text-orange-700',
    },
};

function Info({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex min-w-0 gap-3">
            <Icon className="mt-1 h-5 w-5 shrink-0 text-primary" />

            <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="break-words font-medium">{value || 'No registrado'}</p>
            </div>
        </div>
    );
}

function Section({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: React.ElementType;
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="h-5 w-5 text-primary" />
                    {title}
                </CardTitle>

                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>

            <CardContent>{children}</CardContent>
        </Card>
    );
}

export function PersonnelShowContent({ personnel }: Props) {
    const status = statusConfig[personnel.status] ?? {
        label: personnel.status || 'Sin estado',
        className: 'border-gray-200 bg-gray-100 text-gray-700',
    };

    const age = getAge(personnel.birth_date);

    return (
        <div className="w-full space-y-6">
            {/* Encabezado del trabajador */}
            <Card className="overflow-hidden shadow-sm">
                <div className="h-2 bg-primary" />

                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                        <Avatar className="mx-auto h-32 w-32 shrink-0 border-4 border-background shadow-md md:h-40 md:w-40 lg:mx-0">
                            <AvatarImage
                                className="object-cover"
                                src={personnel.photo ? `/storage/${personnel.photo}` : undefined}
                            />
                            <AvatarFallback className="text-4xl font-bold">
                                {personnel.first_name?.[0]}
                                {personnel.last_name?.[0]}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                        {personnel.full_name}
                                    </h1>

                                    <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                                        <Briefcase className="h-4 w-4 shrink-0" />
                                        {personnel.position?.name ?? 'Sin cargo asignado'}
                                    </p>

                                    <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                        <Building2 className="h-4 w-4 shrink-0" />
                                        {personnel.area?.name ?? 'Sin área asignada'}
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <Badge variant="outline">{personnel.document_type}-{formatIdNumber(personnel.id_number)}</Badge>
                                        <Badge variant="outline" className={status.className}>
                                            {status.label}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex shrink-0 gap-2">
                                    <Can permission="personnel.view">
                                        <Link
                                            href="/personnel"
                                            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            Volver
                                        </Link>
                                    </Can>

                                    <Can permission="personnel.edit">
                                        <Link
                                            href={`/personnel/${personnel.id}/edit`}
                                            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Editar
                                        </Link>
                                    </Can>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-5 border-t pt-5 md:grid-cols-2 xl:grid-cols-3">
                                <Info
                                    icon={Mail}
                                    label="Correo electrónico"
                                    value={personnel.email}
                                />
                                <Info
                                    icon={Phone}
                                    label="Teléfono principal"
                                    value={formatPhone(personnel.phone)}
                                />
                                <Info
                                    icon={Building2}
                                    label="Área asignada"
                                    value={personnel.area?.name}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Información personal y laboral */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Section
                    icon={User}
                    title="Información personal"
                    description="Datos de identidad y características personales."
                >
                    <div className="grid gap-6 sm:grid-cols-2">
                        <Info
                            icon={IdCard}
                            label="Documento de identidad"
                            value={`${personnel.document_type}-${formatIdNumber(personnel.id_number)}`}
                        />

                        <Info
                            icon={Cake}
                            label="Fecha de nacimiento"
                            value={personnel.birth_date ? `${formatDate(personnel.birth_date)}${age ? ` (${age})` : ''}` : 'No registrada'}
                        />

                        <Info
                            icon={personnel.gender === 'male' ? Mars : Venus}
                            label="Sexo"
                            value={personnel.gender === 'male' ? 'Masculino' : personnel.gender === 'female' ? 'Femenino' : 'No especificado'}
                        />

                        <Info
                            icon={Heart}
                            label="Estado civil"
                            value={maritalStatuses[personnel.marital_status] ?? 'No registrado'}
                        />
                    </div>
                </Section>

                <Section
                    icon={Briefcase}
                    title="Información laboral"
                    description="Asignación organizativa y situación actual."
                >
                    <div className="grid gap-6 sm:grid-cols-2">
                        <Info
                            icon={Briefcase}
                            label="Cargo"
                            value={personnel.position?.name ?? 'Sin cargo asignado'}
                        />

                        <Info
                            icon={Building2}
                            label="Área"
                            value={personnel.area?.name ?? 'Sin área asignada'}
                        />

                        {/* <Info
                            icon={Contact}
                            label="Identificador interno"
                            value={`PER-${String(personnel.id).padStart(4, '0')}`}
                        /> */}

                        {/* <Info
                            icon={CalendarDays}
                            label="Estado del trabajador"
                            value={
                                <Badge variant="outline" className={status.className}>
                                    {status.label}
                                </Badge>
                            }
                        /> */}
                    </div>
                </Section>
            </div>

            {/* Información de contacto */}
            <Section
                icon={Phone}
                title="Información de contacto"
                description="Medios de contacto y ubicación del trabajador."
            >
                <div className="grid gap-6 md:grid-cols-2">
                    <Info
                        icon={Mail}
                        label="Correo electrónico"
                        value={personnel.email}
                    />

                    <Info
                        icon={Phone}
                        label="Teléfono principal"
                        value={formatPhone(personnel.phone)}
                    />

                    <Info
                        icon={Phone}
                        label="Teléfono secundario"
                        value={formatPhone(personnel.secondary_phone)}
                    />

                    <Info
                        icon={MapPin}
                        label="Dirección"
                        value={personnel.address}
                    />
                </div>
            </Section>
        </div>
    );
}

export default function Show({ personnel }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Personal', href: '/personnel' },
        { title: personnel.full_name, href: `/personnel/${personnel.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Personal | ${personnel.full_name}`} />

            <div className="p-4 md:p-6">
                <PersonnelShowContent personnel={personnel} />
            </div>
        </AppLayout>
    );
}