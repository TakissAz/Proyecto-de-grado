import clsx from 'clsx';
import { Users } from 'lucide-react';
import AvatarIniciales from '@/Components/ui/avatar-iniciales';
import EstadoPill from '@/Components/ui/estado-pill';
import PacienteFilaAcciones from './PacienteFilaAcciones';

export interface UserOption {
  name: string;
  email: string;
}

export interface PacienteRow {
  id_paciente: number;
  nombre_completo?: string | null;
  ci: string;
  fecha_nacimiento: string;
  edad?: number | null;
  telefono?: string | null;
  fecha_registro?: string | null;
  estado: 'activo' | 'inactivo';
  user?: UserOption | null;
}

interface PacientesTablaProps {
  pacientes: PacienteRow[];
  onCambiarEstado: (idPaciente: number, accion: 'activar' | 'inactivar') => void;
}

const COLUMNAS = ['Paciente', 'CI', 'Contacto', 'Edad', 'Registro', 'Estado', ''] as const;

export default function PacientesTabla({ pacientes, onCambiarEstado }: PacientesTablaProps) {
  if (pacientes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
        <Users size={28} strokeWidth={1.2} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
        <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark">No se encontraron pacientes</p>
        <p className="text-[11px] text-ink-muted/60 dark:text-ink-muted-dark/60">
          Intenta con otro termino de busqueda
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px] border-collapse">
        <thead>
          <tr className="border-b border-surface-border text-left text-[11px] font-semibold text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark">
            {COLUMNAS.map((col, i) => (
              <th
                key={col || i}
                className={clsx('px-3 py-2.5', i === 0 && 'px-5', i === COLUMNAS.length - 1 && 'px-5 text-right')}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pacientes.map((p, idx) => (
            <tr
              key={p.id_paciente}
              className={clsx(
                'border-b border-[#F5F2EB] transition-colors hover:bg-[#FAFAF8] dark:border-[#262A32] dark:hover:bg-white/[0.02]',
                idx % 2 !== 0 && 'bg-[#FDFCFA] dark:bg-[#1A1D24]'
              )}
            >
              <td className="px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <AvatarIniciales nombre={p.nombre_completo ?? p.user?.name ?? 'P'} size={32} />
                  <div>
                    <p className="text-[12.5px] font-semibold leading-tight text-ink dark:text-ink-dark">
                      {p.nombre_completo ?? p.user?.name ?? 'Sin nombre'}
                    </p>
                    <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">
                      {p.user?.email ?? '—'}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 text-[12.5px] text-ink dark:text-ink-dark">{p.ci}</td>
              <td className="px-3 py-3 text-[12.5px] text-ink dark:text-ink-dark">{p.telefono ?? '—'}</td>
              <td className="px-3 py-3 text-[12.5px] text-ink dark:text-ink-dark">
                {p.edad ? `${p.edad} años` : '—'}
              </td>
              <td className="px-3 py-3 text-[12.5px] text-ink-muted dark:text-ink-muted-dark">
                {p.fecha_registro ?? '—'}
              </td>
              <td className="px-3 py-3">
                <EstadoPill activo={p.estado === 'activo'} textoActivo="Activa" textoInactivo="Inactiva" />
              </td>
              <td className="px-5 py-3">
                <PacienteFilaAcciones
                  idPaciente={p.id_paciente}
                  estado={p.estado}
                  onCambiarEstado={onCambiarEstado}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
