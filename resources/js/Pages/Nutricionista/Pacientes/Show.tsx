import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, CheckCircle, XCircle, Salad } from 'lucide-react';
import PacienteResumen from '@/Components/Pacientes/PacienteResumen';
import type { PageProps } from '@/types';

interface PacienteRow { id_paciente: number; ci: string; nombre_completo?: string | null; fecha_nacimiento: string; edad?: number | null; sexo: string; telefono?: string | null; direccion?: string | null; ocupacion?: string | null; estado_civil?: string | null; fecha_registro?: string | null; observaciones?: string | null; estado: 'activo' | 'inactivo'; user?: { name?: string | null; email?: string | null } | null; }
interface Props extends PageProps { paciente: PacienteRow; }

export default function Show({ paciente, flash }: Props) {
    const id = paciente.id_paciente;
    const enviarEstado = (accion: 'activar' | 'inactivar') => {
        const form = document.createElement('form'); form.method = 'POST'; form.action = `/nutricionista/pacientes/${id}/${accion}`; form.style.display = 'none';
        const csrf = document.createElement('input'); csrf.name = '_token'; csrf.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
        const method = document.createElement('input'); method.name = '_method'; method.value = 'PATCH';
        form.appendChild(csrf); form.appendChild(method); document.body.appendChild(form); form.submit();
    };

    return (
        <AuthenticatedLayout header={<h2>Perfil de paciente</h2>}>
            <Head title={`Paciente: ${paciente.ci}`} />
            <div className="space-y-4">
                {flash?.success ? <div className="alert alert-success text-xs py-2">{flash.success}</div> : null}
                <PacienteResumen paciente={paciente} actions={
                    <>
                        <Link href={`/nutricionista/pacientes/${id}/perfil-nutricional`} className="btn btn-primary btn-sm gap-1"><Salad size={14} /> Perfil nutricional</Link>
                        <Link href={`/nutricionista/pacientes/${id}/edit`} className="btn btn-outline btn-sm gap-1"><Edit size={14} /> Editar</Link>
                        <button className="btn btn-outline btn-success btn-sm gap-1" disabled={paciente.estado === 'activo'} onClick={() => enviarEstado('activar')}><CheckCircle size={14} /> Activar</button>
                        <button className="btn btn-outline btn-warning btn-sm gap-1" disabled={paciente.estado === 'inactivo'} onClick={() => enviarEstado('inactivar')}><XCircle size={14} /> Inactivar</button>
                        <Link href="/nutricionista/pacientes" className="btn btn-ghost btn-sm gap-1"><ArrowLeft size={14} /> Listado</Link>
                    </>
                } />
            </div>
        </AuthenticatedLayout>
    );
}
