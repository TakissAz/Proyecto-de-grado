import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Activity, ArrowLeft, ArrowRight, Briefcase, Calendar, CheckCircle2, ClipboardList, Heart, Leaf, MapPin, Phone, Salad, SquarePen, User, Utensils, X } from 'lucide-react';
import Alerta from '@/Components/ui/alerta';
import AvatarIniciales from '@/Components/ui/avatar-iniciales';
import EstadoPill from '@/Components/ui/estado-pill';
import { Badge } from '@/Components/ui/badge';
import { Boton, BotonLink } from '@/Components/ui/boton';
import type { PageProps } from '@/types';

interface PacienteRow { id_paciente: number; ci: string; nombre_completo?: string | null; fecha_nacimiento: string; edad?: number | null; sexo: string; telefono?: string | null; direccion?: string | null; ocupacion?: string | null; estado_civil?: string | null; fecha_registro?: string | null; observaciones?: string | null; estado: 'activo' | 'inactivo'; user?: { name?: string | null; email?: string | null } | null; }
interface Props extends PageProps { paciente: PacienteRow; }

export default function Show({ paciente, flash }: Props) {
    const id = paciente.id_paciente;
    const nombre = paciente.nombre_completo ?? paciente.user?.name ?? 'Paciente';

    const enviarEstado = (accion: 'activar' | 'inactivar') => {
        const form = document.createElement('form'); form.method = 'POST'; form.action = `/nutricionista/pacientes/${id}/${accion}`; form.style.display = 'none';
        const csrf = document.createElement('input'); csrf.name = '_token'; csrf.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
        const method = document.createElement('input'); method.name = '_method'; method.value = 'PATCH';
        form.append(csrf, method); document.body.appendChild(form); form.submit();
    };

    return (
        <AuthenticatedLayout header={<h2>Perfil de paciente</h2>}>
            <Head title={`Paciente: ${paciente.ci}`} />
            <div className="space-y-5">
                {flash?.success && <Alerta tipo="success">{flash.success}</Alerta>}
                {flash?.error && <Alerta tipo="error">{flash.error}</Alerta>}

                {/* Cabecera */}
                <div className="card-elevated overflow-hidden">
                    {/* Cover con gradiente */}
                    <div className="relative h-28 overflow-hidden bg-gradient-to-br from-brand-green/25 via-brand-green/10 to-brand-orange/10 dark:from-brand-green/15 dark:via-brand-green/[0.06] dark:to-brand-orange/[0.06]">
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-green/15 blur-2xl" />
                        <div className="absolute left-1/3 -bottom-8 h-28 w-28 rounded-full bg-brand-orange/15 blur-2xl" />
                        <Leaf size={120} className="absolute -right-4 top-2 text-white/10 dark:text-white/[0.04] rotate-12" />
                        <Link href="/nutricionista/pacientes" className="absolute left-4 top-4 flex items-center gap-1.5 rounded-lg bg-white/70 px-2.5 py-1.5 text-[11px] font-semibold text-ink backdrop-blur-sm transition-colors hover:bg-white dark:bg-black/30 dark:text-ink-dark dark:hover:bg-black/50">
                            <ArrowLeft size={13} strokeWidth={1.8} /> Listado
                        </Link>
                    </div>

                    <div className="relative px-5 pb-5">
                        <div className="-mt-10 mb-3">
                            <div className="inline-flex rounded-full border-4 border-surface-card dark:border-surface-card-dark">
                                <AvatarIniciales nombre={nombre} size={72} />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 className="text-xl font-bold text-ink dark:text-ink-dark">{nombre}</h1>
                                <div className="mt-1 flex flex-wrap items-center gap-3 text-[12px] text-ink-muted dark:text-ink-muted-dark">
                                    <span>CI: {paciente.ci}</span>
                                    {paciente.edad ? <span>· {paciente.edad} años</span> : null}
                                    {paciente.user?.email ? <span>· {paciente.user.email}</span> : null}
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <EstadoPill activo={paciente.estado === 'activo'} textoActivo="Paciente activa" textoInactivo="Paciente inactiva" />
                                    <Badge color={paciente.sexo === 'femenino' ? 'purple' : 'blue'}>{paciente.sexo === 'femenino' ? 'Femenino' : 'Masculino'}</Badge>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <BotonLink href={`/nutricionista/pacientes/${id}/perfil-nutricional`} variante="primary" tamano="md">
                                    <Salad size={14} strokeWidth={1.8} /> Perfil nutricional
                                </BotonLink>
                                <BotonLink href={`/nutricionista/pacientes/${id}/edit`} variante="ghost" tamano="sm">
                                    <SquarePen size={14} strokeWidth={1.8} /> Editar
                                </BotonLink>
                                {paciente.estado === 'inactivo' ? (
                                    <Boton variante="outline" tamano="sm" onClick={() => enviarEstado('activar')}>
                                        <CheckCircle2 size={14} strokeWidth={1.8} /> Activar
                                    </Boton>
                                ) : (
                                    <Boton variante="danger" tamano="sm" onClick={() => enviarEstado('inactivar')}>
                                        <X size={14} strokeWidth={1.8} /> Inactivar
                                    </Boton>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenido en 2 columnas */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
                    {/* Datos personales */}
                    <div className="lg:col-span-3">
                        <div className="card-elevated p-5">
                            <h3 className="mb-4 text-[14px] font-bold text-ink dark:text-ink-dark">Información personal</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <DatoIcono icon={<User size={14} strokeWidth={1.8} />} label="Sexo" valor={paciente.sexo} />
                                <DatoIcono icon={<Calendar size={14} strokeWidth={1.8} />} label="Fecha nacimiento" valor={paciente.fecha_nacimiento} />
                                <DatoIcono icon={<User size={14} strokeWidth={1.8} />} label="Edad" valor={paciente.edad ? `${paciente.edad} años` : null} />
                                <DatoIcono icon={<Phone size={14} strokeWidth={1.8} />} label="Teléfono" valor={paciente.telefono} />
                                <DatoIcono icon={<MapPin size={14} strokeWidth={1.8} />} label="Dirección" valor={paciente.direccion} />
                                <DatoIcono icon={<Briefcase size={14} strokeWidth={1.8} />} label="Ocupación" valor={paciente.ocupacion} />
                                <DatoIcono icon={<Heart size={14} strokeWidth={1.8} />} label="Estado civil" valor={paciente.estado_civil} />
                                <DatoIcono icon={<Calendar size={14} strokeWidth={1.8} />} label="Registrada el" valor={paciente.fecha_registro} />
                            </div>
                            {paciente.observaciones && (
                                <div className="mt-4 border-t border-surface-border pt-4 dark:border-surface-border-dark">
                                    <p className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">Observaciones</p>
                                    <p className="mt-1 text-[13px] text-ink dark:text-ink-dark">{paciente.observaciones}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Accesos rápidos */}
                    <div className="lg:col-span-2">
                        <div className="card-elevated p-5">
                            <h3 className="mb-3 text-[14px] font-bold text-ink dark:text-ink-dark">Acceso rápido</h3>
                            <div className="space-y-2.5">
                                <AccesoCard href={`/nutricionista/pacientes/${id}/perfil-nutricional`} icon={<Salad size={17} strokeWidth={1.8} />} titulo="Perfil nutricional" descripcion="Evaluación, hábitos, objetivos y plan" color="bg-brand-green/15 text-brand-green-dark dark:text-brand-green" bg="border-brand-green/20 bg-brand-green/[0.03] hover:border-brand-green/40 dark:bg-brand-green/[0.05]" />
                                <AccesoCard href={`/nutricionista/pacientes/${id}/perfil-nutricional`} icon={<Utensils size={17} strokeWidth={1.8} />} titulo="Plan alimentario" descripcion="Planificación semanal de comidas" color="bg-brand-orange/15 text-brand-orange" bg="border-brand-orange/20 bg-brand-orange/[0.03] hover:border-brand-orange/40 dark:bg-brand-orange/[0.05]" />
                                <AccesoCard href={`/nutricionista/pacientes/${id}/perfil-nutricional`} icon={<Activity size={17} strokeWidth={1.8} />} titulo="Seguimiento" descripcion="Adherencia y evolución del paciente" color="bg-info/15 text-info" bg="border-info/20 bg-info/[0.03] hover:border-info/40 dark:bg-info/[0.05]" />
                                <AccesoCard href={`/nutricionista/pacientes/${id}/perfil-nutricional`} icon={<ClipboardList size={17} strokeWidth={1.8} />} titulo="Historial de planes" descripcion="Planes anteriores y comparación" color="bg-category-dairy/15 text-category-dairy" bg="border-category-dairy/20 bg-category-dairy/[0.03] hover:border-category-dairy/40 dark:bg-category-dairy/[0.05]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function DatoIcono({ icon, label, valor }: { icon: React.ReactNode; label: string; valor?: string | null }) {
    return (
        <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-green/[0.08] text-brand-green-dark dark:bg-brand-green-dark/15 dark:text-brand-green">
                {icon}
            </div>
            <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">{label}</p>
                <p className="text-[13px] text-ink dark:text-ink-dark capitalize">{valor || '—'}</p>
            </div>
        </div>
    );
}

function AccesoCard({ href, icon, titulo, descripcion, color, bg }: { href: string; icon: React.ReactNode; titulo: string; descripcion: string; color: string; bg: string }) {
    return (
        <Link href={href} className={`group flex items-center gap-3 rounded-xl border p-3.5 transition-all hover:shadow-[0_2px_12px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_2px_12px_rgba(0,0,0,0.15)] ${bg}`}>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>{icon}</div>
            <div className="flex-1">
                <p className="text-[12.5px] font-bold text-ink dark:text-ink-dark">{titulo}</p>
                <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">{descripcion}</p>
            </div>
            <ArrowRight size={14} strokeWidth={1.8} className="text-ink-muted transition-transform group-hover:translate-x-1 dark:text-ink-muted-dark" />
        </Link>
    );
}
