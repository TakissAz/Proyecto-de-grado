import { UtensilsCrossed, Plus, Edit, History, Coffee, Droplets, Apple, AlertTriangle } from 'lucide-react';
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

const FRECUENCIA_NIVEL: Record<string, number> = { nunca: 0, ocasional: 1, frecuente: 2, diario: 3 };
const FRECUENCIA_LABEL: Record<string, string> = { nunca: 'Nunca', ocasional: 'Ocasional', frecuente: 'Frecuente', diario: 'Diario' };
const FRECUENCIA_COLOR: Record<string, string> = {
    nunca: 'bg-brand-green',
    ocasional: 'bg-category-others',
    frecuente: 'bg-brand-orange',
    diario: 'bg-category-fruits',
};
const FRECUENCIA_TEXT_COLOR: Record<string, string> = {
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

    const frecuencias: { key: string; label: string; icono: typeof Apple; invertido?: boolean }[] = [
        { key: 'consumo_azucar', label: 'Azúcar', icono: AlertTriangle },
        { key: 'consumo_ultraprocesados', label: 'Ultraprocesados', icono: AlertTriangle },
        { key: 'consumo_frituras', label: 'Frituras', icono: AlertTriangle },
        { key: 'consumo_bebidas_azucaradas', label: 'Bebidas azucaradas', icono: AlertTriangle },
        { key: 'frecuencia_frutas_verduras', label: 'Frutas y verduras', icono: Apple, invertido: true },
    ];

    const conductas: { key: string; label: string; bueno: boolean }[] = [
        { key: 'horarios_regulares', label: 'Horarios regulares', bueno: true },
        { key: 'consume_desayuno', label: 'Desayuna', bueno: true },
        { key: 'cena_tardia', label: 'Cena tardía', bueno: false },
        { key: 'ansiedad_por_comida', label: 'Ansiedad por comida', bueno: false },
        { key: 'hambre_nocturna', label: 'Hambre nocturna', bueno: false },
    ];

    // Calcular un "score" de hábitos saludables
    const habitosNegativos = ['consumo_azucar', 'consumo_ultraprocesados', 'consumo_frituras', 'consumo_bebidas_azucaradas'];
    const puntuacion = habitosNegativos.reduce((sum, key) => sum + (FRECUENCIA_NIVEL[String(registro[key] ?? 'nunca')] ?? 0), 0);
    const maxPuntuacion = habitosNegativos.length * 3;
    const saludable = puntuacion <= maxPuntuacion * 0.3;

    return (
        <div className="p-5 space-y-4">

            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                    <div className={clsx('flex h-8 w-8 items-center justify-center rounded-xl', saludable ? 'bg-brand-green/15' : 'bg-brand-orange/15')}>
                        <UtensilsCrossed size={15} strokeWidth={1.8} className={saludable ? 'text-brand-green-dark dark:text-brand-green' : 'text-brand-orange'} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Hábitos alimentarios</h3>
                            <Badge color={saludable ? 'green' : 'orange'}>{saludable ? 'Saludables' : 'Atención requerida'}</Badge>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Boton variante="primary" tamano="xs" onClick={onRegistrar}>
                        <Plus size={11} strokeWidth={1.8} /> Nuevo
                    </Boton>
                    {idPaciente && (
                        <Link href={`/nutricionista/pacientes/${idPaciente}/perfil-nutricional/habitos/historial`}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[0.03] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.04] dark:hover:text-ink-dark">
                            <History size={11} strokeWidth={1.8} /> Historial
                        </Link>
                    )}
                    <button onClick={onEditar} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green-soft dark:text-brand-green dark:hover:bg-brand-green-dark/15">
                        <Edit size={11} strokeWidth={1.8} /> Editar
                    </button>
                </div>
            </div>

            {/* ── Datos rápidos ── */}
            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-surface-border bg-black/[0.02] px-3 py-2.5 dark:border-surface-border-dark dark:bg-white/[0.03] flex items-center gap-2.5">
                    <Coffee size={14} strokeWidth={1.8} className="text-brand-orange shrink-0" />
                    <div>
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Comidas/día</p>
                        <p className="text-[14px] font-bold text-ink dark:text-ink-dark">{registro.comidas_por_dia ?? '—'}</p>
                    </div>
                </div>
                <div className="rounded-xl border border-surface-border bg-black/[0.02] px-3 py-2.5 dark:border-surface-border-dark dark:bg-white/[0.03] flex items-center gap-2.5">
                    <Droplets size={14} strokeWidth={1.8} className="text-info shrink-0" />
                    <div>
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Agua diaria</p>
                        <p className="text-[14px] font-bold text-ink dark:text-ink-dark">{registro.consumo_agua_litros ?? '—'} L</p>
                    </div>
                </div>
            </div>

            {/* ── Frecuencias de consumo con barras ── */}
            <div>
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">
                    <AlertTriangle size={10} strokeWidth={2} className="text-brand-orange" />
                    Frecuencia de consumo
                </p>
                <div className="space-y-2">
                    {frecuencias.map(({ key, label, invertido }) => {
                        const valor = String(registro[key] ?? 'nunca');
                        const nivel = FRECUENCIA_NIVEL[valor] ?? 0;
                        const pct = (nivel / 3) * 100;
                        const barColor = invertido
                            ? (nivel >= 2 ? 'bg-brand-green' : nivel === 1 ? 'bg-brand-orange' : 'bg-category-fruits')
                            : (FRECUENCIA_COLOR[valor] ?? 'bg-brand-green');

                        return (
                            <div key={key} className="flex items-center gap-3">
                                <span className="text-[10.5px] text-ink dark:text-ink-dark w-[130px] shrink-0">{label}</span>
                                <div className="flex-1 h-2 rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                                    <div className={clsx('h-full rounded-full transition-all', barColor)} style={{ width: `${pct}%` }} />
                                </div>
                                <span className={clsx('text-[10px] font-semibold w-[65px] text-right', FRECUENCIA_TEXT_COLOR[valor] ?? 'text-ink-muted')}>
                                    {FRECUENCIA_LABEL[valor] ?? valor}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Conductas alimentarias ── */}
            <div>
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">
                    <Apple size={10} strokeWidth={2} className="text-brand-green-dark dark:text-brand-green" />
                    Conductas alimentarias
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {conductas.map(({ key, label, bueno }) => {
                        const activo = Boolean(registro[key]);
                        const esPositivo = bueno ? activo : !activo;
                        return (
                            <span
                                key={key}
                                className={clsx(
                                    'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-semibold border',
                                    esPositivo
                                        ? 'border-brand-green/25 bg-brand-green/8 text-brand-green-dark dark:text-brand-green'
                                        : 'border-brand-orange/25 bg-brand-orange/8 text-brand-orange',
                                )}
                            >
                                {esPositivo ? '✓' : '!'} {label}
                            </span>
                        );
                    })}
                </div>
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
