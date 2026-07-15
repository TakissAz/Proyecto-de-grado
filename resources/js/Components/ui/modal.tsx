import type { PropsWithChildren } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  abierto: boolean;
  titulo: string;
  subtitulo?: string;
  onCerrar: () => void;
}

export default function Modal({
  abierto,
  titulo,
  subtitulo,
  onCerrar,
  children,
}: PropsWithChildren<ModalProps>) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onCerrar}
        aria-hidden="true"
      />

      <div className="card-elevated relative z-10 w-full max-w-md p-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">{titulo}</h3>
            {subtitulo && (
              <p className="mt-0.5 text-[11.5px] text-ink-muted dark:text-ink-muted-dark">{subtitulo}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:bg-black/[0.05] dark:text-ink-muted-dark dark:hover:bg-white/[0.06]"
          >
            <X size={15} strokeWidth={1.8} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
