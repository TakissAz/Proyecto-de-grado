import {
    UtensilsCrossed,
    Plus,
    Edit,
    History,
    Coffee,
    Droplets,
    Apple,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Flame,
    Candy,
    Wine,
    Sandwich,
    Moon,
    Clock,
    BrainCircuit,
    Zap,
    TrendingUp,
    ShieldCheck,
    ShieldAlert,
} from 'lucide-react';
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

/* ── Mapeos ──────────────────────────────────────────────────── */
const NIVEL: Record<string, number> = { nunca: 0, ocasional: 1, frecuente: 2, diario: 3 };
const LABEL: Record<string, string> = { nunca: 'Nunca', ocasional: 'Ocasional', frecuente: 'Frecuente', diario: 'Diario' };


/**
 * Colores de los segmentos según posición absoluta del nivel (0‥3).
 * Para campos de riesgo: verde→amarillo→naranja→rojo
 * Para campos positivos (invertido): rojo→amarillo→verde→verde‑oscuro
 */
const SEGMENTO_COLORES_RIESGO = [
    'bg-brand-green',       // 0 Nunca     → verde
    'bg-category-others',   // 1 Ocasional → amarillo
    'bg-brand-orange',      // 2 Frecuente → naranja
    'bg-category-fruits',   // 3 Diario    → rojo
] as const;

const SEGMENTO_COLORES_POSITIVO = [
    'bg-category-fruits',   // 0 Nunca     → rojo
    'bg-category-others',   // 1 Ocasional → amarillo
    'bg-brand-green',       // 2 Frecuente → verde
    'bg-brand-green',       // 3 Diario    → verde (más brillante vía opacity)
] as const;

const SEGMENTO_TEXTO_RIESGO = [
    'text-brand-green-dark dark:text-brand-green',
    'text-category-others',
    'text-brand-orange',
    'text-category-fruits',
] as const;

const SEGMENTO_TEXTO_POSITIVO = [
    'text-category-fruits',
    'text-category-others',
    'text-brand-green-dark dark:text-brand-green',
    'text-brand-green-dark dark:text-brand-green',
] as const;

/* ── Subcomponente: barra de frecuencia por segmentos ───────── */
function FilaFrecuencia({
    icono: Icono,
    label,
    valor,
    invertido = false,
}: {
    icono: React.ElementType;
    label: string;
    valor: string;
    invertido?: boolean;
}) {
    const nivel = NIVEL[valor] ?? 0;
    const coloresSegmento = invertido ? SEGMENTO_COLORES_POSITIVO : SEGMENTO_COLORES_RIESGO;
    const colorTexto = invertido ? SEGMENTO_TEXTO_POSITIVO[nivel] : SEGMENTO_TEXTO_RIESGO[nivel];
    const colorIcono = colorTexto;

    // Color del icono / dot según nivel activo
    const dotBg = coloresSegmento[nivel];

    return (
        <div className="flex items-center gap-2.5">
            {/* Icono */}
            <div className={clsx('flex h-6 w-6 shrink-0 items-center justify-center rounded-lg', dotBg + '/15')}>
                <Icono size={12} strokeWidth={1.8} className={colorIcono} />
            </div>

            {/* Label */}
            <span className="w-[110px] shrink-0 text-[10.5px] font-medium text-ink dark:text-ink-dark leading-tight">
                {label}
            </span>

            {/* Segmentos: 4 bloques fijos, el activo y los anteriores se iluminan */}
            <div className="flex flex-1 items-center gap-1">
                {([0, 1, 2, 3] as const).map(i => {
                    const activo = i <= nivel;
                    const esteColor = coloresSegmento[nivel]; // todos los activos toman el color del nivel actual
                    return (
                        <div
                            key={i}
                            className={clsx(
                                'h-2 flex-1 rounded-sm transition-all duration-300',
                                activo
                                    ? esteColor
                                    : 'bg-black/[0.06] dark:bg-white/[0.07]',
                            )}
                        />
                    );
                })}
            </div>

            {/* Etiqueta nivel */}
            <span className={clsx('w-[62px] shrink-0 text-right text-[9.5px] font-bold', colorTexto)}>
                {LABEL[valor] ?? valor}
            </span>
        </div>
    );
}

/* ── Subcomponente: chip de conducta ────────────────────────── */
function ChipConducta({
    icono: Icono,
    label,
    activo,
    esPositivo,
}: {
    icono: React.ElementType;
    label: string;
    activo: boolean;
    esPositivo: boolean;
}) {
    const positiveState = esPositivo ? activo : !activo;

    return (
        <div
            className={clsx(
                'flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5',
                positiveState
                    ? 'border-brand-green/25 bg-brand-green/[0.07] dark:bg-brand-green/[0.05]'
                    : 'border-brand-orange/25 bg-brand-orange/[0.07] dark:bg-brand-orange/[0.05]',
            )}
        >
            <Icono
                size={11}
                strokeWidth={1.8}
                className={positiveState ? 'text-brand-green-dark dark:text-brand-green' : 'text-brand-orange'}
            />
            <span
                className={clsx(
                    'text-[10px] font-semibold leading-tight',
                    positiveState ? 'text-brand-green-dark dark:text-brand-green' : 'text-brand-orange',
                )}
            >
                {label}
            </span>
            {positiveState
                ? <CheckCircle2 size={10} strokeWidth={2} className="text-brand-green-dark dark:text-brand-green ml-0.5" />
                : <XCircle size={10} strokeWidth={2} className="text-brand-orange ml-0.5" />}
        </div>
    );
}

/* ── Subcomponente: score circular SVG ──────────────────────── */
function ScoreCircular({ valor }: { valor: number }) {
    const pct = valor / 100;
    const r = 24;
    const circunferencia = 2 * Math.PI * r;
    const offset = circunferencia * (1 - pct);

    const color = pct > 0.7 ? '#22c55e' : pct > 0.4 ? '#f59e0b' : '#f97316';
    const labelPct = Math.round(valor);

    return (
        <div className="relative flex h-[62px] w-[62px] items-center justify-center">
            <svg width="60" height="60" viewBox="0 0 60 60" className="-rotate-90">
                <circle cx="30" cy="30" r={r} fill="none" strokeWidth="5" className="stroke-black/[0.07] dark:stroke-white/[0.07]" />
                <circle
                    cx="30" cy="30" r={r}
                    fill="none"
                    strokeWidth="5"
                    stroke={color}
                    strokeLinecap="round"
                    strokeDasharray={circunferencia}
                    strokeDashoffset={offset}
                    className="transition-all duration-700"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[13px] font-black text-ink dark:text-ink-dark" style={{ color }}>{labelPct}</span>
                <span className="text-[6.5px] font-semibold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">de 100</span>
            </div>
        </div>
    );
}

/* ── Componente principal ────────────────────────────────────── */
export default function TarjetaHabitos({ registro, onRegistrar, onEditar, bloqueada, idPaciente }: Props) {

    /* ── Estado vacío ── */
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

    /* ── Cálculo del score ── */
    const camposRiesgo = ['consumo_azucar', 'consumo_ultraprocesados', 'consumo_frituras', 'consumo_bebidas_azucaradas'];
    const puntuacionRiesgo = camposRiesgo.reduce((s, k) => s + (NIVEL[String(registro[k] ?? 'nunca')] ?? 0), 0);
    const maxPuntuacion = camposRiesgo.length * 3; // 12
    // Alertas activas (hábitos de riesgo presentes)
    const alertas: string[] = [];
    if (registro.cena_tardia) alertas.push('Cena tardía habitual');
    if (registro.ansiedad_por_comida) alertas.push('Ansiedad por comida');
    if (registro.hambre_nocturna) alertas.push('Hambre nocturna');
    if (!registro.consume_desayuno) alertas.push('Omite el desayuno');
    if (!registro.horarios_regulares) alertas.push('Horarios irregulares');
    if ((NIVEL[String(registro.consumo_azucar)] ?? 0) >= 2) alertas.push('Alto consumo de azúcar');
    if ((NIVEL[String(registro.consumo_ultraprocesados)] ?? 0) >= 2) alertas.push('Alto consumo de ultraprocesados');
    if ((NIVEL[String(registro.consumo_frituras)] ?? 0) >= 2) alertas.push('Alto consumo de frituras');
    if ((NIVEL[String(registro.consumo_bebidas_azucaradas)] ?? 0) >= 2) alertas.push('Bebidas azucaradas frecuentes');

    const indiceHabitos = Math.max(0, Math.round(100 - (puntuacionRiesgo / maxPuntuacion) * 65 - Math.min(alertas.length, 5) * 7));
    const nivelRiesgo = indiceHabitos >= 80 ? 'Favorable' : indiceHabitos >= 55 ? 'Por mejorar' : 'Atención prioritaria';
    const saludable = indiceHabitos >= 80;
    const comidasRegistradas = registro.comidas_por_dia !== null && registro.comidas_por_dia !== undefined && registro.comidas_por_dia !== '';
    const aguaRegistrada = registro.consumo_agua_litros !== null && registro.consumo_agua_litros !== undefined && registro.consumo_agua_litros !== '';

    return (
        <div className="p-5 space-y-4">

            {/* ══ HEADER ══════════════════════════════════════ */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                    <div className={clsx('flex h-8 w-8 items-center justify-center rounded-xl', saludable ? 'bg-brand-green/15' : 'bg-brand-orange/15')}>
                        <UtensilsCrossed size={15} strokeWidth={1.8} className={saludable ? 'text-brand-green-dark dark:text-brand-green' : 'text-brand-orange'} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Hábitos alimentarios</h3>
                            <Badge color={saludable ? 'green' : 'orange'}>
                                {saludable ? 'Saludables' : 'Atención requerida'}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Boton variante="primary" tamano="xs" onClick={onRegistrar}>
                        <Plus size={11} strokeWidth={1.8} /> Nuevo
                    </Boton>
                    {idPaciente && (
                        <Link
                            href={`/nutricionista/pacientes/${idPaciente}/perfil-nutricional/habitos/historial`}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[0.03] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.04] dark:hover:text-ink-dark"
                        >
                            <History size={11} strokeWidth={1.8} /> Historial
                        </Link>
                    )}
                    <button
                        onClick={onEditar}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green-soft dark:text-brand-green dark:hover:bg-brand-green-dark/15"
                    >
                        <Edit size={11} strokeWidth={1.8} /> Editar
                    </button>
                </div>
            </div>

            {/* ══ FILA SUPERIOR: score + métricas vitales ══════ */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                {/* Score circular */}
                <div className={clsx(
                    'flex min-h-[128px] flex-col items-center justify-center rounded-2xl border px-4 py-3',
                    saludable
                        ? 'border-brand-green/20 bg-brand-green/[0.05] dark:bg-brand-green/[0.04]'
                        : 'border-brand-orange/20 bg-brand-orange/[0.05] dark:bg-brand-orange/[0.04]',
                )}>
                    <ScoreCircular valor={indiceHabitos} />
                    <span className="mt-1 text-[9px] font-bold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark text-center">
                        Índice de hábitos
                    </span>
                    <span className={clsx(
                        'mt-0.5 text-[9px] font-black uppercase',
                        nivelRiesgo === 'Favorable' ? 'text-brand-green-dark dark:text-brand-green'
                            : nivelRiesgo === 'Por mejorar' ? 'text-category-others'
                                : 'text-brand-orange',
                    )}>
                        {nivelRiesgo}
                    </span>
                </div>

                {/* Comidas por día */}
                <div className="flex min-h-[128px] flex-col justify-center gap-1 rounded-2xl border border-surface-border bg-black/[0.02] px-4 py-3 dark:border-surface-border-dark dark:bg-white/[0.03]">
                    <div className="flex items-center gap-1.5">
                        <Coffee size={13} strokeWidth={1.8} className="text-brand-orange" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Comidas/día</span>
                    </div>
                    <p className="text-[22px] font-black leading-none text-ink dark:text-ink-dark">
                        {comidasRegistradas ? registro.comidas_por_dia : '—'}
                    </p>
                    <p className="text-[9px] text-ink-muted dark:text-ink-muted-dark">
                        {!comidasRegistradas ? 'Sin registrar' : Number(registro.comidas_por_dia) >= 4 ? 'Distribución adecuada' : Number(registro.comidas_por_dia) >= 3 ? 'Distribución aceptable' : 'Frecuencia baja'}
                    </p>
                </div>

                {/* Agua diaria */}
                <div className="flex min-h-[128px] flex-col justify-center gap-1 rounded-2xl border border-surface-border bg-black/[0.02] px-4 py-3 dark:border-surface-border-dark dark:bg-white/[0.03]">
                    <div className="flex items-center gap-1.5">
                        <Droplets size={13} strokeWidth={1.8} className="text-info" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Agua/día</span>
                    </div>
                    <p className="text-[22px] font-black leading-none text-ink dark:text-ink-dark">
                        {aguaRegistrada ? registro.consumo_agua_litros : '—'}
                        {aguaRegistrada && <span className="text-[12px] font-semibold text-ink-muted dark:text-ink-muted-dark ml-0.5">L</span>}
                    </p>
                    <p className="text-[9px] text-ink-muted dark:text-ink-muted-dark">
                        {!aguaRegistrada ? 'Sin registrar' : Number(registro.consumo_agua_litros) >= 2 ? 'Hidratación adecuada' : Number(registro.consumo_agua_litros) >= 1.5 ? 'Puede mejorar' : 'Consumo bajo'}
                    </p>
                </div>
            </div>

            {/* ══ ALERTAS DE RIESGO (si hay) ════════════════════ */}
            {alertas.length > 0 && (
                <div className={clsx(
                    'rounded-2xl border p-3',
                    alertas.length > 3
                        ? 'border-category-fruits/30 bg-category-fruits/[0.06] dark:bg-category-fruits/[0.05]'
                        : 'border-brand-orange/25 bg-brand-orange/[0.06] dark:bg-brand-orange/[0.05]',
                )}>
                    <div className="flex items-center gap-1.5 mb-2">
                        <ShieldAlert
                            size={12}
                            strokeWidth={2}
                            className={alertas.length > 3 ? 'text-category-fruits' : 'text-brand-orange'}
                        />
                        <span className={clsx(
                            'text-[9.5px] font-bold uppercase tracking-wider',
                            alertas.length > 3 ? 'text-category-fruits' : 'text-brand-orange',
                        )}>
                            {alertas.length} hábito{alertas.length !== 1 ? 's' : ''} de riesgo detectado{alertas.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {alertas.map(a => (
                            <span key={a} className={clsx(
                                'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9.5px] font-semibold border',
                                alertas.length > 3
                                    ? 'border-category-fruits/30 bg-category-fruits/10 text-category-fruits'
                                    : 'border-brand-orange/30 bg-brand-orange/10 text-brand-orange',
                            )}>
                                <AlertTriangle size={8} strokeWidth={2} /> {a}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {alertas.length === 0 && (
                <div className="rounded-2xl border border-brand-green/25 bg-brand-green/[0.05] dark:bg-brand-green/[0.04] p-3 flex items-center gap-2">
                    <ShieldCheck size={13} strokeWidth={2} className="text-brand-green-dark dark:text-brand-green shrink-0" />
                    <span className="text-[10.5px] font-semibold text-brand-green-dark dark:text-brand-green">
                        Sin hábitos de riesgo detectados — perfil alimentario saludable
                    </span>
                </div>
            )}

            {/* ══ FRECUENCIAS DE CONSUMO ═══════════════════════ */}
            <div className="rounded-2xl border border-surface-border bg-black/[0.015] dark:border-surface-border-dark dark:bg-white/[0.015] overflow-hidden">
                <div className="px-3.5 pt-3 pb-2 border-b border-surface-border dark:border-surface-border-dark flex items-center gap-1.5">
                    <TrendingUp size={11} strokeWidth={2} className="text-brand-orange" />
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                        Frecuencia de consumo
                    </span>
                </div>
                <div className="p-3.5 space-y-2.5">
                    <FilaFrecuencia icono={Candy} label="Azúcar" valor={String(registro.consumo_azucar ?? 'nunca')} />
                    <FilaFrecuencia icono={Sandwich} label="Ultraprocesados" valor={String(registro.consumo_ultraprocesados ?? 'nunca')} />
                    <FilaFrecuencia icono={Flame} label="Frituras" valor={String(registro.consumo_frituras ?? 'nunca')} />
                    <FilaFrecuencia icono={Wine} label="Beb. azucaradas" valor={String(registro.consumo_bebidas_azucaradas ?? 'nunca')} />
                    {/* Separador visual */}
                    <div className="h-px bg-surface-border dark:bg-surface-border-dark mx-1" />
                    <FilaFrecuencia icono={Apple} label="Frutas y verduras" valor={String(registro.frecuencia_frutas_verduras ?? 'nunca')} invertido />
                </div>
            </div>

            {/* ══ CONDUCTAS ALIMENTARIAS ═══════════════════════ */}
            <div className="rounded-2xl border border-surface-border bg-black/[0.015] dark:border-surface-border-dark dark:bg-white/[0.015] overflow-hidden">
                <div className="px-3.5 pt-3 pb-2 border-b border-surface-border dark:border-surface-border-dark flex items-center gap-1.5">
                    <Zap size={11} strokeWidth={2} className="text-brand-green-dark dark:text-brand-green" />
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                        Conductas alimentarias
                    </span>
                </div>
                <div className="p-3 flex flex-wrap gap-1.5">
                    <ChipConducta icono={Clock} label="Horarios regulares" activo={Boolean(registro.horarios_regulares)} esPositivo />
                    <ChipConducta icono={Coffee} label="Desayuna" activo={Boolean(registro.consume_desayuno)} esPositivo />
                    <ChipConducta icono={Moon} label="Cena tardía" activo={Boolean(registro.cena_tardia)} esPositivo={false} />
                    <ChipConducta icono={BrainCircuit} label="Ansiedad por comida" activo={Boolean(registro.ansiedad_por_comida)} esPositivo={false} />
                    <ChipConducta icono={Moon} label="Hambre nocturna" activo={Boolean(registro.hambre_nocturna)} esPositivo={false} />
                </div>
            </div>

            {/* ══ OBSERVACIONES ════════════════════════════════ */}
            {registro.observaciones && (
                <div className="rounded-xl border border-surface-border px-4 py-3 dark:border-surface-border-dark">
                    <p className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1.5">Observaciones</p>
                    <p className="text-[11.5px] text-ink dark:text-ink-dark leading-relaxed">{String(registro.observaciones)}</p>
                </div>
            )}
        </div>
    );
}
