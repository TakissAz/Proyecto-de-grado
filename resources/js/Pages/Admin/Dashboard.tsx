declare const route: any;

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Users, ClipboardList, History, ArrowRight, ShieldCheck } from 'lucide-react';
import { Tarjeta } from '@/Components/ui/tarjeta';

export default function Dashboard() {
    const { auth } = usePage().props as { auth: { user: { name: string } } };
    const nombre = auth?.user?.name ?? 'Administrador';

    return (
        <AuthenticatedLayout header={<h2>Panel de Administración</h2>}>
            <Head title="Administrador" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-extrabold text-base-content">
                        Hola, {nombre.split(' ')[0]}
                    </h2>
                    <p className="text-sm text-base-content/60 mt-1">
                        Gestión de usuarios, auditoría clínica y configuración del sistema.
                    </p>
                </div>

                {/* Acciones */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <AccionCard
                        titulo="Usuarios"
                        descripcion="Crear, editar, activar, inactivar y bloquear usuarios del sistema."
                        icono={<Users size={20} />}
                        color="bg-primary/10 text-primary"
                        href={route('admin.users.index')}
                        cta="Gestionar usuarios"
                    />
                    <AccionCard
                        titulo="Auditoría de pacientes"
                        descripcion="Revisar origen, creador, editor y flujo clínico de cada paciente."
                        icono={<ClipboardList size={20} />}
                        color="bg-secondary/10 text-secondary"
                        href={route('admin.auditoria.pacientes')}
                        cta="Ver pacientes"
                    />
                    <AccionCard
                        titulo="Actividad del sistema"
                        descripcion="Revisar eventos y cambios recientes registrados en el módulo clínico."
                        icono={<History size={20} />}
                        color="bg-info/10 text-info"
                        href={route('admin.auditoria.actividad')}
                        cta="Ver actividad"
                    />
                </div>

                {/* Info */}
                <Tarjeta>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success shrink-0">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-base-content">Sistema operativo</h3>
                            <p className="text-xs text-base-content/50">
                                Todos los módulos están activos. La auditoría registra cambios automáticamente.
                            </p>
                        </div>
                    </div>
                </Tarjeta>
            </div>
        </AuthenticatedLayout>
    );
}

function AccionCard({ titulo, descripcion, icono, color, href, cta }: {
    titulo: string; descripcion: string; icono: React.ReactNode; color: string; href: string; cta: string;
}) {
    return (
        <Tarjeta>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} mb-3`}>
                {icono}
            </div>
            <h3 className="font-bold text-base-content mb-1">{titulo}</h3>
            <p className="text-xs text-base-content/50 mb-4">{descripcion}</p>
            <Link href={href} className="btn btn-primary btn-sm gap-1.5 w-full">
                {cta} <ArrowRight size={14} />
            </Link>
        </Tarjeta>
    );
}
