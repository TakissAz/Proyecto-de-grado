import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Pencil } from 'lucide-react';
import PacienteFormulario, { PacienteFormValues } from '@/Components/Pacientes/PacienteFormulario';
import { Boton, BotonLink } from '@/Components/ui/boton';
import Alerta from '@/Components/ui/alerta';

interface PacienteRow {
    id_paciente: number;
    ci: string;
    nombres?: string | null;
    apellido_paterno?: string | null;
    apellido_materno?: string | null;
    fecha_nacimiento: string;
    telefono?: string | null;
    direccion?: string | null;
    ocupacion?: string | null;
    estado_civil?: string | null;
    fecha_registro?: string | null;
    user?: { email?: string | null } | null;
}

interface Props extends PageProps {
    paciente: PacienteRow;
}

export default function Edit({ paciente, flash }: Props) {
    const { data, setData, post, processing, errors } = useForm<PacienteFormValues>({
        nombres: paciente.nombres ?? '',
        apellido_paterno: paciente.apellido_paterno ?? '',
        apellido_materno: paciente.apellido_materno ?? '',
        ci: paciente.ci ?? '',
        fecha_nacimiento: paciente.fecha_nacimiento ?? '',
        sexo: 'femenino',
        telefono: paciente.telefono ?? '',
        direccion: paciente.direccion ?? '',
        ocupacion: paciente.ocupacion ?? '',
        estado_civil: paciente.estado_civil ?? '',
        fecha_registro: paciente.fecha_registro ?? '',
        email: paciente.user?.email ?? '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/pacientes/${paciente.id_paciente}?_method=PUT`, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout header={<h2>Editar paciente</h2>}>
            <Head title={`Editar: ${paciente.ci}`} />

            <div className="mx-auto max-w-4xl space-y-5">
                {flash?.success ? <Alerta tipo="success">{flash.success}</Alerta> : null}
                {flash?.error ? <Alerta tipo="error">{flash.error}</Alerta> : null}

                <div className="card-elevated overflow-hidden">
                    <div className="flex items-center gap-3 border-b border-surface-border bg-brand-green-soft/[0.18] px-5 py-4 dark:border-surface-border-dark dark:bg-brand-green-dark/10">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green">
                            <Pencil size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-bold text-ink dark:text-ink-dark">Editar paciente</h2>
                            <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark">Actualiza los datos de la paciente y su cuenta de acceso.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-5">
                        <PacienteFormulario
                            data={data}
                            setData={setData as (field: keyof PacienteFormValues, value: string) => void}
                            errors={errors}
                            mode="edit"
                        />

                        <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-surface-border pt-4 dark:border-surface-border-dark">
                            <BotonLink href={`/admin/pacientes/${paciente.id_paciente}`} variante="ghost">
                                <ArrowLeft size={13} strokeWidth={1.8} /> Volver al perfil
                            </BotonLink>
                            <Boton type="submit" disabled={processing}>
                                <Save size={13} strokeWidth={1.8} /> {processing ? 'Guardando...' : 'Guardar cambios'}
                            </Boton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
