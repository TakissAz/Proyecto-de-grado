import { useEffect, useState } from 'react';

type Size = 'sm' | 'md' | 'lg' | 'xl';
const sizes: Record<Size, string> = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-24 w-24 text-2xl' };

export default function AvatarPaciente({ nombre, avatarUrl, size = 'md', subtitle }: { nombre: string; avatarUrl?: string | null; size?: Size; subtitle?: string }) {
  const [fallo, setFallo] = useState(false);
  useEffect(() => setFallo(false), [avatarUrl]);
  const iniciales = nombre.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';
  const clase = `${sizes[size]} shrink-0 rounded-full border border-brand-green/20 object-cover`;

  return <div className="inline-flex items-center gap-3">
    {avatarUrl && !fallo
      ? <img src={avatarUrl} alt={`Foto de ${nombre}`} className={clase} onError={() => setFallo(true)} />
      : <div className={`${clase} flex items-center justify-center bg-brand-green/10 font-bold text-brand-green-dark dark:text-brand-green`} aria-label={`Iniciales de ${nombre}`}>{iniciales}</div>}
    {subtitle && <span className="text-xs text-ink-muted dark:text-ink-muted-dark">{subtitle}</span>}
  </div>;
}
