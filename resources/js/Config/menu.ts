import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Salad,
  ClipboardList,
  TrendingUp,
  Dumbbell,
  HeartPulse,
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

export const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/endocrinologo/dashboard',
    icon: LayoutDashboard,
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
