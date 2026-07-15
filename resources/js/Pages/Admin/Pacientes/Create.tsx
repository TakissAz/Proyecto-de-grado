import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import PacienteFormulario, { PacienteFormValues } from '@/Components/Pacientes/PacienteFormulario';

interface Props extends PageProps {}

const valoresIniciales: PacienteFormValues = {
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    ci: '',
    fecha_nacimiento: '',
    sexo: 'femenino',
    telefono: '',
    direccion: '',
    ocupacion: '',
    estado_civil: '',
    fecha_registro: '',
    email: '',
    password: '',
};

export default function Create({ flash }: Props) {
    const { data, setData, post, processing, errors } = useForm<PacienteFormValues>({ ...valoresIniciales });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/pacientes', { preserveScroll: false });
    };

    return (
        <AuthenticatedLayout header={<h2>Crear paciente</h2>}>
            <Head title="Crear paciente" />

            <div className="space-y-5">
                <div className="bg-base-100 border border-base-300 rounded-2xl p-5">
                    <div className="mb-5">
                        <h2 className="text-xl font-extrabold text-base-content">Nueva paciente</h2>
                        <p className="text-sm text-base-content/60">Completa los datos de la paciente y su cuenta de acceso al sistema.</p>
                    </div>

                    {flash?.success ? <div className="alert alert-success text-sm mb-4">{flash.success}</div> : null}
                    {flash?.error ? <div className="alert alert-error text-sm mb-4">{flash.error}</div> : null}

                    <form onSubmit={handleSubmit}>
                        <PacienteFormulario
                            data={data}
                            setData={setData as (field: keyof PacienteFormValues, value: string) => void}
                            errors={errors}
                            mode="create"
                        />

                        <div className="flex gap-2 justify-end mt-5 flex-wrap">
                            <Link href="/admin/pacientes" className="btn btn-ghost btn-sm gap-1.5">
                                <ArrowLeft size={14} /> Volver al listado
                            </Link>
                            <button type="submit" className="btn btn-primary btn-sm gap-1.5" disabled={processing}>
                                <Save size={14} /> {processing ? 'Guardando...' : 'Crear paciente'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
