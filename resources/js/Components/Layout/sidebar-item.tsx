import { Link, usePage } from '@inertiajs/react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: number;
  isSub?: boolean;
}

export default function SidebarItem({
  label,
  href,
  icon: Icon,
  badge,
  isSub = false,
}: SidebarItemProps) {
  const { url } = usePage();
  const isActive = url === href || url.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={clsx(
        'nav-item',
        isSub && 'pl-7 text-[13px]',
        isActive && 'nav-item-active'
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
