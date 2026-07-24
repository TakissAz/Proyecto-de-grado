   import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Activity, Heart, Shield } from 'lucide-react';
import { Tarjeta } from '@/Components/ui/tarjeta';

export default function Dashboard() {
    const { auth } = usePage().props as { auth: { user: { name: string } } };
    const nombre = auth?.user?.name ?? 'Usuario';

    return (
        <AuthenticatedLayout header={<h2>Dashboard</h2>}>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Bienvenida */}
                <div>
                    <h2 className="text-2xl font-extrabold text-base-content">
                        Bienvenido, {nombre.split(' ')[0]}
                    </h2>
                    <p className="text-sm text-base-content/60 mt-1">
                        Sistema de gestión clínica para Síndrome de Ovario Poliquístico Metabólico.
                    </p>
                </div>

                {/* Info card */}
                <div className="alert border border-primary/20 bg-primary/5">
                    <Shield size={18} className="text-primary shrink-0" />
                    <p className="text-sm text-base-content/80">
                        Tu panel específico será asignado de acuerdo a tu rol en el sistema. Si no ves opciones adicionales, contacta al administrador.
                    </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Tarjeta>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                            <Heart size={20} />
                        </div>
                        <h3 className="font-bold text-base-content mb-1">Perfil clínico</h3>
                        <p className="text-xs text-base-content/50">
                            Evaluación integral: historia menstrual, hiperandrogenismo, ecografía, laboratorios y diagnóstico.
                        </p>
                    </Tarjeta>

                    <Tarjeta>
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-3">
                            <Activity size={20} />
                        </div>
                        <h3 className="font-bold text-base-content mb-1">Seguimiento</h3>
                        <p className="text-xs text-base-content/50">
                            Control de flujo clínico, auditoría y trazabilidad de cada paciente a lo largo del tratamiento.
                        </p>
                    </Tarjeta>

                    <Tarjeta>
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-3">
                            <Shield size={20} />
                        </div>
                        <h3 className="font-bold text-base-content mb-1">Roles y seguridad</h3>
                        <p className="text-xs text-base-content/50">
                            Administración por rol: endocrinólogo, nutricionista, paciente y administrador.
                        </p>
                    </Tarjeta>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
