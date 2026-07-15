import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Alerta from '@/Components/ui/alerta';
import ModalNuevaConsulta from '@/Components/Consultas/ModalNuevaConsulta';
import PerfilCabecera from './Show/PerfilCabecera';
import PerfilDatosPersonales from './Show/PerfilDatosPersonales';
import PerfilAccesosRapidos from './Show/PerfilAccesosRapidos';
import type { PageProps } from '@/types';

interface PacienteRow {
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

interface Props extends PageProps {
    paciente: PacienteRow;
}

export default function Show({ paciente, flash }: Props) {
    const [modalConsultaAbierto, setModalConsultaAbierto] = useState(false);
    const id = paciente.id_paciente;
    const nombre = paciente.nombre_completo ?? paciente.user?.name ?? 'Paciente';

    function enviarEstado(accion: 'activar' | 'inactivar') {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/endocrinologo/pacientes/${id}/${accion}`;
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
        <AuthenticatedLayout title="Perfil de paciente">
            <Head title={`Paciente: ${paciente.ci}`} />

            <div className="space-y-5">
                {flash?.success && <Alerta tipo="success">{flash.success}</Alerta>}
                {flash?.error && <Alerta tipo="error">{flash.error}</Alerta>}

                {/* Cabecera tipo perfil */}
                <PerfilCabecera
                    id={id}
                    nombre={nombre}
                    ci={paciente.ci}
                    email={paciente.user?.email}
                    edad={paciente.edad}
                    estado={paciente.estado}
                    onActivar={() => enviarEstado('activar')}
                    onInactivar={() => enviarEstado('inactivar')}
                    onNuevaConsulta={() => setModalConsultaAbierto(true)}
                />

                {/* Contenido en 2 columnas */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
                    <div className="lg:col-span-3">
                        <PerfilDatosPersonales
                            sexo={paciente.sexo}
                            fechaNacimiento={paciente.fecha_nacimiento}
                            edad={paciente.edad}
                            telefono={paciente.telefono}
                            direccion={paciente.direccion}
                            ocupacion={paciente.ocupacion}
                            estadoCivil={paciente.estado_civil}
                            fechaRegistro={paciente.fecha_registro}
                            observaciones={paciente.observaciones}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <PerfilAccesosRapidos idPaciente={id} />
                    </div>
                </div>
            </div>

            <ModalNuevaConsulta
                abierto={modalConsultaAbierto}
                idPaciente={id}
                nombrePaciente={nombre}
                urlGuardar={`/endocrinologo/pacientes/${id}/consultas`}
                onCerrar={() => setModalConsultaAbierto(false)}
            />
        </AuthenticatedLayout>
    );
}
