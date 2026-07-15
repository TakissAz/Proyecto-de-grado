import { useEffect, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Alerta from '@/Components/ui/alerta';
import { BotonLink } from '@/Components/ui/boton';
import PacientesToolbar from '@/Components/Pacientes/PacientesToolbar';
import PacientesTabla, { type PacienteRow } from '@/Components/Pacientes/PacientesTabla';
import PacientesPaginacion from '@/Components/Pacientes/PacientesPaginacion';
import type { PageProps } from '@/types';

interface PaginatedPacientes {
  data: PacienteRow[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

interface Filters {
  buscar: string;
}

interface Props extends PageProps {
  pacientes: PaginatedPacientes;
  filtros: Filters;
}

export default function Index({ pacientes, filtros, flash }: Props) {
  const [buscar, setBuscar] = useState(filtros.buscar ?? '');
  const buscarRef = useRef(buscar);
  buscarRef.current = buscar;

  useEffect(() => {
    setBuscar(filtros.buscar ?? '');
  }, [filtros.buscar]);

  function aplicarFiltros(pagina = 1) {
    const params = new URLSearchParams();
    if (buscarRef.current) params.set('buscar', buscarRef.current);
    params.set('page', String(pagina));
    window.location.href = `/endocrinologo/pacientes?${params.toString()}`;
  }

  function limpiarFiltros() {
    setBuscar('');
    window.location.href = '/endocrinologo/pacientes';
  }

  function cambiarEstado(idPaciente: number, accion: 'activar' | 'inactivar') {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/endocrinologo/pacientes/${idPaciente}/${accion}`;
    form.style.display = 'none';

    const csrf = document.createElement('input');
    csrf.name = '_token';
    csrf.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

    const method = document.createElement('input');
    method.name = '_method';
    method.value = 'PATCH';

    form.append(csrf, method);
    document.body.appendChild(form);
    form.submit();
  }

  return (
    <AuthenticatedLayout title="Pacientes">
      <Head title="Pacientes - Endocrinologo" />

      <div className="space-y-5">
        {flash?.success && <Alerta tipo="success">{flash.success}</Alerta>}
        {flash?.error && <Alerta tipo="error">{flash.error}</Alerta>}
        {flash?.nueva_consulta_paciente_id && (
          <Alerta tipo="success">
            <span>Paciente registrada. Puedes iniciar la primera consulta.</span>
            <BotonLink
              href={`/endocrinologo/pacientes/${flash.nueva_consulta_paciente_id}`}
              variante="ghost"
              className="!p-0 font-semibold text-brand-green-dark hover:underline dark:text-brand-green"
            >
              Ver perfil →
            </BotonLink>
          </Alerta>
        )}

        <div className="card-elevated overflow-hidden">
          <PacientesToolbar
            total={pacientes.meta.total}
            buscar={buscar}
            onBuscarChange={setBuscar}
            onSubmit={() => aplicarFiltros(1)}
            onLimpiar={limpiarFiltros}
          />

          <PacientesTabla pacientes={pacientes.data} onCambiarEstado={cambiarEstado} />

          <PacientesPaginacion
            mostrando={pacientes.data.length}
            total={pacientes.meta.total}
            paginaActual={pacientes.meta.current_page}
            ultimaPagina={pacientes.meta.last_page}
            onCambiarPagina={aplicarFiltros}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
