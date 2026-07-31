import { Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, IdCard } from 'lucide-react';
import AvatarIniciales from '@/Components/ui/avatar-iniciales';
import EstadoPill from '@/Components/ui/estado-pill';
import type { PacienteNutricional } from '../tipos';

export default function EncabezadoPacienteNutricional({ paciente }: { paciente: PacienteNutricional }) {
    const nombre = [paciente.nombres, paciente.apellido_paterno, paciente.apellido_materno].filter(Boolean).join(' ');

    return (
        <div className="card-elevated overflow-hidden">
            {/* Banner decorativo */}
            <div className="relative h-20 bg-gradient-to-r from-brand-green/10 via-brand-green/5 to-transparent dark:from-brand-green/[0.08] dark:via-brand-green/[0.03] dark:to-transparent">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-green/[0.06]" />
                <div className="absolute right-20 -bottom-5 h-16 w-16 rounded-full bg-brand-green/[0.04]" />
                <Link
                    href={`/nutricionista/pacientes/${paciente.id_paciente}`}
                    className="absolute left-5 top-5 flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-ink backdrop-blur-sm transition-colors hover:bg-white dark:bg-black/40 dark:text-ink-dark dark:hover:bg-black/60"
                >
                    <ArrowLeft size={12} strokeWidth={1.8} /> Volver al paciente
                </Link>
            </div>

            {/* Info del paciente */}
            <div className="px-5 pb-5 -mt-7">
                <div className="flex items-end gap-4">
                    <div className="rounded-full border-[3px] border-surface-card shadow-md dark:border-surface-card-dark">
                        <AvatarIniciales nombre={nombre} size={56} />
                    </div>
                    <div className="flex-1 pb-1">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-brand-green-dark dark:text-brand-green mb-0.5">Perfil nutricional</p>
                        <h1 className="text-[18px] font-bold text-ink dark:text-ink-dark leading-tight">{nombre}</h1>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-ink-muted dark:text-ink-muted-dark">
                            <span className="flex items-center gap-1"><IdCard size={12} strokeWidth={1.8} /> CI {paciente.ci}</span>
                            <span className="flex items-center gap-1"><CalendarDays size={12} strokeWidth={1.8} /> {paciente.fecha_nacimiento}</span>
                        </div>
                    </div>
                    <div className="pb-1">
                        <EstadoPill activo={paciente.estado === 'activo'} textoActivo="Activo" textoInactivo="Inactivo" />
                    </div>
                </div>
            </div>
        </div>
    );
}
