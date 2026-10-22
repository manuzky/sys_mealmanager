import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, MapPin, Briefcase, User, IdCard, Cake, Venus, Mars, Heart } from 'lucide-react';

interface Position {
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
}

interface Props {
    personnel: Personnel;
}

const formatDate = (date?: string | null) => {
    if (!date) return '-';
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' });
};

const getAge = (date?: string | null) => {
    if (!date) return '-';
    const [year, month, day] = date.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age--;
    return `${age} años`;
};

const formatPhone = (phone?: string | null) => {
    if (!phone) return '-';
    const digits = phone.replace(/\D/g, '');
    return digits.length === 11 ? `(${digits.slice(0, 4)}) ${digits.slice(4, 7)}.${digits.slice(7, 9)}.${digits.slice(9, 11)}` : phone;
};

const formatIdNumber = (id?: string | null) => id ? id.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '-';

function Info({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
    return (
        <div className="flex gap-3">
            <Icon className="h-5 w-5 mt-1 text-primary shrink-0" />
            <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium break-words">{value || '-'}</p>
            </div>
        </div>
    );
}

function Section({ icon: Icon, title, description, children }: { icon: React.ElementType; title: string; description?: string; children: React.ReactNode }) {
    return (
        <Card className="bg-muted/40 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Icon className="h-5 w-5 text-primary" />{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

export function PersonnelShowContent({ personnel }: Props) {
    const maritalStatuses: Record<string, string> = { single: 'Soltero(a)', married: 'Casado(a)', divorced: 'Divorciado(a)', widowed: 'Viudo(a)' };

    return (
        <div className="w-full space-y-6">
            <Card>
                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                        <Avatar className="h-36 w-36 md:h-44 md:w-44 mx-auto lg:mx-0 border">
                            <AvatarImage className="object-cover" src={personnel.photo ? `/storage/${personnel.photo}` : undefined} />
                            <AvatarFallback className="text-5xl font-bold">{personnel.first_name?.[0]}{personnel.last_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div>
                                    <h1 className="text-2xl md:text-4xl font-bold">{personnel.full_name}</h1>
                                    <p className="mt-2 text-lg text-muted-foreground flex items-center gap-2"><Briefcase className="h-5 w-5 shrink-0" />{personnel.position?.name ?? 'Sin cargo asignado'}</p>
                                </div>
                                <Badge variant={personnel.status === 'active' ? 'default' : 'secondary'} className="w-fit px-4 py-2">{personnel.status === 'active' ? 'Activo' : 'Inactivo'}</Badge>
                            </div>
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
                                <Info icon={IdCard} label="Documento" value={`${personnel.document_type}-${formatIdNumber(personnel.id_number)}`} />
                                <Info icon={Mail} label="Correo electrónico" value={personnel.email} />
                                <Info icon={Phone} label="Teléfono principal" value={formatPhone(personnel.phone)} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
                <Section icon={User} title="Información personal" description="Datos personales registrados del empleado.">
                    <div className="space-y-5">
                        <Info icon={IdCard} label="Documento de identidad" value={`${personnel.document_type}-${formatIdNumber(personnel.id_number)}`} />
                        <Info icon={Cake} label="Fecha de nacimiento" value={personnel.birth_date ? `${formatDate(personnel.birth_date)} (${getAge(personnel.birth_date)})` : '-'} />
                        <Info icon={personnel.gender === 'male' ? Mars : Venus} label="Sexo" value={personnel.gender === 'male' ? 'Masculino' : personnel.gender === 'female' ? 'Femenino' : '-'} />
                        <Info icon={Heart} label="Estado civil" value={maritalStatuses[personnel.marital_status] ?? personnel.marital_status ?? '-'} />
                    </div>
                </Section>

                <Section icon={Briefcase} title="Información laboral" description="Cargo y estado actual del trabajador.">
                    <div className="space-y-5">
                        <Info icon={Briefcase} label="Cargo actual" value={personnel.position?.name ?? 'Sin cargo asignado'} />
                        <Info icon={User} label="Estado del trabajador" value={personnel.status === 'active' ? 'Activo' : 'Inactivo'} />
                    </div>
                </Section>
            </div>

            <Section icon={Phone} title="Información de contacto" description="Datos disponibles para comunicarse con el trabajador.">
                <div className="grid md:grid-cols-2 gap-6">
                    <Info icon={Mail} label="Correo electrónico" value={personnel.email} />
                    <Info icon={Phone} label="Teléfono principal" value={formatPhone(personnel.phone)} />
                    <Info icon={Phone} label="Teléfono secundario" value={formatPhone(personnel.secondary_phone)} />
                    <Info icon={MapPin} label="Dirección" value={personnel.address} />
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
            <Head title={personnel.full_name} />
            <div className="p-4 md:p-6">
                <PersonnelShowContent personnel={personnel} />
            </div>
        </AppLayout>
    );
}