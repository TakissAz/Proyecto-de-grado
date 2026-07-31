import { router } from '@inertiajs/react';
import { Calculator, CheckCircle2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Boton } from '@/Components/ui/boton';
import clsx from 'clsx';
import { etiqueta, type Registro, type RequerimientoNutricional } from '../tipos';

interface Props {
    pacienteId: number;
    requerimiento: RequerimientoNutricional | null;
    evaluacion: Registro | null;
    objetivo: Registro | null;
}

const num = (v: number, d = 1) => new Intl.NumberFormat('es-BO', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);

export default function TarjetaRequerimientoNutricional({ pacienteId, requerimiento, evaluacion, objetivo }: Props) {
    const [procesando, setProcesando] = useState(false);
    const faltaEvaluacion = !evaluacion;
    const faltaPesoTalla = Boolean(evaluacion && (evaluacion.peso == null || evaluacion.talla == null));

    const calcular = () => {
        if (faltaEvaluacion || faltaPesoTalla) return;
        router.post(`/nutricionista/pacientes/${pacienteId}/perfil-nutricional/requerimientos/calcular`, {}, {
            preserveScroll: true,
            onStart: () => setProcesando(true),
            onFinish: () => setProcesando(false),
        });
    };

    return (
        <div className="card-elevated p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className={clsx('flex h-8 w-8 items-center justify-center rounded-xl', requerimiento ? 'bg-brand-green/15' : 'bg-black/[0.04] dark:bg-white/[0.04]')}>
                        <Calculator size={15} strokeWidth={1.8} className={requerimiento ? 'text-brand-green-dark dark:text-brand-green' : 'text-ink-muted/40 dark:text-ink-muted-dark/40'} />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Requerimientos nutricionales</h3>
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Estimación energética y macronutrientes</p>
                    </div>
                </div>
                {requerimiento && (
                    <span className="pill bg-brand-green/15 text-brand-green-dark dark:bg-brand-green/20 dark:text-brand-green text-[9px]">
                        <CheckCircle2 size={10} className="mr-1" /> Calculado
                    </span>
                )}
            </div>

            {/* Alertas */}
            {faltaEvaluacion && <p className="text-[11px] text-brand-orange bg-brand-orange/[0.05] rounded-lg px-3 py-2 dark:bg-brand-orange/[0.03]">Registra una evaluación nutricional primero.</p>}
            {faltaPesoTalla && <p className="text-[11px] text-brand-orange bg-brand-orange/[0.05] rounded-lg px-3 py-2 dark:bg-brand-orange/[0.03]">Peso y talla son necesarios para calcular.</p>}

            {requerimiento ? (
                <>
                    {/* Calorías destacadas */}
                    <div className="rounded-xl bg-brand-green/[0.06] p-4 text-center dark:bg-brand-green/[0.04]">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Calorías objetivo</p>
                        <p className="text-[28px] font-black text-brand-green-dark dark:text-brand-green mt-1">
                            {num(requerimiento.calorias_objetivo, 0)}
                            <span className="ml-1 text-[12px] font-semibold">kcal/día</span>
                        </p>
                        <p className="text-[9px] text-ink-muted dark:text-ink-muted-dark mt-1">Calculado el {requerimiento.fecha_calculo}</p>
                    </div>

                    {/* TMB, GET, Ajuste */}
                    <div className="grid grid-cols-3 gap-2">
                        <Dato label="TMB" valor={`${num(requerimiento.tmb)} kcal`} />
                        <Dato label="GET" valor={`${num(requerimiento.get)} kcal`} />
                        <Dato label="Ajuste" valor={`${requerimiento.ajuste_calorico > 0 ? '+' : ''}${num(requerimiento.ajuste_calorico, 0)} kcal`} />
                    </div>

                    {/* Macronutrientes */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <Macro label="Proteínas" gramos={requerimiento.proteinas_diarias} pct={requerimiento.porcentaje_proteinas} color="text-category-fruits" />
                        <Macro label="Carbohidratos" gramos={requerimiento.carbohidratos_diarios} pct={requerimiento.porcentaje_carbohidratos} color="text-brand-orange" />
                        <Macro label="Grasas" gramos={requerimiento.grasas_diarias} pct={requerimiento.porcentaje_grasas} color="text-category-dairy" />
                        <Macro label="Fibra" gramos={requerimiento.fibra_diaria} color="text-brand-green-dark dark:text-brand-green" />
                    </div>

                    {/* Método + actividad */}
                    <div className="flex flex-wrap gap-1.5">
                        <span className="pill bg-brand-green/10 text-brand-green-dark dark:bg-brand-green/[0.08] dark:text-brand-green text-[9px] capitalize">{etiqueta(requerimiento.metodo_calculo)}</span>
                        <span className="pill bg-black/[0.04] text-ink-muted dark:bg-white/[0.04] dark:text-ink-muted-dark text-[9px] capitalize">{etiqueta(requerimiento.nivel_actividad)}</span>
                    </div>

                    {/* Reglas aplicadas */}
                    <section className="space-y-2 rounded-xl border border-base-300 bg-base-100 p-3 sm:p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-base-content">Reglas aplicadas</h4>
                            <span className="badge badge-ghost badge-sm">
                                {requerimiento.reglas_aplicadas?.length ?? 0}
                            </span>
                        </div>

                        {requerimiento.reglas_aplicadas?.length ? (
                            <div className="grid gap-2 lg:grid-cols-2">
                                {requerimiento.reglas_aplicadas.map((regla) => (
                                    <article key={regla.codigo} className="rounded-lg border border-base-300 bg-base-200/60 p-3">
                                        <div className="flex flex-wrap items-start gap-2">
                                            <span className="badge badge-primary badge-sm font-bold">{regla.codigo}</span>
                                            <p className="min-w-0 flex-1 text-xs font-semibold leading-5 text-base-content">{regla.nombre}</p>
                                        </div>
                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <span className="badge badge-outline badge-sm">{etiqueta(regla.tipo_regla)}</span>
                                            <span className="text-[10px] text-base-content/60">Prioridad: {regla.prioridad}</span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p className="rounded-lg bg-base-200 px-3 py-2 text-xs text-base-content/60">
                                No se registraron reglas aplicadas.
                            </p>
                        )}
                    </section>
                </>
            ) : (
                <div className="rounded-xl border border-dashed border-surface-border px-4 py-6 text-center dark:border-surface-border-dark">
                    <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark">Aún no se calcularon los requerimientos nutricionales.</p>
                </div>
            )}

            {/* Botón calcular */}
            <div className="flex justify-end">
                <Boton variante="primary" tamano="sm" onClick={calcular} disabled={procesando || faltaEvaluacion || faltaPesoTalla}>
                    {procesando ? 'Calculando...' : requerimiento ? <><RefreshCw size={12} /> Recalcular</> : <><Calculator size={12} /> Calcular</>}
                </Boton>
            </div>
        </div>
    );
}

function Dato({ label, valor }: { label: string; valor: string }) {
    return (
        <div className="rounded-lg bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03]">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">{label}</p>
            <p className="text-[12px] font-bold text-ink dark:text-ink-dark">{valor}</p>
        </div>
    );
}

function Macro({ label, gramos, pct, color }: { label: string; gramos: number; pct?: number; color: string }) {
    return (
        <div className="rounded-lg bg-black/[0.02] px-3 py-2.5 dark:bg-white/[0.03]">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">{label}</p>
            <p className={clsx('text-[14px] font-bold', color)}>{num(gramos)} g</p>
            {pct !== undefined && <p className="text-[9px] text-ink-muted dark:text-ink-muted-dark">{num(pct, 0)}%</p>}
        </div>
    );
}
