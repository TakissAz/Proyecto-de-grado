import { useForm } from '@inertiajs/react';
import { X, UtensilsCrossed } from 'lucide-react';
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

const FRECUENCIAS: Record<string, string> = { nunca: 'Nunca', ocasional: 'Ocasional', frecuente: 'Frecuente', diario: 'Diario' };

export default function ModalHabitos({ abierto, cerrar, registro, pacienteId, opciones }: Props) {
    const id = registro?.id_habito_alimentario;
    const url = `/nutricionista/pacientes/${pacienteId}/perfil-nutricional/habitos${id ? `/${id}` : ''}`;

    const { data, setData, post, put, processing, errors, clearErrors } = useForm({
        comidas_por_dia: String(registro?.comidas_por_dia ?? ''),
        consumo_agua_litros: String(registro?.consumo_agua_litros ?? ''),
        consumo_azucar: String(registro?.consumo_azucar ?? ''),
        consumo_ultraprocesados: String(registro?.consumo_ultraprocesados ?? ''),
        consumo_frituras: String(registro?.consumo_frituras ?? ''),
        consumo_bebidas_azucaradas: String(registro?.consumo_bebidas_azucaradas ?? ''),
        frecuencia_frutas_verduras: String(registro?.frecuencia_frutas_verduras ?? ''),
        horarios_regulares: Boolean(registro?.horarios_regulares),
        consume_desayuno: Boolean(registro?.consume_desayuno),
        cena_tardia: Boolean(registro?.cena_tardia),
        ansiedad_por_comida: Boolean(registro?.ansiedad_por_comida),
        hambre_nocturna: Boolean(registro?.hambre_nocturna),
        observaciones: String(registro?.observaciones ?? ''),
    });

    useEffect(() => { if (abierto) clearErrors(); }, [abierto]);

    if (!abierto) return null;

    const enviar = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: cerrar };
        registro ? put(url, opts) : post(url, opts);
    };

    const FrecuenciaSelector = ({ campo, label }: { campo: string; label: string }) => (
        <div>
            <label className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark block mb-1.5">{label}</label>
            <div className="flex gap-1">
                {Object.entries(FRECUENCIAS).map(([key, lbl]) => (
                    <button key={key} type="button" onClick={() => setData(campo as any, key)} className={clsx(
                        'flex-1 rounded-lg border px-2 py-1.5 text-[10px] font-medium text-center transition-all',
                        (data as any)[campo] === key
                            ? 'border-brand-green bg-brand-green/10 text-brand-green-dark dark:bg-brand-green/[0.08] dark:text-brand-green'
                            : 'border-surface-border text-ink-muted hover:border-brand-green/30 dark:border-surface-border-dark dark:text-ink-muted-dark'
                    )}>
                        {lbl}
                    </button>
                ))}
            </div>
        </div>
    );

    const Checkbox = ({ campo, label }: { campo: string; label: string }) => (
        <label className="flex items-center gap-2.5 rounded-lg border border-surface-border px-3 py-2 cursor-pointer transition-colors hover:bg-black/[0.01] dark:border-surface-border-dark dark:hover:bg-white/[0.01]">
            <input type="checkbox" checked={Boolean((data as any)[campo])} onChange={e => setData(campo as any, e.target.checked as any)} className="h-4 w-4 rounded border-surface-border text-brand-green focus:ring-brand-green/30 dark:border-surface-border-dark" />
            <span className="text-[11px] font-medium text-ink dark:text-ink-dark">{label}</span>
        </label>
    );

    return (
        <div className="modal modal-open z-50">
            <div className="modal-box max-w-xl bg-surface-card p-0 overflow-hidden dark:bg-surface-card-dark">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border dark:border-surface-border-dark">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange/15">
                            <UtensilsCrossed size={14} strokeWidth={1.8} className="text-brand-orange" />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-bold text-ink dark:text-ink-dark">{id ? 'Editar hábitos' : 'Registrar hábitos'}</h3>
                            <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark">Frecuencia de consumo y conductas alimentarias</p>
                        </div>
                    </div>
                    <button type="button" onClick={cerrar} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
                        <X size={15} strokeWidth={1.8} className="text-ink-muted dark:text-ink-muted-dark" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={enviar} className="px-5 py-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Datos generales */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark block mb-1">Comidas por día</label>
                            <input type="number" value={data.comidas_por_dia} onChange={e => setData('comidas_por_dia', e.target.value)} placeholder="3" className="campo-input" />
                        </div>
                        <div>
                            <label className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark block mb-1">Agua (litros/día)</label>
                            <input type="number" step="0.01" value={data.consumo_agua_litros} onChange={e => setData('consumo_agua_litros', e.target.value)} placeholder="2.0" className="campo-input" />
                        </div>
                    </div>

                    {/* Frecuencias */}
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-3">Frecuencia de consumo</p>
                        <div className="space-y-3">
                            <FrecuenciaSelector campo="consumo_azucar" label="Azúcar" />
                            <FrecuenciaSelector campo="consumo_ultraprocesados" label="Ultraprocesados" />
                            <FrecuenciaSelector campo="consumo_frituras" label="Frituras" />
                            <FrecuenciaSelector campo="consumo_bebidas_azucaradas" label="Bebidas azucaradas" />
                            <FrecuenciaSelector campo="frecuencia_frutas_verduras" label="Frutas y verduras" />
                        </div>
                    </div>

                    {/* Conductas */}
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">Conductas alimentarias</p>
                        <div className="grid grid-cols-2 gap-2">
                            <Checkbox campo="horarios_regulares" label="Horarios regulares" />
                            <Checkbox campo="consume_desayuno" label="Desayuna" />
                            <Checkbox campo="cena_tardia" label="Cena tarde" />
                            <Checkbox campo="ansiedad_por_comida" label="Ansiedad por comida" />
                            <Checkbox campo="hambre_nocturna" label="Hambre nocturna" />
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div>
                        <label className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark block mb-1">Observaciones</label>
                        <textarea value={data.observaciones} onChange={e => setData('observaciones', e.target.value)} rows={2} placeholder="Notas sobre los hábitos del paciente..." className="campo-input resize-none" />
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
