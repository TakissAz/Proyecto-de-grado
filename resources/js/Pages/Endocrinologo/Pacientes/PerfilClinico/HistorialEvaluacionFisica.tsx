import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Activity, Calendar, TrendingUp, Scale } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import AvatarIniciales from '@/Components/ui/avatar-iniciales';
import clsx from 'clsx';
import type { PageProps } from '@/types';
import type { EvaluacionFisicaData } from './tipos';

interface RegistroHistorial extends EvaluacionFisicaData {
    estado?: string;
    created_at?: string | null;
    updated_at?: string | null;
}

interface Props extends PageProps {
    paciente: { id_paciente: number; nombre_completo: string; ci: string };
    registros: RegistroHistorial[];
}

export default function HistorialEvaluacionFisica({ paciente, registros }: Props) {
    const id = paciente.id_paciente;
    const [pagina, setPagina] = useState(1);
    const porPagina = 10;
    const totalPaginas = Math.ceil(registros.length / porPagina);
    const registrosPaginados = registros.slice((pagina - 1) * porPagina, pagina * porPagina);

    return (
        <AuthenticatedLayout title="Historial evaluación física">
            <Head title={`Historial evaluación física: ${paciente.nombre_completo}`} />

            <div className="space-y-5">
                {/* Cabecera */}
                <div className="card-elevated overflow-hidden">
                    <div className="relative h-20 bg-gradient-to-r from-brand-green/10 via-brand-green/5 to-transparent dark:from-brand-green/[0.08] dark:via-brand-green/[0.03] dark:to-transparent">
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-green/[0.06]" />
                        <Link href={`/endocrinologo/pacientes/${id}/perfil-clinico`} className="absolute left-5 top-5 flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-ink backdrop-blur-sm transition-colors hover:bg-white dark:bg-black/40 dark:text-ink-dark dark:hover:bg-black/60">
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
                            <div className="pb-1">
                                <div className="flex items-center gap-1.5 rounded-lg bg-brand-green/10 px-3 py-1.5 dark:bg-brand-green/[0.08]">
                                    <Calendar size={12} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" />
                                    <span className="text-[11px] font-semibold text-brand-green-dark dark:text-brand-green">{registros.length} registro{registros.length !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-surface-border dark:border-surface-border-dark">
                            <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark">Historial de evaluaciones físicas endocrinas. Seguimiento de medidas antropométricas y signos clínicos.</p>
                        </div>
                    </div>
                </div>

                {registros.length === 0 ? (
                    <div className="card-elevated flex flex-col items-center gap-2 px-5 py-14 text-center">
                        <Activity size={28} strokeWidth={1.2} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
                        <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark">No existen registros</p>
                        <p className="text-[11px] text-ink-muted/60 dark:text-ink-muted-dark/60">Aún no se ha registrado evaluación física para esta paciente</p>
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
                                <RegistroCard key={r.id_evaluacion_fisica} registro={r} numero={registros.length - ((pagina - 1) * porPagina + idx)} />
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

                        {/* Panel lateral: Gráficos */}
                        {registros.length >= 2 && (
                            <aside className="lg:sticky lg:top-20 lg:self-start">
                                <GraficoEvolucionFisica registros={registros} />
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
    const hallazgos = [
        r.acantosis_nigricans && 'Acantosis',
        r.skin_tags && 'Acrocordones',
        r.hirsutismo_visible && 'Hirsutismo',
        r.acne_visible && 'Acné',
        r.alopecia_visible && 'Alopecia',
        r.galactorrea && 'Galactorrea',
    ].filter(Boolean) as string[];

    return (
        <div className="card-elevated overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-border dark:border-surface-border-dark">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-green/10 text-[9px] font-bold text-brand-green-dark dark:text-brand-green">
                        {numero}
                    </div>
                    <p className="text-[11.5px] font-semibold text-ink dark:text-ink-dark">Evaluación #{numero}</p>
                    <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{r.created_at ?? ''}</span>
                </div>
                {r.imc != null && (
                    <Badge color={r.imc >= 30 ? 'red' : r.imc >= 25 ? 'orange' : 'green'}>
                        IMC {r.imc}
                    </Badge>
                )}
            </div>

            <div className="px-4 py-3 flex flex-col lg:flex-row lg:items-start gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
                    <DatoCompacto label="Peso" valor={r.peso != null ? `${r.peso} kg` : '—'} />
                    <DatoCompacto label="Talla" valor={r.talla != null ? `${r.talla} m` : '—'} />
                    <DatoCompacto label="IMC" valor={r.imc != null ? `${r.imc}` : '—'} color={r.imc != null && r.imc >= 25 ? 'text-brand-orange' : 'text-ink dark:text-ink-dark'} />
                    <DatoCompacto label="Cintura" valor={r.circunferencia_cintura != null ? `${r.circunferencia_cintura} cm` : '—'} color={r.circunferencia_cintura != null && r.circunferencia_cintura >= 80 ? 'text-brand-orange' : 'text-ink dark:text-ink-dark'} />
                    <DatoCompacto label="PA" valor={r.presion_sistolica && r.presion_diastolica ? `${r.presion_sistolica}/${r.presion_diastolica}` : '—'} color={r.presion_sistolica != null && r.presion_sistolica >= 130 ? 'text-category-fruits' : 'text-ink dark:text-ink-dark'} />
                    <DatoCompacto label="ICC" valor={r.indice_cintura_cadera != null ? `${r.indice_cintura_cadera}` : '—'} color={r.indice_cintura_cadera != null && r.indice_cintura_cadera >= 0.85 ? 'text-brand-orange' : 'text-ink dark:text-ink-dark'} />
                </div>

                {hallazgos.length > 0 && (
                    <div className="flex flex-wrap gap-1 lg:max-w-[160px]">
                        {hallazgos.map((h) => <Badge key={h} color="orange">{h}</Badge>)}
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

/* ═══ Gráficos de evolución ═══ */

function GraficoEvolucionFisica({ registros }: { registros: RegistroHistorial[] }) {
    const ordenados = [...registros].reverse();
    const pesos = ordenados.map(r => r.peso ?? null);
    const imcs = ordenados.map(r => r.imc ?? null);
    const cinturas = ordenados.map(r => r.circunferencia_cintura ?? null);
    const fechas = ordenados.map(r => r.created_at ?? '—');

    const tienePeso = pesos.some(v => v !== null);
    const tieneIMC = imcs.some(v => v !== null);
    const tieneCintura = cinturas.some(v => v !== null);

    return (
        <div className="card-elevated p-5 space-y-5">
            <p className="flex items-center gap-2 text-[13px] font-bold text-ink dark:text-ink-dark">
                <TrendingUp size={15} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" />
                Evolución antropométrica
            </p>

            {tienePeso && <GraficoLinea label="Peso" unidad="kg" valores={pesos} fechas={fechas} rangoMin={50} rangoMax={75} colorLinea="#4CAF50" colorPunto="#2E7D32" />}
            {tieneIMC && <GraficoLinea label="IMC" unidad="" valores={imcs} fechas={fechas} rangoMin={18.5} rangoMax={25} colorLinea="#FF9800" colorPunto="#E65100" />}
            {tieneCintura && <GraficoLinea label="Cintura" unidad="cm" valores={cinturas} fechas={fechas} rangoMin={60} rangoMax={80} colorLinea="#9C27B0" colorPunto="#6A1B9A" />}
        </div>
    );
}

function GraficoLinea({ label, unidad, valores, fechas, rangoMin, rangoMax, colorLinea, colorPunto }: {
    label: string; unidad: string; valores: (number | null)[]; fechas: string[];
    rangoMin: number; rangoMax: number; colorLinea: string; colorPunto: string;
}) {
    const valoresValidos = valores.map((v, i) => v !== null ? { valor: v, idx: i } : null).filter(Boolean) as { valor: number; idx: number }[];
    if (valoresValidos.length < 2) return null;

    const maxVal = Math.max(...valoresValidos.map(v => v.valor), rangoMax) * 1.1;
    const minVal = Math.min(...valoresValidos.map(v => v.valor), rangoMin) * 0.9;
    const rango = maxVal - minVal || 1;

    const W = 380; const H = 140;
    const padL = 35; const padR = 15; const padT = 20; const padB = 25;
    const chartW = W - padL - padR; const chartH = H - padT - padB;

    const puntos = valoresValidos.map((v, i) => ({
        x: padL + (i / (valoresValidos.length - 1)) * chartW,
        y: padT + chartH - ((v.valor - minVal) / rango) * chartH,
        valor: v.valor, fecha: fechas[v.idx],
    }));

    const polyline = puntos.map(p => `${p.x},${p.y}`).join(' ');
    const yUmbral = padT + chartH - ((rangoMax - minVal) / rango) * chartH;

    return (
        <div className="group/chart cursor-pointer transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10.5px] font-semibold text-ink dark:text-ink-dark">{label} {unidad && `(${unidad})`}</p>
                <p className="text-[9px] rounded bg-brand-green/10 px-1.5 py-0.5 text-brand-green-dark dark:bg-brand-green/5 dark:text-brand-green font-medium">Umbral: {rangoMax}</p>
            </div>
            <div className="rounded-xl border border-surface-border bg-[#FDFCFA] p-2.5 transition-all group-hover/chart:border-brand-green/40 group-hover/chart:shadow-lg group-hover/chart:shadow-brand-green/5 dark:border-surface-border-dark dark:bg-[#1A1D24] dark:group-hover/chart:border-brand-green/30">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[130px]">
                    <line x1={padL} y1={yUmbral} x2={W - padR} y2={yUmbral} stroke={colorLinea} strokeWidth="0.5" strokeDasharray="4,3" opacity="0.4" />
                    <rect x={padL} y={padT} width={chartW} height={yUmbral - padT} fill={colorLinea} opacity="0.04" rx="3" />
                    <polyline points={polyline} fill="none" stroke={colorLinea} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {puntos.map((p, i) => (
                        <g key={i}>
                            <line x1={p.x} y1={p.y} x2={p.x} y2={padT + chartH} stroke={colorLinea} strokeWidth="0.4" opacity="0.15" strokeDasharray="2,2" />
                            <circle cx={p.x} cy={p.y} r="4" fill={colorPunto} stroke="white" strokeWidth="1.5" />
                            <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="8" fontWeight="700" fill={p.valor > rangoMax ? '#E65100' : colorPunto}>{p.valor}</text>
                            <text x={p.x} y={H - 4} textAnchor="middle" fontSize="7" className="fill-ink-muted dark:fill-ink-muted-dark" fontWeight="500">{p.fecha?.slice(5) ?? ''}</text>
                        </g>
                    ))}
                </svg>
                <div className="mt-2 flex items-center justify-between px-1">
                    <span className="text-[9px] text-ink-muted dark:text-ink-muted-dark">Último:</span>
                    <span className={clsx('text-[11px] font-bold', valoresValidos[valoresValidos.length - 1].valor > rangoMax ? 'text-brand-orange' : 'text-brand-green-dark dark:text-brand-green')}>
                        {valoresValidos[valoresValidos.length - 1].valor} {unidad}
                    </span>
                </div>
            </div>
        </div>
    );
}

function DatoCompacto({ label, valor, color }: { label: string; valor: string; color?: string }) {
    return (
        <div className="rounded-lg bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03]">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">{label}</p>
            <p className={clsx('text-[12.5px] font-bold', color ?? 'text-ink dark:text-ink-dark')}>{valor}</p>
        </div>
    );
}
