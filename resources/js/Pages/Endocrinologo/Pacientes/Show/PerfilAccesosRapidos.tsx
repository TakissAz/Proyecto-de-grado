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
        icon: <ClipboardList size={17} strokeWidth={1.8} />,
        color: 'bg-brand-green/15 text-brand-green-dark dark:bg-brand-green-dark/20 dark:text-brand-green',
        bg: 'border-brand-green/20 bg-brand-green/[0.03] hover:border-brand-green/40 dark:bg-brand-green/[0.05]',
    },
    {
        titulo: 'Historial de consultas',
        descripcion: 'Todas las consultas registradas',
        href: `/endocrinologo/pacientes/${id}/perfil-clinico`,
        icon: <History size={17} strokeWidth={1.8} />,
        color: 'bg-brand-orange/15 text-brand-orange',
        bg: 'border-brand-orange/20 bg-brand-orange/[0.03] hover:border-brand-orange/40 dark:bg-brand-orange/[0.05]',
    },
    {
        titulo: 'Diagnósticos',
        descripcion: 'PMOS y resistencia a la insulina',
        href: `/endocrinologo/pacientes/${id}/perfil-clinico`,
        icon: <Activity size={17} strokeWidth={1.8} />,
        color: 'bg-category-fruits/15 text-category-fruits',
        bg: 'border-category-fruits/20 bg-category-fruits/[0.03] hover:border-category-fruits/40 dark:bg-category-fruits/[0.05]',
    },
    {
        titulo: 'Documentos',
        descripcion: 'Laboratorios y ecografías',
        href: `/endocrinologo/pacientes/${id}/perfil-clinico`,
        icon: <FileText size={17} strokeWidth={1.8} />,
        color: 'bg-category-others/15 text-category-others',
        bg: 'border-category-others/20 bg-category-others/[0.03] hover:border-category-others/40 dark:bg-category-others/[0.05]',
    },
];

export default function PerfilAccesosRapidos({ idPaciente }: Props) {
    return (
        <Tarjeta>
            <h3 className="mb-3 text-[14px] font-semibold text-ink dark:text-ink-dark">
                Acceso rápido
            </h3>

            <div className="space-y-2.5">
                {accesos(idPaciente).map((item) => (
                    <Link
                        key={item.titulo}
                        href={item.href}
                        className={`group flex items-center gap-3 rounded-xl border p-3.5 transition-all hover:shadow-[0_2px_12px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_2px_12px_rgba(0,0,0,0.15)] ${item.bg}`}
                    >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                            {item.icon}
                        </div>
                        <div className="flex-1">
                            <p className="text-[12.5px] font-bold text-ink dark:text-ink-dark">{item.titulo}</p>
                            <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">{item.descripcion}</p>
                        </div>
                        <ArrowRight size={14} strokeWidth={1.8} className="text-ink-muted transition-transform group-hover:translate-x-1 dark:text-ink-muted-dark" />
                    </Link>
                ))}
            </div>
        </Tarjeta>
    );
}
