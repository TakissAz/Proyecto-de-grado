import clsx from 'clsx';
import type { CitaData } from './tipos';

interface Props {
    fecha: string;
    citas: CitaData[];
}

// Los 8 bloques reales (1h cita, 10 min descanso, jornada 08:00–17:10)
const BLOQUES_CITA = [
    { inicio: '08:00', fin: '09:00' },
    { inicio: '09:10', fin: '10:10' },
    { inicio: '10:20', fin: '11:20' },
    { inicio: '11:30', fin: '12:30' },
    { inicio: '12:40', fin: '13:40' },
    { inicio: '13:50', fin: '14:50' },
    { inicio: '15:00', fin: '16:00' },
    { inicio: '16:10', fin: '17:10' },
];

export default function HorariosDia({ fecha, citas }: Props) {
    const formatFecha = (f: string) => {
        const d = new Date(f + 'T12:00:00');
        return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    };

    const getCitaEnBloque = (horaInicio: string): CitaData | undefined => {
        return citas.find(c => c.hora_inicio === horaInicio);
    };

    return (
        <div>
            <p className="text-[11.5px] font-bold text-ink dark:text-ink-dark mb-0.5">Horarios disponibles</p>
            <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark mb-4">el {formatFecha(fecha)} · 8 bloques · 10 min entre citas</p>

            {/* Grid de bloques */}
            <div className="grid grid-cols-2 gap-2">
                {BLOQUES_CITA.map(bloque => {
                    const cita = getCitaEnBloque(bloque.inicio);
                    const ocupado = !!cita;

                    return (
                        <div
                            key={bloque.inicio}
                            className={clsx(
                                'rounded-xl border px-3 py-2.5 transition-colors',
                                ocupado
                                    ? 'border-brand-orange/25 bg-brand-orange/[0.04] dark:border-brand-orange/15 dark:bg-brand-orange/[0.03]'
                                    : 'border-surface-border dark:border-surface-border-dark hover:border-brand-green/30 hover:bg-brand-green/[0.02]'
                            )}
                        >
                            <p className={clsx(
                                'text-[13px] font-bold',
                                ocupado ? 'text-brand-orange' : 'text-ink dark:text-ink-dark'
                            )}>
                                {bloque.inicio}
                            </p>
                            <p className="text-[9px] text-ink-muted dark:text-ink-muted-dark">
                                {ocupado ? cita.paciente?.nombre_completo?.split(' ')[0] ?? 'Ocupado' : 'Disponible'}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Leyenda */}
            <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-surface-border dark:border-surface-border-dark">
                <span className="flex items-center gap-1.5 text-[9px] text-ink-muted dark:text-ink-muted-dark">
                    <span className="h-2.5 w-2.5 rounded border border-surface-border dark:border-surface-border-dark" /> Libre
                </span>
                <span className="flex items-center gap-1.5 text-[9px] text-ink-muted dark:text-ink-muted-dark">
                    <span className="h-2.5 w-2.5 rounded bg-brand-orange/25 border border-brand-orange/25" /> Ocupado
                </span>
            </div>
        </div>
    );
}
