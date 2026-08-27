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
    : pathname.startsWith('/paciente') ? 'paciente'
    : pathname.startsWith('/admin') ? 'administrador'
    : roles.find(r => ['administrador', 'superadministrador'].includes(r.nombre)) ? 'administrador'
    : roles.find(r => r.nombre === 'nutricionista') ? 'nutricionista'
    : roles.find(r => r.nombre === 'paciente') ? 'paciente'
    : roles.find(r => r.nombre === 'endocrinologo') ? 'endocrinologo'
    : 'endocrinologo';

  const items = getMenuPorRol(rol);
  const dashboardHref = rol === 'nutricionista' ? '/nutricionista/dashboard'
    : rol === 'paciente' ? '/paciente/dashboard'
    : rol === 'administrador' ? '/admin/dashboard'
    : '/endocrinologo/dashboard';

  return (
    <aside
      className="sticky top-0 flex h-screen w-[220px] shrink-0 flex-col border-r
        border-brand-green/10 bg-brand-green-soft/[0.18] px-3.5 py-5 shadow-sidebar transition-colors
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

      {rol === 'paciente' ? (
        <div className="mt-auto rounded-2xl border border-brand-green/20 bg-brand-green/[0.05] p-3.5">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green"><Leaf size={17} /></div>
          <p className="text-[11.5px] font-bold text-ink dark:text-ink-dark">Tu bienestar, paso a paso</p>
          <p className="mt-1 text-[10px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">Consulta tu plan y registra tu avance para que nutrición pueda acompañarte.</p>
        </div>
      ) : rol === 'nutricionista' ? null : rol === 'administrador' ? (
        <div className="mt-auto rounded-2xl border border-category-dairy/15 bg-category-dairy/[0.04] p-3.5">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-category-dairy/10 text-category-dairy"><Leaf size={17} /></div>
          <p className="text-[11.5px] font-bold text-ink dark:text-ink-dark">Control del sistema</p>
          <p className="mt-1 text-[10px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">Supervisa usuarios, pacientes, auditoría y actividad desde módulos separados.</p>
        </div>
      ) : (
        <div className="mt-auto rounded-2xl border border-info/15 bg-info/[0.04] p-3.5">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-info/10 text-info"><Leaf size={17} /></div>
          <p className="text-[11.5px] font-bold text-ink dark:text-ink-dark">Atención endocrinológica</p>
          <p className="mt-1 text-[10px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">Gestiona consultas y abre el perfil de una paciente para completar su evaluación clínica.</p>
        </div>
      )}

      <Link
        href="/logout"
        method="post"
        as="button"
        className="mt-3.5 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12.5px]
          text-ink-muted hover:bg-white/60 hover:text-category-fruits dark:text-ink-muted-dark dark:hover:bg-white/[0.04]"
      >
        <LogOut size={16} strokeWidth={1.8} />
        Cerrar sesión
      </Link>
    </aside>
  );
}
