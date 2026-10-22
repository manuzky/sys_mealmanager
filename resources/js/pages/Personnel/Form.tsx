import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { useState } from "react";
import { Trash2, Camera, Info } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger, } from "@/components/ui/hover-card"

type PersonnelFormProps = {
    data: any;
    setData: any;
    errors: any;
    processing: boolean;
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    positions: any[];
    areas: { id: number; name: string; active: boolean }[];
    currentPhoto?: string | null;
    submitLabel?: string;
    onSubmit: (e: React.FormEvent) => void;
};

export default function Form({ data, setData, errors, processing, date, setDate, positions, areas, currentPhoto, submitLabel = 'Guardar', onSubmit, }: PersonnelFormProps) {
    const formatIdNumber = (value: string) => {
        const digits = value.replace(/\D/g, '');

        // separa en bloques de 3 desde el final
        return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 7);

        // 1234567 → 123.45.67
        const part1 = digits.slice(0, 3);
        const part2 = digits.slice(3, 5);
        const part3 = digits.slice(5, 7);

        let result = part1;
        if (part2) result += '.' + part2;
        if (part3) result += '.' + part3;

        return result;
    };

    const [removeCurrentPhoto, setRemoveCurrentPhoto] = useState(false);

    const previewUrl =
        data.photo instanceof File
            ? URL.createObjectURL(data.photo)
            : currentPhoto && !removeCurrentPhoto
                ? `/storage/${currentPhoto}`
                : null;

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 bg-muted/70">
                <div className="border-b pb-3 mb-6">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">
                            Información personal
                        </h2>

                        <HoverCard openDelay={200}>
                            <HoverCardTrigger asChild>
                                <button type="button" className="text-red-500 hover:text-red-600 transition-colors" >
                                    <Info className="h-4 w-4" />
                                </button>
                            </HoverCardTrigger>

                            <HoverCardContent className="w-96">
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 font-semibold">
                                        <Info className="h-4 w-4 text-red-500" />
                                        Antes de continuar
                                    </h4>

                                    <p className="text-sm text-muted-foreground">
                                        Los campos marcados con{" "}
                                        <span className="font-bold text-red-500">*</span>{" "}
                                        son obligatorios.
                                    </p>

                                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                                        <li>Verifique que el documento de identidad no exista previamente.</li>
                                        <li>El correo electrónico debe ser único dentro del sistema.</li>
                                        <li>Revise toda la información antes de guardar los cambios.</li>
                                    </ul>
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                        Datos básicos del trabajador.
                    </p>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Foto */}
                    <div className="col-span-12 lg:col-span-3">
                        <label className="mb-2 block text-sm font-medium">
                            Fotografía
                        </label>

                        <div className="rounded-lg border p-4">
                            <div className="flex flex-col items-center gap-2">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Vista previa" className="h-50 w-50 rounded-full object-cover border" />
                                ) : (
                                    <div className="h-50 w-50 rounded-full border flex flex-col items-center justify-center text-muted-foreground">
                                        <Camera className="h-8 w-8 mb-2" />
                                        <span className="text-sm">
                                            Sin fotografía
                                        </span>
                                    </div>
                                )}

                                {!previewUrl ? (
                                    <div className="w-full">
                                        <Input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.webp"
                                            onChange={(e) => setData( 'photo', e.target.files?.[0] ?? null ) }
                                        />
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => { setData( 'photo', null ); setData( 'photo_remove', true ); setRemoveCurrentPhoto(true); }}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Eliminar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {errors.photo && (<p className="text-sm text-red-500 mt-2">{errors.photo}</p>)}
                    </div>

                    <div className="col-span-12 lg:col-span-9">
                        <div className="grid grid-cols-3 gap-6">
                            {/* ===================== DATOS PERSONALES ===================== */}
                            {/* Nombre */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Nombres (s) <span className="text-red-500">*</span>
                                </label>
                                <Input placeholder="Nombre" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} />

                                {errors.first_name && (<p className="text-sm text-red-500 mt-1">{errors.first_name}</p>)}
                            </div>

                            {/* Apellido */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Apellido (s) <span className="text-red-500">*</span>
                                </label>
                                <Input placeholder="Apellido" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} />

                                {errors.last_name && (<p className="text-sm text-red-500 mt-1">{errors.last_name}</p>)}
                            </div>

                            {/* Fecha de nacimiento */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Fecha de nacimiento <span className="text-red-500">*</span>
                                </label>

                                <DatePicker
                                    value={date}
                                    onChange={(value) => {
                                        setDate(value);
                                        if (!value) {
                                            setData('birth_date', '');
                                            return;
                                        }
                                        const year = value.getFullYear();
                                        const month = String(value.getMonth() + 1).padStart(2, '0');
                                        const day = String(value.getDate()).padStart(2, '0');
                                        setData('birth_date', `${year}-${month}-${day}`);
                                    }}
                                />

                                {errors.birth_date && (<p className="text-sm text-red-500 mt-1">{errors.birth_date}</p>)}
                            </div>

                            {/* Documento */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Número de documento <span className="text-red-500">*</span>
                                </label>

                                <div className="flex">

                                    <Select value={data.document_type} onValueChange={(value) => setData('document_type', value)} >
                                        <SelectTrigger className="w-15 rounded-r-none border-r-0">
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="V">V</SelectItem>
                                            <SelectItem value="E">E</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Input
                                        className="flex-1 rounded-l-none"
                                        placeholder="Número de cédula"
                                        maxLength={15}
                                        value={formatIdNumber(data.id_number)}
                                        onChange={(e) => {const raw = e.target.value.replace(/\D/g, ''); setData('id_number', raw); }}
                                    />

                                </div>

                                {errors.document_type && (<p className="mt-1 text-sm text-red-500">{errors.document_type}</p>)}
                                {errors.id_number && (<p className="mt-1 text-sm text-red-500">{errors.id_number}</p>)}
                            </div>

                            {/* Sexo */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Sexo <span className="text-red-500">*</span>
                                </label>

                                <Select value={data.gender} onValueChange={(value) => setData('gender', value)} >
                                    <SelectTrigger className={errors.area_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Seleccione..." />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="male">
                                            Masculino
                                        </SelectItem>

                                        <SelectItem value="female">
                                            Femenino
                                        </SelectItem>
                                    </SelectContent>

                                </Select>

                                {errors.gender && (<p className="text-sm text-red-500 mt-1">{errors.gender}</p>)}
                            </div>

                            {/* Estado civil */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Estado civil <span className="text-red-500">*</span>
                                </label>

                                <Select value={data.marital_status} onValueChange={(value) => setData('marital_status', value)}>
                                    <SelectTrigger className={errors.area_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Seleccione..." />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="single">
                                            Soltero(a)
                                        </SelectItem>

                                        <SelectItem value="married">
                                            Casado(a)
                                        </SelectItem>

                                        <SelectItem value="divorced">
                                            Divorciado(a)
                                        </SelectItem>

                                        <SelectItem value="widowed">
                                            Viudo(a)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {errors.marital_status && (<p className="text-sm text-red-500 mt-1">{errors.marital_status}</p>)}
                            </div>

                            {/* Área */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Área <span className="text-red-500">*</span>
                                </label>

                                <Select
                                    value={data.area_id ? String(data.area_id) : ''}
                                    onValueChange={(value) => setData('area_id', value)}
                                >
                                    <SelectTrigger className={errors.area_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Seleccione un área" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {areas.map((area) => (
                                            <SelectItem key={area.id} value={String(area.id)}>
                                                {area.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {errors.area_id && (<p className="mt-1 text-sm text-red-500">{errors.area_id}</p>)}
                            </div>

                            {/* Cargo */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Cargo <span className="text-red-500">*</span>
                                </label>

                                <Select value={data.position_id ? String(data.position_id) : ''} onValueChange={(value) => setData('position_id', value)} >
                                    <SelectTrigger className={errors.area_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Seleccione un cargo" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {positions.map((position) => (
                                            <SelectItem key={position.id} value={String(position.id)}>
                                                {position.name}
                                                {!position.active && ' 🔒'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {errors.position_id && (<p className="text-sm text-red-500 mt-1">{errors.position_id}</p>)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* ===================== CONTACTO ===================== */}
            <br />
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 bg-muted/70">
                <div className="border-b pb-3 mb-6">
                    <h2 className="text-lg font-semibold">
                        Información de contacto
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Datos de contacto del trabajador.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1.5fr] gap-x-8 gap-y-5">
                    {/* Correo */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Correo electrónico <span className="text-red-500">*</span>
                        </label>

                        <div className="flex">
                            <Input className="flex-1 rounded-r-none" placeholder="usuario" value={data.email_local} onChange={(e) => setData('email_local', e.target.value)} />

                            <Select value={data.email_domain} onValueChange={(value) => setData('email_domain', value)} >
                                <SelectTrigger className="w-35 rounded-l-none border-l-0">
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="@gmail.com">
                                        @gmail.com
                                    </SelectItem>

                                    <SelectItem value="@hotmail.com">
                                        @hotmail.com
                                    </SelectItem>

                                    <SelectItem value="@outlook.com">
                                        @outlook.com
                                    </SelectItem>

                                    <SelectItem value="other">
                                        Otro...
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {data.email_domain === 'other' && (
                            <div className="mt-2">
                                <Input
                                    placeholder="@empresa.com"
                                    value={data.email_custom_domain}
                                    onChange={(e) => setData('email_custom_domain', e.target.value)}
                                />
                            </div>
                        )}

                        {errors.email_local && (<p className="mt-1 text-sm text-red-500">{errors.email_local}</p>)}
                    </div>

                    {/* Teléfono principal */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Teléfono principal <span className="text-red-500">*</span>
                        </label>

                        <div className="flex">
                            <Select value={data.phone_code} onValueChange={(value) => setData('phone_code', value)} >
                                <SelectTrigger className="w-20 rounded-r-none border-r-0 focus:z-10">
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="0412">0412</SelectItem>
                                    <SelectItem value="0414">0414</SelectItem>
                                    <SelectItem value="0416">0416</SelectItem>
                                    <SelectItem value="0422">0422</SelectItem>
                                    <SelectItem value="0424">0424</SelectItem>
                                    <SelectItem value="0426">0426</SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                className="flex-1 rounded-l-none focus:z-10"
                                placeholder="123.45.67"
                                maxLength={9}
                                value={formatPhone(data.phone)}
                                onChange={(e) => { const raw = e.target.value.replace(/\D/g, '').slice(0, 7); setData('phone', raw); }}
                            />
                        </div>

                        {errors.phone && (<p className="mt-1 text-sm text-red-500">{errors.phone}</p>)}
                    </div>

                    {/* Segundo teléfono */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Segundo teléfono
                        </label>

                        <div className="flex">
                            <Select value={data.secondary_phone_code} onValueChange={(value) => setData('secondary_phone_code', value)} >
                                <SelectTrigger className="w-20 rounded-r-none border-r-0 focus:z-10">
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="0412">0412</SelectItem>
                                    <SelectItem value="0414">0414</SelectItem>
                                    <SelectItem value="0416">0416</SelectItem>
                                    <SelectItem value="0422">0422</SelectItem>
                                    <SelectItem value="0424">0424</SelectItem>
                                    <SelectItem value="0426">0426</SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                className="flex-1 rounded-l-none focus:z-10"
                                placeholder="123.45.67"
                                maxLength={9}
                                value={formatPhone(data.secondary_phone)}
                                onChange={(e) => { const raw = e.target.value.replace(/\D/g, '').slice(0, 7); setData('secondary_phone', raw);}}
                            />
                        </div>

                        {errors.secondary_phone && (<p className="mt-1 text-sm text-red-500">{errors.secondary_phone}</p>)}
                    </div>
                </div>

                {/* Dirección */}
                <br />
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Dirección de vivienda
                    </label>

                    <Input
                        placeholder="Dirección"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                    />

                    {errors.address && (<p className="text-sm text-red-500 mt-1">{errors.address}</p>)}
                </div>
            </div>


            {/* Botón */}
            <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                >
                    Cancelar
                </Button>

                <Button type="submit" disabled={processing}>
                    {processing ? 'Guardando...' : submitLabel}
                </Button>
            </div>

        </form>
    );
}