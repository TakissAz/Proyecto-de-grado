import { useEffect, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Alerta from '@/Components/ui/alerta';
import PacientesToolbar from '@/Components/Pacientes/PacientesToolbar';
import PacientesTabla, { type PacienteRow } from '@/Components/Pacientes/PacientesTabla';
import PacientesPaginacion from '@/Components/Pacientes/PacientesPaginacion';
import type { PageProps } from '@/types';

interface PaginatedPacientes {
  data: PacienteRow[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface Filters {
  buscar: string;
}

interface Props extends PageProps {
  pacientes: PaginatedPacientes;
  filtros: Filters;
}

const BASE_PATH = '/nutricionista/pacientes';

export default function Index({ pacientes, filtros, flash }: Props) {
  const [buscar, setBuscar] = useState(filtros.buscar ?? '');
  const buscarRef = useRef(buscar);
  buscarRef.current = buscar;

  useEffect(() => {
    setBuscar(filtros.buscar ?? '');
  }, [filtros.buscar]);

  function aplicarFiltros(pagina = 1) {
    const params = new URLSearchParams();
    if (buscarRef.current.trim()) params.set('buscar', buscarRef.current.trim());
    params.set('page', String(pagina));
    window.location.href = `${BASE_PATH}?${params.toString()}`;
  }

  function limpiarFiltros() {
    setBuscar('');
    window.location.href = BASE_PATH;
  }

  function cambiarEstado(idPaciente: number, accion: 'activar' | 'inactivar') {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${BASE_PATH}/${idPaciente}/${accion}`;
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
      <Head title="Pacientes - Nutricionista" />

      <div className="space-y-5">
        {flash?.success && <Alerta tipo="success">{flash.success}</Alerta>}
        {flash?.error && <Alerta tipo="error">{flash.error}</Alerta>}

        <section className="card-elevated overflow-hidden">
          <PacientesToolbar
            total={pacientes.meta.total}
            buscar={buscar}
            basePath={BASE_PATH}
            onBuscarChange={setBuscar}
            onSubmit={() => aplicarFiltros(1)}
            onLimpiar={limpiarFiltros}
          />

          <PacientesTabla
            pacientes={pacientes.data}
            basePath={BASE_PATH}
            onCambiarEstado={cambiarEstado}
          />

          <PacientesPaginacion
            mostrando={pacientes.data.length}
            total={pacientes.meta.total}
            paginaActual={pacientes.meta.current_page}
            ultimaPagina={pacientes.meta.last_page}
            onCambiarPagina={aplicarFiltros}
          />
        </section>
      </div>
    </AuthenticatedLayout>
  );
}