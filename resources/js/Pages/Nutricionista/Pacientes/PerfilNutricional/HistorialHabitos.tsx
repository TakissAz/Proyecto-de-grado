import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    UtensilsCrossed,
    ArrowLeft,
    Calendar,
    Download,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Coffee,
    Droplets,
    Apple,
    Candy,
    Sandwich,
    Flame,
    Wine,
    Moon,
    BrainCircuit,
} from 'lucide-react';
import AvatarPaciente from '@/Components/ui/avatar-paciente';
import clsx from 'clsx';
import { useMemo, useState } from 'react';

/* ─── Tipos ─────────────────────────────────────────────────── */
type Reg = Record<string, unknown>;
interface Paciente {
    id_paciente: number;
    nombres: string;
    apellido_paterno: string;
    apellido_materno?: string | null;
    ci: string;
    user?: { avatar_url?: string | null } | null;
}

/* ─── Mapeos de campos ───────────────────────────────────────── */
const NIVEL: Record<string, number> = { nunca: 0, ocasional: 1, frecuente: 2, diario: 3 };
const NIVEL_LABEL: Record<string, string> = { nunca: 'Nunca', ocasional: 'Ocasional', frecuente: 'Frecuente', diario: 'Diario' };

// Campos de frecuencia (mayor nivel = más riesgo)
const CAMPOS_FRECUENCIA: { key: string; label: string; icono: React.ElementType; invertido?: boolean }[] = [
    { key: 'consumo_azucar', label: 'Azúcar', icono: Candy },
    { key: 'consumo_ultraprocesados', label: 'Ultraprocesados', icono: Sandwich },
    { key: 'consumo_frituras', label: 'Frituras', icono: Flame },
    { key: 'consumo_bebidas_azucaradas', label: 'Bebidas azucaradas', icono: Wine },
    { key: 'frecuencia_frutas_verduras', label: 'Frutas y verduras', icono: Apple, invertido: true },
];

// Campos booleanos (true = bueno vs. true = malo)
const CAMPOS_CONDUCTA: { key: string; label: string; icono: React.ElementType; bueno: boolean }[] = [
    { key: 'horarios_regulares', label: 'Horarios regulares', icono: Clock, bueno: true },
    { key: 'consume_desayuno', label: 'Desayuna', icono: Coffee, bueno: true },
    { key: 'cena_tardia', label: 'Cena tardía', icono: Moon, bueno: false },
    { key: 'ansiedad_por_comida', label: 'Ansiedad por comida', icono: BrainCircuit, bueno: false },
    { key: 'hambre_nocturna', label: 'Hambre nocturna', icono: Moon, bueno: false },
];

/* ─── Índice de hábitos ──────────────────────────────────────── */
const FRECUENCIAS_RIESGO = ['consumo_azucar', 'consumo_ultraprocesados', 'consumo_frituras', 'consumo_bebidas_azucaradas'];
function calcularIndice(r: Reg): number {
    const puntos = FRECUENCIAS_RIESGO.reduce((s, k) => s + (NIVEL[String(r[k] ?? 'nunca')] ?? 0), 0);
    const alertas = [r.cena_tardia, r.ansiedad_por_comida, r.hambre_nocturna, !r.consume_desayuno, !r.horarios_regulares].filter(Boolean).length;
    return Math.max(0, Math.round(100 - (puntos / 12) * 65 - Math.min(alertas, 5) * 7));
}

/* ─── Helpers ────────────────────────────────────────────────── */
function formatearFecha(valor: unknown): string {
    const [a, m, d] = String(valor ?? '').slice(0, 10).split('-');
    return a && m && d ? `${d}/${m}/${a}` : '—';
}
function etiquetaBool(v: unknown) {
    if (v === true || v === 1 || v === '1') return 'Sí';
    if (v === false || v === 0 || v === '0') return 'No';
    return '—';
}
function etiqueta(v: unknown): string {
    if (v === null || v === undefined || v === '') return '—';
    if (v === true) return 'Sí';
    if (v === false) return 'No';
    const s = String(v);
    return NIVEL_LABEL[s] ?? s.replaceAll('_', ' ');
}

/* ─── Subcomponente: segmentos de frecuencia (solo lectura) ─── */
const SEG_COLOR_RIESGO = ['bg-brand-green', 'bg-category-others', 'bg-brand-orange', 'bg-category-fruits'] as const;
const SEG_COLOR_POSITIVO = ['bg-category-fruits', 'bg-category-others', 'bg-brand-green', 'bg-brand-green'] as const;
const SEG_TEXT_RIESGO = [
    'text-brand-green-dark dark:text-brand-green',
    'text-category-others',
    'text-brand-orange',
    'text-category-fruits',
] as const;
const SEG_TEXT_POSITIVO = [
    'text-category-fruits',
    'text-category-others',
    'text-brand-green-dark dark:text-brand-green',
    'text-brand-green-dark dark:text-brand-green',
] as const;

function BarraFrecuencia({ valor, invertido = false }: { valor: string; invertido?: boolean }) {
    const nivel = NIVEL[valor] ?? 0;
    const colores = invertido ? SEG_COLOR_POSITIVO : SEG_COLOR_RIESGO;
    const textos = invertido ? SEG_TEXT_POSITIVO : SEG_TEXT_RIESGO;
    return (
        <div className="flex items-center gap-1.5">
            <div className="flex gap-[3px] flex-1">
                {([0, 1, 2, 3] as const).map(i => (
                    <div
                        key={i}
                        className={clsx(
                            'h-1.5 flex-1 rounded-sm transition-all',
                            i <= nivel ? colores[nivel] : 'bg-black/[0.06] dark:bg-white/[0.07]',
                        )}
                    />
                ))}
            </div>
            <span className={clsx('text-[9.5px] font-bold w-[58px] text-right shrink-0', textos[nivel])}>
                {NIVEL_LABEL[valor] ?? valor}
            </span>
        </div>
    );
}

/* ─── Subcomponente: chip de conducta (solo lectura) ──────────── */
function ChipConducta({ activo, esPositivo, label }: { activo: boolean; esPositivo: boolean; label: string }) {
    const ok = esPositivo ? activo : !activo;
    return (
        <span className={clsx(
            'inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[9.5px] font-semibold',
            ok
                ? 'border-brand-green/25 bg-brand-green/[0.07] text-brand-green-dark dark:text-brand-green'
                : 'border-brand-orange/25 bg-brand-orange/[0.07] text-brand-orange',
        )}>
            {ok
                ? <CheckCircle2 size={9} strokeWidth={2} />
                : <AlertTriangle size={9} strokeWidth={2} />}
            {label}
        </span>
    );
}

/* ─── Subcomponente: diferencia entre dos registros ────────────
   Muestra qué cambió de un registro al siguiente.
 ─────────────────────────────────────────────────────────────── */
function PanelCambios({ anterior, actual }: { anterior: Reg; actual: Reg }) {
    const cambios: { label: string; icono: React.ElementType; antes: string; despues: string; tipo: 'mejora' | 'empeora' | 'neutro' }[] = [];

    // Comidas / agua
    const comAntes = Number(anterior.comidas_por_dia), comAhora = Number(actual.comidas_por_dia);
    if (!isNaN(comAntes) && !isNaN(comAhora) && comAntes !== comAhora)
        cambios.push({ label: 'Comidas/día', icono: Coffee, antes: String(comAntes), despues: String(comAhora), tipo: comAhora >= comAntes ? 'mejora' : 'empeora' });

    const aguaAntes = Number(anterior.consumo_agua_litros), aguaAhora = Number(actual.consumo_agua_litros);
    if (!isNaN(aguaAntes) && !isNaN(aguaAhora) && Math.abs(aguaAntes - aguaAhora) >= 0.1)
        cambios.push({ label: 'Agua (L)', icono: Droplets, antes: String(aguaAntes), despues: String(aguaAhora), tipo: aguaAhora >= aguaAntes ? 'mejora' : 'empeora' });

    // Frecuencias
    for (const { key, label, icono, invertido } of CAMPOS_FRECUENCIA) {
        const nvA = NIVEL[String(anterior[key] ?? 'nunca')] ?? 0;
        const nvB = NIVEL[String(actual[key] ?? 'nunca')] ?? 0;
        if (nvA !== nvB) {
            const mejora = invertido ? nvB > nvA : nvB < nvA;
            cambios.push({
                label,
                icono,
                antes: NIVEL_LABEL[String(anterior[key])] ?? '—',
                despues: NIVEL_LABEL[String(actual[key])] ?? '—',
                tipo: mejora ? 'mejora' : 'empeora',
            });
        }
    }

    // Conductas booleanas
    for (const { key, label, icono, bueno } of CAMPOS_CONDUCTA) {
        const valA = Boolean(anterior[key]);
        const valB = Boolean(actual[key]);
        if (valA !== valB) {
            const mejora = bueno ? valB && !valA : !valB && valA;
            cambios.push({
                label,
                icono,
                antes: etiquetaBool(anterior[key]),
                despues: etiquetaBool(actual[key]),
                tipo: mejora ? 'mejora' : 'empeora',
            });
        }
    }

    if (cambios.length === 0) {
        return (
            <div className="flex items-center gap-1.5 rounded-xl border border-surface-border bg-black/[0.01] dark:border-surface-border-dark dark:bg-white/[0.01] px-3 py-2">
                <Minus size={11} strokeWidth={2} className="text-ink-muted/50 dark:text-ink-muted-dark/50 shrink-0" />
                <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">Sin cambios respecto al registro anterior.</span>
            </div>
        );
    }

    const mejoras = cambios.filter(c => c.tipo === 'mejora');
    const empeoramientos = cambios.filter(c => c.tipo === 'empeora');

    return (
        <div className="space-y-2">
            {/* Resumen rápido */}
            <div className="flex flex-wrap gap-1.5">
                {mejoras.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-brand-green/25 bg-brand-green/[0.07] px-2 py-0.5 text-[9.5px] font-bold text-brand-green-dark dark:text-brand-green">
                        <ArrowUpRight size={10} strokeWidth={2} /> {mejoras.length} mejora{mejoras.length !== 1 ? 's' : ''}
                    </span>
                )}
                {empeoramientos.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-brand-orange/25 bg-brand-orange/[0.07] px-2 py-0.5 text-[9.5px] font-bold text-brand-orange">
                        <ArrowDownRight size={10} strokeWidth={2} /> {empeoramientos.length} retroceso{empeoramientos.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>
            {/* Detalle de cada cambio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {cambios.map(({ label, icono: Icono, antes, despues, tipo }) => (
                    <div
                        key={label}
                        className={clsx(
                            'flex items-center gap-2 rounded-xl border px-3 py-2',
                            tipo === 'mejora'
                                ? 'border-brand-green/20 bg-brand-green/[0.05] dark:bg-brand-green/[0.04]'
                                : 'border-brand-orange/20 bg-brand-orange/[0.05] dark:bg-brand-orange/[0.04]',
                        )}
                    >
                        <Icono
                            size={12}
                            strokeWidth={1.8}
                            className={tipo === 'mejora' ? 'text-brand-green-dark dark:text-brand-green shrink-0' : 'text-brand-orange shrink-0'}
                        />
                        <span className="flex-1 text-[10px] font-semibold text-ink dark:text-ink-dark">{label}</span>
                        <span className="text-[9.5px] text-ink-muted dark:text-ink-muted-dark line-through">{antes}</span>
                        <span className={clsx('text-[9.5px] font-bold', tipo === 'mejora' ? 'text-brand-green-dark dark:text-brand-green' : 'text-brand-orange')}>
                            → {despues}
                        </span>
                        {tipo === 'mejora'
                            ? <ArrowUpRight size={10} strokeWidth={2} className="text-brand-green-dark dark:text-brand-green shrink-0" />
                            : <ArrowDownRight size={10} strokeWidth={2} className="text-brand-orange shrink-0" />}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Subcomponente: campo fecha ─────────────────────────────── */
function CampoFecha({ label, value, min, onChange }: { label: string; value: string; min?: string; onChange: (v: string) => void }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-[8.5px] font-bold uppercase tracking-[0.12em] text-ink-muted dark:text-ink-muted-dark">{label}</span>
            <span className="relative block">
                <Calendar size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-green-dark dark:text-brand-green" />
                <input
                    type="date" value={value} min={min}
                    onChange={e => onChange(e.target.value)}
                    className="h-10 w-[150px] rounded-xl border border-surface-border bg-surface-card pl-9 pr-3 text-[10.5px] font-medium text-ink outline-none transition [color-scheme:light] hover:border-brand-green/40 focus:border-brand-green focus:ring-2 focus:ring-brand-green/10 dark:border-surface-border-dark dark:bg-surface-card-dark dark:text-ink-dark dark:[color-scheme:dark]"
                />
            </span>
        </label>
    );
}

/* ─── Página principal ───────────────────────────────────────── */
export default function HistorialHabitos({ paciente, registros }: { paciente: Paciente; registros: Reg[] }) {
    const nombre = [paciente.nombres, paciente.apellido_paterno, paciente.apellido_materno].filter(Boolean).join(' ');
    const id = paciente.id_paciente;

    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');

    const filtrados = useMemo(() => registros.filter(r => {
        const fecha = String(r.created_at ?? '').slice(0, 10);
        return (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
    }), [registros, desde, hasta]);

    // Ordenados del más antiguo al más reciente para los cambios
    const cronologico = useMemo(() => [...filtrados].reverse(), [filtrados]);

    const reporte = `/nutricionista/pacientes/${id}/perfil-nutricional/historial/habitos/reporte-pdf?${new URLSearchParams({ ...(desde ? { desde } : {}), ...(hasta ? { hasta } : {}) })}`;

    return (
        <AuthenticatedLayout title="Historial de hábitos">
            <Head title={`Historial de hábitos · ${nombre}`} />
            <div className="space-y-5">

                {/* ══ CABECERA ══════════════════════════════════════════ */}
                <div className="card-elevated overflow-hidden">
                    <div className="relative h-16 bg-gradient-to-r from-brand-orange/10 via-brand-orange/5 to-transparent dark:from-brand-orange/[0.06] dark:via-brand-orange/[0.03] dark:to-transparent">
                        <Link
                            href={`/nutricionista/pacientes/${id}/perfil-nutricional`}
                            className="absolute left-5 top-4 flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-ink backdrop-blur-sm transition-colors hover:bg-white dark:bg-black/40 dark:text-ink-dark dark:hover:bg-black/60"
                        >
                            <ArrowLeft size={12} strokeWidth={1.8} /> Perfil nutricional
                        </Link>
                    </div>
                    <div className="px-5 pb-4 -mt-5">
                        <div className="flex items-end gap-3">
                            <div className="rounded-full border-[3px] border-surface-card shadow-md dark:border-surface-card-dark">
                                <AvatarPaciente nombre={nombre} avatarUrl={paciente.user?.avatar_url} size="lg" />
                            </div>
                            <div className="flex-1 pb-0.5">
                                <h1 className="text-[16px] font-bold text-ink dark:text-ink-dark">{nombre}</h1>
                                <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">CI: {paciente.ci}</p>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-lg bg-brand-orange/10 px-3 py-1.5 dark:bg-brand-orange/[0.08]">
                                <UtensilsCrossed size={12} strokeWidth={1.8} className="text-brand-orange" />
                                <span className="text-[11px] font-semibold text-brand-orange">
                                    {filtrados.length} registro{filtrados.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-surface-border dark:border-surface-border-dark">
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                                Compara la evolución de conductas protectoras y hábitos que requieren intervención.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ══ FILTROS + DESCARGA ════════════════════════════════ */}
                <section className="card-elevated overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border bg-black/[0.015] px-5 py-4 dark:border-surface-border-dark dark:bg-white/[0.015]">
                        <div>
                            <p className="text-[12px] font-bold text-ink dark:text-ink-dark">Reporte del historial</p>
                            <p className="mt-0.5 text-[10px] text-ink-muted dark:text-ink-muted-dark">
                                Filtra por período para analizar la evolución y descargar el informe.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-end gap-2.5">
                            <CampoFecha label="Desde" value={desde} onChange={setDesde} />
                            <CampoFecha label="Hasta" value={hasta} min={desde || undefined} onChange={setHasta} />
                            <a
                                href={reporte} target="_blank" rel="noreferrer"
                                className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-green px-4 text-[10.5px] font-bold text-white shadow-sm shadow-brand-green/20 transition hover:-translate-y-0.5 hover:bg-brand-green-dark hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                            >
                                <Download size={14} /> Descargar PDF
                            </a>
                        </div>
                    </div>
                </section>

                {/* ══ REGISTROS ════════════════════════════════════════ */}
                {filtrados.length === 0 ? (
                    <div className="card-elevated flex flex-col items-center gap-2 px-5 py-14 text-center">
                        <UtensilsCrossed size={28} strokeWidth={1.2} className="text-ink-muted/30 dark:text-ink-muted-dark/30" />
                        <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark">No hay registros para el período seleccionado.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtrados.map((r, idx) => {
                            const numero = filtrados.length - idx;
                            const indice = calcularIndice(r);
                            // El anterior en el tiempo = siguiente índice en filtrados (que está de más reciente a más antiguo)
                            const anteriorEnTiempo = filtrados[idx + 1] ?? null;

                            return (
                                <div key={idx} className="card-elevated overflow-hidden">
                                    {/* ── Header del registro ── */}
                                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-border dark:border-surface-border-dark">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-orange/10 text-[9px] font-bold text-brand-orange">
                                                {numero}
                                            </div>
                                            <p className="text-[11.5px] font-semibold text-ink dark:text-ink-dark">
                                                Registro #{numero}
                                            </p>
                                            {/* Índice de hábitos */}
                                            <span className={clsx(
                                                'inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[9.5px] font-bold',
                                                indice >= 80
                                                    ? 'border-brand-green/25 bg-brand-green/[0.07] text-brand-green-dark dark:text-brand-green'
                                                    : indice >= 55
                                                        ? 'border-category-others/25 bg-category-others/[0.07] text-category-others'
                                                        : 'border-brand-orange/25 bg-brand-orange/[0.07] text-brand-orange',
                                            )}>
                                                {indice} pts · {indice >= 80 ? 'Favorable' : indice >= 55 ? 'Por mejorar' : 'Atención prioritaria'}
                                            </span>
                                        </div>
                                        <span className="flex items-center gap-1 text-[10px] text-ink-muted dark:text-ink-muted-dark">
                                            <Calendar size={10} strokeWidth={1.8} />
                                            {formatearFecha(r.created_at)}
                                        </span>
                                    </div>

                                    <div className="px-4 py-3 space-y-3">
                                        {/* ── Métricas rápidas ── */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2 flex items-center gap-2">
                                                <Coffee size={12} strokeWidth={1.8} className="text-brand-orange shrink-0" />
                                                <div>
                                                    <p className="text-[8.5px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Comidas/día</p>
                                                    <p className="text-[13px] font-black text-ink dark:text-ink-dark">{etiqueta(r.comidas_por_dia)}</p>
                                                </div>
                                            </div>
                                            <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2 flex items-center gap-2">
                                                <Droplets size={12} strokeWidth={1.8} className="text-info shrink-0" />
                                                <div>
                                                    <p className="text-[8.5px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Agua/día</p>
                                                    <p className="text-[13px] font-black text-ink dark:text-ink-dark">{etiqueta(r.consumo_agua_litros)} <span className="text-[10px] font-semibold text-ink-muted">L</span></p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ── Frecuencias ── */}
                                        <div className="rounded-xl border border-surface-border dark:border-surface-border-dark overflow-hidden">
                                            <p className="px-3 pt-2 pb-1.5 text-[8.5px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark border-b border-surface-border dark:border-surface-border-dark">
                                                Frecuencia de consumo
                                            </p>
                                            <div className="px-3 py-2 space-y-2">
                                                {CAMPOS_FRECUENCIA.map(({ key, label, icono: Icono, invertido }) => (
                                                    <div key={key} className="flex items-center gap-2">
                                                        <Icono size={11} strokeWidth={1.8} className="text-ink-muted dark:text-ink-muted-dark shrink-0" />
                                                        <span className="w-[110px] shrink-0 text-[10px] text-ink dark:text-ink-dark">{label}</span>
                                                        <div className="flex-1">
                                                            <BarraFrecuencia valor={String(r[key] ?? 'nunca')} invertido={invertido} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5">
                                            {CAMPOS_CONDUCTA.map(({ key, label, bueno }) => (
                                                <ChipConducta key={key} activo={Boolean(r[key])} esPositivo={bueno} label={label} />
                                            ))}
                                        </div>

                                        {/* ── Cambios respecto al registro anterior ── */}
                                        {Boolean(anteriorEnTiempo) && (
                                            <div className="rounded-xl border border-surface-border dark:border-surface-border-dark overflow-hidden">
                                                <p className="px-3 pt-2 pb-1.5 text-[8.5px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark border-b border-surface-border dark:border-surface-border-dark">
                                                    Cambios vs. registro anterior
                                                </p>
                                                <div className="px-3 py-2">
                                                    <PanelCambios anterior={anteriorEnTiempo!} actual={r} />
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Observaciones ── */}
                                        {Boolean(r.observaciones) && (
                                            <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.02] px-3 py-2">
                                                <p className="text-[8.5px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">Observaciones</p>
                                                <p className="text-[10.5px] text-ink dark:text-ink-dark leading-relaxed">{String(r.observaciones)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
