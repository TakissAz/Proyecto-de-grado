import { AlertTriangle, CheckCircle2, ChevronDown, Download, SlidersHorizontal, Utensils } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';
import type { AnaliticaEvolucion } from '@/Components/nutricionista/analitica/AnaliticaEvolucionPanel';

interface Item { nombre: string; motivo?: string }
export interface ContextoAjustePlan {
    estado_periodo?: 'sin_plan' | 'no_iniciado' | 'sin_registros' | 'en_curso' | 'finalizado';
    id_plan_considerado: number | null;
    nombre_plan_considerado: string | null;
    recetas_bien_aceptadas: Item[];
    recetas_a_evitar: Item[];
    ingredientes_no_conseguidos: Item[];
    necesita_mas_saciedad: Record<string, boolean>;
    recomendaciones_nutricionista: string[];
    resumen_ajuste: string[];
    hambre_nocturna_frecuente: boolean;
    ansiedad_comida_frecuente: boolean;
    antojos_dulces_frecuentes: boolean;
    hinchazon_frecuente: boolean;
}

export default function ResumenAjustePlanCard({ contexto, analitica, pacienteId }: { contexto: ContextoAjustePlan; analitica?: AnaliticaEvolucion; pacienteId: number }) {
    const [mostrarDetalles, setMostrarDetalles] = useState(false);
    if (!contexto.id_plan_considerado && contexto.resumen_ajuste.length === 0) return null;
    if (contexto.estado_periodo === 'no_iniciado') return <div className="rounded-xl border border-dashed border-surface-border px-5 py-8 text-center dark:border-surface-border-dark"><SlidersHorizontal size={24} className="mx-auto text-ink-muted/30 dark:text-ink-muted-dark/30"/><h3 className="mt-2 text-[13px] font-bold text-ink dark:text-ink-dark">Resumen aún no disponible</h3><p className="mx-auto mt-1 max-w-md text-[11px] text-ink-muted dark:text-ink-muted-dark">El plan semanal todavía no comenzó. Este resumen se construirá únicamente con registros reales realizados durante esa semana.</p></div>;
    if (contexto.estado_periodo === 'sin_registros') return <div className="rounded-xl border border-dashed border-surface-border px-5 py-8 text-center dark:border-surface-border-dark"><SlidersHorizontal size={24} className="mx-auto text-ink-muted/30 dark:text-ink-muted-dark/30"/><h3 className="mt-2 text-[13px] font-bold text-ink dark:text-ink-dark">Resumen pendiente de información</h3><p className="mx-auto mt-1 max-w-md text-[11px] text-ink-muted dark:text-ink-muted-dark">El monitoreo ya reconoce las comidas vencidas sin marcar. El resumen de ajustes se generará al cierre del día cuando existan respuestas reales de la paciente, evitando conclusiones clínicas prematuras.</p></div>;

    const sintomas = [
        contexto.hambre_nocturna_frecuente && 'Hambre nocturna',
        contexto.ansiedad_comida_frecuente && 'Ansiedad por comida',
        contexto.antojos_dulces_frecuentes && 'Antojos dulces',
        contexto.hinchazon_frecuente && 'Hinchazón',
    ].filter(Boolean) as string[];
    const unicos = (items: string[]) => [...new Set(items.filter(Boolean))];
    const favorecidas = unicos([...contexto.recetas_bien_aceptadas.map(x => x.nombre), ...(analitica?.recetas_aceptadas.map(x => x.nombre) ?? [])]);
    const revisar = unicos([...contexto.recetas_a_evitar.map(x => x.nombre), ...(analitica?.recetas_problematicas.map(x => x.nombre) ?? [])]);
    const ingredientes = unicos([...(contexto.ingredientes_no_conseguidos.map(x => x.nombre)), ...(analitica?.problemas_practicos.ingredientes_no_conseguidos.map(x => x.nombre) ?? [])]);
    const dificiles = unicos(analitica?.problemas_practicos.recetas_dificiles.map(x => x.nombre) ?? []);

    return (
        <div className="rounded-xl border border-surface-border p-5 dark:border-surface-border-dark">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange">
                    <SlidersHorizontal size={18} strokeWidth={1.8} />
                </div>
                <div>
                    <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Contexto para el siguiente plan</h3>
                    <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">El próximo plan considerará el seguimiento reciente del paciente.</p>
                </div>
                </div>
                <div className="flex flex-wrap items-center gap-2"><div className="flex gap-2"><ResumenDato valor={favorecidas.length} texto="favorables" color="green"/><ResumenDato valor={revisar.length} texto="a revisar" color="orange"/><ResumenDato valor={ingredientes.length+dificiles.length} texto="dificultades" color="blue"/></div><a href={route('nutricionista.pacientes.reporte-ajuste-siguiente-plan-pdf', pacienteId)} target="_blank" className="inline-flex items-center gap-1.5 rounded-xl bg-brand-green px-3 py-2 text-[9px] font-bold text-white transition hover:bg-brand-green-dark"><Download size={13}/> Reporte PDF</a></div>
            </div>

            {/* Listas */}
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
                <ListaChips titulo="Recetas favorecidas" descripcion="Bien aceptadas, toleradas o que la paciente desea repetir." items={favorecidas} color="green" icono="ok" />
                <ListaChips titulo="Recetas a revisar" descripcion="Preparaciones con baja aceptación, molestias o incumplimiento." items={revisar} color="orange" icono="alerta" />
            </div>

            <button type="button" onClick={() => setMostrarDetalles(v => !v)} className="mt-4 flex w-full items-center justify-between rounded-xl border border-surface-border px-3.5 py-2.5 text-left transition hover:bg-black/[.02] dark:border-surface-border-dark dark:hover:bg-white/[.025]"><span><b className="block text-[10px] text-ink dark:text-ink-dark">{mostrarDetalles ? 'Ocultar contexto complementario' : 'Ver barreras, síntomas y recomendaciones'}</b><span className="text-[8.5px] text-ink-muted dark:text-ink-muted-dark">Información de apoyo para justificar los ajustes.</span></span><ChevronDown size={14} className={clsx('text-ink-muted transition-transform', mostrarDetalles && 'rotate-180')}/></button>

            {mostrarDetalles && <div className="mt-3 rounded-xl bg-black/[.015] p-3 dark:bg-white/[.015]">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <ListaChips titulo="Ingredientes no conseguidos" descripcion="Pueden requerir sustituciones accesibles." items={ingredientes} color="orange" icono="alerta" compacta />
                    <ListaChips titulo="Preparaciones difíciles" descripcion="Conviene simplificar su elaboración." items={dificiles} color="orange" icono="alerta" compacta />
                    <ListaChips titulo="Mayor saciedad" descripcion="Comidas donde se reportó hambre posterior." items={Object.keys(contexto.necesita_mas_saciedad)} color="blue" icono="comida" compacta />
                    <ListaChips titulo="Síntomas considerados" descripcion="Señales usadas para ajustar el siguiente plan." items={sintomas} color="blue" icono="comida" compacta />
                </div>
                {contexto.recomendaciones_nutricionista.length > 0 && <div className="mt-4 border-t border-surface-border pt-3 dark:border-surface-border-dark"><p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Recomendaciones profesionales</p><ul className="grid gap-2 md:grid-cols-2">{contexto.recomendaciones_nutricionista.map((x, index) => <li key={`${x}-${index}`} className="flex items-start gap-2 rounded-lg bg-white/40 px-3 py-2 text-[10px] text-ink dark:bg-white/[.025] dark:text-ink-dark"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green"/>{x}</li>)}</ul></div>}
            </div>}
        </div>
    );
}

function ListaChips({ titulo, descripcion, items, color, icono, compacta = false }: { titulo: string; descripcion: string; items: string[]; color: 'green' | 'orange' | 'blue'; icono: 'ok' | 'alerta' | 'comida'; compacta?: boolean }) {
    const [expandida, setExpandida] = useState(false);
    const limite = compacta ? 2 : 4;
    const visibles = expandida ? items : items.slice(0, limite);
    const colorMap = {
        green: 'bg-brand-green/10 text-brand-green-dark dark:text-brand-green',
        orange: 'bg-brand-orange/10 text-brand-orange',
        blue: 'bg-info/10 text-info',
    };
    const Icono = icono === 'ok' ? CheckCircle2 : icono === 'alerta' ? AlertTriangle : Utensils;
    return (
        <div className="rounded-xl border border-surface-border/70 bg-black/[.012] p-3.5 dark:border-surface-border-dark/70 dark:bg-white/[.015]">
            <div className="mb-3 flex items-start justify-between gap-2"><div className="flex gap-2"><Icono size={14} className={color === 'green' ? 'text-brand-green' : color === 'orange' ? 'text-brand-orange' : 'text-info'}/><div><p className="text-[10.5px] font-bold text-ink dark:text-ink-dark">{titulo}</p><p className="mt-0.5 text-[9px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">{descripcion}</p></div></div><span className="rounded-md bg-black/[.04] px-2 py-0.5 text-[9px] font-bold text-ink-muted dark:bg-white/[.05] dark:text-ink-muted-dark">{items.length}</span></div>
            <div className="flex flex-wrap gap-1.5">
                {items.length ? visibles.map(x => (
                    <span key={x} className={clsx('inline-flex items-center rounded-lg px-2.5 py-1 text-[10.5px] font-semibold', colorMap[color])}>{x}</span>
                )) : (
                    <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark italic">Sin registros.</span>
                )}
            </div>
            {items.length > limite && <button type="button" onClick={()=>setExpandida(v=>!v)} className="mt-3 inline-flex items-center gap-1 text-[9.5px] font-bold text-ink-muted transition hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark">{expandida?'Ver menos':`Ver ${items.length-limite} más`}<ChevronDown size={11} className={clsx('transition-transform',expandida&&'rotate-180')}/></button>}
        </div>
    );
}

function ResumenDato({valor,texto,color}:{valor:number;texto:string;color:'green'|'orange'|'blue'}){const c={green:'bg-brand-green/10 text-brand-green-dark dark:text-brand-green',orange:'bg-brand-orange/10 text-brand-orange',blue:'bg-info/10 text-info'}[color];return <div className={clsx('rounded-lg px-2.5 py-1.5 text-center',c)}><b className="block text-[13px] leading-none">{valor}</b><span className="text-[8px] font-semibold">{texto}</span></div>}
