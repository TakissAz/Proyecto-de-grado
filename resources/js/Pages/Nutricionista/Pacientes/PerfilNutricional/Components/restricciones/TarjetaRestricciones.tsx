import { ShieldAlert, Plus, Edit, History, AlertTriangle, Ban, XOctagon, Skull, HeartCrack, Info } from 'lucide-react';
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

const SECCIONES: { key: string; label: string; icono: typeof AlertTriangle; color: string; bgColor: string; borderColor: string; badgeColor: 'red' | 'orange' | 'gray'; descripcion: string }[] = [
    { key: 'alergias', label: 'Alergias', icono: Skull, color: 'text-category-fruits', bgColor: 'bg-category-fruits/[0.06] dark:bg-category-fruits/[0.07]', borderColor: 'border-category-fruits/25', badgeColor: 'red', descripcion: 'Reacción inmunológica' },
    { key: 'intolerancias', label: 'Intolerancias', icono: HeartCrack, color: 'text-brand-orange', bgColor: 'bg-brand-orange/[0.05] dark:bg-brand-orange/[0.06]', borderColor: 'border-brand-orange/25', badgeColor: 'orange', descripcion: 'Malestar digestivo' },
    { key: 'alimentos_restringidos', label: 'Restringidos', icono: Ban, color: 'text-category-dairy', bgColor: 'bg-category-dairy/[0.05] dark:bg-category-dairy/[0.06]', borderColor: 'border-category-dairy/25', badgeColor: 'gray', descripcion: 'Limitación médica' },
    { key: 'alimentos_no_tolerados', label: 'No tolerados', icono: XOctagon, color: 'text-category-fruits', bgColor: 'bg-category-fruits/[0.04] dark:bg-category-fruits/[0.05]', borderColor: 'border-category-fruits/20', badgeColor: 'red', descripcion: 'Rechazo por malestar' },
    { key: 'alimentos_rechazados', label: 'Rechazados', icono: AlertTriangle, color: 'text-ink-muted dark:text-ink-muted-dark', bgColor: 'bg-black/[0.02] dark:bg-white/[0.03]', borderColor: 'border-surface-border dark:border-surface-border-dark', badgeColor: 'gray', descripcion: 'Rechazo voluntario' },
];

export default function TarjetaRestricciones({ registro, onRegistrar, onEditar, bloqueada, idPaciente }: Props) {
    if (!registro) {
        return (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-category-fruits/10">
                    <ShieldAlert size={18} strokeWidth={1.5} className="text-ink-muted/30 dark:text-ink-muted-dark/30" />
                </div>
                <div>
                    <p className="text-[12.5px] font-semibold text-ink dark:text-ink-dark">Sin restricciones registradas</p>
                    <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark mt-0.5">Registra alergias, intolerancias y alimentos a evitar</p>
                </div>
                <Boton variante="primary" tamano="sm" onClick={onRegistrar} disabled={bloqueada}>
                    <Plus size={13} strokeWidth={1.8} /> Registrar
                </Boton>
            </div>
        );
    }

    const seccionesConDatos = SECCIONES.filter(s => registro[s.key]);
    const totalItems = seccionesConDatos.reduce((sum, s) => {
        return sum + String(registro[s.key]).split(',').filter(Boolean).length;
    }, 0);

    return (
        <div className="space-y-4">

            {/* Mini header */}
            <div className="flex flex-col gap-3 rounded-xl border border-category-fruits/20 bg-category-fruits/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <ShieldAlert size={14} strokeWidth={1.8} className="text-category-fruits" />
                    <span className="text-[12px] font-bold text-ink dark:text-ink-dark">Restricciones</span>
                    <Badge color="red">{totalItems} items</Badge>
                </div>
                <div className="flex items-center gap-1.5">
                    <Boton variante="primary" tamano="xs" onClick={onRegistrar}><Plus size={11} /> Nuevo</Boton>
                    {idPaciente && (
                        <Link href={`/nutricionista/pacientes/${idPaciente}/perfil-nutricional/restricciones/historial`}
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

            {/* Grid de secciones — 2 columnas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SECCIONES.map(({ key, label, icono: Icon, color, bgColor, borderColor, badgeColor, descripcion }) => {
                    const valor = registro[key];
                    const items = valor ? String(valor).split(',').map(s => s.trim()).filter(Boolean) : [];

                    return (
                        <div key={key} className={clsx('rounded-xl border px-3.5 py-3', borderColor, bgColor)}>
                            <div className="flex items-center gap-1.5 mb-2">
                                <Icon size={12} strokeWidth={1.8} className={color} />
                                <p className="text-[9.5px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{label}</p>
                                <span className="text-[8px] text-ink-muted/50 dark:text-ink-muted-dark/50">— {descripcion}</span>
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
