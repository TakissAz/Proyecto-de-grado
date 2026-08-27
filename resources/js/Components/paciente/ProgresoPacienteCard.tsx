import { Activity, ArrowDown, ArrowRight, ArrowUp, Ruler, Scale, Target } from 'lucide-react';
import clsx from 'clsx';

interface Progreso { evaluacion: { fecha_ultima_evaluacion: string | null; peso_inicial: number | null; peso_actual: number | null; cambio_peso: number | null; imc_actual: number | null; clasificacion_imc: string | null; cambio_imc: number | null; cintura_inicial: number | null; cintura_actual: number | null; cambio_cintura: number | null }; objetivo: { objetivo_principal: string | null; calorias_objetivo: number | null; proteinas_objetivo: number | null; carbohidratos_objetivo: number | null; grasas_objetivo: number | null; fibra_objetivo: number | null }; adherencia: { comidas_totales: number; completadas: number; parciales: number; no_realizadas: number; reemplazadas: number; pendientes: number; porcentaje_adherencia: number }; mensaje: string }
export type { Progreso };

const n = (v: number | null, unidad = '') => v === null ? 'Sin registro' : `${v.toLocaleString('es-BO', { maximumFractionDigits: 2 })}${unidad}`;

export default function ProgresoPacienteCard({ progreso }: { progreso: Progreso | null }) {
    if (!progreso) return null;
    const e = progreso.evaluacion, a = progreso.adherencia, o = progreso.objetivo;

    return (
        <section className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-info/15 text-info">
                    <Activity size={18} strokeWidth={1.8} />
                </div>
                <div>
                    <h2 className="text-[14px] font-bold text-ink dark:text-ink-dark">Mi progreso</h2>
                    <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">{progreso.mensaje}</p>
                </div>
            </div>

            {/* Grid de métricas */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <MetricaCard icon={<Scale size={16} />} titulo="Peso" valor={n(e.peso_actual, ' kg')} subtitulo={`Inicial: ${n(e.peso_inicial, ' kg')}`} cambio={e.cambio_peso} unidad=" kg" color="green" positivo="down" />
                <MetricaCard icon={<Activity size={16} />} titulo="IMC" valor={n(e.imc_actual)} subtitulo={e.clasificacion_imc ?? 'Sin clasificación'} cambio={e.cambio_imc} unidad="" color="purple" positivo="down" />
                <MetricaCard icon={<Ruler size={16} />} titulo="Cintura" valor={n(e.cintura_actual, ' cm')} subtitulo={`Inicial: ${n(e.cintura_inicial, ' cm')}`} cambio={e.cambio_cintura} unidad=" cm" color="orange" positivo="down" />
                <MetricaCard icon={<Activity size={16} />} titulo="Adherencia" valor={n(a.porcentaje_adherencia, '%')} subtitulo={`${a.completadas} completas · ${a.pendientes} pendientes`} pct={a.porcentaje_adherencia} color="blue" />
                <MetricaCard icon={<Target size={16} />} titulo="Objetivo" valor={o.objetivo_principal?.replaceAll('_', ' ') ?? 'Por definir'} subtitulo={`${n(o.calorias_objetivo, ' kcal/día')}`} color="red" esTexto />
            </div>

            {e.fecha_ultima_evaluacion && (
                <p className="text-[10px] text-ink-muted/50 dark:text-ink-muted-dark/50">Último registro: {e.fecha_ultima_evaluacion}</p>
            )}
        </section>
    );
}

const colorConfig: Record<string, { bg: string; icon: string; border: string }> = {
    green: { bg: 'bg-brand-green/[0.05] dark:bg-brand-green/[0.07]', icon: 'bg-brand-green/15 text-brand-green-dark dark:text-brand-green', border: 'border-brand-green/20' },
    purple: { bg: 'bg-category-dairy/[0.05] dark:bg-category-dairy/[0.07]', icon: 'bg-category-dairy/15 text-category-dairy', border: 'border-category-dairy/20' },
    orange: { bg: 'bg-brand-orange/[0.05] dark:bg-brand-orange/[0.07]', icon: 'bg-brand-orange/15 text-brand-orange', border: 'border-brand-orange/20' },
    blue: { bg: 'bg-info/[0.05] dark:bg-info/[0.07]', icon: 'bg-info/15 text-info', border: 'border-info/20' },
    red: { bg: 'bg-category-fruits/[0.05] dark:bg-category-fruits/[0.07]', icon: 'bg-category-fruits/15 text-category-fruits', border: 'border-category-fruits/20' },
};

function MetricaCard({ icon, titulo, valor, subtitulo, cambio, unidad, pct, color, positivo, esTexto }: { icon: React.ReactNode; titulo: string; valor: string; subtitulo: string; cambio?: number | null; unidad?: string; pct?: number; color: string; positivo?: 'up' | 'down'; esTexto?: boolean }) {
    const c = colorConfig[color] ?? colorConfig.green;
    const CambioIcon = cambio === null || cambio === undefined ? null : cambio < 0 ? ArrowDown : cambio > 0 ? ArrowUp : ArrowRight;
    const esPositivo = cambio !== null && cambio !== undefined && ((positivo === 'down' && cambio < 0) || (positivo === 'up' && cambio > 0));
    const esNegativo = cambio !== null && cambio !== undefined && ((positivo === 'down' && cambio > 0) || (positivo === 'up' && cambio < 0));

    return (
        <div className={clsx('rounded-xl border p-4', c.bg, c.border)}>
            <div className="flex items-center gap-2">
                <div className={clsx('flex h-7 w-7 items-center justify-center rounded-lg', c.icon)}>{icon}</div>
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{titulo}</span>
            </div>
            <p className={clsx('mt-2.5 font-bold text-ink dark:text-ink-dark', esTexto ? 'text-[12px] capitalize' : 'text-[18px]')}>{valor}</p>
            {CambioIcon && cambio !== null && cambio !== undefined && (
                <div className={clsx('flex items-center gap-1 mt-1.5 rounded-md px-2 py-0.5 w-fit text-[10px] font-semibold', esPositivo ? 'bg-brand-green/10 text-brand-green-dark dark:text-brand-green' : esNegativo ? 'bg-category-fruits/10 text-category-fruits' : 'bg-black/[0.04] text-ink-muted dark:bg-white/[0.06] dark:text-ink-muted-dark')}>
                    <CambioIcon size={11} />{cambio > 0 ? '+' : ''}{n(cambio, unidad ?? '')}
                </div>
            )}
            {pct !== undefined && (
                <div className="mt-2 h-1.5 w-full rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-brand-green transition-all" style={{ width: `${pct}%` }} />
                </div>
            )}
            <p className="mt-1.5 text-[10px] text-ink-muted/70 dark:text-ink-muted-dark/70">{subtitulo}</p>
        </div>
    );
}
