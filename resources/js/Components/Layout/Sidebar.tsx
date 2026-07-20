import { Link, usePage } from '@inertiajs/react';
import { Leaf, LogOut } from 'lucide-react';
import { getMenuPorRol } from '@/Config/menu';
import SidebarItem from './sidebar-item';
import type { PageProps } from '@/types';

export default function Sidebar() {
  const { auth } = usePage<PageProps>().props;
  const roles = auth?.user?.roles ?? [];

  // Detectar rol por URL actual (más fiable que depender del serializado de roles)
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const rol = pathname.startsWith('/nutricionista') ? 'nutricionista'
    : pathname.startsWith('/endocrinologo') ? 'endocrinologo'
    : roles.find(r => r.nombre === 'nutricionista') ? 'nutricionista'
    : 'endocrinologo';

  const items = getMenuPorRol(rol);
  const dashboardHref = rol === 'nutricionista' ? '/nutricionista/dashboard' : '/endocrinologo/dashboard';

  return (
    <aside
      className="sticky top-0 flex h-screen w-[220px] shrink-0 flex-col border-r
        border-surface-border bg-surface-card px-3.5 py-5 shadow-sidebar transition-colors
        dark:border-surface-border-dark dark:bg-surface-card-dark dark:shadow-sidebar-dark"
    >
      <Link
        href={dashboardHref}
        className="mb-6 flex items-center gap-2 px-1.5 text-lg font-bold text-ink dark:text-ink-dark"
      >
        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-brand-green">
          <Leaf size={13} className="text-white" strokeWidth={2.5} />
        </span>
        Nutrigo
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {items.map((item) => (
          <div key={item.href}>
            <SidebarItem
              label={item.label}
              href={item.href}
              icon={item.icon}
              badge={item.badge}
            />
            {item.children?.map((child) => (
              <SidebarItem key={child.href} label={child.label} href={child.href} isSub />
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl bg-gradient-to-br from-[#3D3A34] to-[#2C2A25] p-3.5 text-center text-white">
        <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-brand-green">
          <Leaf size={20} strokeWidth={1.8} />
        </div>
        <p className="mb-2.5 text-[11.5px] leading-snug text-white/85">
          Inicia tu prueba GRATIS y accede a todas las herramientas de Nutrigo.
        </p>
        <button className="w-full rounded-lg bg-brand-green py-1.5 text-xs font-bold text-[#173312]">
          Reclamar ahora
        </button>
      </div>

      <Link
        href="/logout"
        method="post"
        as="button"
        className="mt-3.5 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12.5px]
          text-ink-muted hover:bg-black/[0.03] dark:text-ink-muted-dark dark:hover:bg-white/[0.04]"
      >
        <LogOut size={16} strokeWidth={1.8} />
        Cerrar sesión
      </Link>
    </aside>
  );
}
