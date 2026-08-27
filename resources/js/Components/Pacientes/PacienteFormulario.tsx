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
  const hoy = new Date();
  const fechaLimite = (edad: number) => {
    const fecha = new Date(hoy.getFullYear() - edad, hoy.getMonth(), hoy.getDate());
    return fecha.toISOString().slice(0, 10);
  };
  const edad = data.fecha_nacimiento
    ? (() => {
        const nacimiento = new Date(`${data.fecha_nacimiento}T12:00:00`);
        let resultado = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) resultado--;
        return Number.isNaN(resultado) ? null : resultado;
      })()
    : null;
  const fechaRegistro = data.fecha_registro || hoy.toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <section>
        <h4 className="mb-3 text-[12.5px] font-semibold text-ink dark:text-ink-dark">
          Datos personales
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Campo
            label="Nombres"
            required
            minLength={2}
            maxLength={150}
            autoComplete="given-name"
            placeholder="Ej. María Fernanda"
            value={data.nombres}
            onChange={(e) => setData('nombres', e.target.value)}
            error={errors.nombres}
          />
          <Campo
            label="Apellido paterno"
            required
            minLength={2}
            maxLength={100}
            autoComplete="family-name"
            value={data.apellido_paterno}
            onChange={(e) => setData('apellido_paterno', e.target.value)}
            error={errors.apellido_paterno}
          />
          <Campo
            label="Apellido materno"
            minLength={2}
            maxLength={100}
            value={data.apellido_materno}
            onChange={(e) => setData('apellido_materno', e.target.value)}
            error={errors.apellido_materno}
          />
          <Campo
            label="CI"
            required
            minLength={4}
            maxLength={20}
            autoComplete="off"
            placeholder="Ej. 12345678-LP"
            value={data.ci}
            onChange={(e) => setData('ci', e.target.value)}
            error={errors.ci}
          />
          <Campo
            label="Fecha de nacimiento"
            type="date"
            required
            value={data.fecha_nacimiento}
            onChange={(e) => setData('fecha_nacimiento', e.target.value)}
            error={errors.fecha_nacimiento}
            min={fechaLimite(35)}
            max={fechaLimite(21)}
          />
          <Campo
            label="Edad calculada"
            value={edad === null ? 'Se calcula con la fecha de nacimiento' : `${edad} años`}
            readOnly
            tabIndex={-1}
            className="cursor-default bg-brand-green/[0.04] font-semibold text-brand-green-dark dark:text-brand-green"
          />
          <CampoSelect
            label="Sexo"
            required
            value={data.sexo}
            onChange={(e) => setData('sexo', e.target.value)}
            error={errors.sexo}
          >
            <option value="femenino">Femenino</option>
          </CampoSelect>
        </div>
      </section>

      <section>
        <h4 className="mb-3 text-[12.5px] font-semibold text-ink dark:text-ink-dark">
          Contacto y otros datos
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Campo
            label="Teléfono"
            type="tel"
            minLength={7}
            maxLength={30}
            autoComplete="tel"
            inputMode="tel"
            placeholder="Ej. 76543210"
            value={data.telefono}
            onChange={(e) => setData('telefono', e.target.value)}
            error={errors.telefono}
          />
          <Campo
            label="Dirección"
            maxLength={255}
            autoComplete="street-address"
            value={data.direccion}
            onChange={(e) => setData('direccion', e.target.value)}
            error={errors.direccion}
            wrapperClassName="sm:col-span-2"
          />
          <Campo
            label="Ocupación"
            maxLength={120}
            value={data.ocupacion}
            onChange={(e) => setData('ocupacion', e.target.value)}
            error={errors.ocupacion}
          />
          <Campo
            label="Estado civil"
            maxLength={50}
            value={data.estado_civil}
            onChange={(e) => setData('estado_civil', e.target.value)}
            error={errors.estado_civil}
          />
          <Campo
            label="Fecha de registro"
            type="date"
            value={fechaRegistro}
            readOnly
            tabIndex={-1}
            error={errors.fecha_registro}
            className="cursor-default bg-black/[0.025] text-ink-muted dark:bg-white/[0.03]"
          />
        </div>
      </section>

      <section>
        <h4 className="mb-3 text-[12.5px] font-semibold text-ink dark:text-ink-dark">
          Cuenta de acceso al portal
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo
            label="Correo electrónico"
            type="email"
            required
            maxLength={255}
            name={mode === 'create' ? 'new-patient-email' : 'email'}
            autoComplete={mode === 'create' ? 'off' : 'email'}
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            error={errors.email}
          />
          <Campo
            label={mode === 'edit' ? 'Nueva contraseña (opcional)' : 'Contraseña temporal'}
            type="password"
            required={mode === 'create'}
            minLength={8}
            maxLength={72}
            name={mode === 'create' ? 'new-patient-password' : 'password'}
            autoComplete="new-password"
            value={data.password}
            onChange={(e) => setData('password', e.target.value)}
            error={errors.password}
            placeholder={mode === 'edit' ? 'Dejar en blanco para no cambiar' : 'Mínimo 8 caracteres'}
          />
        </div>
        <p className="mt-2 text-[11px] text-ink-muted dark:text-ink-muted-dark">
          La paciente usará este correo y contraseña para ingresar a su portal. La cuenta quedará activa al registrarla.
        </p>
      </section>
    </div>
  );
}
