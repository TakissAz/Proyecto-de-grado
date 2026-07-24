import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { CitaData } from './tipos';

interface Props {
    citasPorFecha: Record<string, CitaData[]>;
    fechaSeleccionada?: string;
    onSelectFecha: (fecha: string) => void;
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIAS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

export default function CalendarioCitas({ citasPorFecha, fechaSeleccionada, onSelectFecha }: Props) {
    const [mesActual, setMesActual] = useState(() => {
        const h = new Date();
        return { year: h.getFullYear(), month: h.getMonth() };
    });

    const hoy = new Date();
    const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

    const diasEnMes = new Date(mesActual.year, mesActual.month + 1, 0).getDate();
    let primerDiaSemana = new Date(mesActual.year, mesActual.month, 1).getDay();
    primerDiaSemana = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;

    const diasMesAnterior = new Date(mesActual.year, mesActual.month, 0).getDate();
    const totalCeldas = Math.ceil((primerDiaSemana + diasEnMes) / 7) * 7;
    const diasSiguienteMes = totalCeldas - primerDiaSemana - diasEnMes;

    const mesAnterior = () => setMesActual({ year: mesActual.month === 0 ? mesActual.year - 1 : mesActual.year, month: mesActual.month === 0 ? 11 : mesActual.month - 1 });
    const mesSiguiente = () => setMesActual({ year: mesActual.month === 11 ? mesActual.year + 1 : mesActual.year, month: mesActual.month === 11 ? 0 : mesActual.month + 1 });
    const irHoy = () => { setMesActual({ year: hoy.getFullYear(), month: hoy.getMonth() }); onSelectFecha(hoyStr); };

    const buildFechaStr = (y: number, m: number, d: number) =>
        `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    return (
        <div>
            {/* Toolbar superior */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-surface-border dark:border-surface-border-dark overflow-hidden">
                        <button type="button" onClick={mesAnterior} className="flex h-8 w-8 items-center justify-center hover:bg-black/[0.03] transition-colors dark:hover:bg-white/[0.03] border-r border-surface-border dark:border-surface-border-dark">
                            <ChevronLeft size={14} strokeWidth={2} className="text-ink dark:text-ink-dark" />
                        </button>
                        <button type="button" onClick={mesSiguiente} className="flex h-8 w-8 items-center justify-center hover:bg-black/[0.03] transition-colors dark:hover:bg-white/[0.03]">
                            <ChevronRight size={14} strokeWidth={2} className="text-ink dark:text-ink-dark" />
                        </button>
                    </div>
                    <button type="button" onClick={irHoy} className="h-8 rounded-lg border border-surface-border px-3 text-[11px] font-semibold text-ink hover:bg-black/[0.03] transition-colors dark:border-surface-border-dark dark:text-ink-dark dark:hover:bg-white/[0.03]">
                        Hoy
                    </button>

                    {/* Título del mes */}
                    <h2 className="text-[18px] font-bold text-ink dark:text-ink-dark ml-2">
                        {MESES[mesActual.month]} de {mesActual.year}
                    </h2>
                </div>

                {/* Leyenda pills */}
                <div className="hidden sm:flex items-center gap-1.5">
                    <span className="pill bg-yellow-500/15 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400">Pend.</span>
                    <span className="pill bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">Conf.</span>
                    <span className="pill bg-brand-green/15 text-brand-green-dark dark:bg-brand-green/20 dark:text-brand-green">Comp.</span>
                </div>
            </div>

            {/* Tabla calendario */}
            <div className="rounded-xl border border-surface-border overflow-hidden dark:border-surface-border-dark">
                {/* Header días de la semana */}
                <div className="grid grid-cols-7 bg-black/[0.015] dark:bg-white/[0.02]">
                    {DIAS.map(d => (
                        <div key={d} className="text-center text-[10.5px] font-bold text-ink-muted py-2.5 dark:text-ink-muted-dark border-r last:border-r-0 border-surface-border/50 dark:border-surface-border-dark/50">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Cuerpo del calendario */}
                <div className="grid grid-cols-7">
                    {/* Mes anterior */}
                    {Array.from({ length: primerDiaSemana }, (_, i) => (
                        <div key={`p-${i}`} className="border-t border-r last:border-r-0 border-surface-border/50 dark:border-surface-border-dark/50 px-2 py-2 min-h-[56px]">
                            <span className="text-[11px] text-ink-muted/30 dark:text-ink-muted-dark/30">{diasMesAnterior - primerDiaSemana + 1 + i}</span>
                        </div>
                    ))}

                    {/* Mes actual */}
                    {Array.from({ length: diasEnMes }, (_, i) => {
                        const dia = i + 1;
                        const fechaStr = buildFechaStr(mesActual.year, mesActual.month, dia);
                        const citasDia = citasPorFecha[fechaStr] ?? [];
                        const esHoy = fechaStr === hoyStr;
                        const seleccionado = fechaStr === fechaSeleccionada;

                        return (
                            <button
                                key={dia}
                                type="button"
                                onClick={() => onSelectFecha(fechaStr)}
                                className={clsx(
                                    'border-t border-r last:border-r-0 border-surface-border/50 dark:border-surface-border-dark/50 px-2 py-2 min-h-[56px] text-left transition-colors',
                                    seleccionado ? 'bg-brand-green/[0.06] dark:bg-brand-green/[0.04]' :
                                    esHoy ? 'bg-yellow-500/[0.05] dark:bg-yellow-500/[0.03]' :
                                    'hover:bg-black/[0.015] dark:hover:bg-white/[0.015]'
                                )}
                            >
                                <span className={clsx(
                                    'inline-flex h-[22px] w-[22px] items-center justify-center rounded-md text-[11px] font-semibold',
                                    esHoy && 'bg-brand-green text-white',
                                    seleccionado && !esHoy && 'bg-brand-green/15 text-brand-green-dark dark:text-brand-green font-bold',
                                    !esHoy && !seleccionado && 'text-ink dark:text-ink-dark'
                                )}>
                                    {dia}
                                </span>
                                {citasDia.length > 0 && (
                                    <div className="flex gap-[3px] mt-1">
                                        {citasDia.slice(0, 3).map((c, ci) => (
                                            <div key={ci} className={clsx(
                                                'h-[5px] flex-1 max-w-[14px] rounded-full',
                                                c.estado === 'programada' ? 'bg-yellow-500/60' :
                                                c.estado === 'confirmada' ? 'bg-blue-500/60' :
                                                c.estado === 'atendida' ? 'bg-brand-green/60' : 'bg-category-fruits/40'
                                            )} />
                                        ))}
                                    </div>
                                )}
                            </button>
                        );
                    })}

                    {/* Mes siguiente */}
                    {Array.from({ length: diasSiguienteMes }, (_, i) => (
                        <div key={`n-${i}`} className="border-t border-r last:border-r-0 border-surface-border/50 dark:border-surface-border-dark/50 px-2 py-2 min-h-[56px]">
                            <span className="text-[11px] text-ink-muted/30 dark:text-ink-muted-dark/30">{i + 1}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
