import { Users, Salad, HeartPulse, ClipboardCheck } from 'lucide-react';
import { TarjetaStat } from '@/Components/ui/tarjeta';

interface Props {
    totalPacientes: number;
    totalPlanes: number;
    totalControles: number;
}

export default function EstadisticasNutri({ totalPacientes, totalPlanes, totalControles }: Props) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <TarjetaStat
                label="Pacientes activos"
                value={String(totalPacientes)}
                delta="+3.1%"
                tone="green"
                icon={<Users size={17} strokeWidth={1.8} />}
            />
            <TarjetaStat
                label="Planes nutricionales"
                value={String(totalPlanes)}
                delta="+2.4%"
                tone="orange"
                icon={<Salad size={17} strokeWidth={1.8} />}
            />
            <TarjetaStat
                label="Controles realizados"
                value={String(totalControles)}
                delta="+5.7%"
                tone="peach"
                icon={<HeartPulse size={17} strokeWidth={1.8} />}
            />
            <TarjetaStat
                label="Adherencia promedio"
                value="78%"
                tone="green"
                icon={<ClipboardCheck size={17} strokeWidth={1.8} />}
            />
        </div>
    );
}
