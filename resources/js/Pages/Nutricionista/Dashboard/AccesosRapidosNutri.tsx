import { Link } from '@inertiajs/react';
import { ArrowRight, Users, Salad, TrendingUp, Calendar } from 'lucide-react';
import Tarjeta from '@/Components/ui/tarjeta';

interface AccesoItem {
    titulo: string;
    descripcion: string;
    href: string;
    icon: React.ReactNode;
    color: string;
}

const accesos: AccesoItem[] = [
    {
        titulo: 'Pacientes',
        descripcion: 'Lista completa de seguimiento',
        href: '/nutricionista/pacientes',
        icon: <Users size={16} strokeWidth={1.8} />,
        color: 'bg-brand-green/10 text-brand-green-dark dark:bg-brand-green-dark/20 dark:text-brand-green',
    },
    {
        titulo: 'Nuevo paciente',
        descripcion: 'Registrar nueva paciente',
        href: '/nutricionista/pacientes/create',
        icon: <Salad size={16} strokeWidth={1.8} />,
        color: 'bg-brand-orange/10 text-brand-orange',
    },
    {
        titulo: 'Progreso',
        descripcion: 'Ver avances del mes',
        href: '/nutricionista/progreso',
        icon: <TrendingUp size={16} strokeWidth={1.8} />,
        color: 'bg-category-grains/10 text-category-grains',
    },
    {
        titulo: 'Agenda',
        descripcion: 'Proximas consultas',
        href: '/nutricionista/calendario',
        icon: <Calendar size={16} strokeWidth={1.8} />,
        color: 'bg-category-others/10 text-category-others',
    },
];

export default function AccesosRapidosNutri() {
    return (
        <Tarjeta>
            <h3 className="mb-3 text-[15px] font-semibold text-ink dark:text-ink-dark">
                Accesos rapidos
            </h3>

            <div className="space-y-2">
                {accesos.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="group flex items-center gap-3 rounded-xl border border-surface-border p-3
                            transition-all hover:border-brand-green/30 hover:shadow-sm
                            dark:border-surface-border-dark"
                    >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                            {item.icon}
                        </div>
                        <div className="flex-1">
                            <p className="text-[13px] font-semibold text-ink dark:text-ink-dark">{item.titulo}</p>
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">{item.descripcion}</p>
                        </div>
                        <ArrowRight
                            size={14}
                            strokeWidth={1.8}
                            className="text-ink-muted transition-transform group-hover:translate-x-0.5 dark:text-ink-muted-dark"
                        />
                    </Link>
                ))}
            </div>
        </Tarjeta>
    );
}
