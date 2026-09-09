import { Activity, ArrowDown, ArrowRight, ArrowUp, Ruler, Scale, Target } from 'lucide-react';
import clsx from 'clsx';

interface Progreso { evaluacion: { fecha_ultima_evaluacion: string | null; peso_inicial: number | null; peso_actual: number | null; cambio_peso: number | null; imc_actual: number | null; clasificacion_imc: string | null; cambio_imc: number | null; cintura_inicial: number | null; cintura_actual: number | null; cambio_cintura: number | null }; objetivo: { objetivo_principal: string | null; calorias_objetivo: number | null; proteinas_objetivo: number | null; carbohidratos_objetivo: number | null; grasas_objetivo: number | null; fibra_objetivo: number | null }; adherencia: { comidas_totales: number; completadas: number; parciales: number; no_realizadas: number; reemplazadas: number; pendientes: number; porcentaje_adherencia: number }; mensaje: string }
export type { Progreso };
export interface RegistroProgresoPaciente { id: number; fecha: string | null; peso: number | null; imc: number | null; cintura: number | null; cadera: number | null; porcentaje_grasa: number | null; masa_muscular: number | null }

const n = (v: number | null, unidad = '') => v === null ? 'Sin registro' : `${v.toLocaleString('es-BO', { maximumFractionDigits: 2 })}${unidad}`;

export default function ProgresoPacienteCard({ progreso, historial = [] }: { progreso: Progreso | null; historial?: RegistroProgresoPaciente[] }) {
    if (!progreso) return null;
    const e = progreso.evaluacion, a = progreso.adherencia, o = progreso.objetivo;

    return (
        <section className="overflow-hidden rounded-2xl border border-surface-border bg-surface-card p-5 shadow-sm dark:border-surface-border-dark dark:bg-surface-card-dark">
            {/* Header */}
            <div className="flex items-start gap-3 border-b border-surface-border pb-4 dark:border-surface-border-dark">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-info/15 text-info">
                    <Activity size={18} strokeWidth={1.8} />
                </div>
                <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-info">Tu evolución</p>
                    <h2 className="mt-0.5 text-[15px] font-bold text-ink dark:text-ink-dark">Mi progreso</h2>
                    <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">{progreso.mensaje}</p>
                </div>
            </div>

            {/* Grid de métricas */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <MetricaCard icon={<Scale size={16} />} titulo="Peso" valor={n(e.peso_actual, ' kg')} subtitulo={`Inicial: ${n(e.peso_inicial, ' kg')}`} cambio={e.cambio_peso} unidad=" kg" color="green" positivo="down" />
                <MetricaCard icon={<Activity size={16} />} titulo="IMC" valor={n(e.imc_actual)} subtitulo={e.clasificacion_imc ?? 'Sin clasificación'} cambio={e.cambio_imc} unidad="" color="purple" positivo="down" />
                <MetricaCard icon={<Ruler size={16} />} titulo="Cintura" valor={n(e.cintura_actual, ' cm')} subtitulo={`Inicial: ${n(e.cintura_inicial, ' cm')}`} cambio={e.cambio_cintura} unidad=" cm" color="orange" positivo="down" />
                <MetricaCard icon={<Activity size={16} />} titulo="Adherencia" valor={n(a.porcentaje_adherencia, '%')} subtitulo={`${a.completadas} completas · ${a.pendientes} pendientes`} pct={a.porcentaje_adherencia} color="blue" />
                <MetricaCard icon={<Target size={16} />} titulo="Objetivo" valor={o.objetivo_principal?.replaceAll('_', ' ') ?? 'Por definir'} subtitulo={`${n(o.calorias_objetivo, ' kcal/día')}`} color="red" esTexto />
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_.8fr]">
                <ComparativaMedidas evaluacion={e} />
                <ResumenHabitos adherencia={a} objetivo={o} />
            </div>

            {historial.length > 0 && <HistorialCambios historial={historial} />}

            {e.fecha_ultima_evaluacion && (
                <p className="mt-3 text-[10px] text-ink-muted/50 dark:text-ink-muted-dark/50">Última medición registrada: {e.fecha_ultima_evaluacion}</p>
            )}
        </section>
    );
}

function HistorialCambios({ historial }: { historial: RegistroProgresoPaciente[] }) {
    const fecha = (valor: string | null) => valor ? new Date(`${valor}T12:00:00`).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' }) : 'Sin fecha';
    const delta = (actual: number | null, anterior: number | null, unidad: string) => actual === null || anterior === null ? 'Sin comparación' : `${actual - anterior > 0 ? '+' : ''}${n(actual - anterior, unidad)}`;
    return <section className="mt-4 overflow-hidden rounded-2xl border border-surface-border dark:border-surface-border-dark"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border bg-black/[.012] px-4 py-3 dark:border-surface-border-dark dark:bg-white/[.018]"><div><p className="text-[9px] font-bold uppercase tracking-[.14em] text-category-dairy">Tu recorrido</p><h3 className="mt-0.5 text-[13px] font-bold text-ink dark:text-ink-dark">Historial de cambios</h3></div><span className="rounded-full bg-category-dairy/10 px-2.5 py-1 text-[9px] font-bold text-category-dairy">{historial.length} control{historial.length === 1 ? '' : 'es'}</span></div><div className="overflow-x-auto"><div className="flex min-w-max gap-3 p-4">{historial.map((registro, indice) => { const previo = historial[indice - 1]; const actual = indice === historial.length - 1; return <article key={registro.id} className={clsx('relative w-52 rounded-xl border p-3', actual ? 'border-brand-green/30 bg-brand-green/[.055] dark:bg-brand-green/[.08]' : 'border-surface-border bg-surface-card dark:border-surface-border-dark dark:bg-surface-card-dark')}><div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-bold text-ink dark:text-ink-dark">{fecha(registro.fecha)}</span><span className={clsx('h-2.5 w-2.5 rounded-full', actual ? 'bg-brand-green ring-4 ring-brand-green/15' : 'bg-category-dairy')}/></div><p className="text-[17px] font-bold text-ink dark:text-ink-dark">{n(registro.peso, ' kg')}</p><p className="mt-0.5 text-[9px] text-ink-muted dark:text-ink-muted-dark">Peso registrado</p><div className="mt-3 grid grid-cols-2 gap-2 border-t border-surface-border/70 pt-3 text-[9px] dark:border-surface-border-dark"><div><p className="text-ink-muted dark:text-ink-muted-dark">vs. anterior</p><p className={clsx('mt-0.5 font-bold', !previo || registro.peso === null || previo.peso === null ? 'text-ink-muted' : registro.peso <= previo.peso ? 'text-brand-green-dark dark:text-brand-green' : 'text-brand-orange')}>{previo ? delta(registro.peso, previo.peso, ' kg') : 'Primer control'}</p></div><div><p className="text-ink-muted dark:text-ink-muted-dark">Cintura</p><p className="mt-0.5 font-bold text-ink dark:text-ink-dark">{n(registro.cintura, ' cm')}</p></div></div>{actual && <p className="mt-3 rounded-lg bg-brand-green/12 px-2 py-1 text-center text-[8.5px] font-bold text-brand-green-dark dark:text-brand-green">Medición actual</p>}</article>; })}</div></div></section>;
}

function ComparativaMedidas({ evaluacion: e }: { evaluacion: Progreso['evaluacion'] }) {
    const datos = [
        { etiqueta: 'Peso', inicial: e.peso_inicial, actual: e.peso_actual, unidad: 'kg', color: 'bg-brand-green' },
        { etiqueta: 'Cintura', inicial: e.cintura_inicial, actual: e.cintura_actual, unidad: 'cm', color: 'bg-brand-orange' },
    ].filter(d => d.inicial !== null && d.actual !== null) as { etiqueta: string; inicial: number; actual: number; unidad: string; color: string }[];

    return <section className="rounded-2xl border border-surface-border bg-black/[0.012] p-4 dark:border-surface-border-dark dark:bg-white/[0.018]">
        <div className="flex items-start justify-between gap-3"><div><p className="text-[9px] font-bold uppercase tracking-[.14em] text-info">Cambio visible</p><h3 className="mt-0.5 text-[13px] font-bold text-ink dark:text-ink-dark">Desde tu primer control</h3><p className="mt-0.5 text-[10px] text-ink-muted dark:text-ink-muted-dark">Comparamos la primera medición con la más reciente.</p></div><span className="rounded-full bg-info/10 px-2.5 py-1 text-[9px] font-bold text-info">Tus medidas</span></div>
        {datos.length ? <div className="mt-4 space-y-3">{datos.map(d => <GraficaComparativa key={d.etiqueta} {...d} />)}</div> : <p className="mt-4 rounded-xl bg-surface-card px-3 py-4 text-center text-[10.5px] text-ink-muted dark:bg-surface-card-dark dark:text-ink-muted-dark">Aún faltan dos mediciones para comparar este indicador.</p>}
    </section>;
}

function GraficaComparativa({ etiqueta, inicial, actual, unidad, color }: { etiqueta: string; inicial: number; actual: number; unidad: string; color: string }) {
    const maximo = Math.max(inicial, actual, 1);
    const cambio = actual - inicial;
    return <div>
        <div className="mb-1.5 flex items-center justify-between"><span className="text-[10.5px] font-bold text-ink dark:text-ink-dark">{etiqueta}</span><span className={clsx('text-[10px] font-bold', cambio < 0 ? 'text-brand-green-dark dark:text-brand-green' : cambio > 0 ? 'text-brand-orange' : 'text-ink-muted')}>{cambio === 0 ? 'Sin cambio' : `${cambio > 0 ? '+' : ''}${n(cambio, ` ${unidad}`)}`}</span></div>
        <BarraComparativa etiqueta="Inicio" valor={inicial} maximo={maximo} unidad={unidad} color="bg-ink-muted/30" />
        <BarraComparativa etiqueta="Ahora" valor={actual} maximo={maximo} unidad={unidad} color={color} />
    </div>;
}

function BarraComparativa({ etiqueta, valor, maximo, unidad, color }: { etiqueta: string; valor: number; maximo: number; unidad: string; color: string }) {
    return <div className="mb-1.5 flex items-center gap-2"><span className="w-10 text-[9px] text-ink-muted dark:text-ink-muted-dark">{etiqueta}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/[.07]"><div className={clsx('h-full rounded-full', color)} style={{ width: `${Math.max((valor / maximo) * 100, 4)}%` }} /></div><span className="w-16 text-right text-[9.5px] font-semibold text-ink dark:text-ink-dark">{n(valor, ` ${unidad}`)}</span></div>;
}

function ResumenHabitos({ adherencia: a, objetivo: o }: { adherencia: Progreso['adherencia']; objetivo: Progreso['objetivo'] }) {
    const porcentaje = Math.max(0, Math.min(100, Number(a.porcentaje_adherencia ?? 0)));
    const anillo = { background: `conic-gradient(#20b52b ${porcentaje}%, rgba(32,181,43,.13) 0)` };
    return <section className="rounded-2xl border border-brand-green/20 bg-gradient-to-br from-brand-green/[.07] to-transparent p-4 dark:from-brand-green/[.09]">
        <div className="flex items-start justify-between gap-3"><div><p className="text-[9px] font-bold uppercase tracking-[.14em] text-brand-green-dark dark:text-brand-green">Pequeños pasos</p><h3 className="mt-0.5 text-[13px] font-bold text-ink dark:text-ink-dark">Constancia de esta semana</h3><p className="mt-0.5 text-[10px] text-ink-muted dark:text-ink-muted-dark">Cada comida registrada cuenta para tu acompañamiento.</p></div><div className="relative flex h-16 w-16 items-center justify-center rounded-full" style={anillo}><div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-card text-[13px] font-bold text-brand-green-dark dark:bg-surface-card-dark dark:text-brand-green">{n(porcentaje)}%</div></div></div>
        <div className="mt-4 grid grid-cols-3 gap-2"><MiniDato valor={a.completadas} etiqueta="completadas"/><MiniDato valor={a.parciales} etiqueta="parciales"/><MiniDato valor={a.pendientes} etiqueta="por registrar" alerta={a.pendientes > 0}/></div>
        <div className="mt-3 rounded-xl border border-brand-green/15 bg-surface-card/60 px-3 py-2.5 text-[10px] dark:bg-surface-card-dark/60"><span className="font-semibold text-brand-green-dark dark:text-brand-green">Tu enfoque:</span> <span className="capitalize text-ink-muted dark:text-ink-muted-dark">{o.objetivo_principal?.replaceAll('_', ' ') ?? 'definir tu objetivo con nutrición'}</span></div>
    </section>;
}

function MiniDato({ valor, etiqueta, alerta = false }: { valor: number; etiqueta: string; alerta?: boolean }) { return <div className="rounded-xl bg-surface-card/70 px-2 py-2 text-center dark:bg-surface-card-dark/70"><p className={clsx('text-[14px] font-bold', alerta ? 'text-brand-orange' : 'text-brand-green-dark dark:text-brand-green')}>{valor}</p><p className="mt-0.5 text-[8.5px] leading-tight text-ink-muted dark:text-ink-muted-dark">{etiqueta}</p></div>; }

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
