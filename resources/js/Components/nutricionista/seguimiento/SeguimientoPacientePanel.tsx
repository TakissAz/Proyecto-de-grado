import { AlertTriangle, CalendarDays, ClipboardList, Coffee, Eye, HeartPulse, Moon, Sun, Sunrise, TrendingUp, Utensils, X } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { Badge } from '@/Components/ui/badge';
import type { SeguimientoPacienteNutricionista } from '@/Pages/Nutricionista/Pacientes/PerfilNutricional/tipos';

const texto = (v: unknown) => v === null || v === undefined || v === '' ? 'Sin registro' : String(v).replaceAll('_', ' ');
const estadoColor: Record<string, 'green' | 'orange' | 'red' | 'blue' | 'gray'> = { completada: 'green', parcial: 'orange', no_realizada: 'red', reemplazada: 'blue', pendiente: 'gray' };

export default function SeguimientoPacientePanel({ seguimiento }: { seguimiento: SeguimientoPacienteNutricionista }) {
    const [modalDia, setModalDia] = useState<SeguimientoPacienteNutricionista['seguimiento_comidas'][number] | null>(null);

    if (!seguimiento.plan || !seguimiento.resumen_adherencia) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-surface-border py-10 text-center dark:border-surface-border-dark">
                <ClipboardList size={32} strokeWidth={1.2} className="text-ink-muted/30 dark:text-ink-muted-dark/30" />
                <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Sin plan activo para seguimiento</h3>
                <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark max-w-xs">Este panel se habilitará cuando exista un plan aprobado o activo.</p>
            </div>
        );
    }

    const r = seguimiento.resumen_adherencia;
    const i = seguimiento.indicadores_siguiente_plan;
    const s = seguimiento.seguimiento_sintomas.indicadores;
    const alertas = [
        r.porcentaje_adherencia < 60 && 'La adherencia general está por debajo del 60%.',
        r.no_realizadas > 0 && `Hay ${r.no_realizadas} comida(s) no realizada(s).`,
        i.hambre_frecuente > 0 && 'Se reportó hambre posterior o ansiedad.',
        s.alerta_general === true && 'Existen síntomas frecuentes que requieren revisión.',
    ].filter(Boolean) as string[];

    const adherenciaColor = r.porcentaje_adherencia >= 70 ? 'text-brand-green-dark dark:text-brand-green' : r.porcentaje_adherencia >= 40 ? 'text-brand-orange' : 'text-category-fruits';
    const barColor = r.porcentaje_adherencia >= 70 ? 'bg-brand-green' : r.porcentaje_adherencia >= 40 ? 'bg-brand-orange' : 'bg-category-fruits';

    return (
        <div className="space-y-4">
            {/* ═══ DASHBOARD: Adherencia general ═══ */}
            <div className="rounded-xl border border-surface-border p-5 dark:border-surface-border-dark">
                <div className="flex items-start gap-4">
                    {/* Indicador circular de adherencia */}
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6" className="stroke-black/[0.06] dark:stroke-white/[0.06]" />
                            <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6" strokeLinecap="round"
                                className={clsx(r.porcentaje_adherencia >= 70 ? 'stroke-brand-green' : r.porcentaje_adherencia >= 40 ? 'stroke-brand-orange' : 'stroke-category-fruits')}
                                strokeDasharray={`${(r.porcentaje_adherencia / 100) * 213.6} 213.6`} />
                        </svg>
                        <span className={clsx('absolute text-[18px] font-bold', adherenciaColor)}>{r.porcentaje_adherencia}%</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h3 className="text-[14px] font-bold text-ink dark:text-ink-dark">Seguimiento del paciente</h3>
                                <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">{seguimiento.plan.nombre} · {texto(seguimiento.plan.estado_plan)}</p>
                            </div>
                            <Badge color={r.porcentaje_adherencia >= 70 ? 'green' : r.porcentaje_adherencia >= 40 ? 'orange' : 'red'}>
                                {r.porcentaje_adherencia >= 70 ? 'Buena' : r.porcentaje_adherencia >= 40 ? 'Regular' : 'Baja'} adherencia
                            </Badge>
                        </div>

                        {/* Mini stats inline */}
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                            <MiniStat label="Completadas" valor={r.completadas} color="text-brand-green-dark dark:text-brand-green" />
                            <MiniStat label="Parciales" valor={r.parciales} color="text-brand-orange" />
                            <MiniStat label="No realizadas" valor={r.no_realizadas} color="text-category-fruits" />
                            <MiniStat label="Reemplazadas" valor={r.reemplazadas} color="text-info" />
                            <MiniStat label="Pendientes" valor={r.pendientes} color="text-ink-muted dark:text-ink-muted-dark" />
                        </div>
                    </div>
                </div>

                {/* Barra de progreso full width */}
                <div className="mt-4 h-2 w-full rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                    <div className={clsx('h-full rounded-full transition-all', barColor)} style={{ width: `${r.porcentaje_adherencia}%` }} />
                </div>
            </div>

            {/* ═══ ALERTA rápida si hay problemas ═══ */}
            {alertas.length > 0 && (
                <div className="rounded-xl border border-brand-orange/20 bg-brand-orange/5 px-4 py-3 dark:bg-brand-orange/[0.06]">
                    <div className="flex items-start gap-2.5">
                        <AlertTriangle size={15} strokeWidth={1.8} className="text-brand-orange shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-[11.5px] font-bold text-ink dark:text-ink-dark">Atención ({alertas.length})</p>
                            <ul className="mt-1 space-y-0.5">
                                {alertas.map(a => <li key={a} className="text-[10.5px] text-ink/80 dark:text-ink-dark/80">• {a}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ GRID: Adherencia por tipo + Síntomas ═══ */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* Adherencia por tipo de comida */}
                <div className="lg:col-span-2 rounded-xl border border-surface-border p-4 dark:border-surface-border-dark">
                    <h4 className="flex items-center gap-2 text-[12px] font-bold text-ink dark:text-ink-dark mb-3">
                        <Utensils size={14} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" /> Adherencia por comida
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(seguimiento.adherencia_por_tipo_comida).map(([tipo, d]) => (
                            <div key={tipo} className="rounded-lg bg-black/[0.02] p-3 dark:bg-white/[0.03] text-center">
                                <p className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark capitalize">{texto(tipo)}</p>
                                <p className={clsx('text-[18px] font-bold mt-1', d.porcentaje_adherencia >= 70 ? 'text-brand-green-dark dark:text-brand-green' : d.porcentaje_adherencia >= 40 ? 'text-brand-orange' : 'text-category-fruits')}>{d.porcentaje_adherencia}%</p>
                                <div className="mt-1.5 h-1 w-full rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                                    <div className={clsx('h-full rounded-full', d.porcentaje_adherencia >= 70 ? 'bg-brand-green' : d.porcentaje_adherencia >= 40 ? 'bg-brand-orange' : 'bg-category-fruits')} style={{ width: `${d.porcentaje_adherencia}%` }} />
                                </div>
                                <p className="mt-1 text-[9px] text-ink-muted dark:text-ink-muted-dark">{d.completadas}/{d.completadas + d.pendientes}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Síntomas recientes */}
                <div className="rounded-xl border border-surface-border p-4 dark:border-surface-border-dark">
                    <h4 className="flex items-center gap-2 text-[12px] font-bold text-ink dark:text-ink-dark mb-3">
                        <HeartPulse size={14} strokeWidth={1.8} className="text-category-fruits" /> Síntomas
                    </h4>
                    <div className="space-y-1.5">
                        {Object.entries(s).filter(([, v]) => v === true).map(([k]) => (
                            <div key={k} className="flex items-center gap-2 rounded-lg bg-brand-orange/[0.06] px-3 py-2 dark:bg-brand-orange/[0.08]">
                                <span className="h-1.5 w-1.5 rounded-full bg-brand-orange shrink-0" />
                                <span className="text-[11px] text-ink dark:text-ink-dark capitalize">{texto(k)}</span>
                            </div>
                        ))}
                        {Object.entries(s).filter(([, v]) => v === true).length === 0 && (
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark italic text-center py-4">Sin síntomas reportados</p>
                        )}
                    </div>
                    <p className="mt-3 text-[9.5px] text-ink-muted/60 dark:text-ink-muted-dark/60">{texto(s.registros_ultimos_7_dias)} registro(s) recientes</p>
                </div>
            </div>

            {/* ═══ INDICADORES: Para el siguiente plan ═══ */}
            <div className="rounded-xl border border-surface-border p-4 dark:border-surface-border-dark">
                <h4 className="flex items-center gap-2 text-[12px] font-bold text-ink dark:text-ink-dark mb-3">
                    <TrendingUp size={14} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" /> Indicadores para el siguiente plan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <IndicadorChips titulo="Bien aceptadas" items={i.recetas_bien_aceptadas} color="green" emoji="✓" />
                    <IndicadorChips titulo="Evitar o revisar" items={i.recetas_a_evitar} color="red" emoji="✗" />
                    <IndicadorChips titulo="Problemáticas" items={i.alimentos_o_preparaciones_problematicas} color="orange" emoji="!" />
                    <IndicadorChips titulo="Recomendaciones" items={i.recomendaciones_para_nutricionista} color="gray" emoji="→" />
                </div>
            </div>

            {/* ═══ DETALLE DIARIO: Lista de días con botón modal ═══ */}
            <div className="rounded-xl border border-surface-border p-4 dark:border-surface-border-dark">
                <h4 className="flex items-center gap-2 text-[12px] font-bold text-ink dark:text-ink-dark mb-3">
                    <CalendarDays size={14} strokeWidth={1.8} className="text-info" /> Detalle diario reportado
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {seguimiento.seguimiento_comidas.map(d => {
                        const completadas = d.comidas.filter(c => c.estado_cumplimiento === 'completada').length;
                        const total = d.comidas.length;
                        const pct = total ? Math.round((completadas / total) * 100) : 0;
                        return (
                            <button key={d.id_dia_plan_alimentario} type="button" onClick={() => setModalDia(d)}
                                className="rounded-xl border border-surface-border/60 p-3 text-center transition-all hover:border-brand-green/40 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-surface-border-dark/60 dark:hover:border-brand-green/40">
                                <p className="text-[10px] font-bold text-ink-muted dark:text-ink-muted-dark">Día {d.numero_dia}</p>
                                <p className={clsx('text-[16px] font-bold mt-1', pct >= 70 ? 'text-brand-green-dark dark:text-brand-green' : pct >= 40 ? 'text-brand-orange' : 'text-category-fruits')}>{pct}%</p>
                                <p className="text-[9px] text-ink-muted dark:text-ink-muted-dark mt-0.5">{completadas}/{total}</p>
                                <Eye size={10} className="mx-auto mt-1.5 text-ink-muted/40 dark:text-ink-muted-dark/40" />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ═══ MODAL: Detalle del día ═══ */}
            {modalDia && <ModalDetalleDia dia={modalDia} cerrar={() => setModalDia(null)} />}
        </div>
    );
}

/* ═══ Modal detalle del día ═══ */
function ModalDetalleDia({ dia, cerrar }: { dia: SeguimientoPacienteNutricionista['seguimiento_comidas'][number]; cerrar: () => void }) {
    const completadas = dia.comidas.filter(c => c.estado_cumplimiento === 'completada').length;
    const total = dia.comidas.length;
    const pct = total ? Math.round((completadas / total) * 100) : 0;
    const pctColor = pct >= 70 ? 'text-brand-green-dark dark:text-brand-green' : pct >= 40 ? 'text-brand-orange' : 'text-category-fruits';
    const headerBg = pct >= 70 ? 'bg-brand-green/[0.04] dark:bg-brand-green/[0.06]' : pct >= 40 ? 'bg-brand-orange/[0.04] dark:bg-brand-orange/[0.06]' : 'bg-category-fruits/[0.04] dark:bg-category-fruits/[0.06]';

    const TIPO_ICONO: Record<string, typeof Utensils> = { desayuno: Sunrise, almuerzo: Sun, merienda: Coffee, cena: Moon };
    const TIPO_COLOR: Record<string, { bg: string; accent: string }> = {
        desayuno: { bg: 'bg-amber-500/[0.06] dark:bg-amber-400/[0.08]', accent: 'text-amber-600 dark:text-amber-400' },
        almuerzo: { bg: 'bg-brand-green/[0.06] dark:bg-brand-green/[0.08]', accent: 'text-brand-green-dark dark:text-brand-green' },
        merienda: { bg: 'bg-purple-500/[0.06] dark:bg-purple-400/[0.08]', accent: 'text-purple-600 dark:text-purple-400' },
        cena: { bg: 'bg-blue-500/[0.06] dark:bg-blue-400/[0.08]', accent: 'text-blue-600 dark:text-blue-400' },
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-[3px] p-4">
            <div className="relative w-full max-w-3xl rounded-2xl border border-surface-border bg-surface-card shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark max-h-[88vh] overflow-hidden flex flex-col animate-scale-in">
                {/* Header con color según rendimiento */}
                <div className={clsx('px-6 py-5 shrink-0', headerBg)}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Mini círculo de progreso */}
                            <div className="relative flex h-14 w-14 items-center justify-center">
                                <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                                    <circle cx="28" cy="28" r="22" fill="none" strokeWidth="4" className="stroke-black/[0.08] dark:stroke-white/[0.08]" />
                                    <circle cx="28" cy="28" r="22" fill="none" strokeWidth="4" strokeLinecap="round"
                                        className={clsx(pct >= 70 ? 'stroke-brand-green' : pct >= 40 ? 'stroke-brand-orange' : 'stroke-category-fruits')}
                                        strokeDasharray={`${(pct / 100) * 138.2} 138.2`} />
                                </svg>
                                <span className={clsx('absolute text-[13px] font-bold', pctColor)}>{pct}%</span>
                            </div>
                            <div>
                                <h3 className="text-[16px] font-bold text-ink dark:text-ink-dark">Día {dia.numero_dia} — {dia.nombre_dia}</h3>
                                <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark mt-0.5">
                                    {dia.fecha ?? 'Sin fecha'} · {completadas} de {total} comidas completadas
                                </p>
                            </div>
                        </div>
                        <button type="button" onClick={cerrar}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-black/[0.06] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.06] dark:hover:text-ink-dark">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Mini resumen rápido */}
                    <div className="flex gap-3 mt-4">
                        {(['completada', 'parcial', 'no_realizada', 'reemplazada'] as const).map(estado => {
                            const count = dia.comidas.filter(c => c.estado_cumplimiento === estado).length;
                            if (count === 0) return null;
                            return (
                                <Badge key={estado} color={estadoColor[estado] ?? 'gray'}>
                                    {count} {texto(estado)}{count > 1 ? 's' : ''}
                                </Badge>
                            );
                        })}
                    </div>
                </div>

                {/* Contenido scrollable — comidas */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {dia.comidas.map(c => {
                        const tipoColor = TIPO_COLOR[c.tipo_comida] ?? { bg: 'bg-black/[0.03] dark:bg-white/[0.04]', accent: 'text-ink-muted dark:text-ink-muted-dark' };
                        const Icono = TIPO_ICONO[c.tipo_comida] ?? Utensils;
                        return (
                            <article key={c.id_comida_plan_alimentario} className="rounded-2xl border border-surface-border/70 overflow-hidden dark:border-surface-border-dark/70">
                                {/* Header de comida con color */}
                                <div className={clsx('px-4 py-3.5 flex items-center justify-between', tipoColor.bg)}>
                                    <div className="flex items-center gap-3">
                                        <div className={clsx('flex h-8 w-8 items-center justify-center rounded-lg bg-white/60 dark:bg-black/20', tipoColor.accent)}>
                                            <Icono size={15} strokeWidth={1.8} />
                                        </div>
                                        <div>
                                            <p className={clsx('text-[11px] font-bold uppercase tracking-wider', tipoColor.accent)}>{texto(c.tipo_comida)}</p>
                                            <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{c.hora_sugerida ?? 'Sin hora'} · {c.nombre_comida}</p>
                                        </div>
                                    </div>
                                    <Badge color={estadoColor[c.estado_cumplimiento] ?? 'gray'}>{texto(c.estado_cumplimiento)}</Badge>
                                </div>

                                {/* Body de la comida */}
                                <div className="px-4 py-4 space-y-3">
                                    {/* Componentes de la comida */}
                                    {c.componentes.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {c.componentes.map((comp, idx) => (
                                                <span key={idx} className="inline-flex items-center rounded-md bg-black/[0.03] px-2 py-0.5 text-[10px] text-ink dark:bg-white/[0.04] dark:text-ink-dark">{comp}</span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Indicadores visuales */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <IndicadorVisual label="Consumido" valor={c.porcentaje_consumido} tipo="porcentaje" />
                                        <IndicadorVisual label="Agrado" valor={c.nivel_agrado} tipo="nivel" />
                                        <IndicadorVisual label="Saciedad" valor={c.nivel_saciedad} tipo="nivel" />
                                    </div>

                                    {/* Fila secundaria */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <DatoCompacto label="Hambre posterior" valor={c.nivel_hambre_posterior} />
                                        <DatoCompacto label="Ansiedad" valor={c.ansiedad_posterior === null ? null : c.ansiedad_posterior ? 'Sí' : 'No'} alerta={c.ansiedad_posterior === true} />
                                        <DatoCompacto label="Ingredientes" valor={c.consiguio_ingredientes === null ? null : c.consiguio_ingredientes ? 'Conseguidos' : 'No conseguidos'} alerta={c.consiguio_ingredientes === false} />
                                    </div>

                                    {/* Molestia */}
                                    {c.presento_molestia && (
                                        <div className="rounded-lg border border-category-fruits/20 bg-category-fruits/[0.04] px-3 py-2.5">
                                            <p className="text-[9.5px] font-bold uppercase tracking-wider text-category-fruits/70 mb-0.5">Molestia reportada</p>
                                            <p className="text-[11.5px] text-ink dark:text-ink-dark font-medium">{texto(c.tipo_molestia)} — intensidad: {texto(c.intensidad_molestia)}</p>
                                        </div>
                                    )}

                                    {/* Motivo no cumplimiento */}
                                    {c.motivo_no_cumplimiento && (
                                        <div className="rounded-lg border border-brand-orange/20 bg-brand-orange/[0.04] px-3 py-2.5">
                                            <p className="text-[9.5px] font-bold uppercase tracking-wider text-brand-orange/70 mb-0.5">Motivo</p>
                                            <p className="text-[11.5px] text-ink dark:text-ink-dark">{texto(c.motivo_no_cumplimiento)}</p>
                                        </div>
                                    )}

                                    {/* Comentarios del paciente — estilo chat bubble */}
                                    {(c.comentario_paciente || c.sugerencia_paciente) && (
                                        <div className="space-y-2 pt-1">
                                            {c.comentario_paciente && (
                                                <div className="flex gap-2">
                                                    <div className="h-5 w-5 shrink-0 rounded-full bg-brand-green/15 flex items-center justify-center mt-0.5">
                                                        <span className="text-[8px]">💬</span>
                                                    </div>
                                                    <div className="rounded-xl rounded-tl-sm bg-brand-green/[0.06] px-3 py-2 dark:bg-brand-green/[0.08]">
                                                        <p className="text-[10.5px] text-ink dark:text-ink-dark leading-relaxed">{c.comentario_paciente}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {c.sugerencia_paciente && (
                                                <div className="flex gap-2">
                                                    <div className="h-5 w-5 shrink-0 rounded-full bg-info/15 flex items-center justify-center mt-0.5">
                                                        <span className="text-[8px]">💡</span>
                                                    </div>
                                                    <div className="rounded-xl rounded-tl-sm bg-info/[0.06] px-3 py-2 dark:bg-info/[0.08]">
                                                        <p className="text-[10.5px] text-ink dark:text-ink-dark leading-relaxed">{c.sugerencia_paciente}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
            {/* Backdrop */}
            <div className="absolute inset-0 -z-10" onClick={cerrar} />
        </div>
    );
}

/* Indicador visual con barra de nivel */
function IndicadorVisual({ label, valor, tipo }: { label: string; valor: unknown; tipo: 'porcentaje' | 'nivel' }) {
    const nivelMap: Record<string, number> = { muy_bajo: 20, bajo: 35, moderado: 50, medio: 50, alto: 75, muy_alto: 90 };
    const numVal = tipo === 'porcentaje' ? Number(valor ?? 0) : nivelMap[String(valor ?? '').toLowerCase()] ?? 0;
    const colorBar = numVal >= 70 ? 'bg-brand-green' : numVal >= 40 ? 'bg-brand-orange' : numVal > 0 ? 'bg-category-fruits' : 'bg-ink-muted/20 dark:bg-ink-muted-dark/20';

    return (
        <div className="rounded-lg bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2.5">
            <p className="text-[8.5px] font-semibold uppercase tracking-wider text-ink-muted/60 dark:text-ink-muted-dark/60">{label}</p>
            <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                    <div className={clsx('h-full rounded-full transition-all', colorBar)} style={{ width: `${numVal}%` }} />
                </div>
                <span className="text-[10px] font-bold text-ink dark:text-ink-dark shrink-0">
                    {valor === null || valor === undefined ? '—' : tipo === 'porcentaje' ? `${valor}%` : texto(valor)}
                </span>
            </div>
        </div>
    );
}

/* Dato compacto con alerta */
function DatoCompacto({ label, valor, alerta }: { label: string; valor: unknown; alerta?: boolean }) {
    return (
        <div className={clsx('rounded-lg px-3 py-2.5', alerta ? 'bg-category-fruits/[0.04] border border-category-fruits/15' : 'bg-black/[0.02] dark:bg-white/[0.03]')}>
            <p className="text-[8.5px] font-semibold uppercase tracking-wider text-ink-muted/60 dark:text-ink-muted-dark/60">{label}</p>
            <p className={clsx('text-[11px] font-medium mt-0.5', alerta ? 'text-category-fruits' : 'text-ink dark:text-ink-dark')}>{texto(valor)}</p>
        </div>
    );
}

/* ═══ Componentes auxiliares ═══ */

function MiniStat({ label, valor, color }: { label: string; valor: number; color: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <span className={clsx('text-[14px] font-bold', color)}>{valor}</span>
            <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{label}</span>
        </div>
    );
}

function IndicadorChips({ titulo, items, color, emoji }: { titulo: string; items: string[]; color: 'green' | 'orange' | 'red' | 'gray'; emoji: string }) {
    const bgMap = { green: 'bg-brand-green/10 text-brand-green-dark dark:text-brand-green', orange: 'bg-brand-orange/10 text-brand-orange', red: 'bg-category-fruits/10 text-category-fruits', gray: 'bg-black/[0.04] text-ink-muted dark:bg-white/[0.06] dark:text-ink-muted-dark' };
    return (
        <div>
            <p className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70 mb-1.5">{emoji} {titulo}</p>
            {items.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                    {items.slice(0, 4).map(x => <span key={x} className={clsx('inline-flex rounded-md px-2 py-0.5 text-[9.5px] font-semibold', bgMap[color])}>{x}</span>)}
                    {items.length > 4 && <span className="text-[9px] text-ink-muted dark:text-ink-muted-dark self-center">+{items.length - 4} más</span>}
                </div>
            ) : (
                <p className="text-[10px] text-ink-muted/50 dark:text-ink-muted-dark/50 italic">—</p>
            )}
        </div>
    );
}


