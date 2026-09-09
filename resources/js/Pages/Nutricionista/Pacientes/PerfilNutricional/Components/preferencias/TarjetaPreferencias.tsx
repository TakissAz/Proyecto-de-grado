import { Heart, Plus, Edit, History, ThumbsUp, ThumbsDown, Salad, Flame, Sparkles, Cherry, Info } from 'lucide-react';
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

const SECCIONES: { key: string; label: string; icono: typeof Heart; color: string; bgColor: string; borderColor: string; badgeColor: 'green' | 'red' | 'orange' | 'purple' | 'gray' }[] = [
    { key: 'alimentos_preferidos', label: 'Alimentos preferidos', icono: ThumbsUp, color: 'text-brand-green-dark dark:text-brand-green', bgColor: 'bg-brand-green/[0.05] dark:bg-brand-green/[0.06]', borderColor: 'border-brand-green/20', badgeColor: 'green' },
    { key: 'alimentos_no_preferidos', label: 'No preferidos', icono: ThumbsDown, color: 'text-category-fruits', bgColor: 'bg-category-fruits/[0.04] dark:bg-category-fruits/[0.05]', borderColor: 'border-category-fruits/20', badgeColor: 'red' },
    { key: 'comidas_preferidas', label: 'Comidas preferidas', icono: Salad, color: 'text-category-dairy', bgColor: 'bg-category-dairy/[0.05] dark:bg-category-dairy/[0.06]', borderColor: 'border-category-dairy/20', badgeColor: 'purple' },
    { key: 'comidas_frecuentes', label: 'Comidas frecuentes', icono: Flame, color: 'text-brand-orange', bgColor: 'bg-brand-orange/[0.04] dark:bg-brand-orange/[0.05]', borderColor: 'border-brand-orange/20', badgeColor: 'orange' },
    { key: 'preparaciones_preferidas', label: 'Preparaciones', icono: Sparkles, color: 'text-info', bgColor: 'bg-info/[0.04] dark:bg-info/[0.05]', borderColor: 'border-info/20', badgeColor: 'gray' },
    { key: 'sabores_preferidos', label: 'Sabores', icono: Cherry, color: 'text-category-fruits', bgColor: 'bg-category-fruits/[0.03] dark:bg-category-fruits/[0.04]', borderColor: 'border-category-fruits/15', badgeColor: 'red' },
];

export default function TarjetaPreferencias({ registro, onRegistrar, onEditar, bloqueada, idPaciente }: Props) {
    if (!registro) {
        return (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-category-dairy/10">
                    <Heart size={18} strokeWidth={1.5} className="text-ink-muted/30 dark:text-ink-muted-dark/30" />
                </div>
                <div>
                    <p className="text-[12.5px] font-semibold text-ink dark:text-ink-dark">Sin preferencias registradas</p>
                    <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark mt-0.5">Conocer los gustos permite diseñar planes más adherentes</p>
                </div>
                <Boton variante="primary" tamano="sm" onClick={onRegistrar} disabled={bloqueada}>
                    <Plus size={13} strokeWidth={1.8} /> Registrar
                </Boton>
            </div>
        );
    }

    const seccionesConDatos = SECCIONES.filter(s => registro[s.key]);

    return (
        <div className="space-y-4">

            {/* Mini header */}
            <div className="flex flex-col gap-3 rounded-xl border border-category-dairy/20 bg-category-dairy/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Heart size={14} strokeWidth={1.8} className="text-category-dairy" />
                    <span className="text-[12px] font-bold text-ink dark:text-ink-dark">Preferencias</span>
                    <Badge color="purple">{seccionesConDatos.length} categorías</Badge>
                </div>
                <div className="flex items-center gap-1.5">
                    <Boton variante="primary" tamano="xs" onClick={onRegistrar}><Plus size={11} /> Nuevo</Boton>
                    {idPaciente && (
                        <Link href={`/nutricionista/pacientes/${idPaciente}/perfil-nutricional/preferencias/historial`}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-ink-muted hover:bg-black/[0.03] dark:text-ink-muted-dark dark:hover:bg-white/[0.04]">
                            <History size={10} /> Historial
                        </Link>
                    )}
                    <button onClick={onEditar} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-brand-green-dark hover:bg-brand-green/10 dark:text-brand-green">
                        <Edit size={10} /> Editar
                    </button>
                </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-info/15 bg-info/[0.04] px-3 py-2 text-[10.5px] text-ink-muted dark:text-ink-muted-dark">
                <Info size={13} className="mt-0.5 shrink-0 text-info" />
                <span><strong className="text-ink dark:text-ink-dark">Nuevo</strong> crea una valoración y conserva la vigente en el historial. <strong className="text-ink dark:text-ink-dark">Editar</strong> corrige el registro actual.</span>
            </div>

            {/* Grid de secciones — 2 columnas para mejor distribución */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SECCIONES.map(({ key, label, icono: Icon, color, bgColor, borderColor, badgeColor }) => {
                    const valor = registro[key];
                    const items = valor ? String(valor).split(',').map(s => s.trim()).filter(Boolean) : [];

                    return (
                        <div key={key} className={clsx('rounded-xl border px-3.5 py-3', borderColor, bgColor)}>
                            <div className="flex items-center gap-1.5 mb-2">
                                <Icon size={12} strokeWidth={1.8} className={color} />
                                <p className="text-[9.5px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{label}</p>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {items.length ? items.map((item, i) => (
                                    <Badge key={`${key}-${i}`} color={badgeColor}>{item}</Badge>
                                )) : <span className="text-[10.5px] italic text-ink-muted/70 dark:text-ink-muted-dark/70">Sin información registrada</span>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Observaciones */}
            {registro.observaciones && (
                <div className="rounded-xl border border-surface-border px-3.5 py-2.5 dark:border-surface-border-dark">
                    <p className="text-[9.5px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">Observaciones</p>
                    <p className="text-[11.5px] text-ink dark:text-ink-dark leading-relaxed">{String(registro.observaciones)}</p>
                </div>
            )}
        </div>
    );
}
