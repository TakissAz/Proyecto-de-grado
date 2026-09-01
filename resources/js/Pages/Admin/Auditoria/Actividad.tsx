declare const route: any;

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { X, Search, History, ArrowLeft, UserRound, CalendarClock } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Boton, BotonLink } from '@/Components/ui/boton';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

interface ActivityUser { id: number; name: string; email?: string | null; roles?: { nombre: string }[]; }

interface ActivityRow {
    id: number;
    log_name?: string | null;
    description: string;
    event?: string | null;
    created_at?: string | null;
    causer?: ActivityUser | null;
    subject_type?: string | null;
    subject_id?: number | null;
    properties?: { attributes?: Record<string, unknown>; old?: Record<string, unknown>; [key:string]: unknown };
}

interface PaginatedActivities {
    data?: ActivityRow[];
    links?: Array<{ url: string | null; label: string; active: boolean }>;
    meta?: { current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null; };
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    from?: number | null;
    to?: number | null;
}

interface Filters { buscar: string; paciente: string; }

interface Props extends PageProps {
    actividades: PaginatedActivities;
    filtros: Filters;
    pacienteSeleccionada?: {id_paciente:number;nombre_completo:string;ci:string;email?:string|null;estado:string;created_at?:string|null;updated_at?:string|null}|null;
}

export default function Actividad({ actividades, filtros, pacienteSeleccionada }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [paciente, setPaciente] = useState(filtros.paciente ?? '');

    useEffect(() => {
        setBuscar(filtros.buscar ?? '');
        setPaciente(filtros.paciente ?? '');
    }, [filtros.buscar, filtros.paciente]);

    const applyFilters = (page = 1) => {
        router.get(route('admin.auditoria.actividad'), { buscar, paciente, page }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const clearFilters = () => {
        setBuscar(''); setPaciente('');
        router.get(route('admin.auditoria.actividad'), {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const filas = actividades?.data ?? [];
    const enlaces = actividades?.links ?? [];
    const pageCount = actividades?.meta?.last_page ?? actividades?.last_page ?? 1;
    const total = actividades?.meta?.total ?? actividades?.total ?? filas.length;

    return (
        <AuthenticatedLayout header={<h2>Actividad de pacientes</h2>}>
            <Head title="Actividad de pacientes" />

            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green/12 text-brand-green-dark dark:text-brand-green">
                            <History size={20} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-[18px] font-bold text-ink dark:text-ink-dark">Actividad</h2>
                            <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark">Eventos generados por el módulo de pacientes.</p>
                        </div>
                    </div>
                    <BotonLink href={route('admin.auditoria.pacientes')} variante="outline" tamano="md">
                        <ArrowLeft size={14} strokeWidth={1.8} /> Volver a pacientes
                    </BotonLink>
                </div>

                {pacienteSeleccionada && <section className="card-elevated border-brand-green/20 p-4"><div className="flex flex-wrap items-center gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green"><UserRound size={20}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold">Historial de {pacienteSeleccionada.nombre_completo}</h3><span className="rounded-md bg-brand-green/10 px-2 py-1 text-[9px] font-bold capitalize text-brand-green">{pacienteSeleccionada.estado}</span></div><p className="mt-1 text-[10px] text-ink-muted">CI {pacienteSeleccionada.ci} · {pacienteSeleccionada.email||'Sin correo'} · Expediente #{pacienteSeleccionada.id_paciente}</p></div><div className="flex items-center gap-2 text-[10px] text-ink-muted"><CalendarClock size={14}/><div><p>Creado: {pacienteSeleccionada.created_at||'—'}</p><p>Último cambio: {pacienteSeleccionada.updated_at||'—'}</p></div></div></div></section>}

                {/* Filtros */}
                <form className="card-elevated p-4" onSubmit={(e) => { e.preventDefault(); applyFilters(1); }}>
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3 items-end">
                        <label className="block">
                            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">Buscar</span>
                            <div className="relative">
                                <Search size={14} strokeWidth={1.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted/60 dark:text-ink-muted-dark/60" />
                                <input type="text"
                                    className="w-full rounded-lg border border-surface-border bg-[#FAF9F6] py-2 pl-9 pr-3 text-[12.5px] text-ink outline-none transition-colors placeholder:text-ink-muted/50 focus:border-brand-green/50 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                                    placeholder="Evento, descripción o usuario" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
                            </div>
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">Paciente ID</span>
                            <input type="number" min="1"
                                className="w-full rounded-lg border border-surface-border bg-[#FAF9F6] px-3 py-2 text-[12.5px] text-ink outline-none transition-colors focus:border-brand-green/50 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                                value={paciente} onChange={(e) => setPaciente(e.target.value)} />
                        </label>
                        <div className="flex gap-2 items-end">
                            <Boton type="submit" tamano="md">Filtrar</Boton>
                            <Boton type="button" variante="ghost" tamano="md" onClick={clearFilters}><X size={14} strokeWidth={1.8} /> Limpiar</Boton>
                        </div>
                    </div>
                </form>

                {/* Tabla */}
                <div className="card-elevated overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-surface-border text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark">
                                    <th className="px-4 py-3">Fecha</th>
                                    <th className="px-4 py-3">Evento</th>
                                    <th className="px-4 py-3">Descripción</th>
                                    <th className="px-4 py-3">Responsable</th>
                                    <th className="px-4 py-3">Registro afectado</th>
                                    <th className="px-4 py-3">Cambios</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border dark:divide-surface-border-dark">
                                {filas.length === 0 ? (
                                    <tr><td colSpan={6} className="px-4 py-12 text-center text-[12px] text-ink-muted dark:text-ink-muted-dark">No se encontraron actividades.</td></tr>
                                ) : filas.map((a) => (
                                    <tr key={a.id} className="transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.02]">
                                        <td className="px-4 py-3 text-[11px] text-ink-muted dark:text-ink-muted-dark">{a.created_at ?? '—'}</td>
                                        <td className="px-4 py-3"><Badge color="gray">{a.event ?? '—'}</Badge></td>
                                        <td className="px-4 py-3 text-[12px] text-ink dark:text-ink-dark">{a.description}</td>
                                        <td className="px-4 py-3"><p className="text-[11.5px] font-semibold">{a.causer?.name ?? 'Proceso del sistema'}</p><p className="text-[9.5px] text-ink-muted">{a.causer?.email ?? 'Sin usuario asociado'}</p><div className="mt-1 flex gap-1">{a.causer?.roles?.map(r=><span key={r.nombre} className="rounded bg-brand-green/10 px-1.5 py-0.5 text-[8px] font-bold capitalize text-brand-green">{r.nombre}</span>)}</div></td>
                                        <td className="px-4 py-3 text-[11px] text-ink-muted dark:text-ink-muted-dark"><p>{a.subject_type?.split('\\').pop() ?? 'Registro'}</p><p className="text-[9px]">ID {a.subject_id ?? '—'}</p></td>
                                        <td className="max-w-[280px] px-4 py-3"><Cambios properties={a.properties}/></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-surface-border px-4 py-3 dark:border-surface-border-dark">
                        <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Total: {total} eventos</p>
                        {pageCount > 1 ? (
                            <div className="flex flex-wrap gap-1">
                                {enlaces.map((link, i) => {
                                    const label = link.label.replace('&laquo; Previous', '«').replace('Next &raquo;', '»').replace('pagination.previous', '«').replace('pagination.next', '»');
                                    return (
                                        <button key={`${label}-${i}`}
                                            className={clsx('flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-[11px] font-semibold transition-colors disabled:opacity-40',
                                                link.active ? 'bg-brand-green text-white' : 'text-ink-muted hover:bg-black/[0.04] dark:text-ink-muted-dark dark:hover:bg-white/[0.05]')}
                                            disabled={!link.url} onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true, preserveState: true, replace: true })}
                                            dangerouslySetInnerHTML={{ __html: label }} />
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Cambios({properties}:{properties?:ActivityRow['properties']}) {
 const nuevo=properties?.attributes??{}; const anterior=properties?.old??{}; const campos=Array.from(new Set([...Object.keys(anterior),...Object.keys(nuevo)])).filter(k=>!['updated_at','created_at'].includes(k));
 if(!campos.length){const extras=properties?Object.entries(properties).filter(([k])=>!['attributes','old'].includes(k)):[];return extras.length?<div className="space-y-1">{extras.slice(0,4).map(([k,v])=><p key={k} className="text-[9px]"><b>{k.replaceAll('_',' ')}:</b> {formatear(v)}</p>)}</div>:<span className="text-[10px] text-ink-muted">Sin cambios de campos</span>}
 return <div className="space-y-1">{campos.slice(0,5).map(k=><p key={k} className="text-[9px] text-ink-muted"><b className="text-ink dark:text-ink-dark">{k.replaceAll('_',' ')}:</b> {k in anterior?`${formatear(anterior[k])} → `:''}{formatear(nuevo[k])}</p>)}{campos.length>5&&<p className="text-[9px] font-semibold text-brand-green">+{campos.length-5} cambios más</p>}</div>;
}
function formatear(v:unknown):string { if(v===null||v===undefined||v==='')return 'vacío'; if(typeof v==='boolean')return v?'Sí':'No'; if(typeof v==='object')return JSON.stringify(v); return String(v); }
