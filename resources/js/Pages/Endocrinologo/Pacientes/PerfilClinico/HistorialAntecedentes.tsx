import { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Stethoscope, Calendar, User, Users, Pill, FileDown, Activity, Clock3 } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import AvatarPaciente from '@/Components/ui/avatar-paciente';
import clsx from 'clsx';
import type { PageProps } from '@/types';
import type { AntecedentesData } from './tipos';

interface RegistroHistorial extends AntecedentesData {
    estado?: string;
    created_at?: string | null;
    updated_at?: string | null;
}

interface Props extends PageProps {
    paciente: { id_paciente: number; nombre_completo: string; ci: string; avatar_url?: string | null };
    registros: RegistroHistorial[];
}

export default function HistorialAntecedentes({ paciente, registros }: Props) {
    const id = paciente.id_paciente;
    const [pagina, setPagina] = useState(1);
    const [condicion, setCondicion] = useState('');
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');
    const porPagina = 10;

    const registrosFiltrados = useMemo(() => {
        return registros.filter((r) => {
            if (condicion && !(r as unknown as Record<string, boolean>)[condicion]) return false;
            const fecha = (r.created_at ?? '').slice(0, 10);
            if (desde && fecha < desde) return false;
            if (hasta && fecha > hasta) return false;
            return true;
        });
    }, [registros, condicion, desde, hasta]);

    const totalPaginas = Math.ceil(registrosFiltrados.length / porPagina);
    const registrosPaginados = registrosFiltrados.slice((pagina - 1) * porPagina, pagina * porPagina);

    const urlPdf = useMemo(() => {
        const params = new URLSearchParams();
        if (condicion) params.set('condicion', condicion);
        if (desde) params.set('desde', desde);
        if (hasta) params.set('hasta', hasta);
        const qs = params.toString();
        return `/endocrinologo/pacientes/${id}/antecedentes/reporte-pdf${qs ? `?${qs}` : ''}`;
    }, [id, condicion, desde, hasta]);

    const hayFiltros = condicion || desde || hasta;
    const limpiar = () => { setCondicion(''); setDesde(''); setHasta(''); setPagina(1); };
    const registroActual = registros[0];
    const resumenActual = registroActual ? {
        personales: [registroActual.diabetes_personal, registroActual.hipertension_personal, registroActual.dislipidemia_personal, registroActual.enfermedad_tiroidea, registroActual.hiperprolactinemia_previa].filter(Boolean).length,
        familiares: [registroActual.diabetes_familiar, registroActual.hipertension_familiar, registroActual.dislipidemia_familiar].filter(Boolean).length,
        medicamentos: [registroActual.uso_metformina, registroActual.uso_anticonceptivos, registroActual.uso_corticoides].filter(Boolean).length,
    } : null;

    return (
        <AuthenticatedLayout title="Historial antecedentes">
            <Head title={`Historial antecedentes: ${paciente.nombre_completo}`} />

            <div className="space-y-5">
                {/* Cabecera */}
                <div className="card-elevated overflow-hidden">
                    <div className="relative h-20 bg-gradient-to-r from-category-dairy/10 via-category-dairy/5 to-transparent dark:from-category-dairy/[0.08] dark:via-category-dairy/[0.03] dark:to-transparent">
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-category-dairy/[0.06]" />
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
                                <AvatarPaciente nombre={paciente.nombre_completo} avatarUrl={paciente.avatar_url} size="lg" />
                            </div>
                            <div className="flex-1 pb-1">
                                <h1 className="text-[18px] font-bold text-ink dark:text-ink-dark leading-tight">{paciente.nombre_completo}</h1>
                                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark mt-0.5">CI: {paciente.ci}</p>
                            </div>
                            <div className="pb-1">
                                <div className="flex items-center gap-1.5 rounded-lg bg-category-dairy/10 px-3 py-1.5 dark:bg-category-dairy/[0.08]">
                                    <Calendar size={12} strokeWidth={1.8} className="text-category-dairy" />
                                    <span className="text-[11px] font-semibold text-category-dairy">{registros.length} registro{registros.length !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-surface-border dark:border-surface-border-dark">
                            <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark">
                                Historial de antecedentes endocrino-metabólicos. Seguimiento de cambios en factores de riesgo.
                            </p>
                        </div>
                    </div>
                </div>

                {registroActual && resumenActual && (
                    <section className="card-elevated overflow-hidden">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border px-5 py-4 dark:border-surface-border-dark">
                            <div>
                                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-category-dairy"><Activity size={12} /> Perfil actual</p>
                                <h2 className="mt-1 text-[15px] font-bold text-ink dark:text-ink-dark">Lectura del registro más reciente</h2>
                                <p className="mt-0.5 text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Diferencia los factores personales, familiares y el tratamiento registrado.</p>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-lg bg-black/[0.025] px-3 py-2 text-[10.5px] text-ink-muted dark:bg-white/[0.035] dark:text-ink-muted-dark"><Clock3 size={12} /> Actualizado {registroActual.updated_at ?? registroActual.created_at ?? 'sin fecha'}</div>
                        </div>
                        <div className="grid gap-3 p-4 sm:grid-cols-3">
                            <ResumenActual icono={<User size={16} />} titulo="Antecedentes personales" cantidad={resumenActual.personales} detalle={resumenActual.personales ? 'Factores clínicos propios registrados' : 'Sin antecedentes personales activos'} tono="orange" />
                            <ResumenActual icono={<Users size={16} />} titulo="Antecedentes familiares" cantidad={resumenActual.familiares} detalle={resumenActual.familiares ? 'Factores hereditarios para seguimiento' : 'Sin antecedentes familiares activos'} tono="purple" />
                            <ResumenActual icono={<Pill size={16} />} titulo="Medicación relacionada" cantidad={resumenActual.medicamentos} detalle={resumenActual.medicamentos ? 'Tratamientos declarados actualmente' : 'Sin medicación marcada'} tono="blue" />
                        </div>
                    </section>
                )}

                {/* Barra de filtros + PDF */}
                {registros.length > 0 && (
                    <div className="card-elevated p-4">
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="flex-1 min-w-[180px]">
                                <label className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark mb-1 block">Condición</label>
                                <select value={condicion} onChange={(e) => { setCondicion(e.target.value); setPagina(1); }}
                                    className="w-full rounded-lg border border-surface-border bg-[#FAF9F6] px-3 py-2 text-[12px] text-ink outline-none focus:border-brand-green/50 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark">
                                    <option value="">Todas</option>
                                    <option value="diabetes_personal">Diabetes (personal)</option>
                                    <option value="diabetes_familiar">Diabetes (familiar)</option>
                                    <option value="hipertension_personal">Hipertensión (personal)</option>
                                    <option value="hipertension_familiar">Hipertensión (familiar)</option>
                                    <option value="dislipidemia_personal">Dislipidemia (personal)</option>
                                    <option value="dislipidemia_familiar">Dislipidemia (familiar)</option>
                                    <option value="enfermedad_tiroidea">Enf. tiroidea</option>
                                    <option value="hiperprolactinemia_previa">Hiperprolactinemia</option>
                                    <option value="uso_anticonceptivos">Uso anticonceptivos</option>
                                    <option value="uso_metformina">Uso metformina</option>
                                    <option value="uso_corticoides">Uso corticoides</option>
                                </select>
                            </div>
                            <div className="min-w-[120px]">
                                <label className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark mb-1 block">Desde</label>
                                <input type="date" value={desde} onChange={(e) => { setDesde(e.target.value); setPagina(1); }}
                                    className="w-full rounded-lg border border-surface-border bg-[#FAF9F6] px-3 py-2 text-[12px] text-ink outline-none focus:border-brand-green/50 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" />
                            </div>
                            <div className="min-w-[120px]">
                                <label className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark mb-1 block">Hasta</label>
                                <input type="date" value={hasta} onChange={(e) => { setHasta(e.target.value); setPagina(1); }}
                                    className="w-full rounded-lg border border-surface-border bg-[#FAF9F6] px-3 py-2 text-[12px] text-ink outline-none focus:border-brand-green/50 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" />
                            </div>
                            {hayFiltros && (
                                <button type="button" onClick={limpiar} className="rounded-lg px-3 py-2 text-[11px] font-semibold text-ink-muted hover:bg-black/[0.03] dark:text-ink-muted-dark dark:hover:bg-white/[0.04]">
                                    Limpiar
                                </button>
                            )}
                            <a href={urlPdf} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-green/15 px-4 py-2 text-[11.5px] font-semibold text-brand-green-dark hover:bg-brand-green/25 dark:text-brand-green transition-colors">
                                <FileDown size={14} strokeWidth={1.8} /> Descargar PDF
                            </a>
                        </div>
                        {hayFiltros && (
                            <p className="mt-2.5 text-[10.5px] text-ink-muted dark:text-ink-muted-dark">
                                {registrosFiltrados.length} de {registros.length} registros coinciden con los filtros.
                            </p>
                        )}
                    </div>
                )}

                {registros.length === 0 ? (
                    <div className="card-elevated flex flex-col items-center gap-2 px-5 py-14 text-center">
                        <Stethoscope size={28} strokeWidth={1.2} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
                        <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark">No existen registros</p>
                        <p className="text-[11px] text-ink-muted/60 dark:text-ink-muted-dark/60">Aún no se han registrado antecedentes para esta paciente</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-[12px] font-semibold text-ink dark:text-ink-dark">Registros cronológicos</p>
                            <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Mostrando {registrosPaginados.length} de {registrosFiltrados.length}</p>
                        </div>

                        {registrosFiltrados.length === 0 ? (
                            <div className="card-elevated px-5 py-10 text-center">
                                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark">Ningún registro coincide con los filtros.</p>
                            </div>
                        ) : registrosPaginados.map((r, idx) => (
                            <RegistroCard key={r.id_antecedente} registro={r} numero={registrosFiltrados.length - ((pagina - 1) * porPagina + idx)} />
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
                )}
            </div>
        </AuthenticatedLayout>
    );
}


/* ═══ Card de registro ═══ */

function ResumenActual({ icono, titulo, cantidad, detalle, tono }: { icono: React.ReactNode; titulo: string; cantidad: number; detalle: string; tono: 'orange' | 'purple' | 'blue' }) {
    const estilos = {
        orange: 'border-orange-500/20 bg-orange-500/[0.06] text-orange-400',
        purple: 'border-purple-500/20 bg-purple-500/[0.06] text-purple-400',
        blue: 'border-sky-500/20 bg-sky-500/[0.06] text-sky-400',
    }[tono];

    return <div className={clsx('rounded-xl border p-4', estilos)}><div className="flex items-start justify-between gap-3"><div className="rounded-lg bg-black/5 p-2 dark:bg-white/5">{icono}</div><span className="text-[22px] font-black leading-none">{cantidad}</span></div><p className="mt-3 text-[12px] font-bold text-ink dark:text-ink-dark">{titulo}</p><p className="mt-1 text-[10px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">{detalle}</p></div>;
}

function RegistroCard({ registro: r, numero }: { registro: RegistroHistorial; numero: number }) {
    const personales = [
        r.diabetes_personal && 'Diabetes',
        r.hipertension_personal && 'Hipertensión',
        r.dislipidemia_personal && 'Dislipidemia',
        r.enfermedad_tiroidea && 'Enf. tiroidea',
        r.hiperprolactinemia_previa && 'Hiperprolactinemia',
    ].filter(Boolean) as string[];

    const familiares = [
        r.diabetes_familiar && 'Diabetes',
        r.hipertension_familiar && 'Hipertensión',
        r.dislipidemia_familiar && 'Dislipidemia',
    ].filter(Boolean) as string[];

    const medicamentos = [
        r.uso_metformina && 'Metformina',
        r.uso_anticonceptivos && 'Anticonceptivos',
        r.uso_corticoides && 'Corticoides',
    ].filter(Boolean) as string[];

    const tieneHallazgos = personales.length > 0 || familiares.length > 0;

    return (
        <div className="card-elevated overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-border dark:border-surface-border-dark">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-category-dairy/10 text-[9px] font-bold text-category-dairy">
                        {numero}
                    </div>
                    <p className="text-[11.5px] font-semibold text-ink dark:text-ink-dark">Registro #{numero}</p>
                    <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{r.created_at ?? ''}</span>
                </div>
                <Badge color={tieneHallazgos ? 'orange' : 'green'}>
                    {tieneHallazgos ? 'Relevantes' : 'Sin hallazgos'}
                </Badge>
            </div>

            {/* Contenido */}
            <div className="px-4 py-3 space-y-3">
                {/* Personales + Familiares en fila */}
                <div className="grid gap-2 md:grid-cols-3">
                    {personales.length > 0 && (
                        <div className="rounded-xl border border-orange-500/15 bg-orange-500/[0.035] p-3">
                            <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1.5">
                                <User size={9} strokeWidth={2} className="text-category-fruits" /> Personales
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {personales.map((p) => <Badge key={p} color="orange">{p}</Badge>)}
                            </div>
                        </div>
                    )}
                    {familiares.length > 0 && (
                        <div className="rounded-xl border border-purple-500/15 bg-purple-500/[0.035] p-3">
                            <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1.5">
                                <Users size={9} strokeWidth={2} className="text-category-dairy" /> Familiares
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {familiares.map((f) => <Badge key={f} color="purple">{f}</Badge>)}
                            </div>
                        </div>
                    )}
                    {medicamentos.length > 0 && (
                        <div className="rounded-xl border border-sky-500/15 bg-sky-500/[0.035] p-3">
                            <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1.5">
                                <Pill size={9} strokeWidth={2} className="text-category-others" /> Medicamentos
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {medicamentos.map((m) => <Badge key={m} color="blue">{m}</Badge>)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Otros medicamentos */}
                {r.otros_medicamentos && (
                    <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                        <span className="font-semibold">Otros:</span> {r.otros_medicamentos}
                    </p>
                )}
            </div>

            {/* Observaciones */}
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
