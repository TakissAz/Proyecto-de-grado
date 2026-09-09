import { Activity, CalendarCheck, HeartPulse, Leaf, Settings, Stethoscope, TrendingUp, Utensils } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export type RoleWelcomePreloaderProps = { userName?: string; userId?: number|string; role?: string; show?: boolean; durationMs?: number; forceShow?: boolean; onFinish?: () => void };

const configs = {
  administrador: { panel:'Panel general del sistema', preparing:'Preparando métricas y actividad...', accent:'text-category-dairy', bg:'from-category-dairy/20 via-white to-brand-green/10 dark:via-[#171b21]', icons:[Settings, Activity, TrendingUp] },
  endocrinologo: { panel:'Panel de Endocrinología', preparing:'Preparando información clínica...', accent:'text-info', bg:'from-info/20 via-white to-brand-green/10 dark:via-[#171b21]', icons:[Stethoscope, HeartPulse, Activity] },
  nutricionista: { panel:'Panel de Nutrición', preparing:'Preparando planificación nutricional...', accent:'text-brand-green', bg:'from-brand-green/20 via-white to-brand-orange/10 dark:via-[#171b21]', icons:[Leaf, Utensils, TrendingUp] },
  paciente: { panel:'Tu espacio de seguimiento nutricional', preparing:'Organizando tu bienestar de hoy...', accent:'text-brand-green', bg:'from-brand-green/20 via-white to-info/10 dark:via-[#171b21]', icons:[HeartPulse, CalendarCheck, TrendingUp] },
};

export default function RoleWelcomePreloader({ userName, userId='anon', role='usuario', show=true, durationMs=2800, forceShow=false, onFinish }:RoleWelcomePreloaderProps) {
  const normalized = role.toLowerCase() as keyof typeof configs;
  const config = configs[normalized] ?? { panel:'Panel del sistema', preparing:'Preparando tu panel...', accent:'text-brand-green', bg:'from-brand-green/15 via-white to-info/10 dark:via-[#171b21]', icons:[Leaf, Activity, TrendingUp] };
  const key = `welcome_preloader_seen_v3_${normalized}_${userId}`;
  const [visible,setVisible] = useState(false);
  const firstName = useMemo(() => (userName?.trim().replace(/^(lic\.?|dra?\.?|nut\.?|ing\.?)\s+/i,'').split(/\s+/)[0] || 'Usuario'),[userName]);
  const close = () => { try { sessionStorage.setItem(key,'1'); } catch {} setVisible(false); onFinish?.(); };

  useEffect(() => {
    if (!show) return;
    let seen=false; try { seen=sessionStorage.getItem(key)==='1'; } catch {}
    if (!forceShow && seen) return;
    setVisible(true); const timer=window.setTimeout(close,Math.min(3000,Math.max(800,durationMs)));
    return () => window.clearTimeout(timer);
  },[show,key,durationMs,forceShow]);
  if (!visible) return null;
  const saludo = normalized==='paciente' ? 'Bienvenida' : 'Bienvenido/a';

  return <div role="status" aria-live="polite" aria-label="Preparando panel" className={`role-welcome fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br ${config.bg} p-5 backdrop-blur-md`}>
    <style>{`@keyframes welcomeFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}@keyframes welcomeLoad{from{transform:scaleX(0)}to{transform:scaleX(1)}}@keyframes welcomeIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}.role-welcome-card{animation:welcomeIn .35s ease-out}.role-welcome-float{animation:welcomeFloat 1.8s ease-in-out infinite}.role-welcome-load{animation:welcomeLoad 1.5s ease-out forwards;transform-origin:left}@media(prefers-reduced-motion:reduce){.role-welcome-card,.role-welcome-float,.role-welcome-load{animation:none!important}}`}</style>
    <div className="role-welcome-card relative w-full max-w-md overflow-hidden rounded-2xl border border-white/70 bg-white/90 p-7 text-center shadow-2xl dark:border-white/10 dark:bg-[#1b2027]/95">
      <button type="button" onClick={close} className="absolute right-4 top-4 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-ink-muted hover:bg-black/5 dark:hover:bg-white/5">Omitir</button>
      <div className="mx-auto mb-5 flex h-20 items-center justify-center gap-3">
        {config.icons.map((Icon,index)=><div key={index} className={`role-welcome-float flex h-12 w-12 items-center justify-center rounded-2xl border border-current/15 bg-white/70 ${config.accent} dark:bg-white/5`} style={{animationDelay:`${index*180}ms`}}><Icon size={22}/></div>)}
      </div>
      <p className={`text-[10px] font-bold uppercase tracking-[.2em] ${config.accent}`}>Nutrigo</p>
      <h1 className="mt-2 text-2xl font-bold text-ink dark:text-ink-dark">{saludo}, {firstName}</h1>
      <p className="mt-2 text-sm font-semibold text-ink-muted dark:text-ink-muted-dark">{config.panel}</p>
      <div className="mx-auto mt-6 h-1.5 max-w-xs overflow-hidden rounded-full bg-black/10 dark:bg-white/10"><div className="role-welcome-load h-full rounded-full bg-brand-green"/></div>
      <p className="mt-3 text-[11px] text-ink-muted dark:text-ink-muted-dark">{config.preparing}</p>
    </div>
  </div>;
}
