import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import Alerta from '@/Components/ui/alerta';
import { Boton, BotonLink } from '@/Components/ui/boton';
import PacienteFormulario, { type PacienteFormValues } from '@/Components/Pacientes/PacienteFormulario';
import type { PageProps } from '@/types';

const valoresIniciales: PacienteFormValues = { nombres: '', apellido_paterno: '', apellido_materno: '', ci: '', fecha_nacimiento: '', sexo: 'femenino', telefono: '', direccion: '', ocupacion: '', estado_civil: '', fecha_registro: '', email: '', password: '' };

export default function Create({ flash }: PageProps) {
    const { data, setData, post, processing, errors } = useForm<PacienteFormValues>({ ...valoresIniciales });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); post('/nutricionista/pacientes', { preserveScroll: false }); };

    return (
        <AuthenticatedLayout header={<h2>Registrar paciente</h2>}>
            <Head title="Registrar paciente" />
            <div className="mx-auto max-w-5xl space-y-5">
                {flash?.success && <Alerta tipo="success">{flash.success}</Alerta>}
                {flash?.error && <Alerta tipo="error">{flash.error}</Alerta>}

                <div className="rounded-xl border border-surface-border bg-surface-card dark:border-surface-border-dark dark:bg-surface-card-dark overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-3 border-b border-surface-border/60 dark:border-surface-border-dark/60 px-6 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green">
                            <UserPlus size={20} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-bold text-ink dark:text-ink-dark">Nueva paciente</h3>
                            <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark">Completa los datos de la paciente y su cuenta de acceso.</p>
                        </div>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} autoComplete="off" className="p-6">
                        <PacienteFormulario data={data} setData={setData as (f: keyof PacienteFormValues, v: string) => void} errors={errors} mode="create" />

                        <div className="mt-6 flex justify-end gap-2 border-t border-surface-border pt-5 dark:border-surface-border-dark">
                            <BotonLink href="/nutricionista/pacientes" variante="ghost"><ArrowLeft size={14} strokeWidth={1.8} /> Volver</BotonLink>
                            <Boton type="submit" variante="primary" disabled={processing}>
                                <Save size={14} strokeWidth={1.8} /> {processing ? 'Guardando...' : 'Registrar paciente'}
                            </Boton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
