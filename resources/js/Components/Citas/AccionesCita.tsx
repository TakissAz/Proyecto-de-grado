import { router } from '@inertiajs/react';
import { useState } from 'react';
import { CalendarClock, Check, CircleCheckBig, UserX, X, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { Boton } from '@/Components/ui/boton';
import type { CitaData } from './tipos';

interface Props {
    cita: CitaData;
    prefijo: 'endocrinologo' | 'nutricionista';
    compactas?: boolean;
}

interface AccionProps {
    label: string;
    icono: React.ReactNode;
    tono: 'green' | 'blue' | 'orange' | 'red' | 'neutral';
    onClick?: () => void;
    href?: string;
}

const tonos = {
    green: 'bg-brand-green/10 text-brand-green-dark hover:bg-brand-green hover:text-white dark:text-brand-green',
    blue: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white',
    orange: 'bg-brand-orange/10 text-brand-orange hover:bg-brand-orange hover:text-white',
    red: 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white',
    neutral: 'bg-black/[0.035] text-ink-muted hover:bg-black/[0.07] hover:text-ink dark:bg-white/[0.04] dark:text-ink-muted-dark dark:hover:bg-white/[0.08]',
};

function Accion({ label, icono, tono, onClick, href }: AccionProps) {
    const clases = clsx(
        'group/action relative flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:-translate-y-0.5',
        tonos[tono],
    );

    const contenido = (
        <>
            {icono}
            <span className="pointer-events-none absolute bottom-full right-0 z-30 mb-1.5 hidden whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[8px] font-medium text-white shadow-lg group-hover/action:block dark:bg-white dark:text-ink">
                {label}
            </span>
        </>
    );

    return href ? (
        <a href={href} className={clases} aria-label={label}>{contenido}</a>
    ) : (
        <button type="button" onClick={onClick} className={clases} aria-label={label}>{contenido}</button>
    );
}

export default function AccionesCita({ cita, prefijo, compactas = false }: Props) {
    const [cancelando, setCancelando] = useState(false);
    const [motivo, setMotivo] = useState('');
    const [procesando, setProcesando] = useState(false);

    const ejecutar = (accion: 'confirmar' | 'atendida' | 'no-asistio') => {
        if (!cita.id_cita) return;
        setProcesando(true);
        router.post(`/${prefijo}/citas/${cita.id_cita}/${accion}`, {}, {
            preserveScroll: true,
            onFinish: () => setProcesando(false),
        });
    };

    const cancelar = () => {
        if (!motivo.trim() || !cita.id_cita) return;
        setProcesando(true);
        router.post(`/${prefijo}/citas/${cita.id_cita}/cancelar`, { motivo_cancelacion: motivo }, {
            preserveScroll: true,
            onSuccess: () => { setCancelando(false); setMotivo(''); },
            onFinish: () => setProcesando(false),
        });
    };

    const activa = ['programada', 'confirmada'].includes(cita.estado);
    if (!activa) {
        return (
            <div className="flex items-center gap-1.5">
                <span className={clsx('pill text-[8px]', cita.estado === 'atendida' ? 'bg-brand-green/15 text-brand-green-dark dark:text-brand-green' : cita.estado === 'cancelada' ? 'bg-category-fruits/15 text-category-fruits' : 'bg-brand-orange/15 text-brand-orange')}>
                    {cita.estado === 'atendida' ? '✓ Atendida' : cita.estado === 'cancelada' ? '✗ Cancelada' : cita.estado === 'no_asistio' ? '⊘ No asistió' : cita.estado}
                </span>
            </div>
        );
    }

    return (
        <>
            <div className={clsx('flex items-center justify-end gap-1', procesando && 'pointer-events-none opacity-50')}>
                {cita.estado === 'programada' && (
                    <Accion label="Confirmar cita" tono="blue" icono={<Check size={12} strokeWidth={2.2} />} onClick={() => ejecutar('confirmar')} />
                )}
                {cita.estado === 'confirmada' && (
                    <Accion label="Marcar como atendida" tono="green" icono={<CircleCheckBig size={12} />} onClick={() => ejecutar('atendida')} />
                )}
                <Accion
                    label="Reprogramar"
                    tono="neutral"
                    icono={<CalendarClock size={12} />}
                    href={`/${prefijo}/citas/${cita.id_cita}/edit`}
                />
                <Accion label="No asistió" tono="orange" icono={<UserX size={12} />} onClick={() => ejecutar('no-asistio')} />
                <Accion label="Cancelar cita" tono="red" icono={<X size={12} />} onClick={() => setCancelando(true)} />
            </div>

            {cancelando && (
                <div className="modal modal-open z-50">
                    <div className="modal-box max-w-sm bg-surface-card p-5 dark:bg-surface-card-dark">
                        <div className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                                <XCircle size={17} />
                            </span>
                            <div>
                                <h3 className="text-[14px] font-bold text-ink dark:text-ink-dark">Cancelar cita</h3>
                                <p className="mt-0.5 text-[9.5px] text-ink-muted dark:text-ink-muted-dark">
                                    Indica por qué se cancela la cita de {cita.paciente?.nombre_completo ?? 'este paciente'}.
                                </p>
                            </div>
                        </div>
                        <label className="mt-4 block text-[9px] font-bold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">
                            Motivo de cancelación
                        </label>
                        <textarea
                            rows={3}
                            value={motivo}
                            onChange={(event) => setMotivo(event.target.value)}
                            placeholder="Ej. El paciente solicitó cancelar..."
                            className="mt-1.5 w-full rounded-xl border border-surface-border bg-transparent p-3 text-[11px] text-ink outline-none transition focus:border-red-500/40 focus:ring-2 focus:ring-red-500/10 dark:border-surface-border-dark dark:text-ink-dark"
                        />
                        <div className="mt-4 flex justify-end gap-2">
                            <Boton variante="ghost" tamano="sm" onClick={() => { setCancelando(false); setMotivo(''); }}>Volver</Boton>
                            <Boton variante="danger" tamano="sm" disabled={!motivo.trim() || procesando} onClick={cancelar}>
                                Cancelar cita
                            </Boton>
                        </div>
                    </div>
                    <button type="button" className="modal-backdrop" onClick={() => setCancelando(false)} aria-label="Cerrar modal" />
                </div>
            )}
        </>
    );
}
