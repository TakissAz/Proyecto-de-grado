import { useForm } from '@inertiajs/react';
import { X, Target } from 'lucide-react';
import { useEffect } from 'react';
import { Boton } from '@/Components/ui/boton';
import clsx from 'clsx';
import type { Registro, Opciones } from '../../tipos';

interface Props {
    abierto: boolean;
    cerrar: () => void;
    registro: Registro | null;
    pacienteId: number;
    opciones: Opciones;
}

const OBJ_LABELS: Record<string, string> = {
    perdida_peso: 'Pérdida de peso', mejora_resistencia_insulina: 'Mejorar resistencia insulina',
    control_glucemico: 'Control glucémico', mejora_composicion_corporal: 'Mejorar composición corporal',
    mantenimiento: 'Mantenimiento', educacion_nutricional: 'Educación nutricional', otro: 'Otro',
};
const ENFOQUE_LABELS: Record<string, string> = {
    bajo_indice_glucemico: 'Bajo índice glucémico', alto_en_fibra: 'Alto en fibra',
    alto_en_proteina: 'Alto en proteína', control_calorico: 'Control calórico',
    antiinflamatorio: 'Antiinflamatorio', balanceado: 'Balanceado',
};

export default function ModalObjetivos({ abierto, cerrar, registro, pacienteId, opciones }: Props) {
    const id = registro?.id_objetivo_nutricional;
    const url = `/nutricionista/pacientes/${pacienteId}/perfil-nutricional/objetivos${id ? `/${id}` : ''}`;

    const { data, setData, post, put, processing, errors, clearErrors } = useForm({
        objetivo_principal: String(registro?.objetivo_principal ?? ''),
        prioridad: String(registro?.prioridad ?? 'media'),
        objetivo_secundario: String(registro?.objetivo_secundario ?? ''),
        enfoque_nutricional: String(registro?.enfoque_nutricional ?? ''),
        meta_peso: String(registro?.meta_peso ?? ''),
        meta_cintura: String(registro?.meta_cintura ?? ''),
        plazo_semanas: String(registro?.plazo_semanas ?? ''),
        observaciones: String(registro?.observaciones ?? ''),
    });

    useEffect(() => { if (abierto) clearErrors(); }, [abierto]);

    if (!abierto) return null;

    const enviar = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: cerrar };
        registro ? put(url, opts) : post(url, opts);
    };

    return (
        <div className="modal modal-open z-50">
            <div className="modal-box max-w-xl bg-surface-card p-0 overflow-hidden dark:bg-surface-card-dark">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border dark:border-surface-border-dark">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-category-others/15">
                            <Target size={14} strokeWidth={1.8} className="text-category-others" />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-bold text-ink dark:text-ink-dark">{id ? 'Editar objetivo' : 'Definir objetivo'}</h3>
                            <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark">Metas y enfoque nutricional del paciente</p>
                        </div>
                    </div>
                    <button type="button" onClick={cerrar} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
                        <X size={15} strokeWidth={1.8} className="text-ink-muted dark:text-ink-muted-dark" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={enviar} className="px-5 py-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Objetivo principal */}
                    <div>
                        <label className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark block mb-2">Objetivo principal *</label>
                        <div className="flex flex-wrap gap-1.5">
                            {opciones.objetivo_principal.map(o => (
                                <button key={o} type="button" onClick={() => setData('objetivo_principal', o)} className={clsx(
                                    'rounded-lg border px-2.5 py-1.5 text-[10px] font-medium transition-all',
                                    data.objetivo_principal === o
                                        ? 'border-brand-green bg-brand-green/10 text-brand-green-dark dark:bg-brand-green/[0.08] dark:text-brand-green'
                                        : 'border-surface-border text-ink-muted hover:border-brand-green/30 dark:border-surface-border-dark dark:text-ink-muted-dark'
                                )}>
                                    {OBJ_LABELS[o] ?? o.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>
                        {errors.objetivo_principal && <p className="text-[9px] text-category-fruits mt-1">{errors.objetivo_principal}</p>}
                    </div>

                    {/* Prioridad */}
                    <div>
                        <label className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark block mb-2">Prioridad</label>
                        <div className="flex gap-2">
                            {opciones.prioridad.map(p => (
                                <button key={p} type="button" onClick={() => setData('prioridad', p)} className={clsx(
                                    'flex-1 rounded-lg border px-3 py-2 text-[11px] font-medium text-center capitalize transition-all',
                                    data.prioridad === p
                                        ? 'border-brand-green bg-brand-green/10 text-brand-green-dark dark:bg-brand-green/[0.08] dark:text-brand-green'
                                        : 'border-surface-border text-ink-muted hover:border-brand-green/30 dark:border-surface-border-dark dark:text-ink-muted-dark'
                                )}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Enfoque nutricional */}
                    <div>
                        <label className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark block mb-2">Enfoque nutricional</label>
                        <div className="flex flex-wrap gap-1.5">
                            {opciones.enfoque_nutricional.map(e => (
                                <button key={e} type="button" onClick={() => setData('enfoque_nutricional', e)} className={clsx(
                                    'rounded-lg border px-2.5 py-1.5 text-[10px] font-medium transition-all',
                                    data.enfoque_nutricional === e
                                        ? 'border-category-others bg-category-others/10 text-category-others'
                                        : 'border-surface-border text-ink-muted hover:border-category-others/30 dark:border-surface-border-dark dark:text-ink-muted-dark'
                                )}>
                                    {ENFOQUE_LABELS[e] ?? e.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Objetivo secundario */}
                    <div>
                        <label className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark block mb-1">Objetivo secundario</label>
                        <input type="text" value={data.objetivo_secundario} onChange={e => setData('objetivo_secundario', e.target.value)} placeholder="Ej: mejorar energía diaria, reducir inflamación..." className="campo-input" />
                    </div>

                    {/* Metas numéricas */}
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">Metas cuantitativas</p>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="text-[9px] text-ink-muted dark:text-ink-muted-dark block mb-1">Meta peso (kg)</label>
                                <input type="number" step="0.01" value={data.meta_peso} onChange={e => setData('meta_peso', e.target.value)} placeholder="65" className="campo-input" />
                            </div>
                            <div>
                                <label className="text-[9px] text-ink-muted dark:text-ink-muted-dark block mb-1">Meta cintura (cm)</label>
                                <input type="number" step="0.01" value={data.meta_cintura} onChange={e => setData('meta_cintura', e.target.value)} placeholder="80" className="campo-input" />
                            </div>
                            <div>
                                <label className="text-[9px] text-ink-muted dark:text-ink-muted-dark block mb-1">Plazo (semanas)</label>
                                <input type="number" value={data.plazo_semanas} onChange={e => setData('plazo_semanas', e.target.value)} placeholder="12" className="campo-input" />
                            </div>
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div>
                        <label className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark block mb-1">Observaciones</label>
                        <textarea value={data.observaciones} onChange={e => setData('observaciones', e.target.value)} rows={2} placeholder="Notas sobre los objetivos..." className="campo-input resize-none" />
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-surface-border dark:border-surface-border-dark bg-black/[0.01] dark:bg-white/[0.01]">
                    <Boton variante="ghost" tamano="sm" onClick={cerrar}>Cancelar</Boton>
                    <Boton variante="primary" tamano="sm" onClick={(e: any) => enviar(e)} disabled={processing}>
                        {processing ? 'Guardando...' : (id ? 'Actualizar' : 'Registrar')}
                    </Boton>
                </div>
            </div>
            <button type="button" className="modal-backdrop" onClick={cerrar} aria-label="Cerrar" />
        </div>
    );
}
