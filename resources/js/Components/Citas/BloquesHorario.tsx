import clsx from 'clsx';
import { Clock, Ban, CheckCircle2, AlertCircle } from 'lucide-react';
import type { BloqueHorario } from './tipos';

interface Props {
    bloques: BloqueHorario[];
    seleccionado: string | null;
    onSeleccionar: (horaInicio: string, horaFin: string) => void;
    cargando?: boolean;
}

export default function BloquesHorario({ bloques, seleccionado, onSeleccionar, cargando }: Props) {
    if (cargando) {
        return (
            <div className="flex items-center justify-center gap-2 py-10">
                <span className="loading loading-spinner loading-sm text-brand-green" />
                <span className="text-[12px] text-ink-muted dark:text-ink-muted-dark">Consultando disponibilidad...</span>
            </div>
        );
    }

    if (bloques.length === 0) {
        return (
            <div className="py-10 text-center">
                <Clock size={28} strokeWidth={1.2} className="mx-auto mb-2 text-ink-muted/30 dark:text-ink-muted-dark/30" />
                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark">Selecciona una fecha para ver horarios</p>
                <p className="text-[10px] text-ink-muted/60 dark:text-ink-muted-dark/60 mt-1">Jornada: 08:00 – 17:10 · 8 bloques de 1h</p>
            </div>
        );
    }

    const disponibles = bloques.filter(b => b.disponible).length;

    return (
        <div className="space-y-3">
            {/* Resumen */}
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                    Bloques horarios
                </p>
                <span className={clsx(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                    disponibles > 0 ? 'bg-brand-green/10 text-brand-green-dark dark:bg-brand-green/[0.06] dark:text-brand-green' : 'bg-category-fruits/10 text-category-fruits'
                )}>
                    {disponibles} disponible{disponibles !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Grid de bloques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {bloques.map((bloque) => {
                    const activo = seleccionado === bloque.hora_inicio;
                    const pasado = bloque.pasado;
                    const ocupado = !bloque.disponible && !pasado;

                    return (
                        <button
                            key={bloque.hora_inicio}
                            type="button"
                            disabled={!bloque.disponible}
                            onClick={() => bloque.disponible && onSeleccionar(bloque.hora_inicio, bloque.hora_fin)}
                            className={clsx(
                                'relative flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all border',
                                bloque.disponible
                                    ? activo
                                        ? 'border-brand-green bg-brand-green/10 ring-2 ring-brand-green/20 shadow-sm dark:bg-brand-green/[0.08]'
                                        : 'border-surface-border hover:border-brand-green/50 hover:bg-brand-green/[0.03] hover:shadow-sm dark:border-surface-border-dark dark:hover:border-brand-green/30'
                                    : pasado
                                        ? 'border-surface-border/30 bg-black/[0.02] opacity-40 cursor-not-allowed dark:border-surface-border-dark/30 dark:bg-white/[0.01]'
                                        : 'border-brand-orange/30 bg-brand-orange/[0.03] cursor-not-allowed dark:border-brand-orange/20 dark:bg-brand-orange/[0.02]'
                            )}
                        >
                            {/* Icono de estado */}
                            <div className={clsx(
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                                activo ? 'bg-brand-green text-white' :
                                bloque.disponible ? 'bg-brand-green/10 text-brand-green-dark dark:bg-brand-green/[0.08] dark:text-brand-green' :
                                pasado ? 'bg-black/[0.04] text-ink-muted/40 dark:bg-white/[0.04] dark:text-ink-muted-dark/40' :
                                'bg-brand-orange/10 text-brand-orange'
                            )}>
                                {activo ? <CheckCircle2 size={14} strokeWidth={2} /> :
                                 pasado ? <Clock size={14} strokeWidth={1.8} /> :
                                 ocupado ? <Ban size={14} strokeWidth={1.8} /> :
                                 <Clock size={14} strokeWidth={1.8} />}
                            </div>

                            {/* Contenido */}
                            <div className="flex-1 min-w-0">
                                <p className={clsx(
                                    'text-[13px] font-bold leading-tight',
                                    activo ? 'text-brand-green-dark dark:text-brand-green' :
                                    bloque.disponible ? 'text-ink dark:text-ink-dark' :
                                    'text-ink-muted dark:text-ink-muted-dark'
                                )}>
                                    {bloque.hora_inicio} – {bloque.hora_fin}
                                </p>
                                <p className={clsx(
                                    'text-[9.5px] font-medium mt-0.5',
                                    activo ? 'text-brand-green-dark/80 dark:text-brand-green/80' :
                                    bloque.disponible ? 'text-brand-green-dark/60 dark:text-brand-green/60' :
                                    pasado ? 'text-ink-muted/50 dark:text-ink-muted-dark/50' :
                                    'text-brand-orange/80'
                                )}>
                                    {activo ? '✓ Seleccionado' :
                                     bloque.disponible ? 'Disponible · 60 min' :
                                     pasado ? 'Horario pasado' :
                                     'Ocupado'}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Leyenda */}
            <div className="flex items-center justify-center gap-4 pt-2">
                <span className="flex items-center gap-1 text-[9px] text-ink-muted dark:text-ink-muted-dark">
                    <div className="h-2 w-2 rounded-full bg-brand-green" /> Disponible
                </span>
                <span className="flex items-center gap-1 text-[9px] text-ink-muted dark:text-ink-muted-dark">
                    <div className="h-2 w-2 rounded-full bg-brand-orange" /> Ocupado
                </span>
                <span className="flex items-center gap-1 text-[9px] text-ink-muted dark:text-ink-muted-dark">
                    <div className="h-2 w-2 rounded-full bg-ink-muted/30" /> Pasado
                </span>
            </div>
        </div>
    );
}
