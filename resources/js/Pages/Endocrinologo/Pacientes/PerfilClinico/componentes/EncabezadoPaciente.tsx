import type { ReactNode } from 'react';
import {
    User,
    Phone,
    MapPin,
    Briefcase,
    Heart,
    Calendar,
    Mail,
    ShieldCheck,
} from 'lucide-react';

import AvatarIniciales from '@/Components/ui/avatar-iniciales';
import EstadoPill from '@/Components/ui/estado-pill';
import IndicadorEstadoFlujo from './IndicadorEstadoFlujo';
import type { DatosPaciente, EstadoFlujo } from '../tipos';

interface Props {
    paciente: DatosPaciente;
    estadoFlujo: EstadoFlujo;
}

export default function EncabezadoPaciente({ paciente, estadoFlujo }: Props) {
    return (
        <section className="card-elevated overflow-hidden">
            {/* Cover clínico */}
            <div className="relative h-20 overflow-hidden bg-gradient-to-r from-primary/10 via-secondary/10 to-base-100 dark:from-primary/15 dark:via-secondary/10 dark:to-base-100">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-sm" />
                <div className="absolute left-1/3 -bottom-8 h-24 w-24 rounded-full bg-secondary/10 blur-sm" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-base-300" />
            </div>

            <div className="px-5 pb-5 sm:px-6">
                {/* Avatar + identidad */}
                <div className="-mt-8 mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex items-end gap-3">
                        <div className="rounded-full border-4 border-base-100 bg-base-100 shadow-md dark:border-base-100">
                            <AvatarIniciales nombre={paciente.nombre_completo} size={58} />
                        </div>

                        <div className="pb-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-bold leading-tight text-base-content">
                                    {paciente.nombre_completo}
                                </h2>

                                <EstadoPill
                                    activo={paciente.estado === 'activo'}
                                    textoActivo="Activa"
                                    textoInactivo="Inactiva"
                                />
                            </div>

                            <p className="mt-1 text-xs text-base-content/60">
                                CI: {paciente.ci || '—'} · {paciente.sexo || '—'} ·{' '}
                                {paciente.edad ?? '—'} años
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-base-300 bg-base-200/60 px-3 py-2 text-xs text-base-content/70">
                        <ShieldCheck size={15} className="text-primary" />
                        <span>Paciente registrada en seguimiento clínico</span>
                    </div>
                </div>

                {/* Datos principales */}
                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <DatoIcono
                        icon={<Calendar size={14} strokeWidth={1.8} />}
                        label="Fecha nacimiento"
                        valor={paciente.fecha_nacimiento}
                    />
                    <DatoIcono
                        icon={<Phone size={14} strokeWidth={1.8} />}
                        label="Teléfono"
                        valor={paciente.telefono}
                    />
                    <DatoIcono
                        icon={<Mail size={14} strokeWidth={1.8} />}
                        label="Correo"
                        valor={paciente.user?.email}
                    />
                    <DatoIcono
                        icon={<Calendar size={14} strokeWidth={1.8} />}
                        label="Fecha registro"
                        valor={paciente.fecha_registro}
                    />
                    <DatoIcono
                        icon={<MapPin size={14} strokeWidth={1.8} />}
                        label="Dirección"
                        valor={paciente.direccion}
                    />
                    <DatoIcono
                        icon={<Briefcase size={14} strokeWidth={1.8} />}
                        label="Ocupación"
                        valor={paciente.ocupacion}
                    />
                    <DatoIcono
                        icon={<Heart size={14} strokeWidth={1.8} />}
                        label="Estado civil"
                        valor={paciente.estado_civil}
                    />
                    <DatoIcono
                        icon={<User size={14} strokeWidth={1.8} />}
                        label="Sexo"
                        valor={paciente.sexo}
                    />
                </div>

                {/* Observaciones */}
                {paciente.observaciones ? (
                    <div className="mb-5 rounded-2xl border border-base-300 bg-base-200/50 p-4">
                        <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-base-content/50">
                            Observaciones
                        </p>
                        <p className="text-sm leading-relaxed text-base-content/80">
                            {paciente.observaciones}
                        </p>
                    </div>
                ) : null}

                {/* Flujo clínico */}
                <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                    <IndicadorEstadoFlujo estadoFlujo={estadoFlujo} />
                </div>
            </div>
        </section>
    );
}

function DatoIcono({
    icon,
    label,
    valor,
}: {
    icon: ReactNode;
    label: string;
    valor?: string | number | null;
}) {
    return (
        <div className="group rounded-2xl border border-base-300 bg-base-100 p-3 transition hover:-translate-y-0.5 hover:shadow-sm">
            <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {icon}
                </div>

                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-base-content/50">
                        {label}
                    </p>
                    <p className="mt-0.5 truncate text-[13px] font-medium text-base-content">
                        {valor || '—'}
                    </p>
                </div>
            </div>
        </div>
    );
}