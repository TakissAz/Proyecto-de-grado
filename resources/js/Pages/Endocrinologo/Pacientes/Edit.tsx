import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Alerta from '@/Components/ui/alerta';
import { Boton, BotonLink } from '@/Components/ui/boton';
import PacienteFormulario, { type PacienteFormValues } from '@/Components/Pacientes/PacienteFormulario';
import type { PageProps } from '@/types';

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    post(`/endocrinologo/pacientes/${paciente.id_paciente}?_method=PUT`, { preserveScroll: true });
  }

  return (
    <AuthenticatedLayout title="Editar paciente">
      <Head title={`Editar: ${paciente.ci}`} />

      <div className="space-y-5">
        {flash?.success && <Alerta tipo="success">{flash.success}</Alerta>}
        {flash?.error && <Alerta tipo="error">{flash.error}</Alerta>}

        <div className="card-elevated space-y-5 p-5">
          <div>
            <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">Editar paciente</h3>
            <p className="mt-0.5 text-[11.5px] text-ink-muted dark:text-ink-muted-dark">
              Actualiza los datos de la paciente.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <PacienteFormulario
              data={data}
              setData={(field, value) => setData(field, value)}
              errors={errors}
              mode="edit"
            />

            <div className="mt-6 flex justify-end gap-2 border-t border-surface-border pt-5 dark:border-surface-border-dark">
              <BotonLink href={`/endocrinologo/pacientes/${paciente.id_paciente}`} variante="ghost">
                <ArrowLeft size={14} strokeWidth={1.8} /> Volver
              </BotonLink>
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
