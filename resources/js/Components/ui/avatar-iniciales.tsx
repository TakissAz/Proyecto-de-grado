interface AvatarInicialesProps {
  nombre: string;
  size?: number;
}

export default function AvatarIniciales({ nombre, size = 32 }: AvatarInicialesProps) {
  const inicial = nombre.trim().charAt(0).toUpperCase() || '?';

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-brand-green-soft
        font-bold text-brand-green-dark dark:bg-brand-green-dark/20 dark:text-brand-green"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {inicial}
    </div>
  );
}
