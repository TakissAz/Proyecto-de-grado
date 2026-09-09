import {
    ArrowRight,
    CalendarPlus,
} from 'lucide-react';

interface Props {
    onNuevaCita?: () => void;
}

export default function CentroAgenda({ onNuevaCita }: Props) {
    return (
        <div className="contents">
            <section className="card-elevated overflow-hidden border-brand-green/20">
                <div className="bg-gradient-to-r from-brand-green-dark to-brand-green p-3.5 text-white">
                    <div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15"><CalendarPlus size={18} strokeWidth={1.8}/></span><div><p className="text-[8px] font-bold uppercase tracking-wider text-white/65">Acción rápida</p><h2 className="mt-0.5 text-[13px] font-bold">Nueva cita</h2><p className="mt-0.5 text-[8.5px] text-white/70">Reserva un horario disponible.</p></div></div>
                    <button
                        type="button"
                        onClick={onNuevaCita}
                        className="mt-3 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-white text-[9.5px] font-bold text-brand-green-dark shadow-sm transition-transform hover:-translate-y-0.5"
                    >
                        Crear cita <ArrowRight size={11} />
                    </button>
                </div>
            </section>

        </div>
    );
}
