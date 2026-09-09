import { Link, usePage } from '@inertiajs/react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import type { RolActivo } from './app-layout';

interface SidebarItemProps {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: number;
  isSub?: boolean;
  rol?: RolActivo;
}

/** Color del item activo según el rol */
const ACTIVE_CLASS: Record<RolActivo, string> = {
  nutricionista:  'bg-brand-green/[0.12] text-brand-green-dark font-semibold dark:bg-brand-green/[0.10] dark:text-brand-green',
  endocrinologo:  'bg-brand-orange/[0.12] text-brand-orange font-semibold dark:bg-brand-orange/[0.10] dark:text-brand-orange',
  paciente:       'bg-category-dairy/[0.12] text-category-dairy font-semibold dark:bg-category-dairy/[0.10] dark:text-category-dairy',
  administrador:  'bg-category-dairy/[0.12] text-category-dairy font-semibold dark:bg-category-dairy/[0.10] dark:text-category-dairy',
};

export default function SidebarItem({
  label,
  href,
  icon: Icon,
  badge,
  isSub = false,
  rol = 'nutricionista',
}: SidebarItemProps) {
  const { url } = usePage();
  const isActive = url === href || url.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={clsx(
        'nav-item',
        isSub && 'pl-7 text-[13px]',
        isActive ? ACTIVE_CLASS[rol] : '',
      )}
    >
      {Icon && <Icon size={16} strokeWidth={1.8} className="shrink-0" />}
      <span>{label}</span>
      {badge ? (
        <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-brand-orange text-[9px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
