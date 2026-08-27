import { ChevronDown, CircleAlert, Lightbulb, Zap } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { Badge } from '@/Components/ui/badge';

export interface SugerenciaAjuste { codigo: string; titulo: string; descripcion: string; prioridad: 'alta' | 'media' | 'baja'; categoria: string; accion_sugerida: string; justificacion: string; datos_considerados: string[]; impacto_en_siguiente_plan: string }
export interface SugerenciasAjuste { resumen: { total_sugerencias: number; prioridad_alta: number; prioridad_media: number; prioridad_baja: number; mensaje_general: string }; sugerencias: SugerenciaAjuste[] }

const prioridadConfig = {
    alta: { color: 'text-category-fruits', bg: 'bg-category-fruits/10', border: 'border-l-category-fruits', dot: 'bg-category-fruits', label: 'Prioridad alta', icon: CircleAlert },
    media: { color: 'text-brand-orange', bg: 'bg-brand-orange/10', border: 'border-l-brand-orange', dot: 'bg-brand-orange', label: 'Prioridad media', icon: Zap },
    baja: { color: 'text-info', bg: 'bg-info/10', border: 'border-l-info', dot: 'bg-info', label: 'Prioridad baja', icon: Lightbulb },
};

export default function SugerenciasAjusteNutricionalPanel({ datos }: { datos?: SugerenciasAjuste | null }) {
    const d = datos ?? { resumen: { total_sugerencias: 0, prioridad_alta: 0, prioridad_media: 0, prioridad_baja: 0, mensaje_general: '' }, sugerencias: [] };

    // Agrupar por prioridad
    const altas = d.sugerencias.filter(s => s.prioridad === 'alta');
    const medias = d.sugerencias.filter(s => s.prioridad === 'media');
    const bajas = d.sugerencias.filter(s => s.prioridad === 'baja');

    return (
        <section className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green">
                        <Lightbulb size={18} strokeWidth={1.8} />
                    </div>
                    <div>
                        <h3 className="text-[14px] font-bold text-ink dark:text-ink-dark">Sugerencias de ajuste nutricional</h3>
                        <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark mt-0.5">
                            {d.resumen.mensaje_general || 'Recomendaciones inteligentes basadas en el seguimiento del paciente.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Resumen visual de prioridades */}
            {d.resumen.total_sugerencias > 0 && (
                <div className="flex items-center gap-3 rounded-xl bg-black/[0.02] px-4 py-3 dark:bg-white/[0.03]">
                    <span className="text-[11px] font-semibold text-ink-muted dark:text-ink-muted-dark">Resumen:</span>
                    <div className="flex items-center gap-4">
                        {d.resumen.prioridad_alta > 0 && (
                            <div className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-category-fruits" />
                                <span className="text-[11.5px] font-bold text-category-fruits">{d.resumen.prioridad_alta}</span>
                                <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">urgentes</span>
                            </div>
                        )}
                        {d.resumen.prioridad_media > 0 && (
                            <div className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-brand-orange" />
                                <span className="text-[11.5px] font-bold text-brand-orange">{d.resumen.prioridad_media}</span>
                                <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">importantes</span>
                            </div>
                        )}
                        {d.resumen.prioridad_baja > 0 && (
                            <div className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-info" />
                                <span className="text-[11.5px] font-bold text-info">{d.resumen.prioridad_baja}</span>
                                <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">informativas</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Sin sugerencias */}
            {d.sugerencias.length === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-surface-border py-10 text-center dark:border-surface-border-dark">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green/10">
                        <Lightbulb size={24} strokeWidth={1.3} className="text-brand-green-dark dark:text-brand-green" />
                    </div>
                    <p className="text-[12px] font-semibold text-ink dark:text-ink-dark">Sin sugerencias por ahora</p>
                    <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark max-w-[280px]">El sistema generará sugerencias automáticas cuando tenga datos de seguimiento suficientes.</p>
                </div>
            )}

            {/* Grupo: Altas */}
            {altas.length > 0 && (
                <GrupoSugerencias label="Requieren acción inmediata" sugerencias={altas} prioridad="alta" />
            )}

            {/* Grupo: Medias */}
            {medias.length > 0 && (
                <GrupoSugerencias label="Considerar para el próximo plan" sugerencias={medias} prioridad="media" />
            )}

            {/* Grupo: Bajas */}
            {bajas.length > 0 && (
                <GrupoSugerencias label="Para tener en cuenta" sugerencias={bajas} prioridad="baja" />
            )}
        </section>
    );
}

/* Grupo de sugerencias por prioridad */
function GrupoSugerencias({ label, sugerencias, prioridad }: { label: string; sugerencias: SugerenciaAjuste[]; prioridad: 'alta' | 'media' | 'baja' }) {
    const config = prioridadConfig[prioridad];
    return (
        <div>
            <div className="flex items-center gap-2 mb-2.5">
                <span className={clsx('h-2 w-2 rounded-full', config.dot)} />
                <span className={clsx('text-[10.5px] font-bold uppercase tracking-wider', config.color)}>{label}</span>
                <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">({sugerencias.length})</span>
            </div>
            <div className="space-y-2.5">
                {sugerencias.map(s => <TarjetaSugerencia key={s.codigo} sugerencia={s} />)}
            </div>
        </div>
    );
}

/* Card individual de sugerencia */
function TarjetaSugerencia({ sugerencia: s }: { sugerencia: SugerenciaAjuste }) {
    const [expandido, setExpandido] = useState(false);
    const config = prioridadConfig[s.prioridad];
    const IconoPrioridad = config.icon;

    return (
        <div className={clsx('rounded-xl border border-l-[3px] overflow-hidden transition-shadow', config.border, 'border-surface-border/70 dark:border-surface-border-dark/70', expandido && 'shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.15)]')}>
            {/* Cabecera principal */}
            <div className="px-4 py-4">
                <div className="flex items-start gap-3">
                    {/* Icono */}
                    <div className={clsx('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', config.bg)}>
                        <IconoPrioridad size={15} strokeWidth={1.8} className={config.color} />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <h4 className="text-[12.5px] font-bold text-ink dark:text-ink-dark leading-snug">{s.titulo}</h4>
                            <Badge color="gray">{s.categoria}</Badge>
                        </div>
                        <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark mt-1 leading-relaxed">{s.descripcion}</p>

                        {/* Acción sugerida — destacada */}
                        <div className={clsx('mt-3 rounded-lg px-3 py-2.5', config.bg)}>
                            <p className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted/60 dark:text-ink-muted-dark/60 mb-0.5">Qué hacer</p>
                            <p className={clsx('text-[11.5px] font-semibold leading-relaxed', config.color)}>{s.accion_sugerida}</p>
                        </div>
                    </div>
                </div>

                {/* Botón expandir */}
                <button type="button" onClick={() => setExpandido(!expandido)}
                    className="mt-3 ml-11 flex items-center gap-1 text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark transition-colors">
                    <ChevronDown size={12} className={clsx('transition-transform', expandido && 'rotate-180')} />
                    {expandido ? 'Ocultar detalles' : 'Ver justificación e impacto'}
                </button>
            </div>

            {/* Detalle expandido */}
            {expandido && (
                <div className="px-4 pb-4 pt-0 ml-11">
                    <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.02] p-4 grid gap-4 md:grid-cols-2">
                        {/* Justificación */}
                        <div>
                            <p className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted/60 dark:text-ink-muted-dark/60 mb-1">Por qué se sugiere</p>
                            <p className="text-[11px] text-ink dark:text-ink-dark leading-relaxed">{s.justificacion}</p>
                        </div>

                        {/* Impacto esperado */}
                        <div>
                            <p className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted/60 dark:text-ink-muted-dark/60 mb-1">Impacto esperado</p>
                            <p className="text-[11px] text-ink dark:text-ink-dark leading-relaxed">{s.impacto_en_siguiente_plan}</p>
                        </div>

                        {/* Datos considerados */}
                        {s.datos_considerados.length > 0 && (
                            <div className="md:col-span-2">
                                <p className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted/60 dark:text-ink-muted-dark/60 mb-1.5">Datos que respaldan esta sugerencia</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {s.datos_considerados.map((x, i) => (
                                        <span key={i} className="inline-flex items-center rounded-lg bg-black/[0.04] px-2.5 py-1 text-[10px] font-medium text-ink-muted dark:bg-white/[0.06] dark:text-ink-muted-dark">{x}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
