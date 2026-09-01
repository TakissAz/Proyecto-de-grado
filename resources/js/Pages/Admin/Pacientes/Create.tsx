import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import PacienteFormulario, { PacienteFormValues } from '@/Components/Pacientes/PacienteFormulario';
import { Boton, BotonLink } from '@/Components/ui/boton';
import Alerta from '@/Components/ui/alerta';

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

            <div className="mx-auto max-w-4xl space-y-5">
                {flash?.success ? <Alerta tipo="success">{flash.success}</Alerta> : null}
                {flash?.error ? <Alerta tipo="error">{flash.error}</Alerta> : null}

                <div className="card-elevated overflow-hidden">
                    <div className="flex items-center gap-3 border-b border-surface-border bg-brand-green-soft/[0.18] px-5 py-4 dark:border-surface-border-dark dark:bg-brand-green-dark/10">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green">
                            <UserPlus size={19} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-bold text-ink dark:text-ink-dark">Nueva paciente</h2>
                            <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark">Completa los datos de la paciente y su cuenta de acceso al sistema.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-5">
                        <PacienteFormulario
                            data={data}
                            setData={setData as (field: keyof PacienteFormValues, value: string) => void}
                            errors={errors}
                            mode="create"
                        />

                        <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-surface-border pt-4 dark:border-surface-border-dark">
                            <BotonLink href="/admin/pacientes" variante="ghost">
                                <ArrowLeft size={13} strokeWidth={1.8} /> Volver al listado
                            </BotonLink>
                            <Boton type="submit" disabled={processing}>
                                <Save size={13} strokeWidth={1.8} /> {processing ? 'Guardando...' : 'Crear paciente'}
                            </Boton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
