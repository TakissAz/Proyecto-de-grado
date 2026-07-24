import clsx from 'clsx';
import { Clock } from 'lucide-react';
import type { HistoriaMenstrualData } from '../../tipos';

interface Props {
    historia: HistoriaMenstrualData;
}

export default function DatosCicloMenstrual({ historia }: Props) {
    return (
        <div>
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">
                <Clock size={10} strokeWidth={2} className="text-brand-green-dark dark:text-brand-green" />
                Ciclo menstrual
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <DatoItem label="Regularidad" valor={formatRegularidad(historia.regularidad_ciclo)} destacar={historia.regularidad_ciclo === 'irregular' || historia.regularidad_ciclo === 'ausente'} />
                <DatoItem label="Duración del ciclo" valor={historia.duracion_ciclo_dias ? `${historia.duracion_ciclo_dias} días` : null} />
                <DatoItem label="Intervalo entre ciclos" valor={historia.intervalo_entre_ciclos_dias ? `${historia.intervalo_entre_ciclos_dias} días` : null} />
                <DatoItem label="Edad menarquía" valor={historia.edad_menarquia ? `${historia.edad_menarquia} años` : null} />
                <DatoItem label="Última menstruación" valor={historia.fecha_ultima_menstruacion} />
                <DatoItem label="Progesterona lútea" valor={historia.progesterona_lutea ? `${historia.progesterona_lutea} ng/mL` : null} />
            </div>
        </div>
    );
}

function DatoItem({ label, valor, destacar }: { label: string; valor?: string | null; destacar?: boolean }) {
    return (
        <div className="rounded-xl border border-surface-border px-3 py-2.5 dark:border-surface-border-dark">
            <p className="text-[9.5px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">{label}</p>
            <p className={clsx('text-[13px] font-bold', destacar ? 'text-brand-orange' : 'text-ink dark:text-ink-dark')}>{valor ?? '—'}</p>
        </div>
    );
}

function formatRegularidad(valor?: string | null): string {
    const map: Record<string, string> = { regular: 'Regular', irregular: 'Irregular', ausente: 'Ausente' };
    return map[valor ?? ''] ?? 'No registrada';
}
