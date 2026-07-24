import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import AvatarIniciales from '@/Components/ui/avatar-iniciales';
import clsx from 'clsx';
import type { PageProps } from '@/types';
import type { HiperandrogenismoData } from './tipos';

interface RegistroHistorial extends HiperandrogenismoData {
    estado?: string;
    created_at?: string | null;
    updated_at?: string | null;
}

interface Props extends PageProps {
    paciente: { id_paciente: number; nombre_completo: string; ci: string };
    registros: RegistroHistorial[];
}

export default function HistorialHiperandrogenismo({ paciente, registros }: Props) {
    const id = paciente.id_paciente;
    const [pagina, setPagina] = useState(1);
    const porPagina = 10;
    const totalPaginas = Math.ceil(registros.length / porPagina);
    const registrosPaginados = registros.slice((pagina - 1) * porPagina, pagina * porPagina);

    return (
        <AuthenticatedLayout title="Historial hiperandrogenismo">
            <Head title={`Historial hiperandrogenismo: ${paciente.nombre_completo}`} />

            <div className="space-y-5">
                {/* Cabecera */}
                <div className="card-elevated overflow-hidden">
                    <div className="relative h-20 bg-gradient-to-r from-brand-orange/10 via-brand-orange/5 to-transparent dark:from-brand-orange/[0.08] dark:via-brand-orange/[0.03] dark:to-transparent">
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-orange/[0.06]" />
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
                                <div className="flex items-center gap-1.5 rounded-lg bg-brand-orange/10 px-3 py-1.5 dark:bg-brand-orange/[0.08]">
                                    <Calendar size={12} strokeWidth={1.8} className="text-brand-orange" />
                                    <span className="text-[11px] font-semibold text-brand-orange">{registros.length} registro{registros.length !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-surface-border dark:border-surface-border-dark">
                            <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark">
                                Historial de evaluaciones de hiperandrogenismo clínico. Seguimiento de signos androgénicos.
                            </p>
                        </div>
                    </div>
                </div>

                {registros.length === 0 ? (
                    <div className="card-elevated flex flex-col items-center gap-2 px-5 py-14 text-center">
                        <AlertTriangle size={28} strokeWidth={1.2} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
                        <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark">No existen registros</p>
                        <p className="text-[11px] text-ink-muted/60 dark:text-ink-muted-dark/60">Aún no se ha registrado hiperandrogenismo para esta paciente</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4">
                        {/* Listado principal */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-[12px] font-semibold text-ink dark:text-ink-dark">Registros cronológicos</p>
                                <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Mostrando {registrosPaginados.length} de {registros.length}</p>
                            </div>

                            {registrosPaginados.map((r, idx) => (
                                <RegistroCard key={r.id_historia_hiperandrogenica} registro={r} numero={registros.length - ((pagina - 1) * porPagina + idx)} />
                            ))}

                            {totalPaginas > 1 && (
                                <div className="flex items-center justify-center gap-1 pt-2">
                                    {Array.from({ length: totalPaginas }, (_, i) => (
                                        <button key={i} type="button" onClick={() => setPagina(i + 1)} className={clsx('flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-semibold transition-colors', pagina === i + 1 ? 'bg-brand-green text-white' : 'text-ink-muted hover:bg-[#F5F3EE] dark:text-ink-muted-dark dark:hover:bg-white/[0.04]')}>
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Panel lateral: Gráfico de evolución */}
                        {registros.length >= 2 && (
                            <aside className="lg:sticky lg:top-20 lg:self-start">
                                <GraficoEvolucionHA registros={registros} />
                            </aside>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}


/* ═══ Card de registro ═══ */

function RegistroCard({ registro: r, numero }: { registro: RegistroHistorial; numero: number }) {
    const signos = [
        r.acne && `Acné (${formatGrado(r.acne_grado)})`,
        r.hirsutismo && 'Hirsutismo',
        r.alopecia_androgenica && 'Alopecia',
        r.seborrea && 'Seborrea',
    ].filter(Boolean) as string[];

    const ferrimanAlto = (r.puntaje_ferriman_gallwey ?? 0) >= 8;

    return (
        <div className="card-elevated overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-border dark:border-surface-border-dark">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-orange/10 text-[9px] font-bold text-brand-orange">
                        {numero}
                    </div>
                    <p className="text-[11.5px] font-semibold text-ink dark:text-ink-dark">Evaluación #{numero}</p>
                    <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{r.created_at ?? ''}</span>
                </div>
                {r.progresion_sintomas && (
                    <Badge color={r.progresion_sintomas === 'progresivo' ? 'red' : r.progresion_sintomas === 'regresivo' ? 'green' : 'gray'}>
                        {formatProgresion(r.progresion_sintomas)}
                    </Badge>
                )}
            </div>

            <div className="px-4 py-3 flex flex-col lg:flex-row lg:items-start gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 flex-1">
                    <DatoCompacto label="F-G" valor={r.puntaje_ferriman_gallwey != null ? `${r.puntaje_ferriman_gallwey} pts` : '—'} color={ferrimanAlto ? 'text-brand-orange' : 'text-ink dark:text-ink-dark'} />
                    <DatoCompacto label="Acné" valor={r.acne ? formatGrado(r.acne_grado) : 'No'} color={r.acne && (r.acne_grado === 'moderado' || r.acne_grado === 'severo') ? 'text-category-fruits' : 'text-ink dark:text-ink-dark'} />
                    <DatoCompacto label="Alopecia" valor={r.alopecia_androgenica ? 'Sí' : 'No'} color={r.alopecia_androgenica ? 'text-category-dairy' : 'text-ink dark:text-ink-dark'} />
                    <DatoCompacto label="Inicio" valor={r.inicio_sintomas ?? '—'} color="text-ink dark:text-ink-dark" />
                </div>

                {signos.length > 0 && (
                    <div className="flex flex-wrap gap-1 lg:max-w-[180px]">
                        {signos.map((s) => (
                            <Badge key={s} color="orange">{s}</Badge>
                        ))}
                    </div>
                )}
            </div>

            {r.observaciones && (
                <div className="px-4 pb-2.5">
                    <div className="rounded-md bg-black/[0.02] px-2.5 py-1.5 dark:bg-white/[0.02]">
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">{r.observaciones}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══ Gráfico de evolución ═══ */

function GraficoEvolucionHA({ registros }: { registros: RegistroHistorial[] }) {
    const ordenados = [...registros].reverse();
    const ferriman = ordenados.map(r => r.puntaje_ferriman_gallwey ?? null);
    const fechas = ordenados.map(r => r.created_at ?? '—');
    const tieneFerriman = ferriman.some(v => v !== null);

    // Conteo de signos por registro
    const conteoSignos = ordenados.map(r => {
        let c = 0;
        if (r.acne) c++;
        if (r.hirsutismo) c++;
        if (r.alopecia_androgenica) c++;
        if (r.seborrea) c++;
        return c;
    });

    return (
        <div className="card-elevated p-5 space-y-5">
            <p className="flex items-center gap-2 text-[13px] font-bold text-ink dark:text-ink-dark">
                <TrendingUp size={15} strokeWidth={1.8} className="text-brand-orange" />
                Evolución del hiperandrogenismo
            </p>

            {tieneFerriman && (
                <GraficoLinea label="Ferriman-Gallwey" valores={ferriman} fechas={fechas} rangoMin={0} rangoMax={8} colorLinea="#FF9800" colorPunto="#E65100" />
            )}

            <GraficoLinea label="Signos clínicos presentes" valores={conteoSignos} fechas={fechas} rangoMin={0} rangoMax={2} colorLinea="#9C27B0" colorPunto="#6A1B9A" />
        </div>
    );
}

function GraficoLinea({ label, valores, fechas, rangoMin, rangoMax, colorLinea, colorPunto }: {
    label: string; valores: (number | null)[]; fechas: string[];
    rangoMin: number; rangoMax: number; colorLinea: string; colorPunto: string;
}) {
    const valoresValidos = valores.map((v, i) => v !== null ? { valor: v, idx: i } : null).filter(Boolean) as { valor: number; idx: number }[];
    if (valoresValidos.length < 2) return null;

    const maxVal = Math.max(...valoresValidos.map(v => v.valor), rangoMax) * 1.15;
    const rango = maxVal || 1;

    const W = 380;
    const H = 160;
    const padL = 35;
    const padR = 15;
    const padT = 22;
    const padB = 28;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const puntos = valoresValidos.map((v, i) => ({
        x: padL + (i / (valoresValidos.length - 1)) * chartW,
        y: padT + chartH - (v.valor / rango) * chartH,
        valor: v.valor,
        fecha: fechas[v.idx],
    }));

    const polyline = puntos.map(p => `${p.x},${p.y}`).join(' ');
    const yUmbral = padT + chartH - (rangoMax / rango) * chartH;

    return (
        <div className="group/chart cursor-pointer transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10.5px] font-semibold text-ink dark:text-ink-dark">{label}</p>
                <p className="text-[9px] rounded bg-brand-orange/10 px-1.5 py-0.5 text-brand-orange font-medium">
                    Umbral: {rangoMax}
                </p>
            </div>
            <div className="rounded-xl border border-surface-border bg-[#FDFCFA] p-2.5 transition-all group-hover/chart:border-brand-orange/40 group-hover/chart:shadow-lg group-hover/chart:shadow-brand-orange/5 dark:border-surface-border-dark dark:bg-[#1A1D24] dark:group-hover/chart:border-brand-orange/30">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[150px]">
                    {/* Línea de umbral */}
                    <line x1={padL} y1={yUmbral} x2={W - padR} y2={yUmbral} stroke={colorLinea} strokeWidth="0.5" strokeDasharray="4,3" opacity="0.5" />
                    {/* Zona por encima del umbral */}
                    <rect x={padL} y={padT} width={chartW} height={yUmbral - padT} fill={colorLinea} opacity="0.04" rx="3" />

                    {/* Línea de datos */}
                    <polyline points={polyline} fill="none" stroke={colorLinea} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Puntos */}
                    {puntos.map((p, i) => {
                        const sobreUmbral = p.valor >= rangoMax;
                        return (
                            <g key={i}>
                                <line x1={p.x} y1={p.y} x2={p.x} y2={padT + chartH} stroke={colorLinea} strokeWidth="0.5" opacity="0.15" strokeDasharray="2,2" />
                                <circle cx={p.x} cy={p.y} r="4" fill={colorPunto} stroke="white" strokeWidth="1.5" />
                                <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="8" fontWeight="700" fill={sobreUmbral ? '#E65100' : colorPunto}>
                                    {p.valor}
                                </text>
                                <text x={p.x} y={H - 4} textAnchor="middle" fontSize="7" className="fill-ink-muted dark:fill-ink-muted-dark" fontWeight="500">
                                    {p.fecha?.slice(5) ?? ''}
                                </text>
                            </g>
                        );
                    })}
                </svg>
                <div className="mt-2 flex items-center justify-between px-1">
                    <span className="text-[9px] text-ink-muted dark:text-ink-muted-dark">Último:</span>
                    <span className={clsx('text-[11px] font-bold', valoresValidos[valoresValidos.length - 1].valor >= rangoMax ? 'text-brand-orange' : 'text-brand-green-dark dark:text-brand-green')}>
                        {valoresValidos[valoresValidos.length - 1].valor}
                    </span>
                </div>
            </div>
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

function formatGrado(grado: string): string {
    const map: Record<string, string> = { no_aplica: 'N/A', leve: 'Leve', moderado: 'Moderado', severo: 'Severo' };
    return map[grado] ?? grado;
}

function formatProgresion(progresion: string): string {
    const map: Record<string, string> = { estable: 'Estable', progresivo: 'Progresivo', regresivo: 'Regresivo' };
    return map[progresion] ?? progresion;
}
