import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, Activity, Droplets, AlertTriangle, TrendingUp } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import AvatarIniciales from '@/Components/ui/avatar-iniciales';
import clsx from 'clsx';
import type { PageProps } from '@/types';
import type { HistoriaMenstrualData } from './tipos';

interface RegistroHistorial extends HistoriaMenstrualData {
    estado?: string;
    created_at?: string | null;
    updated_at?: string | null;
}

interface Props extends PageProps {
    paciente: { id_paciente: number; nombre_completo: string; ci: string };
    registros: RegistroHistorial[];
}

export default function HistorialMenstrual({ paciente, registros }: Props) {
    const id = paciente.id_paciente;
    const [pagina, setPagina] = useState(1);
    const porPagina = 10;
    const totalPaginas = Math.ceil(registros.length / porPagina);
    const registrosPaginados = registros.slice((pagina - 1) * porPagina, pagina * porPagina);

    return (
        <AuthenticatedLayout title="Historial menstrual">
            <Head title={`Historial menstrual: ${paciente.nombre_completo}`} />

            <div className="space-y-5">
                {/* Cabecera */}
                <div className="card-elevated overflow-hidden">
                    {/* Banner decorativo */}
                    <div className="relative h-20 bg-gradient-to-r from-brand-green/10 via-brand-green/5 to-transparent dark:from-brand-green/[0.08] dark:via-brand-green/[0.03] dark:to-transparent">
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-green/[0.06]" />
                        <div className="absolute right-20 -bottom-5 h-16 w-16 rounded-full bg-brand-green/[0.04]" />
                        <Link
                            href={`/endocrinologo/pacientes/${id}/perfil-clinico`}
                            className="absolute left-5 top-5 flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-ink backdrop-blur-sm transition-colors hover:bg-white dark:bg-black/40 dark:text-ink-dark dark:hover:bg-black/60"
                        >
                            <ArrowLeft size={12} strokeWidth={1.8} /> Perfil clínico
                        </Link>
                    </div>

                    {/* Info del paciente */}
                    <div className="px-5 pb-5 -mt-7">
                        <div className="flex items-end gap-4">
                            <div className="rounded-full border-[3px] border-surface-card shadow-md dark:border-surface-card-dark">
                                <AvatarIniciales nombre={paciente.nombre_completo} size={56} />
                            </div>
                            <div className="flex-1 pb-1">
                                <h1 className="text-[18px] font-bold text-ink dark:text-ink-dark leading-tight">{paciente.nombre_completo}</h1>
                                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark mt-0.5">
                                    CI: {paciente.ci}
                                </p>
                            </div>
                            <div className="pb-1 flex items-center gap-2">
                                <div className="flex items-center gap-1.5 rounded-lg bg-brand-green/10 px-3 py-1.5 dark:bg-brand-green/[0.08]">
                                    <Calendar size={12} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" />
                                    <span className="text-[11px] font-semibold text-brand-green-dark dark:text-brand-green">
                                        {registros.length} registro{registros.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Subtítulo de sección */}
                        <div className="mt-3 pt-3 border-t border-surface-border dark:border-surface-border-dark">
                            <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark">
                                Historial completo de evaluaciones menstruales. Visualiza la evolución de los ciclos a lo largo del tiempo.
                            </p>
                        </div>
                    </div>
                </div>

                {registros.length === 0 ? (
                    <div className="card-elevated flex flex-col items-center gap-2 px-5 py-14 text-center">
                        <Calendar size={28} strokeWidth={1.2} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
                        <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark">No existen registros</p>
                        <p className="text-[11px] text-ink-muted/60 dark:text-ink-muted-dark/60">Aún no se ha registrado historia menstrual para esta paciente</p>
                    </div>
                ) : (
                    <>
                        {/* Layout: Listado principal + Gráficos lateral derecho */}
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4">
                            {/* Listado de registros (principal) */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-[12px] font-semibold text-ink dark:text-ink-dark">Registros cronológicos</p>
                                    <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">
                                        Mostrando {registrosPaginados.length} de {registros.length}
                                    </p>
                                </div>

                                {registrosPaginados.map((r, idx) => (
                                    <RegistroCard key={r.id_historia_menstrual} registro={r} numero={registros.length - ((pagina - 1) * porPagina + idx)} />
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

                            {/* Panel lateral: Gráficos de evolución (sticky) */}
                            {registros.length >= 2 && (
                                <aside className="lg:sticky lg:top-20 lg:self-start">
                                    <GraficoEvolucion registros={registros} />
                                </aside>
                            )}
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

/* ═══ Gráfico de evolución temporal ═══ */

function GraficoEvolucion({ registros }: { registros: RegistroHistorial[] }) {
    // Ordenar del más antiguo al más reciente
    const ordenados = [...registros].reverse();

    const intervalos = ordenados.map(r => r.intervalo_entre_ciclos_dias ?? null);
    const duraciones = ordenados.map(r => r.duracion_ciclo_dias ?? null);
    const progesteronas = ordenados.map(r => r.progesterona_lutea ?? null);
    const fechas = ordenados.map(r => r.created_at ?? '—');

    const tieneIntervalos = intervalos.some(v => v !== null);
    const tieneDuraciones = duraciones.some(v => v !== null);
    const tieneProgesterona = progesteronas.some(v => v !== null);

    if (!tieneIntervalos && !tieneDuraciones && !tieneProgesterona) return null;

    return (
        <div className="card-elevated p-5">
            <p className="flex items-center gap-2 text-[13px] font-bold text-ink dark:text-ink-dark mb-5">
                <TrendingUp size={15} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" />
                Evolución del ciclo menstrual
            </p>

            <div className="grid grid-cols-1 gap-4">
                {tieneIntervalos && (
                    <GraficoLinea
                        label="Intervalo entre ciclos"
                        unidad="días"
                        valores={intervalos}
                        fechas={fechas}
                        rangoMin={21}
                        rangoMax={35}
                        colorLinea="#4CAF50"
                        colorPunto="#2E7D32"
                    />
                )}
                {tieneDuraciones && (
                    <GraficoLinea
                        label="Duración del sangrado"
                        unidad="días"
                        valores={duraciones}
                        fechas={fechas}
                        rangoMin={3}
                        rangoMax={7}
                        colorLinea="#FF9800"
                        colorPunto="#E65100"
                    />
                )}
                {tieneProgesterona && (
                    <GraficoLinea
                        label="Progesterona lútea"
                        unidad="ng/mL"
                        valores={progesteronas}
                        fechas={fechas}
                        rangoMin={10}
                        rangoMax={25}
                        colorLinea="#9C27B0"
                        colorPunto="#6A1B9A"
                    />
                )}
            </div>
        </div>
    );
}

function GraficoLinea({ label, unidad, valores, fechas, rangoMin, rangoMax, colorLinea, colorPunto }: {
    label: string; unidad: string; valores: (number | null)[]; fechas: string[];
    rangoMin: number; rangoMax: number; colorLinea: string; colorPunto: string;
}) {
    const valoresValidos = valores.map((v, i) => v !== null ? { valor: v, idx: i } : null).filter(Boolean) as { valor: number; idx: number }[];
    if (valoresValidos.length < 2) return null;

    const maxVal = Math.max(...valoresValidos.map(v => v.valor), rangoMax) * 1.15;
    const minVal = 0;
    const rango = maxVal - minVal || 1;

    // SVG dimensions
    const W = 380;
    const H = 160;
    const padL = 35;
    const padR = 15;
    const padT = 22;
    const padB = 28;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    // Calcular puntos
    const puntos = valoresValidos.map((v, i) => {
        const x = padL + (i / (valoresValidos.length - 1)) * chartW;
        const y = padT + chartH - ((v.valor - minVal) / rango) * chartH;
        return { x, y, valor: v.valor, fecha: fechas[v.idx] };
    });

    const polyline = puntos.map(p => `${p.x},${p.y}`).join(' ');

    // Zona normal Y
    const yTop = padT + chartH - ((rangoMax - minVal) / rango) * chartH;
    const yBot = padT + chartH - ((rangoMin - minVal) / rango) * chartH;

    // Líneas horizontales de referencia
    const numLineas = 4;
    const lineas = Array.from({ length: numLineas + 1 }, (_, i) => {
        const val = minVal + (rango / numLineas) * i;
        const y = padT + chartH - ((val - minVal) / rango) * chartH;
        return { y, val: Math.round(val) };
    });

    return (
        <div className="group/chart cursor-pointer transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10.5px] font-semibold text-ink dark:text-ink-dark">{label}</p>
                <p className="text-[9px] rounded bg-brand-green/10 px-1.5 py-0.5 text-brand-green-dark dark:bg-brand-green/5 dark:text-brand-green font-medium">
                    {rangoMin}–{rangoMax}
                </p>
            </div>
            <div className="rounded-xl border border-surface-border bg-[#FDFCFA] p-2.5 transition-all group-hover/chart:border-brand-green/40 group-hover/chart:shadow-lg group-hover/chart:shadow-brand-green/5 dark:border-surface-border-dark dark:bg-[#1A1D24] dark:group-hover/chart:border-brand-green/30">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[150px]">
                    {/* Líneas horizontales de fondo */}
                    {lineas.map((l, i) => (
                        <g key={i}>
                            <line x1={padL} y1={l.y} x2={W - padR} y2={l.y} stroke="currentColor" className="text-surface-border dark:text-surface-border-dark" strokeWidth="0.5" />
                            <text x={padL - 6} y={l.y + 3} textAnchor="end" className="fill-ink-muted dark:fill-ink-muted-dark" fontSize="7.5" fontWeight="500">{l.val}</text>
                        </g>
                    ))}

                    {/* Zona normal (fondo verde suave) */}
                    <rect x={padL} y={yTop} width={chartW} height={yBot - yTop} fill={colorLinea} opacity="0.06" rx="3" />
                    {/* Bordes de zona normal */}
                    <line x1={padL} y1={yTop} x2={W - padR} y2={yTop} stroke={colorLinea} strokeWidth="0.5" strokeDasharray="4,3" opacity="0.4" />
                    <line x1={padL} y1={yBot} x2={W - padR} y2={yBot} stroke={colorLinea} strokeWidth="0.5" strokeDasharray="4,3" opacity="0.4" />

                    {/* Línea de datos */}
                    <polyline points={polyline} fill="none" stroke={colorLinea} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Puntos + valores */}
                    {puntos.map((p, i) => {
                        const enRango = p.valor >= rangoMin && p.valor <= rangoMax;
                        return (
                            <g key={i}>
                                {/* Línea vertical al eje X */}
                                <line x1={p.x} y1={p.y} x2={p.x} y2={padT + chartH} stroke={colorLinea} strokeWidth="0.5" opacity="0.2" strokeDasharray="2,2" />
                                {/* Punto */}
                                <circle cx={p.x} cy={p.y} r="4" fill={colorPunto} stroke="white" strokeWidth="1.5" />
                                {/* Valor encima del punto */}
                                <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="8" fontWeight="700" fill={enRango ? colorPunto : '#E65100'}>
                                    {p.valor}
                                </text>
                                {/* Fecha en el eje X */}
                                <text x={p.x} y={H - 4} textAnchor="middle" fontSize="7" className="fill-ink-muted dark:fill-ink-muted-dark" fontWeight="500">
                                    {p.fecha?.slice(5) ?? ''}
                                </text>
                            </g>
                        );
                    })}
                </svg>
                {/* Último valor destacado */}
                <div className="mt-2 flex items-center justify-between px-1">
                    <span className="text-[9px] text-ink-muted dark:text-ink-muted-dark">Último:</span>
                    <span className={clsx('text-[11px] font-bold', valoresValidos[valoresValidos.length - 1].valor >= rangoMin && valoresValidos[valoresValidos.length - 1].valor <= rangoMax ? 'text-brand-green-dark dark:text-brand-green' : 'text-brand-orange')}>
                        {valoresValidos[valoresValidos.length - 1].valor} {unidad}
                    </span>
                </div>
            </div>
        </div>
    );
}


/* ═══ Card de registro individual ═══ */

function RegistroCard({ registro: r, numero }: { registro: RegistroHistorial; numero: number }) {
    const hallazgos = [
        r.amenorrea && 'Amenorrea',
        r.oligomenorrea && 'Oligomenorrea',
        r.sangrado_abundante && 'Sangrado abundante',
        r.dolor_menstrual && 'Dolor menstrual',
        r.sospecha_anovulacion && 'Sospecha anovulación',
        r.confirma_anovulacion_por_progesterona && 'Anovulación confirmada',
    ].filter(Boolean) as string[];

    return (
        <div className="card-elevated overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-border dark:border-surface-border-dark">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-green/10 text-[9px] font-bold text-brand-green-dark dark:text-brand-green">
                        {numero}
                    </div>
                    <p className="text-[11.5px] font-semibold text-ink dark:text-ink-dark">Evaluación #{numero}</p>
                    <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{r.created_at ?? ''}</span>
                </div>
                <Badge color={r.regularidad_ciclo === 'irregular' || r.regularidad_ciclo === 'ausente' ? 'orange' : 'green'}>
                    {formatRegularidad(r.regularidad_ciclo)}
                </Badge>
            </div>

            {/* Cuerpo: datos en grid horizontal + hallazgos al lado */}
            <div className="px-4 py-3 flex flex-col lg:flex-row lg:items-start gap-3">
                {/* Datos numéricos */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 flex-1">
                    <DatoCompacto label="Duración" valor={r.duracion_ciclo_dias ? `${r.duracion_ciclo_dias} días` : '—'} color="text-brand-green-dark dark:text-brand-green" />
                    <DatoCompacto label="Intervalo" valor={r.intervalo_entre_ciclos_dias ? `${r.intervalo_entre_ciclos_dias} días` : '—'} color="text-brand-green-dark dark:text-brand-green" />
                    <DatoCompacto label="Menarquía" valor={r.edad_menarquia ? `${r.edad_menarquia} años` : '—'} color="text-ink dark:text-ink-dark" />
                    <DatoCompacto label="Últ. menst." valor={r.fecha_ultima_menstruacion ?? '—'} color="text-ink dark:text-ink-dark" />
                    {r.progesterona_lutea && (
                        <DatoCompacto label="Progest." valor={`${r.progesterona_lutea}`} color={Number(r.progesterona_lutea) >= 10 ? 'text-brand-green-dark dark:text-brand-green' : 'text-category-fruits'} />
                    )}
                </div>

                {/* Hallazgos */}
                {hallazgos.length > 0 && (
                    <div className="flex flex-wrap gap-1 lg:max-w-[180px]">
                        {hallazgos.map((h) => (
                            <Badge key={h} color={h === 'Anovulación confirmada' ? 'red' : 'orange'}>{h}</Badge>
                        ))}
                    </div>
                )}
            </div>

            {/* Observaciones */}
            {r.observaciones && (
                <div className="px-4 pb-2.5 pt-0">
                    <div className="rounded-md bg-black/[0.02] px-2.5 py-1.5 dark:bg-white/[0.02]">
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark leading-relaxed">{r.observaciones}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function DatoCompacto({ label, valor, color }: { label: string; valor: string; color: string }) {
    return (
        <div className="rounded-lg bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03]">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">{label}</p>
            <p className={clsx('text-[12.5px] font-bold', color)}>{valor}</p>
        </div>
    );
}

function formatRegularidad(valor?: string | null): string {
    const map: Record<string, string> = { regular: 'Regular', irregular: 'Irregular', ausente: 'Ausente' };
    return map[valor ?? ''] ?? '—';
}
