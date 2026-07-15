import ApplicationLogo from '@/Components/ApplicationLogo';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen relative overflow-hidden bg-base-200 flex items-center py-8 md:py-12">
            {/* Background decorative gradients */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(circle at 20% 20%, rgba(46,139,39,0.12), transparent 24%), radial-gradient(circle at 80% 10%, rgba(242,147,42,0.10), transparent 22%), radial-gradient(circle at 50% 90%, rgba(143,166,188,0.07), transparent 20%)',
                }}
            />

            <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
                <div className="overflow-hidden rounded-3xl border border-base-300 shadow-xl bg-base-100">
                    <div className="grid grid-cols-1 md:grid-cols-[0.95fr_1.05fr] min-h-[auto] md:min-h-[760px]">
                        {/* Left panel - branding */}
                        <div
                            className="p-6 md:p-10 border-r border-base-300 flex flex-col justify-between gap-8"
                            style={{
                                background: 'linear-gradient(160deg, var(--fallback-b1,oklch(var(--b1))) 0%, var(--fallback-b2,oklch(var(--b2))) 58%, var(--fallback-b3,oklch(var(--b3))) 100%)',
                            }}
                        >
                            <div>
                                {/* Logo */}
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                        <ApplicationLogo className="h-7 w-7 fill-current text-primary-content" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-black text-base-content leading-none">PMOS</h1>
                                        <p className="text-xs text-base-content/50">Plataforma clínica y nutricional</p>
                                    </div>
                                </div>

                                {/* Hero text */}
                                <div className="max-w-lg">
                                    <span className="badge badge-sm bg-primary/10 text-primary border-0 font-bold mb-3">
                                        Interfaz estructurada
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-black text-base-content leading-tight mb-3">
                                        Una experiencia clínica clara, ordenada y más visual.
                                    </h2>
                                    <p className="text-base-content/60">
                                        El sistema conserva su lógica, pero la interfaz adopta una composición más limpia: sidebar fija, tarjetas con jerarquía y colores cálidos.
                                    </p>
                                </div>
                            </div>

                            {/* Feature cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    ['Seguimiento', 'Pacientes y estados'],
                                    ['Orden', 'Jerarquía visual'],
                                    ['Color', 'Verde y naranja'],
                                ].map(([titulo, texto]) => (
                                    <div
                                        key={titulo}
                                        className="border border-base-300 rounded-2xl p-4 bg-base-100/70"
                                    >
                                        <p className="font-extrabold text-sm text-base-content">{titulo}</p>
                                        <p className="text-xs text-base-content/50">{texto}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right panel - form area */}
                        <div className="p-6 md:p-12 flex items-center justify-center bg-base-100">
                            <div className="w-full max-w-md">{children}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
