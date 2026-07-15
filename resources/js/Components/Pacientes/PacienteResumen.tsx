import type { ReactNode } from 'react';
import AvatarIniciales from '@/Components/ui/avatar-iniciales';
import EstadoPill from '@/Components/ui/estado-pill';
import { Badge } from '@/Components/ui/badge';

interface PacienteResumenData {
  id_paciente: number;
  ci: string;
  nombre_completo?: string | null;
  fecha_nacimiento: string;
  edad?: number | null;
  sexo: string;
  telefono?: string | null;
  direccion?: string | null;
  ocupacion?: string | null;
  estado_civil?: string | null;
  fecha_registro?: string | null;
  observaciones?: string | null;
  estado: 'activo' | 'inactivo';
  user?: { name?: string | null; email?: string | null } | null;
}

interface PacienteResumenProps {
  paciente: PacienteResumenData;
  actions?: ReactNode;
  badges?: ReactNode;
}

function Dato({ label, valor }: { label: string; valor: ReactNode }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">
        {label}
      </p>
      <p className="mt-0.5 text-[13px] text-ink dark:text-ink-dark">{valor || '—'}</p>
    </div>
  );
}

export default function PacienteResumen({ paciente, actions, badges }: PacienteResumenProps) {
  const nombre = paciente.nombre_completo ?? paciente.user?.name ?? 'Paciente';

  return (
    <div className="card-elevated p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <AvatarIniciales nombre={nombre} size={52} />
          <div>
            <h2 className="text-[17px] font-bold text-ink dark:text-ink-dark">{nombre}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <EstadoPill activo={paciente.estado === 'activo'} textoActivo="Activa" textoInactivo="Inactiva" />
              {badges}
              <Badge color={paciente.sexo === 'femenino' ? 'purple' : 'blue'}>
                {paciente.sexo === 'femenino' ? 'Femenino' : 'Masculino'}
              </Badge>
            </div>
          </div>
        </div>

        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-surface-border pt-4 dark:border-surface-border-dark sm:grid-cols-3 lg:grid-cols-4">
        <Dato label="CI" valor={paciente.ci} />
        <Dato label="Edad" valor={paciente.edad ? `${paciente.edad} años` : null} />
        <Dato label="Fecha de nacimiento" valor={paciente.fecha_nacimiento} />
        <Dato label="Telefono" valor={paciente.telefono} />
        <Dato label="Direccion" valor={paciente.direccion} />
        <Dato label="Ocupacion" valor={paciente.ocupacion} />
        <Dato label="Estado civil" valor={paciente.estado_civil} />
        <Dato label="Registrada el" valor={paciente.fecha_registro} />
        <Dato label="Correo" valor={paciente.user?.email} />
      </div>

      {paciente.observaciones && (
        <div className="mt-4 border-t border-surface-border pt-4 dark:border-surface-border-dark">
          <Dato label="Observaciones" valor={paciente.observaciones} />
        </div>
      )}
    </div>
  );
}
