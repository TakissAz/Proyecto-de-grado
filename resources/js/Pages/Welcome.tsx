import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Welcome({
    auth,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    return (
        <>
            <Head title="PMOS - Sistema Clínico" />

            <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center px-4 relative overflow-hidden">
                {/* Background decorativo */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            'radial-gradient(circle at 20% 30%, rgba(46,139,39,0.08), transparent 30%), radial-gradient(circle at 80% 20%, rgba(242,147,42,0.06), transparent 25%), radial-gradient(circle at 50% 80%, rgba(143,166,188,0.05), transparent 30%)',
                    }}
                />

                <div className="relative z-10 text-center max-w-lg">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <ApplicationLogo className="h-9 w-9 fill-current text-primary-content" />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-base-content mb-2">
                        PMOS
                    </h1>
                    <p className="text-base-content/60 text-sm mb-8">
                        Sistema de gestión clínica para Síndrome de Ovario Poliquístico Metabólico.
                        <br />
                        Evaluación endocrinológica, nutricional y seguimiento integral.
                    </p>

                    {/* Acciones */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {auth.user ? (
                            <Link href="/dashboard" className="btn btn-primary gap-2">
                                Ir al panel
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="btn btn-primary">
                                    Iniciar sesión
                                </Link>
                                <Link href={route('register')} className="btn btn-ghost border border-base-300">
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-12">
                        {[
                            ['Endocrinología', 'Perfil clínico completo con diagnóstico PMOS y RI'],
                            ['Nutrición', 'Seguimiento nutricional integrado al flujo clínico'],
                            ['Auditoría', 'Trazabilidad de cada cambio por usuario y fecha'],
                        ].map(([titulo, desc]) => (
                            <div key={titulo} className="bg-base-100 border border-base-300 rounded-2xl p-4 text-left">
                                <p className="text-sm font-bold text-base-content">{titulo}</p>
                                <p className="text-xs text-base-content/50 mt-1">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
