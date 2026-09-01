import {
    Activity, CheckCircle2, Clock3, ShieldCheck, ShieldX, TrendingUp,
    Scale, Droplets, HeartPulse, Sparkles, Minus, ArrowUp, ArrowDown,
} from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

type Punto = Record<string, string | number | boolean | null>;
export interface PanelEndocrinologico {
    derivacion_nutricional: {id_derivacion_nutricional:number;estado:string;prioridad:string;motivo_derivacion:string|null;fecha_derivacion:string|null;nutricionista:string|null}|null;
    elegibilidad: { elegible: boolean; motivo: string; origen: string | null; pmos: Record<string, unknown> | null; ri: Record<string, unknown> | null };
    seguimiento: { antropometria: Punto[]; glucosa_insulina: Punto[]; perfil_lipidico: Punto[]; sintomas: Punto[] };
    historial_diagnostico: { id: string; tipo: string; fecha: string | null; confirmado: boolean; resultado: string | null; estado_validacion: string | null; confianza: number | string | null; generado_por_motor: boolean; fecha_actualizacion: string | null; conclusion: string | null; observacion_validacion: string | null }[];
}

/* ── Configuración de métricas: etiqueta, unidad, rango de referencia y regla de alteración ── */
type Metrica = {
    campo: string;
    label: string;
    unidad?: string;
    ref?: string;
    // Devuelve true si el valor es clínicamente relevante (fuera de rango)
    alterado?: (v: number) => boolean;
    // 'up' = subir es peor (default) | 'down' = bajar es peor
    peor?: 'up' | 'down';
    decimales?: number;
};

const METRICAS: Record<string, { icon: typeof Activity; color: ColorKey; titulo: string; items: Metrica[] }> = {
    antropometria: {
        icon: Scale, color: 'green', titulo: 'Antropometría',
        items: [
            { campo: 'peso', label: 'Peso', unidad: 'kg', decimales: 1 },
            { campo: 'imc', label: 'IMC', ref: '18.5–24.9', alterado: (v) => v >= 25, decimales: 1 },
            { campo: 'cintura', label: 'Cintura', unidad: 'cm', ref: '< 80', alterado: (v) => v >= 80 },
            { campo: 'icc', label: 'ICC', ref: '< 0.85', alterado: (v) => v >= 0.85, decimales: 2 },
        ],
    },
    glucosa_insulina: {
        icon: Droplets, color: 'blue', titulo: 'Glucosa e insulina',
        items: [
            { campo: 'glucosa', label: 'Glucosa', unidad: 'mg/dL', ref: '70–99', alterado: (v) => v >= 100 },
            { campo: 'insulina', label: 'Insulina', unidad: 'µU/mL', ref: '2–20', alterado: (v) => v > 20 },
            { campo: 'homa_ir', label: 'HOMA-IR', ref: '< 2.5', alterado: (v) => v >= 2.5, decimales: 2 },
            { campo: 'quicki', label: 'QUICKI', ref: '> 0.33', alterado: (v) => v < 0.33, peor: 'down', decimales: 4 },
            { campo: 'hba1c', label: 'HbA1c', unidad: '%', ref: '< 5.7', alterado: (v) => v >= 5.7, decimales: 1 },
        ],
    },
    perfil_lipidico: {
        icon: HeartPulse, color: 'purple', titulo: 'Perfil lipídico',
        items: [
            { campo: 'colesterol_total', label: 'Colesterol', unidad: 'mg/dL', ref: '< 200', alterado: (v) => v >= 200 },
            { campo: 'hdl', label: 'HDL', unidad: 'mg/dL', ref: '≥ 50', alterado: (v) => v < 50, peor: 'down' },
            { campo: 'ldl', label: 'LDL', unidad: 'mg/dL', ref: '< 130', alterado: (v) => v >= 130 },
            { campo: 'trigliceridos', label: 'Triglicéridos', unidad: 'mg/dL', ref: '< 150', alterado: (v) => v >= 150 },
        ],
    },
};

type ColorKey = 'green' | 'blue' | 'purple';
const COLOR: Record<ColorKey, { chip: string; icon: string; ring: string }> = {
    green: { chip: 'bg-brand-green/12 text-brand-green-dark dark:text-brand-green', icon: 'text-brand-green-dark dark:text-brand-green', ring: 'bg-brand-green/10' },
    blue: { chip: 'bg-category-others/12 text-category-others', icon: 'text-category-others', ring: 'bg-category-others/10' },
    purple: { chip: 'bg-category-dairy/12 text-category-dairy', icon: 'text-category-dairy', ring: 'bg-category-dairy/10' },
};

export default function PanelSeguimientoEndocrinologico({ panel, pacienteId }: { panel: PanelEndocrinologico; pacienteId: number }) {
    const e = panel.elegibilidad;
    return <div className="space-y-4">
        <DerivacionNutricional panel={panel} pacienteId={pacienteId}/>
        {/* ── Elegibilidad ── */}
        <section className={clsx('rounded-2xl border p-5', e.elegible ? 'border-brand-green/25 bg-brand-green/[0.045]' : 'border-brand-orange/30 bg-brand-orange/[0.05]')}>
            <div className="flex items-start gap-3">
                <div className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', e.elegible ? 'bg-brand-green/15 text-brand-green-dark dark:text-brand-green' : 'bg-brand-orange/15 text-brand-orange')}>
                    {e.elegible ? <ShieldCheck size={19} /> : <ShieldX size={19} />} </div>
                <div className="flex-1"><p className="text-[13px] font-bold">Elegibilidad para planificación nutricional</p><p className="mt-1 text-[11px] text-ink-muted dark:text-ink-muted-dark">{e.motivo}</p>
                    <div className="mt-3 flex flex-wrap gap-2"><EstadoDiagnostico nombre="PMOS" dato={e.pmos} /><EstadoDiagnostico nombre="Resistencia a la insulina" dato={e.ri} /></div>
                </div>
                <span className={clsx('rounded-lg px-2.5 py-1 text-[10px] font-bold', e.elegible ? 'bg-brand-green/15 text-brand-green-dark dark:text-brand-green' : 'bg-brand-orange/15 text-brand-orange')}>{e.elegible ? 'Habilitada' : 'Bloqueada'}</span>
            </div>
        </section>

        {/* ── Seguimiento endocrinológico ── */}
        <section className="card-elevated p-5">
            <Titulo icon={TrendingUp} texto="Seguimiento endocrinológico" detalle="Último control y evolución respecto a la medición anterior" />
            <div className="mt-4 grid gap-3 xl:grid-cols-3">
                <TarjetaSerie config={METRICAS.antropometria} filas={panel.seguimiento.antropometria} />
                <TarjetaSerie config={METRICAS.glucosa_insulina} filas={panel.seguimiento.glucosa_insulina} />
                <TarjetaSerie config={METRICAS.perfil_lipidico} filas={panel.seguimiento.perfil_lipidico} />
            </div>
            <div className="mt-3"><TarjetaSintomas filas={panel.seguimiento.sintomas} /></div>
        </section>

        {/* ── Historial diagnóstico ── */}
        <section className="card-elevated p-5"><Titulo icon={Clock3} texto="Historial diagnóstico" detalle="Resultados, asistencia experta, correcciones y validaciones" />
            <div className="relative mt-5 space-y-4 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-surface-border dark:before:bg-surface-border-dark">
                {panel.historial_diagnostico.length ? panel.historial_diagnostico.map(item => <article key={item.id} className="relative pl-7"><span className={clsx('absolute left-0 top-1 h-[15px] w-[15px] rounded-full border-4 border-surface-card dark:border-surface-card-dark', item.confirmado ? 'bg-brand-green' : 'bg-brand-orange')} /><div className="rounded-xl border border-surface-border p-4 dark:border-surface-border-dark"><div className="flex flex-wrap justify-between gap-2"><div><p className="text-[12px] font-bold">{item.tipo}</p><p className="text-[10px] text-ink-muted">{item.fecha ?? 'Sin fecha'} · {item.resultado?.replaceAll('_', ' ') ?? 'Sin clasificación'}</p></div><div className="flex gap-1.5"><Badge texto={item.confirmado ? 'Confirmado' : 'No confirmado'} />{item.generado_por_motor && <Badge texto="Asistencia experta" />}<Badge texto={item.estado_validacion ?? 'pendiente'} /></div></div>{item.conclusion && <p className="mt-2 text-[11px]">{item.conclusion}</p>}{item.observacion_validacion && <p className="mt-2 text-[10px] text-ink-muted">Validación: {item.observacion_validacion}</p>}</div></article>) : <Vacio texto="Todavía no existen diagnósticos registrados." />}
            </div>
        </section>
    </div>;
}

function DerivacionNutricional({panel,pacienteId}:{panel:PanelEndocrinologico;pacienteId:number}) {
    const [modal,setModal]=useState(false); const form=useForm({motivo_derivacion:'',prioridad:'normal'}); const d=panel.derivacion_nutricional; const activa=!!d&&['pendiente','vista','en_proceso'].includes(d.estado);
    return <section className="card-elevated p-5"><div className="flex flex-wrap items-center justify-between gap-3"><Titulo icon={HeartPulse} texto="Derivación a nutrición" detalle="Continuidad coordinada del cuidado nutricional"/><div>{d&&<span className="mr-2 rounded-lg bg-brand-green/10 px-2.5 py-1 text-[10px] font-bold capitalize text-brand-green">{d.estado.replaceAll('_',' ')}</span>}{!activa&&<button onClick={()=>setModal(true)} className="rounded-xl bg-brand-green px-4 py-2 text-[11px] font-bold text-white">Derivar a nutrición</button>}</div></div>{d&&<div className="mt-4 rounded-xl border border-surface-border p-3 text-[11px] dark:border-surface-border-dark"><b>Prioridad {d.prioridad}</b><p className="mt-1 text-ink-muted">{d.motivo_derivacion||'Sin motivo adicional.'}</p>{activa&&<p className="mt-2 font-semibold text-brand-green">La paciente ya fue derivada a nutrición.</p>}</div>}{modal&&<div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-4"><form onSubmit={e=>{e.preventDefault();form.post(`/endocrinologo/pacientes/${pacienteId}/derivar-nutricion`,{onSuccess:()=>setModal(false)})}} className="w-full max-w-lg rounded-2xl bg-surface-card p-5 dark:bg-surface-card-dark"><h3 className="font-bold">Derivar paciente a nutrición</h3><label className="mt-4 block text-xs">Prioridad<select value={form.data.prioridad} onChange={e=>form.setData('prioridad',e.target.value)} className="mt-1 w-full rounded-xl border p-2 dark:bg-surface-card-dark"><option value="baja">Baja</option><option value="normal">Normal</option><option value="alta">Alta</option></select></label><label className="mt-3 block text-xs">Motivo<textarea value={form.data.motivo_derivacion} onChange={e=>form.setData('motivo_derivacion',e.target.value)} maxLength={1000} className="mt-1 min-h-28 w-full rounded-xl border p-3 dark:bg-surface-card-dark"/></label><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={()=>setModal(false)} className="rounded-xl border px-4 py-2 text-xs">Cancelar</button><button disabled={form.processing} className="rounded-xl bg-brand-green px-4 py-2 text-xs font-bold text-white">{form.processing?'Derivando...':'Confirmar derivación'}</button></div></form></div>}</section>;
}

/* ═══ Tarjeta de serie clínica (didáctica) ═══ */
function TarjetaSerie({ config, filas }: { config: typeof METRICAS[string]; filas: Punto[] }) {
    const Icon = config.icon;
    const c = COLOR[config.color];

    // Ordenar por fecha ascendente para tomar último y previo
    const ordenados = [...filas];
    const ultimo = ordenados[ordenados.length - 1] ?? null;
    const previo = ordenados.length >= 2 ? ordenados[ordenados.length - 2] : null;

    const tieneValores = ultimo && config.items.some((it) => toNum(ultimo[it.campo]) !== null);
    const alterados = ultimo ? config.items.filter((it) => {
        const v = toNum(ultimo[it.campo]);
        return v !== null && it.alterado?.(v);
    }).length : 0;

    return (
        <div className="rounded-2xl border border-surface-border overflow-hidden dark:border-surface-border-dark">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border dark:border-surface-border-dark">
                <div className="flex items-center gap-2.5">
                    <div className={clsx('flex h-8 w-8 items-center justify-center rounded-xl', c.ring)}>
                        <Icon size={15} strokeWidth={1.8} className={c.icon} />
                    </div>
                    <div>
                        <p className="text-[11.5px] font-bold text-ink dark:text-ink-dark">{config.titulo}</p>
                        <p className="text-[9px] text-ink-muted dark:text-ink-muted-dark">{ultimo ? String(ultimo.fecha ?? 'Sin fecha') : 'Sin control'}</p>
                    </div>
                </div>
                {tieneValores && (
                    <span className={clsx('rounded-lg px-2 py-1 text-[9px] font-bold',
                        alterados > 0 ? 'bg-brand-orange/12 text-brand-orange' : 'bg-brand-green/12 text-brand-green-dark dark:text-brand-green')}>
                        {alterados > 0 ? `${alterados} alterado${alterados > 1 ? 's' : ''}` : 'En rango'}
                    </span>
                )}
            </div>

            {/* Métricas del último control */}
            {tieneValores ? (
                <div className="grid grid-cols-2 gap-px bg-surface-border/60 dark:bg-surface-border-dark/60">
                    {config.items.map((it) => {
                        const val = toNum(ultimo![it.campo]);
                        const prev = previo ? toNum(previo[it.campo]) : null;
                        const alterado = val !== null && it.alterado ? it.alterado(val) : false;
                        return <CeldaMetrica key={it.campo} item={it} val={val} prev={prev} alterado={alterado} />;
                    })}
                </div>
            ) : (
                <Vacio texto="Sin controles registrados." />
            )}

            {/* Historial reciente compacto */}
            {ordenados.length > 1 && (
                <div className="border-t border-surface-border px-4 py-2.5 dark:border-surface-border-dark">
                    <p className="text-[8.5px] font-semibold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70 mb-1.5">Controles previos</p>
                    <div className="flex flex-wrap gap-1.5">
                        {ordenados.slice(0, -1).reverse().slice(0, 4).map((f, i) => (
                            <span key={i} className="rounded-md bg-black/[0.03] px-2 py-1 text-[9px] font-medium text-ink-muted dark:bg-white/[0.04] dark:text-ink-muted-dark">
                                {String(f.fecha ?? '—')}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══ Celda individual de métrica ═══ */
function CeldaMetrica({ item, val, prev, alterado }: { item: Metrica; val: number | null; prev: number | null; alterado: boolean }) {
    const dec = item.decimales ?? 0;
    const mostrado = val !== null ? val.toFixed(dec) : '—';

    // Tendencia respecto al valor previo
    let tendencia: 'up' | 'down' | 'igual' | null = null;
    let delta: number | null = null;
    if (val !== null && prev !== null) {
        delta = val - prev;
        tendencia = Math.abs(delta) < 0.0001 ? 'igual' : delta > 0 ? 'up' : 'down';
    }

    // ¿La tendencia es favorable? Por defecto subir es peor; algunas (HDL, QUICKI) al revés.
    const peorAlSubir = (item.peor ?? 'up') === 'up';
    const tendenciaMala = tendencia === 'up' ? peorAlSubir : tendencia === 'down' ? !peorAlSubir : false;

    return (
        <div className="bg-surface-card px-3 py-2.5 dark:bg-surface-card-dark">
            <div className="flex items-center justify-between">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{item.label}</p>
                {tendencia && val !== null && (
                    <span className={clsx('flex items-center gap-0.5 text-[8.5px] font-bold',
                        tendencia === 'igual' ? 'text-ink-muted/60 dark:text-ink-muted-dark/60'
                            : tendenciaMala ? 'text-brand-orange' : 'text-brand-green-dark dark:text-brand-green')}>
                        {tendencia === 'igual' ? <Minus size={9} strokeWidth={2.5} /> : tendencia === 'up' ? <ArrowUp size={9} strokeWidth={2.5} /> : <ArrowDown size={9} strokeWidth={2.5} />}
                        {delta !== null && delta !== 0 ? Math.abs(delta).toFixed(item.decimales ?? 0) : ''}
                    </span>
                )}
            </div>
            <p className={clsx('mt-0.5 text-[16px] font-bold leading-none', alterado ? 'text-brand-orange' : 'text-ink dark:text-ink-dark')}>
                {mostrado}
                {val !== null && item.unidad && <span className="ml-0.5 text-[9px] font-medium text-ink-muted dark:text-ink-muted-dark">{item.unidad}</span>}
            </p>
            {item.ref && (
                <p className="mt-0.5 text-[8px] text-ink-muted/70 dark:text-ink-muted-dark/70">Ref. {item.ref}</p>
            )}
        </div>
    );
}

/* ═══ Tarjeta de síntomas ═══ */
function TarjetaSintomas({ filas }: { filas: Punto[] }) {
    // Los síntomas llegan en orden descendente (más reciente primero)
    const ultimo = filas[0] ?? null;
    const campos: { campo: string; label: string }[] = [
        { campo: 'energia', label: 'Energía' },
        { campo: 'ansiedad', label: 'Ansiedad' },
        { campo: 'acne', label: 'Acné' },
        { campo: 'dolor_menstrual', label: 'Dolor menstrual' },
        { campo: 'irregularidad_menstrual', label: 'Irregularidad menstrual' },
    ];
    const conDatos = ultimo && campos.some((c) => ultimo[c.campo] !== null && ultimo[c.campo] !== undefined);

    return (
        <div className="rounded-2xl border border-surface-border overflow-hidden dark:border-surface-border-dark">
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border dark:border-surface-border-dark">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange/10">
                        <Sparkles size={15} strokeWidth={1.8} className="text-brand-orange" />
                    </div>
                    <div>
                        <p className="text-[11.5px] font-bold text-ink dark:text-ink-dark">Síntomas informados por la paciente</p>
                        <p className="text-[9px] text-ink-muted dark:text-ink-muted-dark">{ultimo ? String(ultimo.fecha ?? 'Sin fecha') : 'Sin reporte'}</p>
                    </div>
                </div>
            </div>
            {conDatos ? (
                <div className="flex flex-wrap gap-2 px-4 py-3">
                    {campos.map((c) => {
                        const raw = ultimo![c.campo];
                        if (raw === null || raw === undefined) return null;
                        return <ChipSintoma key={c.campo} label={c.label} valor={raw} />;
                    })}
                </div>
            ) : (
                <Vacio texto="La paciente aún no ha reportado síntomas de seguimiento." />
            )}
        </div>
    );
}

function ChipSintoma({ label, valor }: { label: string; valor: string | number | boolean }) {
    // Escala 1-5 o texto; coloreamos según severidad si es numérico
    const num = toNum(valor);
    let tono = 'bg-black/[0.04] text-ink-muted dark:bg-white/[0.05] dark:text-ink-muted-dark';
    if (num !== null) {
        tono = num >= 4 ? 'bg-category-fruits/12 text-category-fruits'
            : num >= 3 ? 'bg-brand-orange/12 text-brand-orange'
                : 'bg-brand-green/12 text-brand-green-dark dark:text-brand-green';
    } else if (typeof valor === 'boolean') {
        tono = valor ? 'bg-brand-orange/12 text-brand-orange' : 'bg-brand-green/12 text-brand-green-dark dark:text-brand-green';
    }
    const texto = typeof valor === 'boolean' ? (valor ? 'Sí' : 'No') : String(valor);
    return (
        <span className={clsx('inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold', tono)}>
            {label}
            <span className="rounded-md bg-white/40 px-1.5 py-0.5 text-[9px] dark:bg-black/20">{texto}</span>
        </span>
    );
}

/* ═══ Helpers ═══ */
function toNum(v: unknown): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

function EstadoDiagnostico({ nombre, dato }: { nombre: string; dato: Record<string, unknown> | null }) { const ok = Boolean(dato?.confirmado); return <span className={clsx('inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-semibold', ok ? 'bg-brand-green/12 text-brand-green-dark dark:text-brand-green' : 'bg-black/[0.04] text-ink-muted dark:bg-white/[0.05]')}>{ok ? <CheckCircle2 size={11} /> : <Activity size={11} />} {nombre}: {dato ? (ok ? 'confirmado' : 'no confirmado') : 'sin registro'}</span> }
function Titulo({ icon: Icon, texto, detalle }: { icon: typeof Activity; texto: string; detalle: string }) { return <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green/12 text-brand-green-dark dark:text-brand-green"><Icon size={17} /></div><div><h3 className="text-[13px] font-bold">{texto}</h3><p className="text-[10px] text-ink-muted">{detalle}</p></div></div> }
function Badge({ texto }: { texto: string }) { return <span className="rounded-md bg-black/[0.045] px-2 py-1 text-[9px] font-semibold capitalize text-ink-muted dark:bg-white/[0.06]">{texto.replaceAll('_', ' ')}</span> }
function Vacio({ texto }: { texto: string }) { return <p className="px-4 py-4 text-[10px] text-ink-muted dark:text-ink-muted-dark">{texto}</p> }
