import { Target, Plus, Edit, History, Calendar, TrendingDown } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Boton } from '@/Components/ui/boton';
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
const PRIORIDAD_COLOR: Record<string, string> = {
    alta: 'bg-category-fruits/15 text-category-fruits', media: 'bg-brand-orange/15 text-brand-orange',
    baja: 'bg-brand-green/15 text-brand-green-dark dark:text-brand-green',
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

    return (
        <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-category-others/15">
                        <Target size={15} strokeWidth={1.8} className="text-category-others" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Objetivos nutricionales</h3>
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Metas y enfoque</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Boton variante="primary" tamano="xs" onClick={onRegistrar}>
                        <Plus size={11} strokeWidth={1.8} /> Nuevo
                    </Boton>
                    {idPaciente && (
                        <Link href={`/nutricionista/pacientes/${idPaciente}/perfil-nutricional/objetivos/historial`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[0.03] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.04] dark:hover:text-ink-dark">
                            <History size={11} strokeWidth={1.8} /> Historial
                        </Link>
                    )}
                    <button onClick={onEditar} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green-soft dark:text-brand-green dark:hover:bg-brand-green-dark/15">
                        <Edit size={11} strokeWidth={1.8} /> Editar
                    </button>
                </div>
            </div>

            {/* Objetivo principal + prioridad */}
            <div className="rounded-xl border border-surface-border p-3 dark:border-surface-border-dark">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-[9.5px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Objetivo principal</p>
                    <span className={clsx('pill text-[9px] capitalize', PRIORIDAD_COLOR[prioridad] ?? PRIORIDAD_COLOR.media)}>
                        Prioridad {prioridad}
                    </span>
                </div>
                <p className="text-[13px] font-bold text-ink dark:text-ink-dark">{obj}</p>
                {registro.objetivo_secundario && (
                    <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark mt-1">Secundario: {String(registro.objetivo_secundario)}</p>
                )}
            </div>

            {/* Enfoque + Metas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="rounded-lg bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03]">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">Enfoque</p>
                    <p className="text-[11.5px] font-bold text-category-others">{enfoque}</p>
                </div>
                {registro.meta_peso && (
                    <div className="rounded-lg bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03]">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">Meta peso</p>
                        <p className="text-[12.5px] font-bold text-ink dark:text-ink-dark flex items-center gap-1">
                            <TrendingDown size={11} className="text-brand-green-dark dark:text-brand-green" /> {String(registro.meta_peso)} kg
                        </p>
                    </div>
                )}
                {registro.meta_cintura && (
                    <div className="rounded-lg bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03]">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">Meta cintura</p>
                        <p className="text-[12.5px] font-bold text-ink dark:text-ink-dark">{String(registro.meta_cintura)} cm</p>
                    </div>
                )}
                {registro.plazo_semanas && (
                    <div className="rounded-lg bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03]">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">Plazo</p>
                        <p className="text-[12.5px] font-bold text-ink dark:text-ink-dark flex items-center gap-1">
                            <Calendar size={10} className="text-ink-muted dark:text-ink-muted-dark" /> {String(registro.plazo_semanas)} sem.
                        </p>
                    </div>
                )}
            </div>

            {/* Observaciones */}
            {registro.observaciones && (
                <div className="rounded-xl border border-surface-border px-4 py-3 dark:border-surface-border-dark">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">Observaciones</p>
                    <p className="text-[12px] text-ink dark:text-ink-dark leading-relaxed">{String(registro.observaciones)}</p>
                </div>
            )}
        </div>
    );
}
