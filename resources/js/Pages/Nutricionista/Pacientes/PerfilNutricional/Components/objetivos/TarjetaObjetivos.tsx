import { Target, Plus, Edit, History, Calendar, TrendingDown, Flame, Flag, Timer } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Boton } from '@/Components/ui/boton';
import { Badge } from '@/Components/ui/badge';
import clsx from 'clsx';
import type { Registro } from '../../tipos';

interface Props {
    registro: Registro | null;
    onRegistrar: () => void;
    onEditar: () => void;
    bloqueada?: boolean;
    idPaciente?: number;
}

const OBJ_LABEL: Record<string, string> = {
    perdida_peso: 'Pérdida de peso', mejora_resistencia_insulina: 'Mejorar resistencia insulina',
    control_glucemico: 'Control glucémico', mejora_composicion_corporal: 'Mejorar composición corporal',
    mantenimiento: 'Mantenimiento', educacion_nutricional: 'Educación nutricional', otro: 'Otro',
};
const ENFOQUE_LABEL: Record<string, string> = {
    bajo_indice_glucemico: 'Bajo índice glucémico', alto_en_fibra: 'Alto en fibra',
    alto_en_proteina: 'Alto en proteína', control_calorico: 'Control calórico',
    antiinflamatorio: 'Antiinflamatorio', balanceado: 'Balanceado',
};
const PRIORIDAD_COLOR: Record<string, 'red' | 'orange' | 'green'> = {
    alta: 'red', media: 'orange', baja: 'green',
};

export default function TarjetaObjetivos({ registro, onRegistrar, onEditar, bloqueada, idPaciente }: Props) {
    if (!registro) {
        return (
            <div className="p-5">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-category-others/10">
                        <Target size={15} strokeWidth={1.8} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-semibold text-ink dark:text-ink-dark">Objetivos nutricionales</h3>
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Metas y enfoque del tratamiento</p>
                    </div>
                </div>
                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark mb-4 leading-relaxed">
                    No se han definido objetivos nutricionales. Establece las metas del paciente para orientar el plan.
                </p>
                <Boton variante="primary" tamano="sm" onClick={onRegistrar} disabled={bloqueada}>
                    <Plus size={13} strokeWidth={1.8} /> Definir objetivos
                </Boton>
            </div>
        );
    }

    const obj = OBJ_LABEL[String(registro.objetivo_principal)] ?? String(registro.objetivo_principal ?? '—');
    const enfoque = ENFOQUE_LABEL[String(registro.enfoque_nutricional)] ?? String(registro.enfoque_nutricional ?? '—');
    const prioridad = String(registro.prioridad ?? 'media');
    const plazoSemanas = Number(registro.plazo_semanas) || 0;
    const metaPeso = Number(registro.meta_peso) || 0;
    const metaCintura = Number(registro.meta_cintura) || 0;

    return (
        <div className="p-5 space-y-4">

            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-category-others/15">
                        <Target size={15} strokeWidth={1.8} className="text-category-others" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Objetivos nutricionales</h3>
                            <Badge color={PRIORIDAD_COLOR[prioridad] ?? 'orange'}>
                                Prioridad {prioridad}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Boton variante="primary" tamano="xs" onClick={onRegistrar}>
                        <Plus size={11} strokeWidth={1.8} /> Nuevo
                    </Boton>
                    {idPaciente && (
                        <Link href={`/nutricionista/pacientes/${idPaciente}/perfil-nutricional/objetivos/historial`}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[0.03] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.04] dark:hover:text-ink-dark">
                            <History size={11} strokeWidth={1.8} /> Historial
                        </Link>
                    )}
                    <button onClick={onEditar} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green-soft dark:text-brand-green dark:hover:bg-brand-green-dark/15">
                        <Edit size={11} strokeWidth={1.8} /> Editar
                    </button>
                </div>
            </div>

            {/* ── Objetivo principal destacado ── */}
            <div className="rounded-xl border border-category-others/25 bg-category-others/[0.04] px-4 py-3.5 dark:bg-category-others/[0.05]">
                <div className="flex items-start gap-3">
                    <Flag size={16} strokeWidth={1.8} className="text-category-others shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-[9.5px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Objetivo principal</p>
                        <p className="text-[14px] font-bold text-ink dark:text-ink-dark mt-0.5">{obj}</p>
                        {registro.objetivo_secundario && (
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark mt-1">
                                Secundario: {String(registro.objetivo_secundario).replace(/_/g, ' ')}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Metas visuales ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">

                {/* Enfoque nutricional */}
                <div className="rounded-xl border border-surface-border bg-black/[0.02] px-3 py-2.5 dark:border-surface-border-dark dark:bg-white/[0.03]">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Flame size={11} strokeWidth={1.8} className="text-brand-orange" />
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Enfoque</p>
                    </div>
                    <p className="text-[12px] font-bold text-ink dark:text-ink-dark">{enfoque}</p>
                </div>

                {/* Meta de peso */}
                {metaPeso > 0 && (
                    <div className="rounded-xl border border-brand-green/20 bg-brand-green/[0.04] px-3 py-2.5 dark:bg-brand-green/[0.05]">
                        <div className="flex items-center gap-1.5 mb-1">
                            <TrendingDown size={11} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" />
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Meta peso</p>
                        </div>
                        <p className="text-[16px] font-bold text-brand-green-dark dark:text-brand-green">{metaPeso} <span className="text-[10px] font-normal text-ink-muted">kg</span></p>
                    </div>
                )}

                {/* Meta de cintura */}
                {metaCintura > 0 && (
                    <div className="rounded-xl border border-brand-orange/20 bg-brand-orange/[0.04] px-3 py-2.5 dark:bg-brand-orange/[0.05]">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Target size={11} strokeWidth={1.8} className="text-brand-orange" />
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Meta cintura</p>
                        </div>
                        <p className="text-[16px] font-bold text-brand-orange">{metaCintura} <span className="text-[10px] font-normal text-ink-muted">cm</span></p>
                    </div>
                )}

                {/* Plazo */}
                {plazoSemanas > 0 && (
                    <div className="rounded-xl border border-surface-border bg-black/[0.02] px-3 py-2.5 dark:border-surface-border-dark dark:bg-white/[0.03]">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Timer size={11} strokeWidth={1.8} className="text-category-dairy" />
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Plazo</p>
                        </div>
                        <p className="text-[16px] font-bold text-ink dark:text-ink-dark">{plazoSemanas} <span className="text-[10px] font-normal text-ink-muted">semanas</span></p>
                        {/* Mini barra de progreso visual del plazo */}
                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                            <div className="h-full rounded-full bg-category-dairy" style={{ width: '20%' }} />
                        </div>
                        <p className="text-[8px] text-ink-muted/50 dark:text-ink-muted-dark/50 mt-0.5">En progreso</p>
                    </div>
                )}
            </div>

            {/* ── Observaciones ── */}
            {registro.observaciones && (
                <div className="rounded-xl border border-surface-border px-4 py-3 dark:border-surface-border-dark">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">Observaciones</p>
                    <p className="text-[12px] text-ink dark:text-ink-dark leading-relaxed">{String(registro.observaciones)}</p>
                </div>
            )}
        </div>
    );
}
