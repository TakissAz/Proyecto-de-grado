import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ScanSearch, TrendingUp, CheckCircle2, XCircle, Activity, BarChart3, Eye } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import AvatarIniciales from '@/Components/ui/avatar-iniciales';
import clsx from 'clsx';
import type { PageProps } from '@/types';

/* ═══ Tipos ═══ */
interface EcografiaRegistro {
    id_ecografia: number;
    fecha_ecografia: string;
    tipo_ecografia?: string | null;
    volumen_ovario_derecho?: number | null;
    volumen_ovario_izquierdo?: number | null;
    foliculos_ovario_derecho?: number | null;
    foliculos_ovario_izquierdo?: number | null;
    morfologia_compatible_pmos: boolean;
    distribucion_periferica: boolean;
    observaciones?: string | null;
    estado?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

interface Props extends PageProps {
    paciente: { id_paciente: number; nombre_completo: string; ci: string };
    registros: EcografiaRegistro[];
}

export default function HistorialEcografia({ paciente, registros }: Props) {
    const id = paciente.id_paciente;
    const [pagina, setPagina] = useState(1);
    const [registroExpandido, setRegistroExpandido] = useState<number | null>(null);
    const porPagina = 8;
    const totalPaginas = Math.ceil(registros.length / porPagina);
    const registrosPaginados = registros.slice((pagina - 1) * porPagina, pagina * porPagina);

    // Estadísticas
    const compatibles = registros.filter(r => r.morfologia_compatible_pmos).length;
    const porcCompatible = registros.length > 0 ? Math.round((compatibles / registros.length) * 100) : 0;
    const ultimaEco = registros[0];
    const promedioVolOD = calcPromedio(registros.map(r => r.volumen_ovario_derecho));
    const promedioVolOI = calcPromedio(registros.map(r => r.volumen_ovario_izquierdo));
    const promedioFolOD = calcPromedio(registros.map(r => r.foliculos_ovario_derecho));
    const promedioFolOI = calcPromedio(registros.map(r => r.foliculos_ovario_izquierdo));

    return (
        <AuthenticatedLayout title="Historial ecográfico">
            <Head title={`Historial ecografía: ${paciente.nombre_completo}`} />

            <div className="space-y-5">
                {/* ═══ CABECERA ═══ */}
                <div className="card-elevated overflow-hidden">
                    <div className="relative h-20 bg-gradient-to-r from-category-dairy/10 via-brand-orange/5 to-transparent dark:from-category-dairy/[0.08] dark:via-brand-orange/[0.03] dark:to-transparent">
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-category-dairy/[0.06]" />
                        <div className="absolute right-20 -bottom-5 h-16 w-16 rounded-full bg-brand-orange/[0.04]" />
                        <Link
                            href={`/endocrinologo/pacientes/${id}/perfil-clinico`}
                            className="absolute left-5 top-5 flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-ink backdrop-blur-sm transition-colors hover:bg-white dark:bg-black/40 dark:text-ink-dark dark:hover:bg-black/60"
                        >
                            <ArrowLeft size={12} strokeWidth={1.8} /> Perfil clínico
                        </Link>
                    </div>
                    <div className="px-5 pb-5 -mt-7">
                        <div className="flex items-end gap-4">
                            <div className="rounded-full border-[3px] border-surface-card shadow-md dark:border-surface-card-dark">
                                <AvatarIniciales nombre={paciente.nombre_completo} size={56} />
                            </div>
                            <div className="flex-1 pb-1">
                                <h1 className="text-[18px] font-bold text-ink dark:text-ink-dark leading-tight">{paciente.nombre_completo}</h1>
                                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark mt-0.5">CI: {paciente.ci}</p>
                            </div>
                            <div className="pb-1 flex items-center gap-2">
                                <div className="flex items-center gap-1.5 rounded-lg bg-category-dairy/10 px-3 py-1.5 dark:bg-category-dairy/[0.08]">
                                    <ScanSearch size={12} strokeWidth={1.8} className="text-category-dairy" />
                                    <span className="text-[11px] font-semibold text-category-dairy">
                                        {registros.length} ecografía{registros.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-surface-border dark:border-surface-border-dark">
                            <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark">
                                Historial completo de evaluaciones ecográficas con evolución de volúmenes ováricos y conteo folicular.
                            </p>
                        </div>
                    </div>
                </div>

                {registros.length === 0 ? (
                    <div className="card-elevated flex flex-col items-center gap-2 px-5 py-14 text-center">
                        <ScanSearch size={28} strokeWidth={1.2} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
                        <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark">No existen registros ecográficos</p>
                        <p className="text-[11px] text-ink-muted/60 dark:text-ink-muted-dark/60">Aún no se ha registrado ninguna ecografía para esta paciente</p>
                    </div>
                ) : (
                    <>
                        {/* ═══ TARJETAS RESUMEN ═══ */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <TarjetaResumen
                                label="Compatibilidad PMOS"
                                valor={`${porcCompatible}%`}
                                subtexto={`${compatibles} de ${registros.length} ecografías`}
                                icono={<Activity size={14} strokeWidth={1.8} />}
                                color={porcCompatible >= 50 ? 'orange' : 'green'}
                            />
                            <TarjetaResumen
                                label="Prom. Volumen OD"
                                valor={promedioVolOD !== null ? `${promedioVolOD} mL` : '—'}
                                subtexto={promedioVolOD !== null && promedioVolOD >= 10 ? 'Elevado (≥10 mL)' : 'Rango normal'}
                                icono={<BarChart3 size={14} strokeWidth={1.8} />}
                                color={promedioVolOD !== null && promedioVolOD >= 10 ? 'orange' : 'green'}
                            />
                            <TarjetaResumen
                                label="Prom. Volumen OI"
                                valor={promedioVolOI !== null ? `${promedioVolOI} mL` : '—'}
                                subtexto={promedioVolOI !== null && promedioVolOI >= 10 ? 'Elevado (≥10 mL)' : 'Rango normal'}
                                icono={<BarChart3 size={14} strokeWidth={1.8} />}
                                color={promedioVolOI !== null && promedioVolOI >= 10 ? 'orange' : 'green'}
                            />
                            <TarjetaResumen
                                label="Última evaluación"
                                valor={ultimaEco?.fecha_ecografia ?? '—'}
                                subtexto={ultimaEco?.tipo_ecografia ? formatTipo(ultimaEco.tipo_ecografia) : 'Sin tipo'}
                                icono={<Eye size={14} strokeWidth={1.8} />}
                                color="purple"
                            />
                        </div>

                        {/* ═══ CONTENIDO PRINCIPAL: listado + panel lateral con scroll ═══ */}
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
                            {/* Listado */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-[12px] font-semibold text-ink dark:text-ink-dark">Evaluaciones ecográficas</p>
                                    <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">
                                        Mostrando {registrosPaginados.length} de {registros.length}
                                    </p>
                                </div>

                                {registrosPaginados.map((r, idx) => (
                                    <EcografiaCard
                                        key={r.id_ecografia}
                                        registro={r}
                                        numero={registros.length - ((pagina - 1) * porPagina + idx)}
                                        expandido={registroExpandido === r.id_ecografia}
                                        onToggle={() => setRegistroExpandido(registroExpandido === r.id_ecografia ? null : r.id_ecografia)}
                                    />
                                ))}

                                {/* Paginación */}
                                {totalPaginas > 1 && (
                                    <div className="flex items-center justify-center gap-1 pt-2">
                                        {Array.from({ length: totalPaginas }, (_, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setPagina(i + 1)}
                                                className={clsx(
                                                    'flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-semibold transition-colors',
                                                    pagina === i + 1
                                                        ? 'bg-brand-green text-white'
                                                        : 'text-ink-muted hover:bg-[#F5F3EE] dark:text-ink-muted-dark dark:hover:bg-white/[0.04]'
                                                )}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Panel lateral derecho con scroll */}
                            <aside className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-1 space-y-4">
                                <ComparativaOvarios registros={registros} />
                                {registros.length >= 2 && (
                                    <GraficoEvolucionEcografia registros={registros} />
                                )}
                            </aside>
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

/* ═══ Tarjeta de resumen ═══ */
function TarjetaResumen({ label, valor, subtexto, icono, color }: { label: string; valor: string; subtexto: string; icono: React.ReactNode; color: 'green' | 'orange' | 'purple' }) {
    const colorMap = {
        green: { bg: 'bg-brand-green/10 dark:bg-brand-green/[0.06]', icon: 'text-brand-green-dark dark:text-brand-green', valor: 'text-brand-green-dark dark:text-brand-green' },
        orange: { bg: 'bg-brand-orange/10 dark:bg-brand-orange/[0.06]', icon: 'text-brand-orange', valor: 'text-brand-orange' },
        purple: { bg: 'bg-category-dairy/10 dark:bg-category-dairy/[0.06]', icon: 'text-category-dairy', valor: 'text-category-dairy' },
    };
    const c = colorMap[color];

    return (
        <div className="card-elevated p-4 transition-all hover:shadow-lg hover:shadow-black/[0.03] dark:hover:shadow-black/20">
            <div className="flex items-center gap-2 mb-2.5">
                <div className={clsx('flex h-7 w-7 items-center justify-center rounded-lg', c.bg)}>
                    <span className={c.icon}>{icono}</span>
                </div>
                <p className="text-[9.5px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{label}</p>
            </div>
            <p className={clsx('text-[18px] font-bold leading-tight', c.valor)}>{valor}</p>
            <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark mt-1">{subtexto}</p>
        </div>
    );
}

/* ═══ Card de ecografía mejorada ═══ */
function EcografiaCard({ registro: r, numero, expandido, onToggle }: { registro: EcografiaRegistro; numero: number; expandido: boolean; onToggle: () => void }) {
    const hallazgos = [
        r.morfologia_compatible_pmos && 'Compatible PMOS',
        r.distribucion_periferica && 'Distribución periférica',
        r.volumen_ovario_derecho != null && r.volumen_ovario_derecho >= 10 && 'Vol. OD elevado',
        r.volumen_ovario_izquierdo != null && r.volumen_ovario_izquierdo >= 10 && 'Vol. OI elevado',
        r.foliculos_ovario_derecho != null && r.foliculos_ovario_derecho >= 12 && 'Folículos OD ≥ 12',
        r.foliculos_ovario_izquierdo != null && r.foliculos_ovario_izquierdo >= 12 && 'Folículos OI ≥ 12',
    ].filter(Boolean) as string[];

    return (
        <div className={clsx('card-elevated overflow-hidden transition-all', expandido && 'ring-1 ring-category-dairy/30 shadow-lg shadow-category-dairy/5')}>
            {/* Header clickeable */}
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-black/[0.01] dark:hover:bg-white/[0.01]"
            >
                <div className="flex items-center gap-2.5">
                    <div className={clsx(
                        'flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold',
                        r.morfologia_compatible_pmos ? 'bg-brand-orange/15 text-brand-orange' : 'bg-brand-green/15 text-brand-green-dark dark:text-brand-green'
                    )}>
                        {numero}
                    </div>
                    <div>
                        <p className="text-[12px] font-semibold text-ink dark:text-ink-dark">Ecografía #{numero}</p>
                        <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{r.fecha_ecografia} · {formatTipo(r.tipo_ecografia)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Mini barras rápidas */}
                    <MiniBarras volOD={r.volumen_ovario_derecho} volOI={r.volumen_ovario_izquierdo} />
                    <Badge color={r.morfologia_compatible_pmos ? 'orange' : 'green'}>
                        {r.morfologia_compatible_pmos ? 'PMOS' : 'Normal'}
                    </Badge>
                </div>
            </button>

            {/* Contenido expandible */}
            <div className={clsx('transition-all duration-200 overflow-hidden', expandido ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0')}>
                <div className="border-t border-surface-border dark:border-surface-border-dark px-4 py-3 space-y-3">
                    {/* Datos principales */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <DatoCompacto label="Vol. OD" valor={r.volumen_ovario_derecho != null ? `${r.volumen_ovario_derecho} mL` : '—'} destacar={r.volumen_ovario_derecho != null && r.volumen_ovario_derecho >= 10} />
                        <DatoCompacto label="Vol. OI" valor={r.volumen_ovario_izquierdo != null ? `${r.volumen_ovario_izquierdo} mL` : '—'} destacar={r.volumen_ovario_izquierdo != null && r.volumen_ovario_izquierdo >= 10} />
                        <DatoCompacto label="Folículos OD" valor={r.foliculos_ovario_derecho?.toString() ?? '—'} destacar={r.foliculos_ovario_derecho != null && r.foliculos_ovario_derecho >= 12} />
                        <DatoCompacto label="Folículos OI" valor={r.foliculos_ovario_izquierdo?.toString() ?? '—'} destacar={r.foliculos_ovario_izquierdo != null && r.foliculos_ovario_izquierdo >= 12} />
                    </div>

                    {/* Barra comparativa visual OD vs OI */}
                    <BarraComparativa
                        volOD={r.volumen_ovario_derecho}
                        volOI={r.volumen_ovario_izquierdo}
                        folOD={r.foliculos_ovario_derecho}
                        folOI={r.foliculos_ovario_izquierdo}
                    />

                    {/* Hallazgos */}
                    {hallazgos.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {hallazgos.map((h) => (
                                <Badge key={h} color={h.includes('PMOS') ? 'orange' : h.includes('≥') || h.includes('elevado') ? 'red' : 'orange'}>{h}</Badge>
                            ))}
                        </div>
                    )}

                    {/* Observaciones */}
                    {r.observaciones && (
                        <div className="rounded-xl bg-black/[0.02] px-3 py-2.5 dark:bg-white/[0.02]">
                            <p className="text-[9.5px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">Observaciones</p>
                            <p className="text-[11px] text-ink dark:text-ink-dark leading-relaxed">{r.observaciones}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ═══ Mini barras en el header del card ═══ */
function MiniBarras({ volOD, volOI }: { volOD?: number | null; volOI?: number | null }) {
    if (volOD == null && volOI == null) return null;
    const max = Math.max(volOD ?? 0, volOI ?? 0, 10) * 1.1;
    return (
        <div className="hidden sm:flex items-end gap-0.5 h-5">
            <div className="flex flex-col items-center gap-0.5">
                <div
                    className={clsx('w-2.5 rounded-t-sm transition-all', (volOD ?? 0) >= 10 ? 'bg-brand-orange' : 'bg-brand-green/60')}
                    style={{ height: `${Math.max(((volOD ?? 0) / max) * 20, 3)}px` }}
                />
            </div>
            <div className="flex flex-col items-center gap-0.5">
                <div
                    className={clsx('w-2.5 rounded-t-sm transition-all', (volOI ?? 0) >= 10 ? 'bg-category-dairy' : 'bg-category-dairy/50')}
                    style={{ height: `${Math.max(((volOI ?? 0) / max) * 20, 3)}px` }}
                />
            </div>
        </div>
    );
}

/* ═══ Barra comparativa OD vs OI ═══ */
function BarraComparativa({ volOD, volOI, folOD, folOI }: { volOD?: number | null; volOI?: number | null; folOD?: number | null; folOI?: number | null }) {
    const tieneVol = volOD != null || volOI != null;
    const tieneFol = folOD != null || folOI != null;
    if (!tieneVol && !tieneFol) return null;

    const maxVol = Math.max(volOD ?? 0, volOI ?? 0, 10) * 1.2;
    const maxFol = Math.max(folOD ?? 0, folOI ?? 0, 12) * 1.2;

    return (
        <div className="rounded-xl border border-surface-border p-3 dark:border-surface-border-dark">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tieneVol && (
                    <div>
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">Volumen ovárico (mL)</p>
                        <div className="space-y-1.5">
                            <BarraItem label="OD" valor={volOD} max={maxVol} umbral={10} color="bg-brand-orange" colorNormal="bg-brand-green" />
                            <BarraItem label="OI" valor={volOI} max={maxVol} umbral={10} color="bg-category-dairy" colorNormal="bg-category-dairy/60" />
                        </div>
                        <p className="text-[8px] text-ink-muted/50 dark:text-ink-muted-dark/50 mt-1">Línea en 10 mL (criterio PMOS)</p>
                    </div>
                )}
                {tieneFol && (
                    <div>
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">Conteo folicular</p>
                        <div className="space-y-1.5">
                            <BarraItem label="OD" valor={folOD} max={maxFol} umbral={12} color="bg-category-fruits" colorNormal="bg-brand-green" />
                            <BarraItem label="OI" valor={folOI} max={maxFol} umbral={12} color="bg-category-fruits/70" colorNormal="bg-brand-green/60" />
                        </div>
                        <p className="text-[8px] text-ink-muted/50 dark:text-ink-muted-dark/50 mt-1">Línea en 12 folículos (criterio Rotterdam)</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function BarraItem({ label, valor, max, umbral, color, colorNormal }: { label: string; valor?: number | null; max: number; umbral: number; color: string; colorNormal: string }) {
    const v = valor ?? 0;
    const porcUmbral = (umbral / max) * 100;
    const porcValor = Math.min((v / max) * 100, 100);
    const elevado = v >= umbral;

    return (
        <div className="flex items-center gap-2">
            <span className="text-[9px] font-semibold w-5 text-ink-muted dark:text-ink-muted-dark">{label}</span>
            <div className="relative flex-1 h-3 rounded-full bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden">
                <div className={clsx('h-full rounded-full transition-all', elevado ? color : colorNormal)} style={{ width: `${porcValor}%` }} />
                {/* Línea de umbral */}
                <div className="absolute top-0 h-full w-px bg-ink-muted/40 dark:bg-ink-muted-dark/40" style={{ left: `${porcUmbral}%` }} />
            </div>
            <span className={clsx('text-[10px] font-bold w-8 text-right', elevado ? 'text-brand-orange' : 'text-ink dark:text-ink-dark')}>
                {valor ?? '—'}
            </span>
        </div>
    );
}

/* ═══ Comparativa visual de ovarios (última ecografía) ═══ */
function ComparativaOvarios({ registros }: { registros: EcografiaRegistro[] }) {
    const ultimo = registros[0];
    if (!ultimo) return null;

    const volOD = ultimo.volumen_ovario_derecho;
    const volOI = ultimo.volumen_ovario_izquierdo;
    const folOD = ultimo.foliculos_ovario_derecho;
    const folOI = ultimo.foliculos_ovario_izquierdo;

    // Tamaño visual proporcional del ovario (mínimo 36px, máximo 60px)
    const maxVol = Math.max(volOD ?? 5, volOI ?? 5, 10);
    const sizeOD = 36 + ((volOD ?? 5) / maxVol) * 24;
    const sizeOI = 36 + ((volOI ?? 5) / maxVol) * 24;

    return (
        <div className="card-elevated p-4">
            <div className="flex items-center justify-between mb-3">
                <p className="flex items-center gap-2 text-[12px] font-bold text-ink dark:text-ink-dark">
                    <ScanSearch size={14} strokeWidth={1.8} className="text-category-dairy" />
                    Última ecografía
                </p>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{ultimo.fecha_ecografia}</span>
                    {ultimo.morfologia_compatible_pmos && <Badge color="orange">Compatible PMOS</Badge>}
                    {!ultimo.morfologia_compatible_pmos && <Badge color="green">Sin criterios PMOS</Badge>}
                </div>
            </div>

            {/* Layout horizontal: OD | útero | OI + leyenda */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    {/* OD */}
                    <div className="flex items-center gap-2">
                        <div
                            className={clsx(
                                'relative rounded-[45%] border-2 flex items-center justify-center',
                                (volOD ?? 0) >= 10 ? 'border-brand-orange bg-brand-orange/[0.08]' : 'border-brand-green/40 bg-brand-green/[0.04]'
                            )}
                            style={{ width: `${sizeOD}px`, height: `${sizeOD * 0.7}px` }}
                        >
                            {folOD != null && folOD > 0 && (
                                <div className="flex flex-wrap items-center justify-center gap-[2px] p-1">
                                    {Array.from({ length: Math.min(folOD, 16) }, (_, i) => (
                                        <div key={i} className={clsx('rounded-full', folOD >= 12 ? 'bg-category-fruits/60' : 'bg-brand-green/40')} style={{ width: '3px', height: '3px' }} />
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-ink-muted dark:text-ink-muted-dark">OD</p>
                            <p className={clsx('text-[11px] font-bold', (volOD ?? 0) >= 10 ? 'text-brand-orange' : 'text-ink dark:text-ink-dark')}>
                                {volOD != null ? `${volOD} mL` : '—'}
                            </p>
                            <p className={clsx('text-[9px]', (folOD ?? 0) >= 12 ? 'text-category-fruits font-semibold' : 'text-ink-muted dark:text-ink-muted-dark')}>
                                {folOD != null ? `${folOD} fol.` : '—'}
                            </p>
                        </div>
                    </div>

                    {/* Útero */}
                    <div className="flex flex-col items-center">
                        <div className="w-4 h-6 rounded-b-full border border-surface-border bg-surface-card dark:border-surface-border-dark dark:bg-surface-card-dark" />
                    </div>

                    {/* OI */}
                    <div className="flex items-center gap-2">
                        <div
                            className={clsx(
                                'relative rounded-[45%] border-2 flex items-center justify-center',
                                (volOI ?? 0) >= 10 ? 'border-category-dairy bg-category-dairy/[0.08]' : 'border-category-dairy/30 bg-category-dairy/[0.04]'
                            )}
                            style={{ width: `${sizeOI}px`, height: `${sizeOI * 0.7}px` }}
                        >
                            {folOI != null && folOI > 0 && (
                                <div className="flex flex-wrap items-center justify-center gap-[2px] p-1">
                                    {Array.from({ length: Math.min(folOI, 16) }, (_, i) => (
                                        <div key={i} className={clsx('rounded-full', folOI >= 12 ? 'bg-category-fruits/60' : 'bg-category-dairy/40')} style={{ width: '3px', height: '3px' }} />
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-ink-muted dark:text-ink-muted-dark">OI</p>
                            <p className={clsx('text-[11px] font-bold', (volOI ?? 0) >= 10 ? 'text-category-dairy' : 'text-ink dark:text-ink-dark')}>
                                {volOI != null ? `${volOI} mL` : '—'}
                            </p>
                            <p className={clsx('text-[9px]', (folOI ?? 0) >= 12 ? 'text-category-fruits font-semibold' : 'text-ink-muted dark:text-ink-muted-dark')}>
                                {folOI != null ? `${folOI} fol.` : '—'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Leyenda compacta */}
                <div className="hidden sm:flex flex-col gap-1">
                    <LeyendaItem color="bg-brand-orange" label="Vol ≥ 10 mL" />
                    <LeyendaItem color="bg-category-fruits/60" label="Fol ≥ 12" />
                    <LeyendaItem color="bg-brand-green/40" label="Normal" />
                </div>
            </div>
        </div>
    );
}

function LeyendaItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <div className={clsx('h-2.5 w-2.5 rounded-full', color)} />
            <span className="text-[9px] text-ink-muted dark:text-ink-muted-dark">{label}</span>
        </div>
    );
}

/* ═══ Gráficos de evolución ═══ */
function GraficoEvolucionEcografia({ registros }: { registros: EcografiaRegistro[] }) {
    const ordenados = [...registros].reverse();
    const fechas = ordenados.map(r => r.fecha_ecografia ?? '—');

    const volOD = ordenados.map(r => r.volumen_ovario_derecho ?? null);
    const volOI = ordenados.map(r => r.volumen_ovario_izquierdo ?? null);
    const folOD = ordenados.map(r => r.foliculos_ovario_derecho ?? null);
    const folOI = ordenados.map(r => r.foliculos_ovario_izquierdo ?? null);

    const tieneVol = volOD.some(v => v !== null) || volOI.some(v => v !== null);
    const tieneFol = folOD.some(v => v !== null) || folOI.some(v => v !== null);

    if (!tieneVol && !tieneFol) return null;

    return (
        <div className="card-elevated p-5">
            <p className="flex items-center gap-2 text-[13px] font-bold text-ink dark:text-ink-dark mb-5">
                <TrendingUp size={15} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" />
                Evolución temporal
            </p>
            <div className="grid grid-cols-1 gap-4">
                {volOD.some(v => v !== null) && (
                    <GraficoLinea label="Volumen OD" unidad="mL" valores={volOD} fechas={fechas} rangoMin={0} rangoMax={10} colorLinea="#FF8C00" colorPunto="#CC7000" />
                )}
                {volOI.some(v => v !== null) && (
                    <GraficoLinea label="Volumen OI" unidad="mL" valores={volOI} fechas={fechas} rangoMin={0} rangoMax={10} colorLinea="#B341D6" colorPunto="#8A2FA8" />
                )}
                {folOD.some(v => v !== null) && (
                    <GraficoLinea label="Folículos OD" unidad="" valores={folOD} fechas={fechas} rangoMin={0} rangoMax={12} colorLinea="#D42213" colorPunto="#9B1B0F" />
                )}
                {folOI.some(v => v !== null) && (
                    <GraficoLinea label="Folículos OI" unidad="" valores={folOI} fechas={fechas} rangoMin={0} rangoMax={12} colorLinea="#5C8FB8" colorPunto="#3D6A8C" />
                )}
            </div>

            {/* Timeline PMOS */}
            <div className="mt-5 pt-4 border-t border-surface-border dark:border-surface-border-dark">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2.5">Timeline morfología PMOS</p>
                <div className="flex items-center gap-1">
                    {ordenados.map((r, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1">
                            <div className={clsx(
                                'flex h-6 w-6 items-center justify-center rounded-full transition-all',
                                r.morfologia_compatible_pmos
                                    ? 'bg-brand-orange/15 text-brand-orange'
                                    : 'bg-brand-green/15 text-brand-green-dark dark:text-brand-green'
                            )}>
                                {r.morfologia_compatible_pmos ? <CheckCircle2 size={11} strokeWidth={2} /> : <XCircle size={11} strokeWidth={2} />}
                            </div>
                            <span className="text-[7.5px] text-ink-muted dark:text-ink-muted-dark text-center leading-tight">
                                {r.fecha_ecografia?.slice(5)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ═══ Gráfico de línea SVG ═══ */
function GraficoLinea({ label, unidad, valores, fechas, rangoMin, rangoMax, colorLinea, colorPunto }: {
    label: string; unidad: string; valores: (number | null)[]; fechas: string[];
    rangoMin: number; rangoMax: number; colorLinea: string; colorPunto: string;
}) {
    const valoresValidos = valores.map((v, i) => v !== null ? { valor: v, idx: i } : null).filter(Boolean) as { valor: number; idx: number }[];
    if (valoresValidos.length < 2) return null;

    const maxVal = Math.max(...valoresValidos.map(v => v.valor), rangoMax) * 1.15;
    const minVal = 0;
    const rango = maxVal - minVal || 1;

    const W = 400;
    const H = 150;
    const padL = 32;
    const padR = 12;
    const padT = 20;
    const padB = 26;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const puntos = valoresValidos.map((v, i) => {
        const x = padL + (i / (valoresValidos.length - 1)) * chartW;
        const y = padT + chartH - ((v.valor - minVal) / rango) * chartH;
        return { x, y, valor: v.valor, fecha: fechas[v.idx] };
    });

    const polyline = puntos.map(p => `${p.x},${p.y}`).join(' ');
    const yUmbral = padT + chartH - ((rangoMax - minVal) / rango) * chartH;

    const numLineas = 4;
    const lineas = Array.from({ length: numLineas + 1 }, (_, i) => {
        const val = minVal + (rango / numLineas) * i;
        const y = padT + chartH - ((val - minVal) / rango) * chartH;
        return { y, val: Math.round(val * 10) / 10 };
    });

    // Área bajo la curva (gradient fill)
    const areaPath = `M ${puntos[0].x},${padT + chartH} ${puntos.map(p => `L ${p.x},${p.y}`).join(' ')} L ${puntos[puntos.length - 1].x},${padT + chartH} Z`;

    return (
        <div className="group/chart transition-all hover:scale-[1.01]">
            <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10.5px] font-semibold text-ink dark:text-ink-dark">{label}</p>
                <p className="text-[9px] rounded bg-brand-green/10 px-1.5 py-0.5 text-brand-green-dark dark:bg-brand-green/5 dark:text-brand-green font-medium">
                    umbral: {rangoMax} {unidad}
                </p>
            </div>
            <div className="rounded-xl border border-surface-border bg-[#FDFCFA] p-2.5 transition-all group-hover/chart:border-category-dairy/40 group-hover/chart:shadow-md dark:border-surface-border-dark dark:bg-[#1A1D24] dark:group-hover/chart:border-category-dairy/30">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[140px]">
                    {/* Líneas de fondo */}
                    {lineas.map((l, i) => (
                        <g key={i}>
                            <line x1={padL} y1={l.y} x2={W - padR} y2={l.y} stroke="currentColor" className="text-surface-border dark:text-surface-border-dark" strokeWidth="0.4" />
                            <text x={padL - 5} y={l.y + 3} textAnchor="end" className="fill-ink-muted dark:fill-ink-muted-dark" fontSize="7" fontWeight="500">{l.val}</text>
                        </g>
                    ))}

                    {/* Zona de umbral */}
                    <rect x={padL} y={padT} width={chartW} height={yUmbral - padT} fill={colorLinea} opacity="0.04" rx="2" />
                    <line x1={padL} y1={yUmbral} x2={W - padR} y2={yUmbral} stroke={colorLinea} strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
                    <text x={W - padR - 2} y={yUmbral - 4} textAnchor="end" fill={colorLinea} fontSize="7" fontWeight="600" opacity="0.7">{rangoMax}</text>

                    {/* Área rellena */}
                    <path d={areaPath} fill={colorLinea} opacity="0.08" />

                    {/* Línea principal */}
                    <polyline points={polyline} fill="none" stroke={colorLinea} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Puntos */}
                    {puntos.map((p, i) => {
                        const elevado = p.valor > rangoMax;
                        return (
                            <g key={i}>
                                <circle cx={p.x} cy={p.y} r={elevado ? 5 : 4} fill={colorPunto} stroke="white" strokeWidth="1.5" />
                                <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize="8" fontWeight="700" fill={elevado ? '#E65100' : colorPunto}>
                                    {p.valor}
                                </text>
                                <text x={p.x} y={H - 3} textAnchor="middle" fontSize="6.5" className="fill-ink-muted dark:fill-ink-muted-dark" fontWeight="500">
                                    {p.fecha?.slice(5) ?? ''}
                                </text>
                            </g>
                        );
                    })}
                </svg>
                <div className="mt-1.5 flex items-center justify-between px-1">
                    <span className="text-[9px] text-ink-muted dark:text-ink-muted-dark">Último valor:</span>
                    <span className={clsx('text-[11px] font-bold', valoresValidos[valoresValidos.length - 1].valor <= rangoMax ? 'text-brand-green-dark dark:text-brand-green' : 'text-brand-orange')}>
                        {valoresValidos[valoresValidos.length - 1].valor} {unidad}
                    </span>
                </div>
            </div>
        </div>
    );
}

/* ═══ Componentes auxiliares ═══ */
function DatoCompacto({ label, valor, destacar }: { label: string; valor: string; destacar?: boolean }) {
    return (
        <div className="rounded-lg bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03]">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">{label}</p>
            <p className={clsx('text-[12.5px] font-bold', destacar ? 'text-brand-orange' : 'text-ink dark:text-ink-dark')}>{valor}</p>
        </div>
    );
}

function formatTipo(tipo?: string | null): string {
    const map: Record<string, string> = { transvaginal: 'Transvaginal', abdominal: 'Abdominal', otra: 'Otra' };
    return map[tipo ?? ''] ?? '—';
}

function calcPromedio(valores: (number | null | undefined)[]): number | null {
    const validos = valores.filter((v): v is number => v != null);
    if (validos.length === 0) return null;
    return Math.round((validos.reduce((a, b) => a + b, 0) / validos.length) * 10) / 10;
}
