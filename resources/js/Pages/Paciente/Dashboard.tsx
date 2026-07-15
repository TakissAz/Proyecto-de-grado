import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { User, Info, Calendar, Phone } from 'lucide-react';
import { Tarjeta } from '@/Components/ui/tarjeta';
import { Badge } from '@/Components/ui/badge';

interface DatosPaciente {
    nombre_completo?: string | null;
    ci?: string | null;
    fecha_nacimiento?: string | null;
    telefono?: string | null;
    estado?: string | null;
}

interface Props {
    paciente?: DatosPaciente;
}

export default function Dashboard({ paciente }: Props) {
    const { auth } = usePage().props as { auth: { user: { name: string } } };
    const nombreUsuario = paciente?.nombre_completo ?? auth?.user?.name ?? 'Paciente';

    return (
        <AuthenticatedLayout header={<h2>Mi panel</h2>}>
            <Head title="Mi panel" />

            <div className="space-y-6">
                {/* Saludo */}
                <div>
                    <h2 className="text-2xl font-extrabold text-base-content">
                        Hola, {nombreUsuario.split(' ')[0]}
                    </h2>
                    <p className="text-sm text-base-content/60 mt-1">
                        Bienvenida al sistema clínico PMOS. Aquí encontrarás tu información médica y de seguimiento.
                    </p>
                </div>

                {/* Alerta informativa */}
                <div className="alert border border-info/20 bg-info/5">
                    <Info size={18} className="text-info shrink-0" />
                    <p className="text-sm text-base-content/80">
                        Tu módulo de seguimiento estará disponible próximamente. Si tienes alguna consulta, comunícate con tu médico tratante.
                    </p>
                </div>

                {/* Datos personales */}
                {paciente ? (
                    <Tarjeta>
                        <div className="flex items-center gap-2 mb-4">
                            <User size={18} className="text-primary" />
                            <h3 className="font-bold text-base-content">Mis datos</h3>
                        </div>

                        <div className="border-t border-base-300 pt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {paciente.ci ? (
                                    <Detalle label="CI" valor={paciente.ci} />
                                ) : null}
                                {paciente.fecha_nacimiento ? (
                                    <Detalle label="Fecha de nacimiento" valor={paciente.fecha_nacimiento} icono={<Calendar size={13} />} />
                                ) : null}
                                {paciente.telefono ? (
                                    <Detalle label="Teléfono" valor={paciente.telefono} icono={<Phone size={13} />} />
                                ) : null}
                                {paciente.estado ? (
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-base-content/40 mb-1">Estado</p>
                                        <Badge variante={paciente.estado === 'activo' ? 'success' : 'ghost'}>
                                            {paciente.estado}
                                        </Badge>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </Tarjeta>
                ) : null}
            </div>
        </AuthenticatedLayout>
    );
}

function Detalle({ label, valor, icono }: { label: string; valor: string; icono?: React.ReactNode }) {
    return (
        <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-base-content/40 mb-1">{label}</p>
            <p className="text-sm font-medium text-base-content flex items-center gap-1.5">
                {icono ? <span className="text-base-content/40">{icono}</span> : null}
                {valor}
            </p>
        </div>
    );
}
