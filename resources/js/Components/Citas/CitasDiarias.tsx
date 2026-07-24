import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Clock, User, Bell, CalendarClock } from 'lucide-react';
import { Boton } from '@/Components/ui/boton';
import clsx from 'clsx';
import type { CitaData } from './tipos';
import { ESTADOS_BADGE } from './tipos';

interface Props {
    citas: CitaData[];
    fecha: string;
    prefijo: string;
}

export default function CitasDiarias({ citas, fecha, prefijo }: Props) {
    const [cancelarId, setCancelarId] = useState<number | null>(null);
    const [motivoCancelacion, setMotivoCancelacion] = useState('');

    const handleCancelar = () => {
        if (!cancelarId || !motivoCancelacion.trim()) return;
        router.post(`/${prefijo}/citas/${cancelarId}/cancelar`, { motivo_cancelacion: motivoCancelacion }, {
            onSuccess: () => { setCancelarId(null); setMotivoCancelacion(''); },
        });
    };

    if (citas.length === 0) {
        return (
            <div>
                <p className="text-[11.5px] font-bold text-ink dark:text-ink-dark mb-1">Citas del día</p>
                <div className="flex flex-col items-center gap-1.5 py-6 text-center">
                    <CalendarClock size={20} strokeWidth={1.2} className="text-ink-muted/25 dark:text-ink-muted-dark/25" />
                    <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Sin citas este día</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <p className="text-[11.5px] font-bold text-ink dark:text-ink-dark">Citas del día</p>
                <span className="flex items-center gap-1 text-[9px] font-medium text-brand-green-dark dark:text-brand-green">
                    <Bell size={9} strokeWidth={2} /> {citas.length}
                </span>
            </div>

            <div className="space-y-2">
                {citas.map(c => {
                    const badge = ESTADOS_BADGE[c.estado] ?? { class: 'badge-ghost', label: c.estado };
                    const colorBorde = c.estado === 'programada' ? 'border-l-yellow-500' :
                        c.estado === 'confirmada' ? 'border-l-blue-500' :
                        c.estado === 'atendida' ? 'border-l-brand-green' : 'border-l-category-fruits/50';

                    return (
                        <div key={c.id_cita} className={clsx('rounded-lg border-l-[3px] bg-black/[0.015] px-3 py-2.5 dark:bg-white/[0.02]', colorBorde)}>
                            {/* Hora + estado */}
                            <div className="flex items-center justify-between mb-1">
                                <span className="flex items-center gap-1 text-[12px] font-bold text-ink dark:text-ink-dark">
                                    <Clock size={10} strokeWidth={2} className="text-brand-green-dark dark:text-brand-green" />
                                    {c.hora_inicio} – {c.hora_fin}
                                </span>
                                <span className={clsx('pill text-[8px]', badge.class)}>{badge.label}</span>
                            </div>
                            {/* Paciente */}
                            <div className="flex items-center gap-1.5">
                                <User size={9} strokeWidth={1.8} className="text-ink-muted/50 dark:text-ink-muted-dark/50" />
                                <span className="text-[10.5px] font-medium text-ink dark:text-ink-dark truncate">{c.paciente?.nombre_completo ?? '—'}</span>
                            </div>
                            <p className="text-[9px] text-ink-muted dark:text-ink-muted-dark mt-0.5">{c.tipo_cita} · <span className="capitalize">{c.modalidad}</span></p>
                        </div>
                    );
                })}
            </div>

            {/* Modal cancelar */}
            {cancelarId && (
                <div className="modal modal-open">
                    <div className="modal-box bg-surface-card dark:bg-surface-card-dark max-w-sm">
                        <h3 className="text-[14px] font-bold text-ink dark:text-ink-dark mb-3">Cancelar cita</h3>
                        <textarea className="textarea textarea-bordered w-full text-[12px] bg-transparent" rows={3} placeholder="Motivo de cancelación..." value={motivoCancelacion} onChange={e => setMotivoCancelacion(e.target.value)} />
                        <div className="modal-action">
                            <Boton variante="ghost" tamano="sm" onClick={() => { setCancelarId(null); setMotivoCancelacion(''); }}>Cerrar</Boton>
                            <Boton variante="danger" tamano="sm" onClick={handleCancelar} disabled={!motivoCancelacion.trim()}>Confirmar</Boton>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setCancelarId(null)} />
                </div>
            )}
        </div>
    );
}
