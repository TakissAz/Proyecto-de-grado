import { Link, router, usePage } from '@inertiajs/react';
import { Bell, Menu, Search } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from './theme-toggle';
import type { PageProps } from '@/types';
import type { RolActivo } from './app-layout';

interface TopbarProps {
    title: string;
    rol: RolActivo;
    onMenuClick?: () => void;
}

const ROL_LABEL: Record<RolActivo, string> = {
    nutricionista:  'Nutricionista',
    endocrinologo:  'Endocrinólogo/a',
    paciente:       'Paciente',
    administrador:  'Administrador',
};

/** Clases del contenedor del topbar según rol */
const TOPBAR_TEMA: Record<RolActivo, { wrapper: string; notifBtn: string; rolColor: string }> = {
    nutricionista: {
        wrapper:  'border-brand-green/10 bg-brand-green-soft/[0.18] dark:border-surface-border-dark dark:bg-surface-card-dark',
        notifBtn: 'text-brand-green',
        rolColor: 'text-brand-green-dark dark:text-brand-green',
    },
    endocrinologo: {
        wrapper:  'border-brand-orange/15 bg-brand-orange/[0.06] dark:border-surface-border-dark dark:bg-surface-card-dark',
        notifBtn: 'text-brand-orange',
        rolColor: 'text-brand-orange',
    },
    paciente: {
        wrapper:  'border-category-dairy/15 bg-category-dairy/[0.06] dark:border-surface-border-dark dark:bg-surface-card-dark',
        notifBtn: 'text-category-dairy',
        rolColor: 'text-category-dairy',
    },
    administrador: {
        wrapper:  'border-category-dairy/15 bg-category-dairy/[0.04] dark:border-surface-border-dark dark:bg-surface-card-dark',
        notifBtn: 'text-category-dairy',
        rolColor: 'text-category-dairy',
    },
};

export default function Topbar({ title, rol, onMenuClick }: TopbarProps) {
    const { auth, notificaciones, alertas_vigencia } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);

    const name     = auth?.user?.name?.trim() || 'Usuario';
    const avatar   = auth?.user?.avatar_url ?? auth?.user?.avatar;
    const initials = name
        .replace(/^(lic\.?|dra?\.?|nut\.?)\s+/i, '')
        .split(/\s+/).slice(0, 2)
        .map(p => p[0])
        .join('')
        .toUpperCase();

    const t = TOPBAR_TEMA[rol];

    return (
        <div className={`mb-5 flex items-center justify-between rounded-card border px-4 py-3.5 shadow-card md:px-5 ${t.wrapper}`}>
            {/* Izquierda: menú móvil + título */}
            <div className="flex items-center gap-3">
                <button
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-border dark:border-surface-border-dark lg:hidden"
                    onClick={onMenuClick}
                >
                    <Menu size={16} />
                </button>
                <h1 className="truncate text-xl font-bold text-ink dark:text-ink-dark">{title}</h1>
            </div>

            {/* Derecha: acciones + perfil */}
            <div className="flex items-center gap-3">
                <ThemeToggle />

                {/* Buscador (decorativo) */}
                <button className="hidden h-9 w-9 items-center justify-center rounded-full border border-surface-border dark:border-surface-border-dark sm:flex">
                    <Search size={16} className="text-ink-muted dark:text-ink-muted-dark" />
                </button>

                {/* Notificaciones */}
                <div className="relative">
                    <button
                        onClick={() => setOpen(v => !v)}
                        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-surface-border dark:border-surface-border-dark bg-white dark:bg-surface-card-dark"
                    >
                        <Bell size={16} className="text-ink-muted dark:text-ink-muted-dark" />
                        {!!((notificaciones?.total_no_leidas ?? 0) + (alertas_vigencia?.total ?? 0)) && (
                            <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-brand-orange px-1 text-[9px] font-bold text-white">
                                {(notificaciones?.total_no_leidas ?? 0) + (alertas_vigencia?.total ?? 0)}
                            </span>
                        )}
                    </button>

                    {/* Backdrop para cerrar al clic fuera */}
                    {open && (
                        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    )}

                    {open && (
                        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-xl dark:border-surface-border-dark dark:bg-surface-card-dark">
                            <div className="flex justify-between border-b border-surface-border p-3 dark:border-surface-border-dark">
                                <b className="text-xs text-ink dark:text-ink-dark">Notificaciones</b>
                                {!!notificaciones?.total_no_leidas && (
                                    <button className={`text-[10px] font-semibold ${t.notifBtn}`} onClick={() => router.post('/notificaciones/leer-todas')}>
                                        Marcar todas como leídas
                                    </button>
                                )}
                            </div>
                            {!!alertas_vigencia?.items?.length && <div className="border-b border-surface-border bg-brand-orange/[.035] p-2 dark:border-surface-border-dark">
                                <div className="flex items-center justify-between px-1 pb-1.5"><b className="text-[9px] uppercase tracking-wide text-brand-orange">Vigencia de planes</b><Link href="/nutricionista/vigencia-planes" onClick={() => setOpen(false)} className={`text-[9px] font-bold ${t.notifBtn}`}>Ver calendario</Link></div>
                                {alertas_vigencia.items.map(a => <Link key={a.id_plan_alimentario} href={`/nutricionista/pacientes/${a.paciente.id_paciente}/perfil-nutricional?step=planificacion`} onClick={() => setOpen(false)} className="mb-1 block rounded-lg border border-brand-orange/15 bg-surface-card px-2.5 py-2 hover:border-brand-orange/30 dark:bg-surface-card-dark"><div className="flex items-center justify-between gap-2"><p className="truncate text-[10px] font-bold text-ink dark:text-ink-dark">{a.paciente.nombre}</p><span className="shrink-0 text-[8.5px] font-bold text-brand-orange">{a.dias_restantes < 0 ? `Venció hace ${Math.abs(a.dias_restantes)} d.` : a.dias_restantes === 0 ? 'Vence hoy' : `Faltan ${a.dias_restantes} d.`}</span></div><p className="mt-0.5 truncate text-[8.5px] text-ink-muted">{a.nombre_plan} · hasta {a.fecha_fin}</p></Link>)}
                            </div>}
                            <div className="max-h-80 overflow-y-auto">
                                {notificaciones?.ultimas?.length
                                    ? notificaciones.ultimas.map(n => (
                                        <button
                                            key={n.id_notificacion_interna}
                                            onClick={() => { router.post(`/notificaciones/${n.id_notificacion_interna}/leer`); setOpen(false); }}
                                            className="block w-full border-b border-surface-border p-3 text-left hover:bg-black/[0.02] dark:border-surface-border-dark dark:hover:bg-white/[0.02]"
                                        >
                                            <div className="flex items-start gap-2">
                                                {!n.leida && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />}
                                                <div className={!n.leida ? '' : 'ml-3.5'}>
                                                    <p className="text-[11px] font-bold text-ink dark:text-ink-dark">{n.titulo}</p>
                                                    <p className="mt-0.5 text-[10px] text-ink-muted dark:text-ink-muted-dark">{n.mensaje}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                    : <p className="p-5 text-center text-[11px] text-ink-muted dark:text-ink-muted-dark">{alertas_vigencia?.items?.length ? 'No hay otros mensajes pendientes' : 'Sin notificaciones'}</p>
                                }
                            </div>
                            <Link href="/notificaciones" onClick={() => setOpen(false)} className={`block p-3 text-center text-[10px] font-bold ${t.notifBtn}`}>
                                Ver todas
                            </Link>
                        </div>
                    )}
                </div>

                {/* Perfil */}
                <div className="flex items-center gap-2.5">
                    {avatar
                        ? <img src={avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                        : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E7E4DC] text-[11px] font-bold text-ink">
                            {initials}
                          </div>
                    }
                    <div className="hidden sm:block">
                        <div className="text-[12px] font-semibold text-ink dark:text-ink-dark">{name}</div>
                        <div className={`text-[10px] font-semibold ${t.rolColor}`}>
                            {ROL_LABEL[rol]}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
