import { Heart, Plus, Edit, History, ThumbsUp, ThumbsDown, Salad, Flame, Sparkles } from 'lucide-react';
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

type SeccionTipo = 'like' | 'dislike' | 'neutral';

const SECCIONES: { key: string; label: string; tipo: SeccionTipo; icono: typeof ThumbsUp }[] = [
    { key: 'alimentos_preferidos', label: 'Alimentos preferidos', tipo: 'like', icono: ThumbsUp },
    { key: 'alimentos_no_preferidos', label: 'Alimentos no preferidos', tipo: 'dislike', icono: ThumbsDown },
    { key: 'comidas_preferidas', label: 'Comidas preferidas', tipo: 'like', icono: Salad },
    { key: 'comidas_frecuentes', label: 'Comidas frecuentes', tipo: 'neutral', icono: Flame },
    { key: 'preparaciones_preferidas', label: 'Preparaciones preferidas', tipo: 'like', icono: Sparkles },
    { key: 'sabores_preferidos', label: 'Sabores preferidos', tipo: 'like', icono: Heart },
];

const TIPO_ESTILOS: Record<SeccionTipo, { border: string; bg: string; badgeColor: 'green' | 'red' | 'gray'; iconColor: string }> = {
    like: { border: 'border-brand-green/20', bg: 'bg-brand-green/[0.03] dark:bg-brand-green/[0.04]', badgeColor: 'green', iconColor: 'text-brand-green-dark dark:text-brand-green' },
    dislike: { border: 'border-category-fruits/20', bg: 'bg-category-fruits/[0.03] dark:bg-category-fruits/[0.04]', badgeColor: 'red', iconColor: 'text-category-fruits' },
    neutral: { border: 'border-surface-border dark:border-surface-border-dark', bg: 'bg-black/[0.015] dark:bg-white/[0.02]', badgeColor: 'gray', iconColor: 'text-ink-muted dark:text-ink-muted-dark' },
};

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
                    No se han registrado preferencias. Conocer los gustos permite diseñar planes más adherentes.
                </p>
                <Boton variante="primary" tamano="sm" onClick={onRegistrar} disabled={bloqueada}>
                    <Plus size={13} strokeWidth={1.8} /> Registrar preferencias
                </Boton>
            </div>
        );
    }

    // Contar secciones con datos
    const seccionesConDatos = SECCIONES.filter(s => registro[s.key]);

    return (
        <div className="p-5 space-y-4">

            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-category-dairy/15">
                        <Heart size={15} strokeWidth={1.8} className="text-category-dairy" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Preferencias alimentarias</h3>
                            <Badge color="purple">{seccionesConDatos.length} categorías</Badge>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Boton variante="primary" tamano="xs" onClick={onRegistrar}>
                        <Plus size={11} strokeWidth={1.8} /> Nuevo
                    </Boton>
                    {idPaciente && (
                        <Link href={`/nutricionista/pacientes/${idPaciente}/perfil-nutricional/preferencias/historial`}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[0.03] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.04] dark:hover:text-ink-dark">
                            <History size={11} strokeWidth={1.8} /> Historial
                        </Link>
                    )}
                    <button onClick={onEditar} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green-soft dark:text-brand-green dark:hover:bg-brand-green-dark/15">
                        <Edit size={11} strokeWidth={1.8} /> Editar
                    </button>
                </div>
            </div>

            {/* ── Secciones con chips ── */}
            <div className="space-y-3">
                {SECCIONES.map(({ key, label, tipo, icono: Icon }) => {
                    const valor = registro[key];
                    if (!valor) return null;
                    const estilo = TIPO_ESTILOS[tipo];
                    // Intentar parsear como items separados por coma
                    const items = String(valor).split(',').map(s => s.trim()).filter(Boolean);

                    return (
                        <div key={key} className={clsx('rounded-xl border px-3.5 py-3', estilo.border, estilo.bg)}>
                            <div className="flex items-center gap-1.5 mb-2">
                                <Icon size={12} strokeWidth={1.8} className={estilo.iconColor} />
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{label}</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {items.length > 1 ? (
                                    items.map((item, i) => (
                                        <Badge key={`${key}-${i}`} color={estilo.badgeColor}>{item}</Badge>
                                    ))
                                ) : (
                                    <p className="text-[11.5px] text-ink dark:text-ink-dark leading-relaxed">{String(valor)}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
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
