import { useState } from 'react';
import { router } from '@inertiajs/react';
import { BotonLink, Boton } from '@/Components/ui/boton';
import { Edit, CheckCircle2, XCircle, UserX, MoreVertical } from 'lucide-react';
import clsx from 'clsx';
import type { CitaData } from './tipos';
import { ESTADOS_BADGE } from './tipos';

interface Props {
    citas: CitaData[];
    prefijo: string; // 'endocrinologo' | 'nutricionista'
}

export default function CitasTabla({ citas, prefijo }: Props) {
    const [cancelarId, setCancelarId] = useState<number | null>(null);
    const [motivoCancelacion, setMotivoCancelacion] = useState('');

    const handleCancelar = () => {
        if (!cancelarId || !motivoCancelacion.trim()) return;
        router.post(`/${prefijo}/citas/${cancelarId}/cancelar`, { motivo_cancelacion: motivoCancelacion }, {
            onSuccess: () => { setCancelarId(null); setMotivoCancelacion(''); },
        });
    };

    const handleAccion = (idCita: number, accion: string) => {
        if (!idCita) return;
        router.post(`/${prefijo}/citas/${idCita}/${accion}`, {}, { preserveScroll: true });
    };

    if (citas.length === 0) {
        return (
            <div className="card-elevated flex flex-col items-center gap-2 px-5 py-12 text-center">
                <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark">No hay citas registradas</p>
                <p className="text-[11px] text-ink-muted/60 dark:text-ink-muted-dark/60">Crea una nueva cita para comenzar</p>
            </div>
        );
    }

    return (
        <>
            <div className="card-elevated overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table table-sm w-full">
                        <thead>
                            <tr className="border-b border-surface-border dark:border-surface-border-dark">
                                <th className="text-[10px] uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Paciente</th>
                                <th className="text-[10px] uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Fecha</th>
                                <th className="text-[10px] uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Horario</th>
                                <th className="text-[10px] uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Tipo</th>
                                <th className="text-[10px] uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Modalidad</th>
                                <th className="text-[10px] uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Estado</th>
                                <th className="text-[10px] uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {citas.map((c) => {
                                const badge = ESTADOS_BADGE[c.estado] ?? { class: 'badge-ghost', label: c.estado };
                                const puedeEditar = ['programada', 'confirmada'].includes(c.estado);
                                return (
                                    <tr key={c.id_cita} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] border-b border-surface-border/50 dark:border-surface-border-dark/50">
                                        <td>
                                            <div>
                                                <p className="text-[12px] font-semibold text-ink dark:text-ink-dark">{c.paciente?.nombre_completo ?? '—'}</p>
                                                <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark">CI: {c.paciente?.ci}</p>
                                            </div>
                                        </td>
                                        <td className="text-[11px] text-ink dark:text-ink-dark">{c.fecha_cita}</td>
                                        <td className="text-[11px] font-medium text-ink dark:text-ink-dark">{c.hora_inicio} – {c.hora_fin}</td>
                                        <td className="text-[11px] text-ink dark:text-ink-dark">{c.tipo_cita}</td>
                                        <td className="text-[11px] text-ink dark:text-ink-dark capitalize">{c.modalidad}</td>
                                        <td><span className={clsx('badge badge-sm', badge.class)}>{badge.label}</span></td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                {puedeEditar && (
                                                    <BotonLink href={`/${prefijo}/citas/${c.id_cita}/edit`} variante="ghost" tamano="xs">
                                                        <Edit size={12} strokeWidth={1.8} />
                                                    </BotonLink>
                                                )}
                                                {c.estado === 'programada' && (
                                                    <Boton variante="ghost" tamano="xs" onClick={() => handleAccion(c.id_cita, 'confirmar')} title="Confirmar">
                                                        <CheckCircle2 size={12} strokeWidth={1.8} className="text-category-others" />
                                                    </Boton>
                                                )}
                                                {c.estado === 'confirmada' && (
                                                    <Boton variante="ghost" tamano="xs" onClick={() => handleAccion(c.id_cita, 'atendida')} title="Marcar atendida">
                                                        <CheckCircle2 size={12} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" />
                                                    </Boton>
                                                )}
                                                {['programada', 'confirmada'].includes(c.estado) && (
                                                    <>
                                                        <Boton variante="ghost" tamano="xs" onClick={() => handleAccion(c.id_cita, 'no-asistio')} title="No asistió">
                                                            <UserX size={12} strokeWidth={1.8} className="text-brand-orange" />
                                                        </Boton>
                                                        <Boton variante="ghost" tamano="xs" onClick={() => setCancelarId(c.id_cita)} title="Cancelar">
                                                            <XCircle size={12} strokeWidth={1.8} className="text-category-fruits" />
                                                        </Boton>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal cancelar */}
            {cancelarId && (
                <div className="modal modal-open">
                    <div className="modal-box bg-surface-card dark:bg-surface-card-dark max-w-sm">
                        <h3 className="text-[14px] font-bold text-ink dark:text-ink-dark mb-3">Cancelar cita</h3>
                        <textarea
                            className="textarea textarea-bordered w-full text-[12px] bg-transparent"
                            rows={3}
                            placeholder="Motivo de cancelación..."
                            value={motivoCancelacion}
                            onChange={e => setMotivoCancelacion(e.target.value)}
                        />
                        <div className="modal-action">
                            <Boton variante="ghost" tamano="sm" onClick={() => { setCancelarId(null); setMotivoCancelacion(''); }}>Cerrar</Boton>
                            <Boton variante="danger" tamano="sm" onClick={handleCancelar} disabled={!motivoCancelacion.trim()}>Confirmar cancelación</Boton>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setCancelarId(null)} />
                </div>
            )}
        </>
    );
}
