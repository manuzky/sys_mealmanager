import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    UtensilsCrossed,
    Camera,
    ImagePlus,
    Trash2,
    Info,
    ClipboardList,
    Sparkles,
} from 'lucide-react';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';

interface Props {
    data: {
        name: string;
        ingredients: string;
        photo: File | null;
    };
    setData: (field: string, value: any) => void;
    submit: (e: React.FormEvent) => void;
    processing: boolean;
    errors: Record<string, string>;
    currentPhoto?: string | null;
    submitLabel?: string;
}

export default function Form({ data,setData,submit,processing,errors,currentPhoto,submitLabel = 'Guardar comida' }: Props) {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!data.photo) {
            setPreview(null);
            return;
        }

        const url = URL.createObjectURL(data.photo);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [data.photo]);

    const photoUrl = preview ?? (currentPhoto ? `/storage/${currentPhoto}` : null);

    function removePhoto() {
        setData('photo', null);
        setPreview(null);
        const input = document.getElementById('meal-photo') as HTMLInputElement | null;
        if (input) input.value = '';
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* INFORMACIÓN PRINCIPAL */}
            <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="flex items-center justify-between border-b bg-muted/40 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <UtensilsCrossed className="h-5 w-5" />
                        </div>

                        <div>
                            <h2 className="font-semibold">Información de la comida</h2>
                            <p className="text-sm text-muted-foreground">
                                Datos generales del plato.
                            </p>
                        </div>
                    </div>

                    <HoverCard openDelay={200}>
                        <HoverCardTrigger asChild>
                            <button
                                type="button"
                                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                                aria-label="Ayuda del formulario"
                            >
                                <Info className="h-5 w-5" />
                            </button>
                        </HoverCardTrigger>

                        <HoverCardContent className="w-80">
                            <div className="space-y-2">
                                <h4 className="flex items-center gap-2 font-semibold">
                                    <Info className="h-4 w-4 text-primary" />
                                    Antes de guardar
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Los campos marcados con{' '}
                                    <span className="font-bold text-red-500">*</span>{' '}
                                    son obligatorios. La fotografía es opcional.
                                </p>
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                    {/* DATOS */}
                    <div className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Nombre de la comida <span className="text-red-500">*</span>
                            </label>

                            <Input
                                placeholder="Ej. Pollo a la plancha"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                maxLength={150}
                                className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                            />

                            <div className="mt-1 flex justify-between gap-2">
                                {errors.name ? (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Nombre con el que aparecerá en el catálogo.
                                    </p>
                                )}

                                <span className="shrink-0 text-xs text-muted-foreground">
                                    {data.name.length}/150
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Ingredientes <span className="text-red-500">*</span>
                            </label>

                            <Textarea
                                placeholder="Ej. Pechuga de pollo, arroz, ensalada y vegetales..."
                                value={data.ingredients}
                                onChange={(e) => setData('ingredients', e.target.value)}
                                rows={6}
                                className={`resize-y ${errors.ingredients ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />

                            {errors.ingredients ? (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.ingredients}
                                </p>
                            ) : (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Describe los ingredientes que componen el plato.
                                </p>
                            )}
                        </div>

                        <div className="rounded-lg border border-dashed bg-muted/30 p-4">
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-background p-2 text-primary shadow-sm">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">
                                        Consejo
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Usa un nombre claro y una lista de ingredientes
                                        completa para facilitar la selección del menú semanal.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FOTOGRAFÍA */}
                    <div className="space-y-3">
                        <div>
                            <h3 className="text-sm font-medium">Fotografía del plato</h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Imagen de referencia para el catálogo.
                            </p>
                        </div>

                        <div className="overflow-hidden rounded-xl border bg-muted/20">
                            <div className="flex aspect-square items-center justify-center p-3">
                                {photoUrl ? (
                                    <img
                                        src={photoUrl}
                                        alt="Vista previa de la comida"
                                        className="h-full w-full rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-dashed bg-background text-center">
                                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Camera className="h-7 w-7" />
                                        </div>
                                        <p className="text-sm font-medium">Sin fotografía</p>
                                        <p className="mt-1 px-4 text-xs text-muted-foreground">
                                            Selecciona una imagen para mostrar el plato.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 border-t p-4">
                                <Input
                                    id="meal-photo"
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    className="cursor-pointer bg-background text-xs"
                                    onChange={(e) => {setData('photo', e.target.files?.[0] ?? null);}}
                                />

                                <p className="text-xs text-muted-foreground">
                                    JPG, PNG o WEBP. Máximo 2 MB.
                                </p>

                                {photoUrl && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full text-destructive hover:text-destructive"
                                        onClick={removePhoto}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Quitar selección
                                    </Button>
                                )}

                                {errors.photo && (<p className="text-sm text-red-500">{errors.photo}</p>)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RESUMEN */}
            <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <ClipboardList className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">
                            {data.name.trim() || 'Nueva comida'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {photoUrl ? 'Fotografía agregada' : 'Sin fotografía'} · Catálogo de comidas
                        </p>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
                        Cancelar
                    </Button>

                    <Button type="submit" disabled={processing} className="min-w-40">
                        {processing ? ('Guardando...') : (
                            <>
                                <ImagePlus className="mr-2 h-4 w-4" />
                                {submitLabel}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
}