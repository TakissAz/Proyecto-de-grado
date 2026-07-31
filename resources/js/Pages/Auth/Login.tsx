import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, LogIn, Mail } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('login'), {
            preserveScroll: true,
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Iniciar sesión" />

            <div className="mb-8">
                <span className="mb-5 grid size-11 place-items-center rounded-2xl bg-brand-green-soft text-brand-green-dark dark:bg-brand-green-dark/20 dark:text-brand-green">
                    <LogIn size={20} strokeWidth={1.8} />
                </span>
                <h1 className="text-3xl font-black tracking-[-0.035em] text-ink dark:text-ink-dark sm:text-[34px]">
                    Bienvenido
                </h1>
                <p className="mt-2 text-sm leading-6 text-ink-muted dark:text-ink-muted-dark">
                    Ingresa tus credenciales para acceder al sistema.
                </p>
            </div>

            {status && (
                <div className="mb-5 rounded-xl border border-brand-green/20 bg-brand-green-soft px-4 py-3 text-xs font-medium text-brand-green-dark dark:bg-brand-green-dark/15 dark:text-brand-green">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label htmlFor="email" className="mb-2 block text-xs font-bold text-ink dark:text-ink-dark">
                        Correo electrónico
                    </label>
                    <div className="relative">
                        <Mail size={16} strokeWidth={1.7} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/60 dark:text-ink-muted-dark/60" />
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            placeholder="tu@correo.com"
                            autoComplete="username"
                            autoFocus
                            onChange={(event) => setData('email', event.target.value)}
                            className="campo-input h-12 rounded-xl bg-surface-card pl-10 pr-4 text-[13px] dark:bg-surface-card-dark"
                        />
                    </div>
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <label htmlFor="password" className="mb-2 block text-xs font-bold text-ink dark:text-ink-dark">
                        Contraseña
                    </label>
                    <div className="relative">
                        <LockKeyhole size={16} strokeWidth={1.7} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/60 dark:text-ink-muted-dark/60" />
                        <input
                            id="password"
                            type={mostrarPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            placeholder="Ingresa tu contraseña"
                            autoComplete="current-password"
                            onChange={(event) => setData('password', event.target.value)}
                            className="campo-input h-12 rounded-xl bg-surface-card pl-10 pr-11 text-[13px] dark:bg-surface-card-dark"
                        />
                        <button
                            type="button"
                            onClick={() => setMostrarPassword((actual) => !actual)}
                            className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-black/[0.04] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.05] dark:hover:text-ink-dark"
                            aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                            {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex cursor-pointer items-center gap-2.5">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(event) => setData('remember', event.target.checked)}
                        />
                        <span className="text-xs text-ink-muted dark:text-ink-muted-dark">Recordarme</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-xs font-semibold text-brand-green-dark transition-colors hover:text-brand-green dark:text-brand-green"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="group flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-brand-green-dark px-5 text-sm font-bold text-white shadow-lg shadow-brand-green-dark/15 transition hover:bg-[#205f51] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-green dark:text-[#102c27]"
                >
                    {processing ? (
                        <>
                            <span className="loading loading-spinner loading-sm" /> Ingresando…
                        </>
                    ) : (
                        <>
                            Iniciar sesión
                            <span className="grid size-7 place-items-center rounded-lg bg-white/12 transition-transform group-hover:translate-x-0.5 dark:bg-black/10">
                                <ArrowRight size={15} />
                            </span>
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 flex items-center justify-center border-t border-surface-border pt-6 dark:border-surface-border-dark">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted transition-colors hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark"
                >
                    <ArrowLeft size={13} /> Volver al inicio
                </Link>
            </div>
        </GuestLayout>
    );
}