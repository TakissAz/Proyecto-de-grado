import {
  LayoutDashboard,
  Activity,
  Calendar,
  CalendarClock,
  MessageSquare,
  Salad,
  ClipboardList,
  TrendingUp,
  Users,
  CookingPot,
  ShoppingCart,
  UserCog,
  UserRound,
  ShieldCheck,
  DatabaseBackup,
  LogIn,
  BrainCircuit,
  FileBarChart,
  Send,
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
    label: 'Pacientes',
    href: '/endocrinologo/pacientes',
    icon: Users,
  },
  {
    label: 'Citas',
    href: '/endocrinologo/citas',
    icon: CalendarClock,
  },
];

export const menuAdministrador: MenuItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Usuarios', href: '/admin/users', icon: UserCog },
  { label: 'Pacientes', href: '/admin/pacientes', icon: Users },
  { label: 'Auditoría', href: '/admin/auditoria/pacientes', icon: ShieldCheck },
  { label: 'Actividad', href: '/admin/auditoria/actividad', icon: Activity },
  { label: 'Logs de acceso', href: '/admin/logs-acceso', icon: LogIn },
  { label: 'Base de datos', href: '/admin/base-datos', icon: DatabaseBackup },
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
  { label: 'Derivaciones', href: '/nutricionista/derivaciones', icon: Send },
  {
    label: 'Reglas nutricionales',
    href: '/nutricionista/reglas-nutricionales',
    icon: BrainCircuit,
  },
  {
    label: 'Citas',
    href: '/nutricionista/citas',
    icon: CalendarClock,
  },
  {
    label: 'Progreso',
    href: '/nutricionista/progreso',
    icon: TrendingUp,
  },
  {
    label: 'Vigencia de planes',
    href: '/nutricionista/vigencia-planes',
    icon: CalendarClock,
  },
  {
    label: 'Reportes',
    href: '/nutricionista/reportes',
    icon: FileBarChart,
  },
];

/* ═══ Menú Paciente ═══ */
export const menuPaciente: MenuItem[] = [
  {
    label: 'Inicio',
    href: '/paciente/dashboard',
    icon: LayoutDashboard,
  },
  { label: 'Mi perfil', href: '/paciente/mi-perfil', icon: UserRound },
  {
    label: 'Mi Plan',
    href: '/paciente/mi-plan',
    icon: Salad,
  },
  {
    label: 'Seguimiento',
    href: '/paciente/seguimiento',
    icon: ClipboardList,
  },
  {
    label: 'Síntomas y bienestar',
    href: '/paciente/sintomas',
    icon: Activity,
  },
  {
    label: 'Lista de compras',
    href: '/paciente/compras',
    icon: ShoppingCart,
  },
  {
    label: 'Habla con tu nutricionista',
    href: '/paciente/orientacion',
    icon: MessageSquare,
  },
  {
    label: 'Historial',
    href: '/paciente/historial',
    icon: CalendarClock,
  },
  {
    label: 'Citas',
    href: '/paciente/citas',
    icon: Calendar,
  },
];

/* ═══ Default (fallback) ═══ */
export const menuItems = menuEndocrinologo;

/* ═══ Selector por rol ═══ */
export function getMenuPorRol(rol: string): MenuItem[] {
  if (rol === 'administrador' || rol === 'superadministrador') return menuAdministrador;
  if (rol === 'nutricionista') return menuNutricionista;
  if (rol === 'endocrinologo') return menuEndocrinologo;
  if (rol === 'paciente') return menuPaciente;
  return menuEndocrinologo;
}
