import { Link } from '@inertiajs/react';
import { ClipboardList, SquarePen, FileText, CheckCircle2, X, ArrowLeft, Leaf } from 'lucide-react';
import clsx from 'clsx';
import AvatarPaciente from '@/Components/ui/avatar-paciente';
import EstadoPill from '@/Components/ui/estado-pill';
import { Boton, BotonLink } from '@/Components/ui/boton';

interface Props {
    id: number;
    nombre: string;
    ci: string;
    email?: string | null;
    avatarUrl?: string | null;
    edad?: number | null;
    estado: 'activo' | 'inactivo';
    onActivar: () => void;
    onInactivar: () => void;
    onNuevaConsulta: () => void;
}

export default function PerfilCabecera({
    id,
    nombre,
    ci,
    email,
    avatarUrl,
    edad,
    estado,
    onActivar,
    onInactivar,
    onNuevaConsulta,
}: Props) {
    return (
        <div className="card-elevated overflow-hidden">
            {/* Cover — gradiente verde con decoración */}
            <div className="relative h-28 overflow-hidden bg-gradient-to-br from-brand-green/25 via-brand-green/10 to-brand-orange/10 dark:from-brand-green/15 dark:via-brand-green/[0.06] dark:to-brand-orange/[0.06]">
                {/* Decoración: círculos difusos */}
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-green/15 blur-2xl" />
                <div className="absolute left-1/3 -bottom-8 h-28 w-28 rounded-full bg-brand-orange/15 blur-2xl" />
                {/* Hoja decorativa */}
                <Leaf size={120} className="absolute -right-4 top-2 text-white/10 dark:text-white/[0.04] rotate-12" />

                {/* Volver */}
                <Link
                    href="/endocrinologo/pacientes"
                    className="absolute left-4 top-4 flex items-center gap-1.5 rounded-lg bg-white/70 px-2.5 py-1.5 text-[11px] font-semibold text-ink backdrop-blur-sm transition-colors hover:bg-white dark:bg-black/30 dark:text-ink-dark dark:hover:bg-black/50"
                >
                    <ArrowLeft size={13} strokeWidth={1.8} /> Listado
                </Link>
            </div>

            {/* Info principal */}
            <div className="relative px-5 pb-5">
                {/* Avatar superpuesto al cover */}
                <div className="-mt-10 mb-3">
                    <div className="inline-flex rounded-full border-4 border-surface-card dark:border-surface-card-dark">
                        <AvatarPaciente nombre={nombre} avatarUrl={avatarUrl} size="xl" />
                    </div>
                </div>

                <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* Nombre y datos básicos */}
                    <div>
                        <h1 className="text-xl font-bold text-ink dark:text-ink-dark">{nombre}</h1>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-[12px] text-ink-muted dark:text-ink-muted-dark">
                            <span>CI: {ci}</span>
                            {edad ? <span>· {edad} años</span> : null}
                            {email ? <span>· {email}</span> : null}
                        </div>
                        <div className="mt-2">
                            <EstadoPill activo={estado === 'activo'} textoActivo="Paciente activa" textoInactivo="Paciente inactiva" />
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-wrap items-center gap-2">
                        <BotonLink href={`/endocrinologo/pacientes/${id}/perfil-clinico`} variante="primary" tamano="md">
                            <ClipboardList size={14} strokeWidth={1.8} /> Perfil clínico
                        </BotonLink>
                        <Boton variante="outline" tamano="sm" onClick={onNuevaConsulta}>
                            <FileText size={14} strokeWidth={1.8} /> Nueva consulta
                        </Boton>
                        <BotonLink href={`/endocrinologo/pacientes/${id}/edit`} variante="ghost" tamano="sm">
                            <SquarePen size={14} strokeWidth={1.8} /> Editar
                        </BotonLink>
                        {estado === 'inactivo' ? (
                            <Boton variante="outline" tamano="sm" onClick={onActivar}>
                                <CheckCircle2 size={14} strokeWidth={1.8} /> Activar
                            </Boton>
                        ) : (
                            <Boton variante="danger" tamano="sm" onClick={onInactivar}>
                                <X size={14} strokeWidth={1.8} /> Inactivar
                            </Boton>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
