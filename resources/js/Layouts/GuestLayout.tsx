import ApplicationLogo from '@/Components/ApplicationLogo';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return <main className="min-h-screen bg-[#f8faf7] text-ink dark:bg-surface-bg-dark dark:text-ink-dark">
        <div className="grid min-h-screen lg:grid-cols-[minmax(500px,1.05fr)_minmax(460px,.95fr)]">
            <section className="relative hidden min-h-screen overflow-hidden bg-[#263326] text-white lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
                <img src="/images/login/hero-nutrigo.png" alt="Alimentos frescos para una nutrición integral" className="absolute inset-0 h-full w-full object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/[.08] to-[#102019]/95" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-transparent" aria-hidden="true" />

                <div />

                <div className="relative z-10 max-w-lg">
                    <h1 className="max-w-xl text-5xl font-black leading-[1.06] tracking-[-.04em] xl:text-[58px]">Alcanzá tus metas<br/>con <span className="italic text-[#83df76]">acompañamiento</span><br/>profesional.</h1>
                    <p className="mt-5 max-w-md text-[15px] leading-7 text-white/70">Conectamos pacientes y nutricionistas<br/>para un camino más saludable.</p>
                </div>
            </section>

            <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:px-12">
                <div className="pointer-events-none absolute inset-0" aria-hidden="true"><div className="absolute -right-28 -top-28 size-80 rounded-full bg-brand-green/[.08] blur-3xl"/><div className="absolute -bottom-28 -left-20 size-72 rounded-full bg-brand-orange/[.055] blur-3xl"/></div>
                <div className="relative z-10 w-full max-w-[440px]">
                    <div className="mb-8 flex items-center gap-3 lg:hidden"><span className="grid size-11 place-items-center rounded-2xl bg-brand-green text-white shadow-lg shadow-brand-green/20"><ApplicationLogo className="size-6 fill-current"/></span><div><p className="font-black leading-none">Nutrigo</p><p className="mt-1 text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Salud endocrina y nutrición integral</p></div></div>
                    <div className="rounded-[24px] border border-surface-border/80 bg-white p-6 shadow-[0_24px_70px_rgba(28,48,28,.08)] sm:p-8 dark:border-surface-border-dark dark:bg-surface-card-dark dark:shadow-black/20">{children}</div>
                    <p className="mt-5 text-center text-[10px] text-ink-muted/70 dark:text-ink-muted-dark/70">© {new Date().getFullYear()} Nutrigo · Plataforma de atención integral</p>
                </div>
            </section>
        </div>
    </main>;
}
