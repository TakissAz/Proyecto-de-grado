import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, CheckCircle, Ban } from 'lucide-react';
import PacienteResumen from '@/Components/Pacientes/PacienteResumen';
import { Badge } from '@/Components/ui/badge';

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
            <Link href={`/admin/pacientes/${id}/edit`} className="btn btn-primary btn-sm gap-1.5">
                <Pencil size={14} /> Editar
            </Link>
            <button className="btn btn-outline btn-success btn-sm gap-1.5" disabled={paciente.estado === 'activo'} onClick={() => enviarFormEstado(`/admin/pacientes/${id}/activar`)}>
                <CheckCircle size={14} /> Activar
            </button>
            <button className="btn btn-outline btn-warning btn-sm gap-1.5" disabled={paciente.estado === 'inactivo'} onClick={() => enviarFormEstado(`/admin/pacientes/${id}/inactivar`)}>
                <Ban size={14} /> Inactivar
            </button>
            <Link href="/admin/pacientes" className="btn btn-ghost btn-sm gap-1.5">
                <ArrowLeft size={14} /> Volver al listado
            </Link>
        </>
    );

    const badges = (
        <Badge variante={paciente.estado === 'activo' ? 'success' : 'warning'}>{paciente.estado}</Badge>
    );

    return (
        <AuthenticatedLayout header={<h2>Perfil de paciente</h2>}>
            <Head title={`Paciente: ${paciente.ci}`} />

            <div className="space-y-4">
                {flash?.success ? <div className="alert alert-success text-sm">{flash.success}</div> : null}
                {flash?.error ? <div className="alert alert-error text-sm">{flash.error}</div> : null}

                <PacienteResumen paciente={paciente} actions={actions} badges={badges} />
            </div>
        </AuthenticatedLayout>
    );
}
