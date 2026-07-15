import { Link } from '@inertiajs/react';
import { CheckCircle2, Eye, SquarePen, X } from 'lucide-react';

interface PacienteFilaAccionesProps {
  idPaciente: number;
  estado: 'activo' | 'inactivo';
  onCambiarEstado: (idPaciente: number, accion: 'activar' | 'inactivar') => void;
}

export default function PacienteFilaAcciones({
  idPaciente,
  estado,
  onCambiarEstado,
}: PacienteFilaAccionesProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/endocrinologo/pacientes/${idPaciente}`}
        title="Ver perfil"
        className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors
          hover:bg-brand-green-soft hover:text-brand-green-dark
          dark:text-ink-muted-dark dark:hover:bg-brand-green-dark/20 dark:hover:text-brand-green"
      >
        <Eye size={14} strokeWidth={1.8} />
      </Link>

      <Link
        href={`/endocrinologo/pacientes/${idPaciente}/edit`}
        title="Editar"
        className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors
          hover:bg-brand-orange/10 hover:text-brand-orange dark:text-ink-muted-dark"
      >
        <SquarePen size={14} strokeWidth={1.8} />
      </Link>

      {estado === 'inactivo' ? (
        <button
          type="button"
          title="Activar"
          onClick={() => onCambiarEstado(idPaciente, 'activar')}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors
            hover:bg-brand-green-soft hover:text-brand-green-dark
            dark:text-ink-muted-dark dark:hover:bg-brand-green-dark/20 dark:hover:text-brand-green"
        >
          <CheckCircle2 size={14} strokeWidth={1.8} />
        </button>
      ) : (
        <button
          type="button"
          title="Inactivar"
          onClick={() => onCambiarEstado(idPaciente, 'inactivar')}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors
            hover:bg-category-fruits/10 hover:text-category-fruits dark:text-ink-muted-dark"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      )}
    </div>
  );
}
