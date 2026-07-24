import { UtensilsCrossed, Plus, Edit, History, Calendar, Droplets, Coffee, Apple } from 'lucide-react';
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

const FRECUENCIA_LABEL: Record<string, string> = { nunca: 'Nunca', ocasional: 'Ocasional', frecuente: 'Frecuente', diario: 'Diario' };
const FRECUENCIA_COLOR: Record<string, string> = {
    nunca: 'text-brand-green-dark dark:text-brand-green',
    ocasional: 'text-category-others',
    frecuente: 'text-brand-orange',
    diario: 'text-category-fruits',
};

export default function TarjetaHabitos({ registro, onRegistrar, onEditar, bloqueada, idPaciente }: Props) {
    if (!registro) {
        return (
            <div className="p-5">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange/10">
                        <UtensilsCrossed size={15} strokeWidth={1.8} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-semibold text-ink dark:text-ink-dark">Hábitos alimentarios</h3>
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Frecuencia de consumo y conductas</p>
                    </div>
                </div>
                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark mb-4 leading-relaxed">
                    No se han registrado hábitos alimentarios. Registra las conductas alimentarias del paciente.
                </p>
                <Boton variante="primary" tamano="sm" onClick={onRegistrar} disabled={bloqueada}>
                    <Plus size={13} strokeWidth={1.8} /> Registrar hábitos
                </Boton>
            </div>
        );
    }

    const frecuencias: [string, string][] = [
        ['consumo_azucar', 'Azúcar'],
        ['consumo_ultraprocesados', 'Ultraprocesados'],
        ['consumo_frituras', 'Frituras'],
        ['consumo_bebidas_azucaradas', 'Bebidas azucaradas'],
        ['frecuencia_frutas_verduras', 'Frutas y verduras'],
    ];

    const conductas: [string, string][] = [
        ['horarios_regulares', 'Horarios regulares'],
        ['consume_desayuno', 'Desayuna'],
        ['cena_tardia', 'Cena tarde'],
        ['ansiedad_por_comida', 'Ansiedad por comida'],
        ['hambre_nocturna', 'Hambre nocturna'],
    ];

    return (
        <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange/15">
                        <UtensilsCrossed size={15} strokeWidth={1.8} className="text-brand-orange" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Hábitos alimentarios</h3>
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Frecuencia y conductas alimentarias</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Boton variante="primary" tamano="xs" onClick={onRegistrar}>
                        <Plus size={11} strokeWidth={1.8} /> Nuevo
                    </Boton>
                    {idPaciente && (
                        <Link href={`/nutricionista/pacientes/${idPaciente}/perfil-nutricional/habitos/historial`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[0.03] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.04] dark:hover:text-ink-dark">
                            <History size={11} strokeWidth={1.8} /> Historial
                        </Link>
                    )}
                    <button onClick={onEditar} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green-soft dark:text-brand-green dark:hover:bg-brand-green-dark/15">
                        <Edit size={11} strokeWidth={1.8} /> Editar
                    </button>
                </div>
            </div>

            {/* Datos generales */}
            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03] flex items-center gap-2">
                    <Coffee size={13} className="text-brand-orange shrink-0" />
                    <div>
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Comidas/día</p>
                        <p className="text-[13px] font-bold text-ink dark:text-ink-dark">{registro.comidas_por_dia ?? '—'}</p>
                    </div>
                </div>
                <div className="rounded-lg bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03] flex items-center gap-2">
                    <Droplets size={13} className="text-category-others shrink-0" />
                    <div>
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Agua</p>
                        <p className="text-[13px] font-bold text-ink dark:text-ink-dark">{registro.consumo_agua_litros ?? '—'} L</p>
                    </div>
                </div>
            </div>

            {/* Frecuencias de consumo */}
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">Frecuencia de consumo</p>
                <div className="space-y-1.5">
                    {frecuencias.map(([key, label]) => {
                        const valor = String(registro[key] ?? 'nunca');
                        return (
                            <div key={key} className="flex items-center justify-between rounded-lg bg-black/[0.015] px-3 py-1.5 dark:bg-white/[0.02]">
                                <span className="text-[11px] text-ink dark:text-ink-dark">{label}</span>
                                <span className={clsx('text-[10.5px] font-semibold capitalize', FRECUENCIA_COLOR[valor] ?? 'text-ink-muted')}>
                                    {FRECUENCIA_LABEL[valor] ?? valor}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Conductas (checkmarks) */}
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">Conductas alimentarias</p>
                <div className="flex flex-wrap gap-1.5">
                    {conductas.map(([key, label]) => {
                        const activo = Boolean(registro[key]);
                        return (
                            <span key={key} className={clsx(
                                'pill text-[9.5px]',
                                activo
                                    ? key === 'horarios_regulares' || key === 'consume_desayuno'
                                        ? 'bg-brand-green/15 text-brand-green-dark dark:bg-brand-green/20 dark:text-brand-green'
                                        : 'bg-brand-orange/15 text-brand-orange'
                                    : 'bg-black/[0.03] text-ink-muted/50 dark:bg-white/[0.04] dark:text-ink-muted-dark/50'
                            )}>
                                {activo ? '✓' : '✗'} {label}
                            </span>
                        );
                    })}
                </div>
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
