import ApplicationLogo from '@/Components/ApplicationLogo';
import { ImageIcon, ShieldCheck } from 'lucide-react';
import { PropsWithChildren } from 'react';

// Cuando tengas la imagen institucional, coloca su ruta pública aquí.
// Ejemplo: const COVER_IMAGE = '/images/login/portada-nutricional.webp';
const COVER_IMAGE = '';

export default function Guest({ children }: PropsWithChildren) {
    const portada = COVER_IMAGE
        ? {
            backgroundImage: `linear-gradient(180deg, rgba(17, 55, 47, 0.28), rgba(13, 39, 35, 0.88)), url('${COVER_IMAGE}')`,
        }
        : undefined;

    return (
        <main className="min-h-screen bg-surface-bg text-ink dark:bg-surface-bg-dark dark:text-ink-dark">
            <div className="grid min-h-screen lg:grid-cols-[minmax(420px,0.92fr)_minmax(540px,1.08fr)]">
                <section
                    className="relative hidden overflow-hidden bg-[#173f38] bg-cover bg-center text-white lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:p-10 xl:p-14"
                    style={portada}
                >
                    {!COVER_IMAGE && (
                        <div className="absolute inset-0" aria-hidden="true">
                            <div className="absolute -left-24 -top-20 h-96 w-96 rounded-full bg-brand-green/20 blur-3xl" />
                            <div className="absolute -bottom-24 -right-12 h-[30rem] w-[30rem] rounded-full bg-brand-orange/15 blur-3xl" />
                            <div className="absolute inset-0 opacity-[0.09] [background-image:radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:26px_26px]" />
                        </div>
                    )}

                    <div className="relative z-10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="grid size-11 place-items-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
                                <ApplicationLogo className="size-6 fill-current text-white" />
                            </span>
                            <div>
                                <p className="text-lg font-black leading-none tracking-tight">Sistema PMOS</p>
                                <p className="mt-1 text-[11px] text-white/65">Gestión clínica y nutricional</p>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] backdrop-blur-sm">
                            <ShieldCheck size={13} /> Acceso seguro
                        </span>
                    </div>

                    <div className="relative z-10 max-w-xl">
                        {!COVER_IMAGE && (
                            <div className="mb-8 inline-flex items-center gap-2 rounded-2xl border border-dashed border-white/25 bg-white/[0.06] px-4 py-3 text-xs text-white/65">
                                <ImageIcon size={16} /> Espacio preparado para la imagen institucional
                            </div>
                        )}
                        <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-white/75">
                            Sistema PMOS
                        </p>
                        <h1 className="max-w-xl text-5xl font-black leading-[0.98] tracking-[-0.045em] xl:text-6xl">
                            Almendra
                            <br />
                            Nutrición Integral
                        </h1>
                        <p className="mt-6 max-w-md text-[15px] leading-7 text-white/80">
                            Plataforma de gestión clínica y nutricional para el equipo del consultorio.
                        </p>
                    </div>

                    <p className="relative z-10 text-[11px] text-white/55">
                        Solo el personal autorizado puede acceder al sistema.
                    </p>
                </section>

                <section className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden" aria-hidden="true">
                        <div className="absolute -right-20 -top-24 size-72 rounded-full bg-brand-green/10 blur-3xl" />
                        <div className="absolute -bottom-24 -left-16 size-72 rounded-full bg-brand-orange/10 blur-3xl" />
                    </div>

                    <div className="relative z-10 w-full max-w-[430px]">
                        <div className="mb-9 flex items-center gap-3 lg:hidden">
                            <span className="grid size-11 place-items-center rounded-2xl bg-brand-green-dark text-white shadow-lg shadow-brand-green-dark/15">
                                <ApplicationLogo className="size-6 fill-current" />
                            </span>
                            <div>
                                <p className="font-black leading-none">Sistema PMOS</p>
                                <p className="mt-1 text-[11px] text-ink-muted dark:text-ink-muted-dark">Gestión clínica y nutricional</p>
                            </div>
                        </div>
                        {children}
                    </div>
                </section>
            </div>
        </main>
    );
}