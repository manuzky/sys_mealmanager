
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Props {
    data: { name: string; description: string };
    setData: (field: string, value: string) => void;
    submit: (e: React.FormEvent) => void;
    processing: boolean;
    errors: Record<string, string>;
    submitLabel?: string;
}

export default function Form({ data, setData, submit, processing, errors, submitLabel = 'Guardar', }: Props) {
    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Nombre del área <span className="text-red-500">*</span>
                </label>
                <Input
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Ej. Administración"
                    required
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium">Descripción</label>
                <Textarea
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Descripción del área (opcional)"
                />
                {errors.description && (
                    <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                )}
            </div>
            {errors.error && <p className="text-sm text-red-500">{errors.error}</p>}

            <div className="flex justify-end gap-3 border-t pt-6">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Guardando...' : submitLabel}
                </Button>
            </div>
        </form>
    );
}
