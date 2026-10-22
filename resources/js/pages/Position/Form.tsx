import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Props {
    data: {
        name: string;
        description: string;
    };

    setData: (field: string, value: any) => void;
    submit: (e: React.FormEvent) => void;
    processing: boolean;
    errors: any;
    submitLabel?: string;
}

export default function Form({ data, setData, submit, processing, errors, submitLabel = 'Guardar' }: Props) {
    return (
        <form onSubmit={submit} className="space-y-4">

            {/* NAME */}
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Nombre del cargo <span className="text-red-500">*</span>
                </label>
                
                <Input
                    placeholder="Nombre del cargo"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                />
                {errors.name && (<p className="text-red-500 text-sm">{errors.name}</p>)}
            </div>

            {/* DESCRIPTION */}
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Descripción del cargo
                </label>

                <Textarea
                    placeholder="(opcional)"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                />
                {errors.description && (<p className="text-red-500 text-sm">{errors.description}</p>)}
            </div>

            {/* BUTTON */}
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