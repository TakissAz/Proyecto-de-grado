import { Link } from '@inertiajs/react';
import { Leaf, LogOut, Stethoscope } from 'lucide-react';
import { getMenuPorRol } from '@/Config/menu';
import SidebarItem from './sidebar-item';
import type { RolActivo } from './app-layout';

interface SidebarProps {
  rol: RolActivo;
}

/* ── Tema por rol ────────────────────────────────────────────── */
const TEMA = {
  nutricionista: {
    border:     'border-brand-green/10',
    bg:         'bg-brand-green-soft/[0.18]',
    logoBg:     'bg-brand-green',
    cardBorder: 'border-brand-green/20',
    cardBg:     'bg-brand-green/[0.05]',
    cardIconBg: 'bg-brand-green/15',
    cardIconTx: 'text-brand-green-dark dark:text-brand-green',
    cardTitle:  'Tu paciente, tu plan',
    cardDesc:   'Revisa perfiles, planes y derivaciones para acompañar a cada paciente.',
  },
  endocrinologo: {
    border:     'border-brand-orange/15',
    bg:         'bg-brand-orange/[0.06]',
    logoBg:     'bg-brand-orange',
    cardBorder: 'border-brand-orange/20',
    cardBg:     'bg-brand-orange/[0.05]',
    cardIconBg: 'bg-brand-orange/15',
    cardIconTx: 'text-brand-orange',
    cardTitle:  'Atención endocrinológica',
    cardDesc:   'Gestiona consultas y abre el perfil de una paciente para completar su evaluación clínica.',
  },
  paciente: {
    border:     'border-category-dairy/15',
    bg:         'bg-category-dairy/[0.06]',
    logoBg:     'bg-category-dairy',
    cardBorder: 'border-category-dairy/20',
    cardBg:     'bg-category-dairy/[0.05]',
    cardIconBg: 'bg-category-dairy/15',
    cardIconTx: 'text-category-dairy',
    cardTitle:  'Tu bienestar, paso a paso',
    cardDesc:   'Consulta tu plan y registra tu avance para que nutrición pueda acompañarte.',
  },
  administrador: {
    border:     'border-category-dairy/15',
    bg:         'bg-category-dairy/[0.04]',
    logoBg:     'bg-category-dairy',
    cardBorder: 'border-category-dairy/15',
    cardBg:     'bg-category-dairy/[0.04]',
    cardIconBg: 'bg-category-dairy/10',
    cardIconTx: 'text-category-dairy',
    cardTitle:  'Control del sistema',
    cardDesc:   'Supervisa usuarios, pacientes, auditoría y actividad desde módulos separados.',
  },
} as const;

export default function Sidebar({ rol }: SidebarProps) {
  const t = TEMA[rol];
  const items = getMenuPorRol(rol);

  const dashboardHref = rol === 'nutricionista' ? '/nutricionista/dashboard'
    : rol === 'paciente' ? '/paciente/dashboard'
    : rol === 'administrador' ? '/admin/dashboard'
    : '/endocrinologo/dashboard';

  const LogoIcon = rol === 'endocrinologo' ? Stethoscope : Leaf;

  return (
    <aside
      className={`sticky top-0 flex h-screen w-[220px] shrink-0 flex-col border-r px-3.5 py-5 shadow-sidebar transition-colors
        ${t.border} ${t.bg}
        dark:border-surface-border-dark dark:bg-surface-card-dark dark:shadow-sidebar-dark`}
    >
      {/* Logo imagen */}
      <Link
        href={dashboardHref}
        className="mb-6 flex items-center gap-2 px-1.5"
      >
        <img src="/images/logo.png" alt="Almendra Nutrición" className="h-8 w-auto" />
      </Link>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {items.map((item) => (
          <div key={item.href}>
            <SidebarItem
              label={item.label}
              href={item.href}
              icon={item.icon}
              badge={item.badge}
              rol={rol}
            />
            {item.children?.map((child) => (
              <SidebarItem key={child.href} label={child.label} href={child.href} isSub rol={rol} />
            ))}
          </div>
        ))}
      </nav>

      {/* Card inferior */}
      <div className={`mt-auto rounded-2xl border p-3.5 ${t.cardBorder} ${t.cardBg}`}>
        <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${t.cardIconBg} ${t.cardIconTx}`}>
          <LogoIcon size={17} />
        </div>
        <p className="text-[11.5px] font-bold text-ink dark:text-ink-dark">{t.cardTitle}</p>
        <p className="mt-1 text-[10px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">{t.cardDesc}</p>
      </div>

      {/* Logout */}
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
