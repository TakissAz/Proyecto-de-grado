import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import type { HistoriaMenstrualData } from '../../tipos';

interface Props {
    historia: HistoriaMenstrualData;
}

export default function HallazgosMenstruales({ historia }: Props) {
    const hallazgos = [
        historia.amenorrea && 'Amenorrea',
        historia.oligomenorrea && 'Oligomenorrea',
        historia.sangrado_abundante && 'Sangrado abundante',
        historia.dolor_menstrual && 'Dolor menstrual',
        historia.sospecha_anovulacion && 'Sospecha anovulacion',
        historia.confirma_anovulacion_por_progesterona && 'Anovulacion confirmada',
    ].filter(Boolean) as string[];

    if (hallazgos.length === 0) return null;

    return (
        <div>
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">
                <AlertTriangle size={10} strokeWidth={2} className="text-brand-orange" />
                Hallazgos clinicos
            </p>
            <div className="flex flex-wrap gap-1.5">
                {hallazgos.map((h) => (
                    <Badge key={h} color={h === 'Anovulacion confirmada' ? 'red' : 'orange'}>{h}</Badge>
                ))}
            </div>
        </div>
    );
}
