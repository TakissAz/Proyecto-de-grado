import { MoreHorizontal } from 'lucide-react';
import Tarjeta from '@/Components/ui/tarjeta';

const categorias = [
    { nombre: 'Resistencia insulina', porcentaje: 38, color: 'bg-category-grains' },
    { nombre: 'PMOS confirmado', porcentaje: 28, color: 'bg-category-fruits' },
    { nombre: 'Sobrepeso', porcentaje: 20, color: 'bg-category-veggies' },
    { nombre: 'Control general', porcentaje: 14, color: 'bg-category-dairy' },
];

interface Props {
    total: number;
}

export default function DistribucionPacientes({ total }: Props) {
    return (
        <Tarjeta>
            <div className="mb-2 flex items-center justify-between">
                <div>
                    <div className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark">
                        Pacientes por condicion
                    </div>
                    <div className="text-[22px] font-bold text-ink dark:text-ink-dark">
                        {total}{' '}
                        <span className="text-[11px] font-normal text-ink-muted dark:text-ink-muted-dark">
                            pacientes
                        </span>
                    </div>
                </div>
                <MoreHorizontal size={16} className="cursor-pointer text-ink-muted dark:text-ink-muted-dark" />
            </div>

            {/* Barra de distribución */}
            <div className="mb-2.5 flex h-2 overflow-hidden rounded-md">
                {categorias.map((cat) => (
                    <div key={cat.nombre} className={cat.color} style={{ width: `${cat.porcentaje}%` }} />
                ))}
            </div>

            {/* Leyenda */}
            <div className="space-y-1 text-[11px]">
                {categorias.map((cat) => (
                    <div key={cat.nombre} className="flex justify-between text-ink dark:text-ink-dark">
                        <span className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${cat.color}`} />
                            {cat.nombre}
                        </span>
                        <span className="text-ink-muted dark:text-ink-muted-dark">{cat.porcentaje}%</span>
                    </div>
                ))}
            </div>
        </Tarjeta>
    );
}
