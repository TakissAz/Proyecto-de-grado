import { ShieldAlert, Plus, Edit, History, AlertTriangle, Ban } from 'lucide-react';
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

export default function TarjetaRestricciones({ registro, onRegistrar, onEditar, bloqueada, idPaciente }: Props) {
    if (!registro) {
        return (
            <div className="p-5">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-category-fruits/10">
                        <ShieldAlert size={15} strokeWidth={1.8} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-semibold text-ink dark:text-ink-dark">Restricciones alimentarias</h3>
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Alergias, intolerancias y exclusiones</p>
                    </div>
                </div>
                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark mb-4 leading-relaxed">
                    No se han registrado restricciones. Registra alergias, intolerancias y alimentos a evitar.
                </p>
                <Boton variante="primary" tamano="sm" onClick={onRegistrar} disabled={bloqueada}>
                    <Plus size={13} strokeWidth={1.8} /> Registrar restricciones
                </Boton>
            </div>
        );
    }

    const secciones: [string, string, 'danger' | 'warning' | 'neutral'][] = [
        ['alergias', 'Alergias', 'danger'],
        ['intolerancias', 'Intolerancias', 'warning'],
        ['alimentos_restringidos', 'Alimentos restringidos', 'warning'],
        ['alimentos_no_tolerados', 'No tolerados', 'danger'],
        ['alimentos_rechazados', 'Rechazados', 'neutral'],
    ];

    const iconColor = { danger: 'text-category-fruits', warning: 'text-brand-orange', neutral: 'text-ink-muted dark:text-ink-muted-dark' };
    const bgColor = { danger: 'bg-category-fruits/[0.04]', warning: 'bg-brand-orange/[0.04]', neutral: 'bg-black/[0.015] dark:bg-white/[0.02]' };

    return (
        <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-category-fruits/15">
                        <ShieldAlert size={15} strokeWidth={1.8} className="text-category-fruits" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Restricciones alimentarias</h3>
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Alergias, intolerancias y exclusiones</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Boton variante="primary" tamano="xs" onClick={onRegistrar}>
                        <Plus size={11} strokeWidth={1.8} /> Nuevo
                    </Boton>
                    {idPaciente && (
                        <Link href={`/nutricionista/pacientes/${idPaciente}/perfil-nutricional/restricciones/historial`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[0.03] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.04] dark:hover:text-ink-dark">
                            <History size={11} strokeWidth={1.8} /> Historial
                        </Link>
                    )}
                    <button onClick={onEditar} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green-soft dark:text-brand-green dark:hover:bg-brand-green-dark/15">
                        <Edit size={11} strokeWidth={1.8} /> Editar
                    </button>
                </div>
            </div>

            {/* Secciones */}
            <div className="space-y-2">
                {secciones.map(([key, label, tipo]) => {
                    const valor = registro[key];
                    if (!valor) return null;
                    return (
                        <div key={key} className={`rounded-lg px-3 py-2.5 ${bgColor[tipo]}`}>
                            <div className="flex items-center gap-1.5 mb-1">
                                {tipo === 'danger' ? <AlertTriangle size={10} strokeWidth={2} className={iconColor[tipo]} /> : <Ban size={10} strokeWidth={1.8} className={iconColor[tipo]} />}
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
