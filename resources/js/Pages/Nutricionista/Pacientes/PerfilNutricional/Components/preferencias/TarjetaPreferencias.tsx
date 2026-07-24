import { Heart, Plus, Edit, History, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Boton } from '@/Components/ui/boton';
import type { Registro } from '../../tipos';

interface Props {
    registro: Registro | null;
    onRegistrar: () => void;
    onEditar: () => void;
    bloqueada?: boolean;
    idPaciente?: number;
}

export default function TarjetaPreferencias({ registro, onRegistrar, onEditar, bloqueada, idPaciente }: Props) {
    if (!registro) {
        return (
            <div className="p-5">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-category-dairy/10">
                        <Heart size={15} strokeWidth={1.8} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-semibold text-ink dark:text-ink-dark">Preferencias alimentarias</h3>
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Gustos y afinidades del paciente</p>
                    </div>
                </div>
                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark mb-4 leading-relaxed">
                    No se han registrado preferencias alimentarias. Conocer los gustos del paciente permite diseñar planes más adherentes.
                </p>
                <Boton variante="primary" tamano="sm" onClick={onRegistrar} disabled={bloqueada}>
                    <Plus size={13} strokeWidth={1.8} /> Registrar preferencias
                </Boton>
            </div>
        );
    }

    const secciones: [string, string, 'like' | 'dislike' | 'neutral'][] = [
        ['alimentos_preferidos', 'Alimentos preferidos', 'like'],
        ['alimentos_no_preferidos', 'Alimentos no preferidos', 'dislike'],
        ['comidas_preferidas', 'Comidas preferidas', 'like'],
        ['comidas_frecuentes', 'Comidas frecuentes', 'neutral'],
        ['preparaciones_preferidas', 'Preparaciones preferidas', 'like'],
        ['sabores_preferidos', 'Sabores preferidos', 'like'],
    ];

    return (
        <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-category-dairy/15">
                        <Heart size={15} strokeWidth={1.8} className="text-category-dairy" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Preferencias alimentarias</h3>
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Gustos y afinidades</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Boton variante="primary" tamano="xs" onClick={onRegistrar}>
                        <Plus size={11} strokeWidth={1.8} /> Nuevo
                    </Boton>
                    {idPaciente && (
                        <Link href={`/nutricionista/pacientes/${idPaciente}/perfil-nutricional/preferencias/historial`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[0.03] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.04] dark:hover:text-ink-dark">
                            <History size={11} strokeWidth={1.8} /> Historial
                        </Link>
                    )}
                    <button onClick={onEditar} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green-soft dark:text-brand-green dark:hover:bg-brand-green-dark/15">
                        <Edit size={11} strokeWidth={1.8} /> Editar
                    </button>
                </div>
            </div>

            {/* Datos en lista */}
            <div className="space-y-2">
                {secciones.map(([key, label, tipo]) => {
                    const valor = registro[key];
                    if (!valor) return null;
                    return (
                        <div key={key} className="rounded-lg bg-black/[0.015] px-3 py-2.5 dark:bg-white/[0.02]">
                            <div className="flex items-center gap-1.5 mb-1">
                                {tipo === 'like' && <ThumbsUp size={10} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" />}
                                {tipo === 'dislike' && <ThumbsDown size={10} strokeWidth={1.8} className="text-category-fruits" />}
                                <p className="text-[9.5px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{label}</p>
                            </div>
                            <p className="text-[11.5px] text-ink dark:text-ink-dark leading-relaxed">{String(valor)}</p>
                        </div>
                    );
                })}
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
