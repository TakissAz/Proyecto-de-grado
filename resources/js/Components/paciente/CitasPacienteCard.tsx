import { CalendarDays, ChevronLeft, ChevronRight, Clock3, History, MapPin, Sparkles, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Badge } from '@/Components/ui/badge';

interface CitaPaciente { id_cita: number; fecha: string; hora_inicio: string; hora_fin: string; profesional: string; area: string; motivo: string | null; tipo_cita: string | null; modalidad: string | null; estado: string; observaciones: string | null }
export interface CitasPaciente { proxima_cita: CitaPaciente | null; citas_pendientes: CitaPaciente[]; citas_historial: CitaPaciente[]; resumen: { total_citas: number; pendientes: number; realizadas: number; canceladas: number; ultima_cita: string | null; proxima_fecha: string | null } }

const etiqueta = (estado: string) => ({ programada: 'Programada', confirmada: 'Confirmada', atendida: 'Realizada', cancelada: 'Cancelada', reprogramada: 'Reprogramada', no_asistio: 'No asistió' }[estado] ?? estado.replaceAll('_', ' '));
const estadoColor = (estado: string): 'green' | 'blue' | 'red' | 'orange' | 'gray' => ['programada', 'confirmada'].includes(estado) ? 'blue' : estado === 'atendida' ? 'green' : ['cancelada', 'no_asistio'].includes(estado) ? 'red' : 'gray';
const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function CitasPacienteCard({ citas }: { citas: CitasPaciente | null }) {
    if (!citas) return null;

    const proxima = citas.proxima_cita;
    const todasCitas = [...citas.citas_pendientes, ...citas.citas_historial];
    const fechasConCita = useMemo(() => new Set(todasCitas.map(c => c.fecha)), [todasCitas]);

    return (
        <section className="space-y-5">
            {/* Header */}
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-info/15 text-info">
                    <CalendarDays size={18} strokeWidth={1.8} />
                </div>
                <div>
                    <h2 className="text-[14px] font-bold text-ink dark:text-ink-dark">Mis citas</h2>
                    <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Consulta tus próximos controles y el historial de atención.</p>
                </div>
            </div>

            {/* Layout: Calendario + Próxima cita */}
            <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                {/* Mini calendario */}
                <MiniCalendario fechasConCita={fechasConCita} proximaFecha={proxima?.fecha ?? null} />

                {/* Próxima cita destacada */}
                {proxima ? (
                    <div className="rounded-2xl border border-info/25 bg-info/[0.04] p-5 dark:bg-info/[0.06] relative overflow-hidden">
                        <div className="absolute right-4 top-4 opacity-10">
                            <Sparkles size={48} />
                        </div>
                        <Badge color="blue">Tu próxima cita</Badge>
                        <h3 className="mt-3 text-[16px] font-bold text-ink dark:text-ink-dark">{proxima.area}</h3>
                        <p className="mt-1 flex items-center gap-2 text-[12px] text-ink-muted dark:text-ink-muted-dark">
                            <UserRound size={14} /> {proxima.profesional}
                        </p>

                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                            <DatoVisual icono={<CalendarDays size={15} />} titulo="Fecha" valor={proxima.fecha} color="blue" />
                            <DatoVisual icono={<Clock3 size={15} />} titulo="Horario" valor={`${proxima.hora_inicio} – ${proxima.hora_fin}`} color="green" />
                            <DatoVisual icono={<MapPin size={15} />} titulo="Modalidad" valor={proxima.modalidad?.replaceAll('_', ' ') ?? 'Por confirmar'} color="orange" />
                        </div>

                        {proxima.motivo && (
                            <p className="mt-3 text-[11.5px] text-ink/80 dark:text-ink-dark/80"><span className="font-semibold">Motivo:</span> {proxima.motivo}</p>
                        )}
                        {proxima.observaciones && (
                            <div className="mt-3 rounded-lg bg-white/50 dark:bg-black/20 px-3 py-2 text-[11px] text-ink/70 dark:text-ink-dark/70">{proxima.observaciones}</div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-surface-border py-10 text-center dark:border-surface-border-dark">
                        <CalendarDays size={32} strokeWidth={1.2} className="text-ink-muted/30 dark:text-ink-muted-dark/30" />
                        <p className="text-[12px] font-semibold text-ink dark:text-ink-dark">No tienes citas próximas</p>
                        <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Te avisaremos cuando se programe tu siguiente control.</p>
                    </div>
                )}
            </div>

            {/* Citas pendientes */}
            {citas.citas_pendientes.length > 0 && (
                <div className="rounded-xl border border-surface-border p-4 dark:border-surface-border-dark">
                    <h3 className="text-[12.5px] font-bold text-ink dark:text-ink-dark mb-3">Citas pendientes</h3>
                    <div className="grid gap-2 md:grid-cols-2">
                        {citas.citas_pendientes.map(c => (
                            <div key={c.id_cita} className="flex items-center gap-3 rounded-xl border border-surface-border/60 p-3 dark:border-surface-border-dark/60">
                                {/* Fecha como card */}
                                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-info/10 text-info">
                                    <span className="text-[9px] font-bold uppercase">{new Date(c.fecha + 'T00:00').toLocaleDateString('es-BO', { month: 'short' })}</span>
                                    <span className="text-[16px] font-bold leading-none">{new Date(c.fecha + 'T00:00').getDate()}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-semibold text-ink dark:text-ink-dark">{c.profesional}</p>
                                    <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{c.area} · {c.hora_inicio}</p>
                                </div>
                                <Badge color={estadoColor(c.estado)}>{etiqueta(c.estado)}</Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Historial */}
            <div className="rounded-xl border border-surface-border dark:border-surface-border-dark overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-black/[0.015] dark:bg-white/[0.02] border-b border-surface-border dark:border-surface-border-dark">
                    <h3 className="flex items-center gap-2 text-[12.5px] font-bold text-ink dark:text-ink-dark">
                        <History size={14} className="text-ink-muted dark:text-ink-muted-dark" /> Historial de citas
                    </h3>
                    <div className="flex gap-1.5">
                        <Badge color="green">Realizadas {citas.resumen.realizadas}</Badge>
                        <Badge color="red">Canceladas {citas.resumen.canceladas}</Badge>
                    </div>
                </div>
                {citas.citas_historial.length === 0 ? (
                    <p className="px-4 py-6 text-center text-[11px] text-ink-muted dark:text-ink-muted-dark italic">Aún no tienes citas en el historial.</p>
                ) : (
                    <div className="divide-y divide-surface-border/40 dark:divide-surface-border-dark/40">
                        {citas.citas_historial.map(c => (
                            <div key={c.id_cita} className="flex items-center gap-4 px-4 py-3 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                                {/* Fecha mini */}
                                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-black/[0.03] dark:bg-white/[0.04]">
                                    <span className="text-[8px] font-bold uppercase text-ink-muted dark:text-ink-muted-dark">{new Date(c.fecha + 'T00:00').toLocaleDateString('es-BO', { month: 'short' })}</span>
                                    <span className="text-[13px] font-bold text-ink dark:text-ink-dark leading-none">{new Date(c.fecha + 'T00:00').getDate()}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-semibold text-ink dark:text-ink-dark">{c.profesional}</p>
                                    <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{c.area} · {c.hora_inicio} {c.motivo ? `· ${c.motivo}` : ''}</p>
                                </div>
                                <Badge color={estadoColor(c.estado)}>{etiqueta(c.estado)}</Badge>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

/* Mini Calendario */
function MiniCalendario({ fechasConCita, proximaFecha }: { fechasConCita: Set<string>; proximaFecha: string | null }) {
    const [mesOffset, setMesOffset] = useState(0);
    const hoy = new Date();
    const mesActual = new Date(hoy.getFullYear(), hoy.getMonth() + mesOffset, 1);
    const año = mesActual.getFullYear();
    const mes = mesActual.getMonth();

    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = (primerDia.getDay() + 6) % 7; // Lunes = 0

    const dias: (number | null)[] = Array.from({ length: primerDiaSemana }, () => null);
    for (let i = 1; i <= diasEnMes; i++) dias.push(i);

    const formatFecha = (d: number) => `${año}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    return (
        <div className="rounded-2xl border border-surface-border p-5 dark:border-surface-border-dark">
            {/* Header mes */}
            <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={() => setMesOffset(mesOffset - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:bg-black/[0.04] dark:text-ink-muted-dark dark:hover:bg-white/[0.04] transition-colors">
                    <ChevronLeft size={16} />
                </button>
                <h4 className="text-[13px] font-bold text-ink dark:text-ink-dark">{MESES[mes]} {año}</h4>
                <button type="button" onClick={() => setMesOffset(mesOffset + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:bg-black/[0.04] dark:text-ink-muted-dark dark:hover:bg-white/[0.04] transition-colors">
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
                {DIAS_SEMANA.map(d => (
                    <div key={d} className="text-center text-[9px] font-bold text-ink-muted/60 dark:text-ink-muted-dark/60 py-1">{d}</div>
                ))}
            </div>

            {/* Grid de días */}
            <div className="grid grid-cols-7 gap-0.5">
                {dias.map((dia, i) => {
                    if (dia === null) return <div key={`empty-${i}`} />;
                    const fecha = formatFecha(dia);
                    const esHoy = dia === hoy.getDate() && mes === hoy.getMonth() && año === hoy.getFullYear();
                    const tieneCita = fechasConCita.has(fecha);
                    const esProxima = fecha === proximaFecha;

                    return (
                        <div key={dia}
                            className={clsx(
                                'relative flex h-9 w-full items-center justify-center rounded-lg text-[12px] font-medium transition-colors',
                                esProxima ? 'bg-info/20 text-info font-bold' :
                                esHoy ? 'bg-brand-green/15 text-brand-green-dark dark:text-brand-green font-bold' :
                                tieneCita ? 'bg-brand-orange/10 text-brand-orange font-semibold' :
                                'text-ink/70 dark:text-ink-dark/70 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                            )}
                        >
                            {dia}
                            {tieneCita && (
                                <span className={clsx('absolute bottom-1 h-1 w-1 rounded-full', esProxima ? 'bg-info' : 'bg-brand-orange')} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Leyenda */}
            <div className="mt-4 flex items-center gap-4 text-[9.5px] text-ink-muted dark:text-ink-muted-dark">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-green" /> Hoy</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-info" /> Próxima cita</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-orange" /> Cita agendada</span>
            </div>
        </div>
    );
}

/* Dato visual */
const datoColors: Record<string, string> = { blue: 'bg-info/10 text-info', green: 'bg-brand-green/10 text-brand-green-dark dark:text-brand-green', orange: 'bg-brand-orange/10 text-brand-orange' };
function DatoVisual({ icono, titulo, valor, color }: { icono: React.ReactNode; titulo: string; valor: string; color: string }) {
    return (
        <div className="flex items-center gap-2.5 rounded-xl bg-white/50 dark:bg-black/20 px-3 py-2.5">
            <div className={clsx('flex h-8 w-8 items-center justify-center rounded-lg', datoColors[color] ?? datoColors.blue)}>{icono}</div>
            <div>
                <p className="text-[9px] font-semibold text-ink-muted/60 dark:text-ink-muted-dark/60 uppercase">{titulo}</p>
                <p className="text-[12px] font-semibold text-ink dark:text-ink-dark capitalize">{valor}</p>
            </div>
        </div>
    );
}
