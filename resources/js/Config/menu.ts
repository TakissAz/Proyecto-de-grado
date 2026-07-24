import {
  LayoutDashboard,
  Calendar,
  CalendarClock,
  MessageSquare,
  Salad,
  ClipboardList,
  TrendingUp,
  Dumbbell,
  HeartPulse,
  Users,
  CookingPot,
  type LucideIcon,
} from 'lucide-react';

export interface MenuChild {
  label: string;
  href: string;
}

export interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  children?: MenuChild[];
}

/* ═══ Menú Endocrinólogo ═══ */
export const menuEndocrinologo: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/endocrinologo/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Citas',
    href: '/endocrinologo/citas',
    icon: CalendarClock,
  },
  {
    label: 'Calendario',
    href: '/endocrinologo/calendario',
    icon: Calendar,
  },
  {
    label: 'Mensajes',
    href: '/endocrinologo/mensajes',
    icon: MessageSquare,
    badge: 3,
  },
  {
    label: 'Menu Saludable',
    href: '/endocrinologo/menu',
    icon: Salad,
  },
  {
    label: 'Plan de Consulta',
    href: '/endocrinologo/plan',
    icon: ClipboardList,
    children: [
      { label: 'Lista de Pacientes', href: '/endocrinologo/pacientes' },
      { label: 'Historial Clinico', href: '/endocrinologo/historial' },
    ],
  },
  {
    label: 'Progreso',
    href: '/endocrinologo/progreso',
    icon: TrendingUp,
  },
  {
    label: 'Ejercicios',
    href: '/endocrinologo/ejercicios',
    icon: Dumbbell,
  },
  {
    label: 'Salud General',
    href: '/endocrinologo/salud',
    icon: HeartPulse,
  },
];

/* ═══ Menú Nutricionista ═══ */
export const menuNutricionista: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/nutricionista/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Pacientes',
    href: '/nutricionista/pacientes',
    icon: Users,
  },
  {
    label: 'Recetas',
    href: '/nutricionista/recetas',
    icon: CookingPot,
  },
  {
    label: 'Citas',
    href: '/nutricionista/citas',
    icon: CalendarClock,
  },
  {
    label: 'Calendario',
    href: '/nutricionista/calendario',
    icon: Calendar,
  },
  {
    label: 'Progreso',
    href: '/nutricionista/progreso',
    icon: TrendingUp,
  },
];

/* ═══ Default (fallback) ═══ */
export const menuItems = menuEndocrinologo;

/* ═══ Selector por rol ═══ */
export function getMenuPorRol(rol: string): MenuItem[] {
  if (rol === 'nutricionista') return menuNutricionista;
  if (rol === 'endocrinologo') return menuEndocrinologo;
  return menuEndocrinologo;
}
