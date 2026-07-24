import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, type LucideIcon } from 'lucide-react';
import AvatarIniciales from '@/Components/ui/avatar-iniciales';
import clsx from 'clsx';
import { etiqueta } from '../tipos';

interface Campo {
    key: string;
    label: string;
    destacar?: (valor: any) => boolean;
}

interface Props {
    titulo: string;
    descripcion: string;
    icono: LucideIcon;
    colorIcono: string;
    bgIcono: string;
    paciente: { id_paciente: number; nombres: string; apellido_paterno: string; apellido_materno?: string | null; ci: string };
    registros: Record<string, any>[];
    campos: Campo[];
    campoFecha?: string;
}

export default function HistorialGenerico({ titulo, descripcion, icono: Icono, colorIcono, bgIcono, paciente, registros, campos, campoFecha = 'created_at' }: Props) {
    const nombre = [paciente.nombres, paciente.apellido_paterno, paciente.apellido_materno].filter(Boolean).join(' ');
    const id = paciente.id_paciente;

    return (
        <AuthenticatedLayout title={titulo}>
            <Head title={`${titulo}: ${nombre}`} />
            <div className="space-y-5">
                {/* Cabecera */}
                <div className="card-elevated overflow-hidden">
                    <div className="relative h-16 bg-gradient-to-r from-brand-green/10 via-brand-green/5 to-transparent dark:from-brand-green/[0.06] dark:via-brand-green/[0.03] dark:to-transparent">
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
                                <AvatarIniciales nombre={nombre} size={48} />
                            </div>
                            <div className="flex-1 pb-0.5">
                                <h1 className="text-[16px] font-bold text-ink dark:text-ink-dark">{nombre}</h1>
                                <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">CI: {paciente.ci}</p>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-lg bg-brand-green/10 px-3 py-1.5 dark:bg-brand-green/[0.08]">
                                <Icono size={12} strokeWidth={1.8} className={colorIcono} />
                                <span className="text-[11px] font-semibold text-brand-green-dark dark:text-brand-green">
                                    {registros.length} registro{registros.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-surface-border dark:border-surface-border-dark">
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">{descripcion}</p>
                        </div>
                    </div>
                </div>

                {/* Registros */}
                {registros.length === 0 ? (
                    <div className="card-elevated flex flex-col items-center gap-2 px-5 py-14 text-center">
                        <Icono size={28} strokeWidth={1.2} className="text-ink-muted/30 dark:text-ink-muted-dark/30" />
                        <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark">No existen registros</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {registros.map((r, idx) => (
                            <div key={idx} className="card-elevated overflow-hidden">
                                {/* Header del registro */}
                                <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-border dark:border-surface-border-dark">
                                    <div className="flex items-center gap-2">
                                        <div className={clsx('flex h-6 w-6 items-center justify-center rounded-md text-[9px] font-bold', bgIcono, colorIcono)}>
                                            {registros.length - idx}
                                        </div>
                                        <p className="text-[11.5px] font-semibold text-ink dark:text-ink-dark">Registro #{registros.length - idx}</p>
                                    </div>
                                    <span className="flex items-center gap-1 text-[10px] text-ink-muted dark:text-ink-muted-dark">
                                        <Calendar size={10} strokeWidth={1.8} />
                                        {r[campoFecha] ? String(r[campoFecha]).slice(0, 10) : '—'}
                                    </span>
                                </div>

                                {/* Datos */}
                                <div className="px-4 py-3">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {campos.map(campo => {
                                            const valor = r[campo.key];
                                            const dest = campo.destacar?.(valor) ?? false;
                                            return (
                                                <div key={campo.key} className="rounded-lg bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03]">
                                                    <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">{campo.label}</p>
                                                    <p className={clsx('text-[12px] font-bold', dest ? 'text-brand-orange' : 'text-ink dark:text-ink-dark')}>
                                                        {etiqueta(valor)}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {r.observaciones && (
                                        <div className="mt-2 rounded-md bg-black/[0.02] px-2.5 py-1.5 dark:bg-white/[0.02]">
                                            <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark leading-relaxed">{String(r.observaciones)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
