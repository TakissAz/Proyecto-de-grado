import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, UserCog } from 'lucide-react';
import Alerta from '@/Components/ui/alerta';
import { Boton, BotonLink } from '@/Components/ui/boton';
import PacienteFormulario, { type PacienteFormValues } from '@/Components/Pacientes/PacienteFormulario';
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

    const nombreCompleto = [paciente.nombres, paciente.apellido_paterno].filter(Boolean).join(' ') || paciente.ci;

    return (
        <AuthenticatedLayout header={<h2>Editar paciente</h2>}>
            <Head title={`Editar: ${paciente.ci}`} />
            <div className="mx-auto max-w-5xl space-y-5">
                {flash?.success && <Alerta tipo="success">{flash.success}</Alerta>}
                {flash?.error && <Alerta tipo="error">{flash.error}</Alerta>}

                <div className="rounded-xl border border-surface-border bg-surface-card dark:border-surface-border-dark dark:bg-surface-card-dark overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-3 border-b border-surface-border/60 dark:border-surface-border-dark/60 px-6 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange">
                            <UserCog size={20} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-bold text-ink dark:text-ink-dark">Editar paciente</h3>
                            <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark">{nombreCompleto} · CI {paciente.ci}</p>
                        </div>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <PacienteFormulario data={data} setData={setData as (f: keyof PacienteFormValues, v: string) => void} errors={errors} mode="edit" />

                        <div className="mt-6 flex justify-end gap-2 border-t border-surface-border pt-5 dark:border-surface-border-dark">
                            <BotonLink href={`/nutricionista/pacientes/${paciente.id_paciente}`} variante="ghost"><ArrowLeft size={14} strokeWidth={1.8} /> Volver</BotonLink>
                            <Boton type="submit" variante="primary" disabled={processing}>
                                <Save size={14} strokeWidth={1.8} /> {processing ? 'Guardando...' : 'Guardar cambios'}
                            </Boton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
