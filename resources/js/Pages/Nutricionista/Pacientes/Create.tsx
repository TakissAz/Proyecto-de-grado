import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import PacienteFormulario, { PacienteFormValues } from '@/Components/Pacientes/PacienteFormulario';
import type { PageProps } from '@/types';

const valoresIniciales: PacienteFormValues = { nombres: '', apellido_paterno: '', apellido_materno: '', ci: '', fecha_nacimiento: '', sexo: 'femenino', telefono: '', direccion: '', ocupacion: '', estado_civil: '', fecha_registro: '', email: '', password: '' };

export default function Create({ flash }: PageProps) {
    const { data, setData, post, processing, errors } = useForm<PacienteFormValues>({ ...valoresIniciales });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); post('/nutricionista/pacientes', { preserveScroll: false }); };

    return (
        <AuthenticatedLayout header={<h2>Registrar paciente</h2>}>
            <Head title="Registrar paciente" />
            <div className="space-y-5">
                <div className="bg-base-100 border border-base-300 rounded-2xl p-5 space-y-4">
                    <div><h3 className="text-lg font-extrabold text-base-content">Nueva paciente</h3><p className="text-xs text-base-content/60">Completa los datos de la paciente y su cuenta de acceso.</p></div>
                    {flash?.success ? <div className="alert alert-success text-xs py-2">{flash.success}</div> : null}
                    {flash?.error ? <div className="alert alert-error text-xs py-2">{flash.error}</div> : null}
                    <form onSubmit={handleSubmit}>
                        <PacienteFormulario data={data} setData={setData as (f: keyof PacienteFormValues, v: string) => void} errors={errors} mode="create" />
                        <div className="flex justify-end gap-2 mt-5">
                            <Link href="/nutricionista/pacientes" className="btn btn-ghost btn-sm gap-1"><ArrowLeft size={14} /> Volver</Link>
                            <button type="submit" className="btn btn-primary btn-sm gap-1.5" disabled={processing}><Save size={14} /> {processing ? 'Guardando...' : 'Registrar paciente'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
