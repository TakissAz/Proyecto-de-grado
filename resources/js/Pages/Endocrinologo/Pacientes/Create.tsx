import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Alerta from '@/Components/ui/alerta';
import { Boton, BotonLink } from '@/Components/ui/boton';
import PacienteFormulario, { type PacienteFormValues } from '@/Components/Pacientes/PacienteFormulario';
import type { PageProps } from '@/types';

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

export default function Create({ flash }: PageProps) {
  const { data, setData, post, processing, errors } = useForm<PacienteFormValues>({
    ...valoresIniciales,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    post('/endocrinologo/pacientes');
  }

  return (
    <AuthenticatedLayout title="Registrar paciente">
      <Head title="Registrar paciente" />

      <div className="space-y-5">
        {flash?.success && <Alerta tipo="success">{flash.success}</Alerta>}
        {flash?.error && <Alerta tipo="error">{flash.error}</Alerta>}

        <div className="card-elevated space-y-5 p-5">
          <div>
            <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">Nueva paciente</h3>
            <p className="mt-0.5 text-[11.5px] text-ink-muted dark:text-ink-muted-dark">
              Completa los datos de la paciente y su cuenta de acceso.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <PacienteFormulario
              data={data}
              setData={(field, value) => setData(field, value)}
              errors={errors}
              mode="create"
            />

            <div className="mt-6 flex justify-end gap-2 border-t border-surface-border pt-5 dark:border-surface-border-dark">
              <BotonLink href="/endocrinologo/pacientes" variante="ghost">
                <ArrowLeft size={14} strokeWidth={1.8} /> Volver
              </BotonLink>
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
