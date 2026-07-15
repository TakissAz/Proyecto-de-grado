import { Campo, CampoSelect } from '@/Components/ui/campo';

export interface PacienteFormValues {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  ci: string;
  fecha_nacimiento: string;
  sexo: 'femenino' | 'masculino';
  telefono: string;
  direccion: string;
  ocupacion: string;
  estado_civil: string;
  fecha_registro: string;
  email: string;
  password: string;
}

interface PacienteFormularioProps {
  data: PacienteFormValues;
  setData: (field: keyof PacienteFormValues, value: string) => void;
  errors: Partial<Record<keyof PacienteFormValues, string>>;
  mode: 'create' | 'edit';
}

export default function PacienteFormulario({ data, setData, errors, mode }: PacienteFormularioProps) {
  return (
    <div className="space-y-6">
      <section>
        <h4 className="mb-3 text-[12.5px] font-semibold text-ink dark:text-ink-dark">
          Datos personales
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Campo
            label="Nombres"
            value={data.nombres}
            onChange={(e) => setData('nombres', e.target.value)}
            error={errors.nombres}
          />
          <Campo
            label="Apellido paterno"
            value={data.apellido_paterno}
            onChange={(e) => setData('apellido_paterno', e.target.value)}
            error={errors.apellido_paterno}
          />
          <Campo
            label="Apellido materno"
            value={data.apellido_materno}
            onChange={(e) => setData('apellido_materno', e.target.value)}
            error={errors.apellido_materno}
          />
          <Campo
            label="CI"
            value={data.ci}
            onChange={(e) => setData('ci', e.target.value)}
            error={errors.ci}
          />
          <Campo
            label="Fecha de nacimiento"
            type="date"
            value={data.fecha_nacimiento}
            onChange={(e) => setData('fecha_nacimiento', e.target.value)}
            error={errors.fecha_nacimiento}
          />
          <CampoSelect
            label="Sexo"
            value={data.sexo}
            onChange={(e) => setData('sexo', e.target.value)}
            error={errors.sexo}
          >
            <option value="femenino">Femenino</option>
            <option value="masculino">Masculino</option>
          </CampoSelect>
        </div>
      </section>

      <section>
        <h4 className="mb-3 text-[12.5px] font-semibold text-ink dark:text-ink-dark">
          Contacto y otros datos
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Campo
            label="Telefono"
            value={data.telefono}
            onChange={(e) => setData('telefono', e.target.value)}
            error={errors.telefono}
          />
          <Campo
            label="Direccion"
            value={data.direccion}
            onChange={(e) => setData('direccion', e.target.value)}
            error={errors.direccion}
            wrapperClassName="sm:col-span-2"
          />
          <Campo
            label="Ocupacion"
            value={data.ocupacion}
            onChange={(e) => setData('ocupacion', e.target.value)}
            error={errors.ocupacion}
          />
          <Campo
            label="Estado civil"
            value={data.estado_civil}
            onChange={(e) => setData('estado_civil', e.target.value)}
            error={errors.estado_civil}
          />
          <Campo
            label="Fecha de registro"
            type="date"
            value={data.fecha_registro}
            onChange={(e) => setData('fecha_registro', e.target.value)}
            error={errors.fecha_registro}
          />
        </div>
      </section>

      <section>
        <h4 className="mb-3 text-[12.5px] font-semibold text-ink dark:text-ink-dark">
          Cuenta de acceso
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo
            label="Correo electronico"
            type="email"
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            error={errors.email}
          />
          <Campo
            label={mode === 'edit' ? 'Nueva contrasena (opcional)' : 'Contrasena'}
            type="password"
            value={data.password}
            onChange={(e) => setData('password', e.target.value)}
            error={errors.password}
            placeholder={mode === 'edit' ? 'Dejar en blanco para no cambiar' : undefined}
          />
        </div>
      </section>
    </div>
  );
}
