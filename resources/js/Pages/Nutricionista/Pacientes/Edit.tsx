import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import PacienteFormulario, { PacienteFormValues } from '@/Components/Pacientes/PacienteFormulario';
import type { PageProps } from '@/types';

interface PacienteRow { id_paciente: number; ci: string; nombres?: string | null; apellido_paterno?: string | null; apellido_materno?: string | null; fecha_nacimiento: string; telefono?: string | null; direccion?: string | null; ocupacion?: string | null; estado_civil?: string | null; fecha_registro?: string | null; user?: { email?: string | null } | null; }
interface Props extends PageProps { paciente: PacienteRow; }

export default function Edit({ paciente, flash }: Props) {
    const { data, setData, post, processing, errors } = useForm<PacienteFormValues>({
        nombres: paciente.nombres ?? '', apellido_paterno: paciente.apellido_paterno ?? '', apellido_materno: paciente.apellido_materno ?? '',
        ci: paciente.ci ?? '', fecha_nacimiento: paciente.fecha_nacimiento ?? '', sexo: 'femenino',
        telefono: paciente.telefono ?? '', direccion: paciente.direccion ?? '', ocupacion: paciente.ocupacion ?? '',
        estado_civil: paciente.estado_civil ?? '', fecha_registro: paciente.fecha_registro ?? '',
        email: paciente.user?.email ?? '', password: '',
    });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); post(`/nutricionista/pacientes/${paciente.id_paciente}?_method=PUT`, { preserveScroll: true }); };

    return (
        <AuthenticatedLayout header={<h2>Editar paciente</h2>}>
            <Head title={`Editar: ${paciente.ci}`} />
            <div className="space-y-5">
                <div className="bg-base-100 border border-base-300 rounded-2xl p-5 space-y-4">
                    <div><h3 className="text-lg font-extrabold text-base-content">Editar paciente</h3></div>
                    {flash?.success ? <div className="alert alert-success text-xs py-2">{flash.success}</div> : null}
                    <form onSubmit={handleSubmit}>
                        <PacienteFormulario data={data} setData={setData as (f: keyof PacienteFormValues, v: string) => void} errors={errors} mode="edit" />
                        <div className="flex justify-end gap-2 mt-5">
                            <Link href={`/nutricionista/pacientes/${paciente.id_paciente}`} className="btn btn-ghost btn-sm gap-1"><ArrowLeft size={14} /> Volver</Link>
                            <button type="submit" className="btn btn-primary btn-sm gap-1.5" disabled={processing}><Save size={14} /> Guardar cambios</button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
