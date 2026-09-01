import { AlertTriangle, BrainCircuit, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Download, FileText, Filter, GitCompare, Sparkles, Target, X } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { Badge } from '@/Components/ui/badge';

type TextoLista = string[];
interface RecomendacionOrigen {
    id: number; enfoque: string | null; prioridad: string | null; conclusion: string | null;
    confianza: number | null; version_motor: string | null; estado_validacion: string | null;
    fecha_validacion: string | null; reglas_activadas: TextoLista; explicacion: TextoLista;
    recomendaciones: TextoLista; restricciones: TextoLista; alertas: TextoLista;
}
interface ComponenteHistorial { tipo_componente: string; nombre: string | null; cantidad: number; unidad: string | null; calorias?: number; proteinas?: number; carbohidratos?: number; grasas?: number; fibra?: number; observaciones?: string | null; explicacion_seleccion?: { puntaje_experto:number|null; puntaje_ajustado:number|null; asistido_por_groq?:boolean; puntaje_groq?:number|null; motivos_groq?:string[]; motivos:string[]; advertencias:string[] } }
interface ComidaHistorial { tipo_comida: string; nombre_comida: string; hora_sugerida: string | null; calorias: number; proteinas?: number; carbohidratos?: number; grasas?: number; fibra?: number; observaciones?: string | null; componentes: ComponenteHistorial[] }
interface DiaHistorialTipo { numero_dia: number; nombre_dia: string; fecha?: string | null; calorias?: number; proteinas?: number; carbohidratos?: number; grasas?: number; fibra?: number; comidas: ComidaHistorial[] }

export interface HistorialPlan {
    id_plan_alimentario: number; nombre_plan: string; estado_plan: string; fecha_inicio: string | null; fecha_fin: string | null;
    calorias_planificadas: number; calorias_objetivo?: number; proteinas_objetivo?: number; proteinas_planificadas?: number;
    carbohidratos_objetivo?: number; carbohidratos_planificados?: number; grasas_objetivo?: number; grasas_planificadas?: number;
    fibra_objetivo?: number; fibra_planificada?: number; total_dias: number; total_comidas: number; total_componentes_receta?: number;
    total_componentes_manual?: number; porcentaje_adherencia: number; resumen?: string; generado_por_sistema_experto?: boolean;
    puede_editar?: boolean; observaciones?: string | null; recomendacion_origen?: RecomendacionOrigen | string | null; dias: DiaHistorialTipo[];
}
export interface HistorialPlanes {
    planes: HistorialPlan[]; total_planes: number;
    comparacion: { tiene_plan_anterior: boolean; cambios: Record<string, number>; mensaje: string };
    comparacion_detallada?: { tiene_plan_anterior: boolean; resumen: string; cambios_recetas: { recetas_mantenidas: string[]; recetas_nuevas: string[]; recetas_retiradas: string[] }; motivos_cambio?: string[]; datos_considerados?: string[]; mensajes?: string[] };
}

const n = (v: unknown) => Number(v ?? 0).toLocaleString('es-BO', { maximumFractionDigits: 1 });
const etiqueta = (v?: string | null) => v ? v.replaceAll('_', ' ') : 'No definido';
const lista = (v?: TextoLista | null) => Array.isArray(v) ? v.filter(Boolean) : [];

export default function HistorialPlanesNutricionista({ historial, pacienteId }: { historial: HistorialPlanes; pacienteId?: number }) {
    const [estado, setEstado] = useState(''), [origen, setOrigen] = useState(''), [desde, setDesde] = useState(''), [hasta, setHasta] = useState('');
    const filtrados = historial.planes.filter(plan => {
        if (estado && plan.estado_plan !== estado) return false;
        if (origen === 'experto' && !plan.generado_por_sistema_experto) return false;
        if (origen === 'manual' && plan.generado_por_sistema_experto) return false;
        if (desde && (!plan.fecha_inicio || plan.fecha_inicio < desde)) return false;
        if (hasta && (!plan.fecha_inicio || plan.fecha_inicio > hasta)) return false;
        return true;
    });
    const hayFiltros = !!(estado || origen || desde || hasta);
    const parametros = Object.fromEntries(Object.entries({ paciente: pacienteId, estado, origen, desde, hasta }).filter(([, valor]) => valor));
    const limpiar = () => { setEstado(''); setOrigen(''); setDesde(''); setHasta('') };
    return <section className="space-y-4">
        <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange"><FileText size={19} /></div>
            <div><h2 className="text-[15px] font-bold text-ink dark:text-ink-dark">Historial y fundamento de planes</h2><p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">{historial.total_planes} plan(es) con trazabilidad clínica, nutricional y experta.</p></div>
        </div>
        <Comparacion datos={historial} />
        <div className="rounded-2xl border border-surface-border bg-black/[0.015] p-4 dark:border-surface-border-dark dark:bg-white/[0.02]">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><Filter size={14} className="text-brand-green-dark dark:text-brand-green"/><div><h3 className="text-[12px] font-bold text-ink dark:text-ink-dark">Filtros del historial</h3><p className="text-[9.5px] text-ink-muted">{filtrados.length} de {historial.total_planes} planes seleccionados</p></div></div>{hayFiltros && <button type="button" onClick={limpiar} className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-ink-muted hover:text-ink dark:hover:text-ink-dark"><X size={12}/> Limpiar filtros</button>}</div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <FiltroSelect label="Estado" value={estado} onChange={setEstado} opciones={[['','Todos'],['sugerido','Sugerido'],['en_revision','En revisión'],['aprobado','Aprobado'],['activo','Activo'],['rechazado','Rechazado'],['finalizado','Finalizado']]} />
                <FiltroSelect label="Origen" value={origen} onChange={setOrigen} opciones={[['','Todos'],['experto','Asistencia experta'],['manual','Elaboración profesional']]} />
                <FiltroFecha label="Desde" value={desde} onChange={setDesde} max={hasta || undefined}/>
                <FiltroFecha label="Hasta" value={hasta} onChange={setHasta} min={desde || undefined}/>
            </div>
            {pacienteId && <div className="mt-3 flex justify-end"><a href={route('nutricionista.pacientes.planes-alimentarios.historial.reporte-pdf', parametros)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-brand-green/15 px-4 py-2.5 text-[11px] font-bold text-brand-green-dark transition-colors hover:bg-brand-green/25 dark:text-brand-green"><Download size={13}/> Descargar reporte filtrado</a></div>}
        </div>
        {filtrados.length === 0
            ? <div className="rounded-xl border border-dashed border-surface-border py-8 text-center text-[12px] text-ink-muted dark:border-surface-border-dark">No existen planes que coincidan con los filtros.</div>
            : <div className="space-y-3">{filtrados.map(plan => <PlanItem key={plan.id_plan_alimentario} plan={plan} />)}</div>}
    </section>;
}

function FiltroSelect({ label, value, onChange, opciones }: { label:string; value:string; onChange:(valor:string)=>void; opciones:[string,string][] }) { return <label><span className="mb-1 block text-[9.5px] font-semibold text-ink-muted">{label}</span><select value={value} onChange={e=>onChange(e.target.value)} className="w-full rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-[11px] text-ink outline-none focus:border-brand-green/50 dark:border-surface-border-dark dark:bg-surface-card-dark dark:text-ink-dark">{opciones.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label> }
function FiltroFecha({ label, value, onChange, min, max }: { label:string; value:string; onChange:(valor:string)=>void; min?:string; max?:string }) { return <label><span className="mb-1 block text-[9.5px] font-semibold text-ink-muted">{label}</span><input type="date" value={value} min={min} max={max} onChange={e=>onChange(e.target.value)} className="w-full rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-[11px] text-ink outline-none focus:border-brand-green/50 dark:border-surface-border-dark dark:bg-surface-card-dark dark:text-ink-dark"/></label> }

function PlanItem({ plan: p }: { plan: HistorialPlan }) {
    const [abierto, setAbierto] = useState(false);
    const estadoColor = ['aprobado', 'activo'].includes(p.estado_plan) ? 'green' : ['rechazado', 'finalizado'].includes(p.estado_plan) ? 'red' : 'orange';
    const r = typeof p.recomendacion_origen === 'object' ? p.recomendacion_origen : null;
    return <article className="overflow-hidden rounded-2xl border border-surface-border bg-surface-card dark:border-surface-border-dark dark:bg-surface-card-dark">
        <button type="button" onClick={() => setAbierto(!abierto)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-black/[0.015] dark:hover:bg-white/[0.02]">
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><h3 className="text-[13.5px] font-bold text-ink dark:text-ink-dark">{p.nombre_plan}</h3><Badge color={estadoColor}>{etiqueta(p.estado_plan)}</Badge>{p.generado_por_sistema_experto && <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-green-dark dark:text-brand-green"><Sparkles size={10} /> Asistencia experta</span>}</div>
                <p className="mt-1 flex items-center gap-1.5 text-[10.5px] text-ink-muted dark:text-ink-muted-dark"><CalendarDays size={11} /> {p.fecha_inicio ?? 'Sin fecha'} al {p.fecha_fin ?? 'Sin fecha'} · {p.total_dias} días · {p.total_comidas} comidas</p>
                {p.resumen && <p className="mt-2 text-[11px] text-ink/75 dark:text-ink-dark/75">{p.resumen}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-3"><div className="text-right"><b className="text-[14px] text-ink dark:text-ink-dark">{n(p.porcentaje_adherencia)}%</b><p className="text-[9px] text-ink-muted">adherencia</p></div><ChevronDown size={15} className={clsx('transition-transform', abierto && 'rotate-180')} /></div>
        </button>

        {abierto && <div className="space-y-5 border-t border-surface-border px-5 py-5 dark:border-surface-border-dark">
            <OrigenExperto plan={p} recomendacion={r} />
            <Balance plan={p} />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><Dato label="Energía planificada" valor={`${n(p.calorias_planificadas)} kcal`} /><Dato label="Recetas seleccionadas" valor={n(p.total_componentes_receta)} /><Dato label="Pendientes manuales" valor={n(p.total_componentes_manual)} alerta={Number(p.total_componentes_manual) > 0} /><Dato label="Adherencia registrada" valor={`${n(p.porcentaje_adherencia)}%`} /></div>
            <CarruselDias dias={p.dias} />
            <div className="flex flex-wrap gap-2"><Accion href={route('nutricionista.planes.reporte-pdf', p.id_plan_alimentario)} icono={<Download size={12} />} texto="PDF justificativo" /><Accion href={route('nutricionista.planes.reporte-cambios-pdf', p.id_plan_alimentario)} icono={<GitCompare size={12} />} texto="Reporte de cambios" />{p.puede_editar && <a className="rounded-lg bg-brand-green/15 px-3 py-2 text-[11px] font-semibold text-brand-green-dark dark:text-brand-green" href={route('nutricionista.planes.show', p.id_plan_alimentario)}>Revisar y editar plan</a>}</div>
            {p.observaciones && <div className="rounded-xl bg-black/[0.025] p-3 text-[11px] text-ink/80 dark:bg-white/[0.03] dark:text-ink-dark/80"><b>Observación profesional:</b> {p.observaciones}</div>}
        </div>}
    </article>;
}

function OrigenExperto({ plan, recomendacion: r }: { plan: HistorialPlan; recomendacion: RecomendacionOrigen | null }) {
    if (!plan.generado_por_sistema_experto) return <div className="rounded-xl border border-surface-border p-4 text-[11px] dark:border-surface-border-dark"><b>Origen profesional:</b> plan elaborado manualmente por nutrición.</div>;
    return <section className="rounded-2xl border border-brand-green/25 bg-brand-green/[0.04] p-4 dark:bg-brand-green/[0.05]">
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex gap-3"><BrainCircuit className="mt-0.5 text-brand-green-dark dark:text-brand-green" size={19} /><div><h4 className="text-[13px] font-bold text-ink dark:text-ink-dark">Fundamento del sistema experto</h4><p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Datos que orientaron la propuesta y que deben ser revisados por la nutricionista.</p></div></div>{r && <div className="flex gap-1.5"><Badge color="green">{etiqueta(r.estado_validacion)}</Badge>{r.confianza !== null && <Badge color="blue">Confianza {n(r.confianza)}%</Badge>}</div>}</div>
        {!r ? <p className="mt-3 text-[11px] text-ink-muted">No se encontró la recomendación experta vinculada a este plan.</p> : <div className="mt-4 space-y-4">
            <div className="grid gap-2 sm:grid-cols-3"><Dato label="Enfoque nutricional" valor={etiqueta(r.enfoque)} /><Dato label="Prioridad clínica" valor={etiqueta(r.prioridad)} /><Dato label="Motor utilizado" valor={r.version_motor || 'ZEN Engine'} /></div>
            {r.conclusion && <div className="rounded-xl border border-brand-green/15 bg-white/40 p-3 text-[11.5px] leading-relaxed text-ink dark:bg-black/10 dark:text-ink-dark"><b>Conclusión experta:</b> {r.conclusion}</div>}
            <div className="grid gap-4 lg:grid-cols-2"><ListaTitulo titulo="¿Por qué se recomendó?" elementos={r.explicacion} vacio="Sin explicación registrada." /><ListaTitulo titulo="Reglas clínicas activadas" elementos={r.reglas_activadas} badges vacio="Sin reglas registradas." /><ListaTitulo titulo="Recomendaciones aplicables" elementos={r.recomendaciones} vacio="Sin recomendaciones adicionales." /><ListaTitulo titulo="Restricciones consideradas" elementos={r.restricciones} vacio="No se registraron restricciones alimentarias." /></div>
            {lista(r.alertas).length > 0 && <div className="rounded-xl border border-brand-orange/25 bg-brand-orange/[0.06] p-3"><p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-orange"><AlertTriangle size={12} /> Alertas para revisión profesional</p><ul className="ml-4 list-disc space-y-1 text-[11px] text-ink dark:text-ink-dark">{r.alertas.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
        </div>}
    </section>;
}

function Balance({ plan: p }: { plan: HistorialPlan }) {
    const dias = Math.max(p.total_dias || 7, 1);
    const filas = [['Calorías', p.calorias_objetivo, p.calorias_planificadas, 'kcal'], ['Proteínas', p.proteinas_objetivo, p.proteinas_planificadas, 'g'], ['Carbohidratos', p.carbohidratos_objetivo, p.carbohidratos_planificados, 'g'], ['Grasas', p.grasas_objetivo, p.grasas_planificadas, 'g'], ['Fibra', p.fibra_objetivo, p.fibra_planificada, 'g']] as const;
    return <section><div className="mb-2 flex items-center gap-2"><Target size={13} className="text-brand-green-dark" /><p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Objetivo diario vs total semanal planificado</p></div><div className="grid grid-cols-2 gap-2 lg:grid-cols-5">{filas.map(([label, diario, total, unidad]) => { const objetivo = Number(diario ?? 0) * dias; const valor = Number(total ?? 0); const porcentaje = objetivo > 0 ? (valor / objetivo) * 100 : 0; const fuera = objetivo > 0 && (porcentaje < 85 || porcentaje > 115); return <div key={label} className={clsx('rounded-xl border p-3', fuera ? 'border-brand-orange/30 bg-brand-orange/[0.04]' : 'border-surface-border dark:border-surface-border-dark')}><div className="flex justify-between text-[9px] font-bold uppercase text-ink-muted"><span>{label}</span>{fuera && <AlertTriangle size={10} className="text-brand-orange" />}</div><p className="mt-1 text-[11px] font-bold text-ink dark:text-ink-dark">{n(valor)} / {n(objetivo)} {unidad}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]"><div className={clsx('h-full rounded-full', fuera ? 'bg-brand-orange' : 'bg-brand-green')} style={{ width: `${Math.min(porcentaje, 100)}%` }} /></div><p className="mt-1 text-[9px] text-ink-muted">{objetivo > 0 ? `${n(porcentaje)}% de la meta` : 'Sin meta definida'}</p></div>})}</div></section>;
}

function CarruselDias({ dias }: { dias: DiaHistorialTipo[] }) {
    const [indice, setIndice] = useState(0);
    const dia = dias[indice];
    if (!dia) return null;
    const mover = (direccion: number) => setIndice(actual => Math.min(Math.max(actual + direccion, 0), dias.length - 1));

    return <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Planificación por día</p><p className="mt-0.5 text-[10px] text-ink-muted">Selecciona un día para consultar sus cuatro comidas.</p></div>
            <div className="flex items-center gap-2">
                <button type="button" aria-label="Día anterior" disabled={indice === 0} onClick={() => mover(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border text-ink-muted transition-colors hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-30 dark:border-surface-border-dark dark:hover:bg-white/[0.04]"><ChevronLeft size={15} /></button>
                <span className="min-w-14 text-center text-[10px] font-semibold text-ink-muted">{indice + 1} de {dias.length}</span>
                <button type="button" aria-label="Día siguiente" disabled={indice === dias.length - 1} onClick={() => mover(1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border text-ink-muted transition-colors hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-30 dark:border-surface-border-dark dark:hover:bg-white/[0.04]"><ChevronRight size={15} /></button>
            </div>
        </div>

        <div className="grid grid-cols-7 gap-1 rounded-xl bg-black/[0.025] p-1.5 dark:bg-white/[0.03]">
            {dias.map((item, i) => <button key={item.numero_dia} type="button" onClick={() => setIndice(i)} className={clsx('rounded-lg px-2 py-2 text-center transition-all', i === indice ? 'bg-surface-card text-brand-green-dark shadow-sm ring-1 ring-brand-green/20 dark:bg-surface-card-dark dark:text-brand-green' : 'text-ink-muted hover:bg-black/[0.025] dark:hover:bg-white/[0.03]')}><span className="block text-[9px] font-semibold uppercase">Día</span><b className="text-[12px]">{item.numero_dia}</b></button>)}
        </div>

        <div className="overflow-hidden rounded-2xl border border-surface-border dark:border-surface-border-dark">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border bg-brand-green/[0.035] px-4 py-3 dark:border-surface-border-dark dark:bg-brand-green/[0.045]">
                <div><p className="text-[9.5px] font-semibold uppercase tracking-wider text-brand-green-dark dark:text-brand-green">Día {dia.numero_dia}</p><h4 className="text-[13px] font-bold text-ink dark:text-ink-dark">{dia.nombre_dia || `Día ${dia.numero_dia}`}</h4></div>
                <div className="flex flex-wrap gap-1.5"><Badge color="green">{n(dia.calorias)} kcal</Badge><span className="rounded-md bg-black/[0.04] px-2 py-1 text-[9.5px] font-semibold text-ink-muted dark:bg-white/[0.05]">P {n(dia.proteinas)} g</span><span className="rounded-md bg-black/[0.04] px-2 py-1 text-[9.5px] font-semibold text-ink-muted dark:bg-white/[0.05]">C {n(dia.carbohidratos)} g</span><span className="rounded-md bg-black/[0.04] px-2 py-1 text-[9.5px] font-semibold text-ink-muted dark:bg-white/[0.05]">G {n(dia.grasas)} g</span></div>
            </div>
            <div className="grid gap-3 p-3 md:grid-cols-2">
                {dia.comidas.map((comida, i) => <ComidaDia key={`${comida.tipo_comida}-${i}`} comida={comida} />)}
            </div>
        </div>
    </section>;
}

function ComidaDia({ comida: c }: { comida: ComidaHistorial }) {
    return <article className="rounded-xl border border-surface-border/60 bg-black/[0.015] p-3 dark:border-surface-border-dark/60 dark:bg-white/[0.02]">
        <div className="flex items-start justify-between gap-2"><div><p className="text-[9px] font-bold uppercase tracking-wider text-brand-green-dark dark:text-brand-green">{etiqueta(c.tipo_comida)} {c.hora_sugerida ? `· ${String(c.hora_sugerida).slice(0, 5)}` : ''}</p><h5 className="mt-0.5 text-[11.5px] font-bold text-ink dark:text-ink-dark">{c.nombre_comida}</h5></div><b className="shrink-0 text-[10px] text-ink-muted">{n(c.calorias)} kcal</b></div>
        <div className="mt-2 flex flex-wrap gap-1 text-[9px] text-ink-muted"><span className="rounded bg-category-dairy/10 px-1.5 py-0.5">P {n(c.proteinas)} g</span><span className="rounded bg-brand-orange/10 px-1.5 py-0.5">C {n(c.carbohidratos)} g</span><span className="rounded bg-category-others/10 px-1.5 py-0.5">G {n(c.grasas)} g</span><span className="rounded bg-brand-green/10 px-1.5 py-0.5">Fibra {n(c.fibra)} g</span></div>
        <div className="mt-2 space-y-2">{c.componentes.map((x, j) => {
            const explicacion = x.explicacion_seleccion;
            return <div key={j} className="rounded-lg border border-surface-border/50 bg-surface-card/50 p-2 dark:border-surface-border-dark/50 dark:bg-surface-card-dark/40">
                <div className="flex justify-between gap-2 text-[10px]"><span className="font-semibold text-ink/80 dark:text-ink-dark/80">{x.nombre || 'Componente sin nombre'}</span><span className="shrink-0 text-ink-muted">{n(x.cantidad)} {x.unidad}</span></div>
                {explicacion?.puntaje_experto !== null && explicacion?.puntaje_experto !== undefined && <p className="mt-1 text-[9px] font-bold text-brand-green-dark dark:text-brand-green">Puntaje experto: {n(explicacion.puntaje_experto)}</p>}
                {explicacion?.asistido_por_groq && <div className="mt-1.5 rounded-md bg-brand-green/[0.07] px-2 py-1.5"><p className="flex items-center gap-1 text-[9px] font-bold text-brand-green-dark dark:text-brand-green"><Sparkles size={9}/> Ranking Groq: {n(explicacion.puntaje_groq)}/100</p>{!!explicacion.motivos_groq?.length && <p className="mt-0.5 text-[9px] text-ink/70 dark:text-ink-dark/70">{explicacion.motivos_groq.join(' ')}</p>}</div>}
                {!!explicacion?.motivos?.length && <div className="mt-1"><p className="text-[8.5px] font-bold uppercase tracking-wider text-ink-muted">¿Por qué se indicó?</p><ul className="ml-4 mt-0.5 list-disc space-y-0.5 text-[9.5px] text-ink/75 dark:text-ink-dark/75">{explicacion.motivos.map((motivo, indiceMotivo)=><li key={indiceMotivo}>{motivo}</li>)}</ul></div>}
                {!!explicacion?.advertencias?.length && <p className="mt-1 text-[9px] text-brand-orange">{explicacion.advertencias.join(' ')}</p>}
                {x.tipo_componente === 'manual' && !explicacion?.motivos?.length && <p className="mt-1 text-[9px] italic text-brand-orange">Selección o ajuste realizado directamente por la nutricionista.</p>}
            </div>;
        })}</div>
        {c.observaciones && <p className="mt-2 border-t border-surface-border/50 pt-2 text-[9.5px] italic text-ink-muted dark:border-surface-border-dark/50">{c.observaciones}</p>}
    </article>;
}

function Comparacion({ datos: h }: { datos: HistorialPlanes }) {
    const [detalle, setDetalle] = useState(false); const c = h.comparacion; const d = h.comparacion_detallada;
    return <div className="rounded-xl border border-brand-green/20 bg-brand-green/[0.035] p-4 dark:bg-brand-green/[0.04]"><div className="flex items-start gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green/15 text-brand-green-dark"><GitCompare size={15} /></div><div className="flex-1"><h4 className="text-[12.5px] font-bold text-ink dark:text-ink-dark">¿Qué cambió respecto al plan anterior?</h4><p className="mt-1 text-[11px] text-ink-muted">{c.mensaje}</p></div></div>{c.tiene_plan_anterior && <><div className="ml-11 mt-3 flex flex-wrap gap-1.5">{Object.entries(c.cambios).slice(0, 8).map(([k, v]) => <span key={k} className={clsx('rounded-lg px-2.5 py-1 text-[10px] font-semibold', v > 0 ? 'bg-brand-green/10 text-brand-green-dark' : v < 0 ? 'bg-category-fruits/10 text-category-fruits' : 'bg-black/[0.04] text-ink-muted')}>{etiqueta(k)}: {v > 0 ? '+' : ''}{n(v)}</span>)}</div>{d && <div className="ml-11 mt-3"><button type="button" onClick={() => setDetalle(!detalle)} className="text-[11px] font-semibold text-brand-green-dark hover:underline">{detalle ? 'Ocultar explicación' : 'Ver explicación del ajuste'}</button>{detalle && <div className="mt-3 grid gap-3 text-[11px] md:grid-cols-2"><ListaTitulo titulo="Motivos del cambio" elementos={d.motivos_cambio} vacio="Sin motivos adicionales." /><ListaTitulo titulo="Datos considerados" elementos={d.datos_considerados} vacio="Sin datos adicionales." /><ListaTitulo titulo="Recetas nuevas" elementos={d.cambios_recetas.recetas_nuevas} vacio="Ninguna." /><ListaTitulo titulo="Recetas retiradas" elementos={d.cambios_recetas.recetas_retiradas} vacio="Ninguna." /></div>}</div>}</>}</div>;
}

function ListaTitulo({ titulo, elementos, vacio, badges = false }: { titulo: string; elementos?: TextoLista; vacio: string; badges?: boolean }) { const items = lista(elementos); return <div><p className="mb-1.5 text-[9.5px] font-bold uppercase tracking-wider text-ink-muted">{titulo}</p>{items.length === 0 ? <p className="text-[10.5px] italic text-ink-muted">{vacio}</p> : badges ? <div className="flex flex-wrap gap-1">{items.map((x, i) => <span key={i} className="rounded-md bg-brand-green/10 px-2 py-1 text-[9.5px] font-semibold text-brand-green-dark dark:text-brand-green">{x}</span>)}</div> : <ul className="ml-4 list-disc space-y-1 text-[10.5px] text-ink/80 dark:text-ink-dark/80">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>}</div> }
function Dato({ label, valor, alerta = false }: { label: string; valor: string; alerta?: boolean }) { return <div className={clsx('rounded-xl border px-3 py-2.5', alerta ? 'border-brand-orange/30 bg-brand-orange/[0.05]' : 'border-surface-border bg-black/[0.02] dark:border-surface-border-dark dark:bg-white/[0.03]')}><p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted">{label}</p><p className="mt-0.5 text-[12px] font-bold capitalize text-ink dark:text-ink-dark">{valor}</p></div> }
function Accion({ href, icono, texto }: { href: string; icono: React.ReactNode; texto: string }) { return <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-2 text-[11px] font-semibold text-ink-muted hover:bg-black/[0.03] hover:text-ink dark:border-surface-border-dark dark:text-ink-muted-dark dark:hover:bg-white/[0.04]">{icono}{texto}</a> }
