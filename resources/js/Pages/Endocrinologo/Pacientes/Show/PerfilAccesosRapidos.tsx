import { Link } from '@inertiajs/react';
import { ClipboardList, History, FileText, Activity, ArrowRight } from 'lucide-react';
import Tarjeta from '@/Components/ui/tarjeta';

interface Props {
    idPaciente: number;
}

const accesos = (id: number) => [
    {
        titulo: 'Perfil clínico',
        descripcion: 'Evaluación completa: menstrual, hormonal, diagnóstico',
        href: `/endocrinologo/pacientes/${id}/perfil-clinico`,
        icon: <ClipboardList size={15} strokeWidth={1.8} />,
        color: 'bg-brand-green/10 text-brand-green-dark dark:bg-brand-green-dark/20 dark:text-brand-green',
    },
    {
        titulo: 'Historial de consultas',
        descripcion: 'Todas las consultas registradas',
        href: `/endocrinologo/pacientes/${id}/perfil-clinico`,
        icon: <History size={15} strokeWidth={1.8} />,
        color: 'bg-brand-orange/10 text-brand-orange',
    },
    {
        titulo: 'Diagnósticos',
        descripcion: 'PMOS y resistencia a la insulina',
        href: `/endocrinologo/pacientes/${id}/perfil-clinico`,
        icon: <Activity size={15} strokeWidth={1.8} />,
        color: 'bg-category-fruits/10 text-category-fruits',
    },
    {
        titulo: 'Documentos',
        descripcion: 'Laboratorios y ecografías',
        href: `/endocrinologo/pacientes/${id}/perfil-clinico`,
        icon: <FileText size={15} strokeWidth={1.8} />,
        color: 'bg-category-others/10 text-category-others',
    },
];

export default function PerfilAccesosRapidos({ idPaciente }: Props) {
    return (
        <Tarjeta>
            <h3 className="mb-3 text-[14px] font-semibold text-ink dark:text-ink-dark">
                Acceso rápido
            </h3>

            <div className="space-y-2">
                {accesos(idPaciente).map((item) => (
                    <Link
                        key={item.titulo}
                        href={item.href}
                        className="group flex items-center gap-3 rounded-xl border border-surface-border p-3 transition-all hover:border-brand-green/30 hover:shadow-sm dark:border-surface-border-dark"
                    >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                            {item.icon}
                        </div>
                        <div className="flex-1">
                            <p className="text-[12.5px] font-semibold text-ink dark:text-ink-dark">{item.titulo}</p>
                            <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">{item.descripcion}</p>
                        </div>
                        <ArrowRight size={13} strokeWidth={1.8} className="text-ink-muted transition-transform group-hover:translate-x-0.5 dark:text-ink-muted-dark" />
                    </Link>
                ))}
            </div>
        </Tarjeta>
    );
}
