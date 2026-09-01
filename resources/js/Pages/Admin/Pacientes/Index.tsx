declare const route: any;

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Plus, Eye, Pencil, CheckCircle, Ban, X, Search, Users } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Boton, BotonLink } from '@/Components/ui/boton';
import Alerta from '@/Components/ui/alerta';
import AvatarIniciales from '@/Components/ui/avatar-iniciales';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

interface UserOption { name: string; email: string; }

interface PacienteRow {
    id_paciente: number;
    nombre_completo?: string | null;
    ci: string;
    fecha_nacimiento: string;
    edad?: number | null;
    telefono?: string | null;
    fecha_registro?: string | null;
    estado: 'activo' | 'inactivo';
    user?: UserOption | null;
}

interface PaginatedPacientes {
    data?: PacienteRow[];
    links?: Array<{ url: string | null; label: string; active: boolean }> | { first?: string|null; last?: string|null; prev?: string|null; next?: string|null };
    meta?: { current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null; links?: Array<{ url: string | null; label: string; active: boolean }> };
    current_page?: number;
    last_page?: number;
    total?: number;
}

interface Filters { buscar: string; }

interface Props extends PageProps {
    pacientes: PaginatedPacientes;
    filtros: Filters;
}

export default function Index({ pacientes, filtros, flash }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const buscarRef = useRef(buscar);
    buscarRef.current = buscar;

    useEffect(() => { setBuscar(filtros.buscar ?? ''); }, [filtros.buscar]);

    const applyFilters = (page = 1) => {
        const params = new URLSearchParams();
        if (buscarRef.current) params.set('buscar', buscarRef.current);
        params.set('page', String(page));
        window.location.href = `/admin/pacientes?${params.toString()}`;
    };

    const clearFilters = () => { setBuscar(''); window.location.href = '/admin/pacientes'; };

    const cambiarEstado = (idPaciente: number, accion: 'activar' | 'inactivar') => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/pacientes/${idPaciente}/${accion}`;
        form.style.display = 'none';
        const csrfInput = document.createElement('input');
        csrfInput.name = '_token';
        csrfInput.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
        const methodInput = document.createElement('input');
        methodInput.name = '_method';
        methodInput.value = 'PATCH';
        form.appendChild(csrfInput);
        form.appendChild(methodInput);
        document.body.appendChild(form);
        form.submit();
    };

    const filas = pacientes?.data ?? [];
    const enlaces = Array.isArray(pacientes?.links)
        ? pacientes.links
        : (pacientes?.meta?.links ?? []);
    const pageCount = pacientes?.meta?.last_page ?? pacientes?.last_page ?? 1;
    const total = pacientes?.meta?.total ?? pacientes?.total ?? filas.length;

    return (
        <AuthenticatedLayout header={<h2>Pacientes</h2>}>
            <Head title="Pacientes" />

            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green/12 text-brand-green-dark dark:text-brand-green">
                            <Users size={20} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-[18px] font-bold text-ink dark:text-ink-dark">Gestión de pacientes</h2>
                            <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark">Busca y administra los registros clínicos base.</p>
                        </div>
                    </div>
                    <BotonLink href={route('admin.pacientes.create')} tamano="md">
                        <Plus size={15} strokeWidth={2} /> Crear paciente
                    </BotonLink>
                </div>

                {flash?.success ? <Alerta tipo="success">{flash.success}</Alerta> : null}
                {flash?.error ? <Alerta tipo="error">{flash.error}</Alerta> : null}

                {/* Filtros */}
                <form className="card-elevated p-4" onSubmit={(e) => { e.preventDefault(); applyFilters(1); }}>
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_auto] gap-3 items-end">
                        <label className="block">
                            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">Buscar</span>
                            <div className="relative">
                                <Search size={14} strokeWidth={1.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted/60 dark:text-ink-muted-dark/60" />
                                <input type="text"
                                    className="w-full rounded-lg border border-surface-border bg-[#FAF9F6] py-2 pl-9 pr-3 text-[12.5px] text-ink outline-none transition-colors placeholder:text-ink-muted/50 focus:border-brand-green/50 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                                    placeholder="Nombre, correo, CI o teléfono" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
                            </div>
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
                                    <th className="px-4 py-3">Paciente</th>
                                    <th className="px-4 py-3">CI</th>
                                    <th className="px-4 py-3">Contacto</th>
                                    <th className="px-4 py-3">Nacimiento</th>
                                    <th className="px-4 py-3">Edad</th>
                                    <th className="px-4 py-3">Estado</th>
                                    <th className="px-4 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border dark:divide-surface-border-dark">
                                {filas.length === 0 ? (
                                    <tr><td colSpan={7} className="px-4 py-12 text-center text-[12px] text-ink-muted dark:text-ink-muted-dark">No se encontraron pacientes.</td></tr>
                                ) : filas.map((p) => (
                                    <tr key={p.id_paciente} className="transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.02]">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <AvatarIniciales nombre={p.nombre_completo ?? p.user?.name ?? 'S N'} size={34} />
                                                <div className="min-w-0">
                                                    <p className="truncate text-[12.5px] font-semibold text-ink dark:text-ink-dark">{p.nombre_completo ?? p.user?.name ?? 'Sin nombre'}</p>
                                                    <p className="truncate text-[10.5px] text-ink-muted dark:text-ink-muted-dark">{p.user?.email ?? 'Sin correo'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-[12px] text-ink dark:text-ink-dark">{p.ci}</td>
                                        <td className="px-4 py-3 text-[12px] text-ink-muted dark:text-ink-muted-dark">{p.telefono ?? '—'}</td>
                                        <td className="px-4 py-3 text-[12px] text-ink-muted dark:text-ink-muted-dark">{p.fecha_nacimiento}</td>
                                        <td className="px-4 py-3 text-[12px] text-ink-muted dark:text-ink-muted-dark">{p.edad ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <Badge color={p.estado === 'activo' ? 'green' : 'orange'}>{p.estado}</Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1 justify-end">
                                                <AccionIcono href={route('admin.pacientes.show', { paciente: p.id_paciente })} label="Ver" color="text-category-others"><Eye size={14} strokeWidth={1.8} /></AccionIcono>
                                                <AccionIcono href={route('admin.pacientes.edit', { paciente: p.id_paciente })} label="Editar"><Pencil size={14} strokeWidth={1.8} /></AccionIcono>
                                                <AccionBoton onClick={() => cambiarEstado(p.id_paciente, 'activar')} disabled={p.estado === 'activo'} label="Activar" color="text-brand-green-dark dark:text-brand-green"><CheckCircle size={14} strokeWidth={1.8} /></AccionBoton>
                                                <AccionBoton onClick={() => cambiarEstado(p.id_paciente, 'inactivar')} disabled={p.estado === 'inactivo'} label="Inactivar" color="text-brand-orange"><Ban size={14} strokeWidth={1.8} /></AccionBoton>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-surface-border px-4 py-3 dark:border-surface-border-dark">
                        <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Total: {total} pacientes</p>
                        {pageCount > 1 ? (
                            <div className="flex flex-wrap gap-1">
                                {enlaces.map((link, i) => {
                                    const label = link.label.replace('&laquo; Previous', '«').replace('Next &raquo;', '»').replace('pagination.previous', '«').replace('pagination.next', '»');
                                    return (
                                        <button key={`${label}-${i}`}
                                            className={clsx('flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-[11px] font-semibold transition-colors disabled:opacity-40',
                                                link.active ? 'bg-brand-green text-white' : 'text-ink-muted hover:bg-black/[0.04] dark:text-ink-muted-dark dark:hover:bg-white/[0.05]')}
                                            disabled={!link.url} onClick={() => link.url && (window.location.href = link.url)}
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

function AccionIcono({ href, label, color, children }: { href: string; label: string; color?: string; children: React.ReactNode }) {
    return (
        <BotonLink href={href} variante="ghost" tamano="xs" aria-label={label}
            className={clsx('!h-8 !w-8 !p-0', color ?? 'text-ink-muted dark:text-ink-muted-dark')}>
            {children}
        </BotonLink>
    );
}

function AccionBoton({ onClick, disabled, label, color, children }: { onClick: () => void; disabled?: boolean; label: string; color?: string; children: React.ReactNode }) {
    return (
        <Boton variante="ghost" tamano="xs" onClick={onClick} disabled={disabled} aria-label={label}
            className={clsx('!h-8 !w-8 !p-0', color ?? 'text-ink-muted dark:text-ink-muted-dark')}>
            {children}
        </Boton>
    );
}
