import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { ArrowLeft, Pencil, CheckCircle, Ban } from 'lucide-react';
import PacienteResumen from '@/Components/Pacientes/PacienteResumen';
import { Badge } from '@/Components/ui/badge';
import { Boton, BotonLink } from '@/Components/ui/boton';
import Alerta from '@/Components/ui/alerta';

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
    const id = paciente.id_paciente;

    const enviarFormEstado = (url: string) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;
        form.style.display = 'none';
        const csrf = document.createElement('input');
        csrf.name = '_token';
        csrf.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
        const method = document.createElement('input');
        method.name = '_method';
        method.value = 'PATCH';
        form.appendChild(csrf);
        form.appendChild(method);
        document.body.appendChild(form);
        form.submit();
    };

    const actions = (
        <>
            <BotonLink href={`/admin/pacientes/${id}/edit`}>
                <Pencil size={13} strokeWidth={1.8} /> Editar
            </BotonLink>
            <Boton variante="outline" disabled={paciente.estado === 'activo'} onClick={() => enviarFormEstado(`/admin/pacientes/${id}/activar`)}>
                <CheckCircle size={13} strokeWidth={1.8} /> Activar
            </Boton>
            <Boton variante="outline" disabled={paciente.estado === 'inactivo'} onClick={() => enviarFormEstado(`/admin/pacientes/${id}/inactivar`)}>
                <Ban size={13} strokeWidth={1.8} /> Inactivar
            </Boton>
            <BotonLink href="/admin/pacientes" variante="ghost">
                <ArrowLeft size={13} strokeWidth={1.8} /> Volver al listado
            </BotonLink>
        </>
    );

    const badges = (
        <Badge variante={paciente.estado === 'activo' ? 'success' : 'warning'}>{paciente.estado}</Badge>
    );

    return (
        <AuthenticatedLayout header={<h2>Perfil de paciente</h2>}>
            <Head title={`Paciente: ${paciente.ci}`} />

            <div className="space-y-4">
                {flash?.success ? <Alerta tipo="success">{flash.success}</Alerta> : null}
                {flash?.error ? <Alerta tipo="error">{flash.error}</Alerta> : null}

                <PacienteResumen paciente={paciente} actions={actions} badges={badges} />
            </div>
        </AuthenticatedLayout>
    );
}
