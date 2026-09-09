import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AvatarPaciente from '@/Components/ui/avatar-paciente';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Camera,
    Save,
    ShieldCheck,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    BadgeCheck,
    ImagePlus,
    X,
} from 'lucide-react';
import { FormEvent, useMemo } from 'react';

interface Perfil {
    name: string;
    email: string;
    avatar_url?: string | null;
    estado_cuenta?: string | null;
    telefono?: string | null;
    direccion?: string | null;
    fecha_nacimiento?: string | null;
    edad?: number | null;
    sexo: string;
}

/* ── Componente de error ── */
function Error({ text }: { text?: string }) {
    return text
        ? <span className="mt-1 flex items-center gap-1 text-[10.5px] text-error">{text}</span>
        : null;
}

/* ── Campo de formulario con ícono ── */
function Campo({
    label, icono: Icono, children, hint, full,
}: {
    label: string;
    icono: React.ElementType;
    children: React.ReactNode;
    hint?: string;
    full?: boolean;
}) {
    return (
        <label className={`flex flex-col gap-1 ${full ? 'sm:col-span-2' : ''}`}>
            <span className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                <Icono size={11} strokeWidth={2} />
                {label}
            </span>
            {children}
            {hint && <span className="text-[9.5px] text-ink-muted dark:text-ink-muted-dark">{hint}</span>}
        </label>
    );
}

const inputClass = `w-full rounded-xl border border-surface-border bg-black/[0.015] px-3.5 py-2.5 text-[13px]
    text-ink outline-none transition placeholder:text-ink-muted/40
    focus:border-category-dairy/50 focus:ring-2 focus:ring-category-dairy/10
    dark:border-surface-border-dark dark:bg-white/[0.03] dark:text-ink-dark
    dark:focus:border-category-dairy/40`;

export default function MiPerfil({ perfil }: { perfil: Perfil }) {
    const form = useForm<{
        telefono: string;
        direccion: string;
        avatar: File | null;
        _method: string;
    }>({
        telefono: perfil.telefono ?? '',
        direccion: perfil.direccion ?? '',
        avatar: null,
        _method: 'PUT',
    });

    const preview = useMemo(
        () => form.data.avatar ? URL.createObjectURL(form.data.avatar) : perfil.avatar_url,
        [form.data.avatar, perfil.avatar_url],
    );

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(route('paciente.mi-perfil.actualizar'), { forceFormData: true, preserveScroll: true });
    };

    return (
        <AuthenticatedLayout header={<h2>Mi perfil</h2>}>
            <Head title="Mi perfil" />
            <main className="mx-auto max-w-4xl space-y-5">

                {/* ══ BANNER DE PERFIL ══════════════════════════════════ */}
                <section className="card-elevated overflow-hidden">
                    {/* Degradado lila */}
                    <div className="h-28 bg-gradient-to-r from-category-dairy/20 via-category-dairy/8 to-transparent" />

                    <div className="-mt-14 flex flex-wrap items-end gap-5 px-6 pb-6">
                        {/* Avatar con badge */}
                        <div className="relative">
                            <div className="rounded-full ring-4 ring-surface-card dark:ring-surface-card-dark shadow-lg">
                                <AvatarPaciente nombre={perfil.name} avatarUrl={preview} size="xl" />
                            </div>
                        </div>

                        {/* Nombre + email */}
                        <div className="pb-1 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-[20px] font-black text-ink dark:text-ink-dark leading-tight truncate">
                                    {perfil.name}
                                </p>
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9.5px] font-bold capitalize
                                    border-category-dairy/30 bg-category-dairy/[0.08] text-category-dairy`}>
                                    <BadgeCheck size={10} strokeWidth={2} />
                                    {perfil.estado_cuenta ?? 'activa'}
                                </span>
                            </div>
                            <p className="mt-0.5 text-[12px] text-ink-muted dark:text-ink-muted-dark">{perfil.email}</p>
                        </div>

                        {/* Datos rápidos */}
                        <div className="flex items-center gap-4 pb-1">
                            {perfil.edad && (
                                <div className="text-center">
                                    <p className="text-[18px] font-black text-category-dairy leading-none">{perfil.edad}</p>
                                    <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">años</p>
                                </div>
                            )}
                            {perfil.sexo && (
                                <div className="text-center">
                                    <p className="text-[13px] font-bold text-ink dark:text-ink-dark capitalize leading-none">{perfil.sexo}</p>
                                    <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">sexo</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ══ FORMULARIO ═══════════════════════════════════════ */}
                <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_320px]">

                    {/* ── Datos personales ── */}
                    <section className="card-elevated p-6 space-y-5">
                        <div>
                            <h3 className="text-[15px] font-bold text-ink dark:text-ink-dark flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-category-dairy/15">
                                    <User size={13} strokeWidth={2} className="text-category-dairy" />
                                </span>
                                Datos personales
                            </h3>
                            <p className="mt-1 text-[11px] text-ink-muted dark:text-ink-muted-dark">
                                Puedes actualizar únicamente información básica de contacto.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* ── Solo lectura ── */}
                            <div className="sm:col-span-2 rounded-xl border border-surface-border bg-black/[0.02] px-4 py-3 dark:border-surface-border-dark dark:bg-white/[0.02]">
                                <div className="flex items-center gap-1.5 mb-3">
                                    <ShieldCheck size={11} strokeWidth={2} className="text-ink-muted/50 dark:text-ink-muted-dark/50" />
                                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                                        Información no modificable
                                    </span>
                                </div>
                                <div className="grid sm:grid-cols-3 gap-3">
                                    <div>
                                        <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">
                                            <User size={9} strokeWidth={2} /> Nombre
                                        </p>
                                        <p className="text-[13px] font-semibold text-ink dark:text-ink-dark">{perfil.name}</p>
                                    </div>
                                    <div>
                                        <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">
                                            <Mail size={9} strokeWidth={2} /> Correo
                                        </p>
                                        <p className="text-[12px] font-semibold text-ink dark:text-ink-dark truncate">{perfil.email}</p>
                                    </div>
                                    <div>
                                        <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">
                                            <Calendar size={9} strokeWidth={2} /> Fecha de nacimiento
                                        </p>
                                        <p className="text-[13px] font-semibold text-ink dark:text-ink-dark">
                                            {perfil.fecha_nacimiento
                                                ? new Date(perfil.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })
                                                : '—'}
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-3 text-[9.5px] text-ink-muted dark:text-ink-muted-dark">
                                    Estos datos solo pueden modificarse a través del equipo de salud.
                                </p>
                            </div>

                            {/* ── Editables ── */}
                            <Campo label="Teléfono" icono={Phone}>
                                <input
                                    className={inputClass}
                                    value={form.data.telefono}
                                    onChange={e => form.setData('telefono', e.target.value)}
                                    placeholder="Ej. 70012345"
                                />
                                <Error text={form.errors.telefono} />
                            </Campo>

                            <Campo label="Dirección" icono={MapPin} full>
                                <input
                                    className={inputClass}
                                    value={form.data.direccion}
                                    onChange={e => form.setData('direccion', e.target.value)}
                                    placeholder="Tu dirección"
                                />
                                <Error text={form.errors.direccion} />
                            </Campo>
                        </div>

                        {/* Datos de solo lectura */}
                        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-surface-border dark:border-surface-border-dark">
                            <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] px-4 py-3">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">Edad</p>
                                <p className="text-[18px] font-black text-ink dark:text-ink-dark leading-none">
                                    {perfil.edad ?? '—'}
                                    {perfil.edad && <span className="text-[12px] font-semibold text-ink-muted ml-1">años</span>}
                                </p>
                            </div>
                            <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] px-4 py-3">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">Sexo</p>
                                <p className="text-[14px] font-bold text-ink dark:text-ink-dark capitalize">{perfil.sexo || '—'}</p>
                            </div>
                        </div>
                    </section>

                    {/* ── Foto de perfil ── */}
                    <div className="space-y-4">
                        <section className="card-elevated p-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-category-dairy/15">
                                    <Camera size={14} strokeWidth={2} className="text-category-dairy" />
                                </span>
                                <div>
                                    <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Foto de perfil</h3>
                                    <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">
                                        Ayuda al equipo de salud a identificarte.
                                    </p>
                                </div>
                            </div>

                            {/* Preview del avatar */}
                            <div className="flex justify-center">
                                <div className="relative">
                                    <AvatarPaciente nombre={perfil.name} avatarUrl={preview} size="xl" />
                                    {form.data.avatar && (
                                        <button
                                            type="button"
                                            onClick={() => form.setData('avatar', null)}
                                            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-category-fruits text-white shadow"
                                        >
                                            <X size={10} strokeWidth={2.5} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Input de archivo */}
                            <label className="flex flex-col items-center gap-2 cursor-pointer rounded-xl border-2 border-dashed border-category-dairy/30 bg-category-dairy/[0.04] px-4 py-5 transition hover:border-category-dairy/50 hover:bg-category-dairy/[0.07] dark:bg-category-dairy/[0.03]">
                                <ImagePlus size={20} strokeWidth={1.8} className="text-category-dairy/70" />
                                <span className="text-[11px] font-semibold text-category-dairy">
                                    {form.data.avatar ? form.data.avatar.name : 'Seleccionar imagen'}
                                </span>
                                <span className="text-[9.5px] text-ink-muted dark:text-ink-muted-dark">
                                    JPG, PNG o WebP · máx. 2 MB
                                </span>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="sr-only"
                                    onChange={e => form.setData('avatar', e.target.files?.[0] ?? null)}
                                />
                            </label>
                            <Error text={form.errors.avatar} />

                            {/* Aviso de privacidad */}
                            <div className="flex items-start gap-2 rounded-xl bg-brand-green/[0.05] border border-brand-green/15 p-3">
                                <ShieldCheck size={13} strokeWidth={2} className="shrink-0 mt-0.5 text-brand-green-dark dark:text-brand-green" />
                                <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark leading-relaxed">
                                    Tu foto es de uso interno y solo la verá el equipo de salud asignado.
                                </p>
                            </div>
                        </section>

                        {/* Acciones */}
                        <div className="flex flex-col gap-2">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-category-dairy px-5 py-2.5 text-[13px] font-bold text-white shadow-sm shadow-category-dairy/20 transition hover:-translate-y-0.5 hover:opacity-90 disabled:opacity-60"
                            >
                                <Save size={14} strokeWidth={2} />
                                {form.processing ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                            <Link
                                href={route('paciente.dashboard')}
                                className="flex w-full items-center justify-center rounded-xl border border-surface-border bg-transparent px-5 py-2.5 text-[13px] font-semibold text-ink-muted transition hover:bg-black/[0.03] dark:border-surface-border-dark dark:text-ink-muted-dark dark:hover:bg-white/[0.03]"
                            >
                                Cancelar
                            </Link>
                        </div>
                    </div>
                </form>
            </main>
        </AuthenticatedLayout>
    );
}
