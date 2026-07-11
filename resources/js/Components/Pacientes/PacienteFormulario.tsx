import { Box, TextField } from '@mui/material';

export interface PacienteFormValues {
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    ci: string;
    fecha_nacimiento: string;
    /** Siempre 'femenino' — el sistema solo trabaja con pacientes femeninas */
    sexo: string;
    telefono: string;
    direccion: string;
    ocupacion: string;
    estado_civil: string;
    fecha_registro: string;
    email: string;
    password: string;
}

export type PacienteFormErrors = Partial<Record<keyof PacienteFormValues, string>>;

interface Props {
    data: PacienteFormValues;
    setData: (field: keyof PacienteFormValues, value: string) => void;
    errors: PacienteFormErrors;
    mode: 'create' | 'edit';
}

export default function PacienteFormulario({ data, setData, errors, mode }: Props) {
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField label="Nombres" value={data.nombres} onChange={(event) => setData('nombres', event.target.value)} error={Boolean(errors.nombres)} helperText={errors.nombres} fullWidth required />
            <TextField label="Apellido paterno" value={data.apellido_paterno} onChange={(event) => setData('apellido_paterno', event.target.value)} error={Boolean(errors.apellido_paterno)} helperText={errors.apellido_paterno} fullWidth required />
            <TextField label="Apellido materno" value={data.apellido_materno} onChange={(event) => setData('apellido_materno', event.target.value)} error={Boolean(errors.apellido_materno)} helperText={errors.apellido_materno} fullWidth />
            <TextField label="CI" value={data.ci} onChange={(event) => setData('ci', event.target.value)} error={Boolean(errors.ci)} helperText={errors.ci} fullWidth required />
            <TextField label="Fecha de nacimiento" type="date" value={data.fecha_nacimiento} onChange={(event) => setData('fecha_nacimiento', event.target.value)} error={Boolean(errors.fecha_nacimiento)} helperText={errors.fecha_nacimiento ?? 'La paciente debe tener entre 21 y 35 anos.'} fullWidth required slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Sexo" value={data.sexo} fullWidth disabled helperText="El sistema solo trabaja con pacientes femeninas." />
            <TextField label="Telefono" value={data.telefono} onChange={(event) => setData('telefono', event.target.value)} error={Boolean(errors.telefono)} helperText={errors.telefono} fullWidth />
            <TextField label="Direccion" value={data.direccion} onChange={(event) => setData('direccion', event.target.value)} error={Boolean(errors.direccion)} helperText={errors.direccion} fullWidth />
            <TextField label="Ocupacion" value={data.ocupacion} onChange={(event) => setData('ocupacion', event.target.value)} error={Boolean(errors.ocupacion)} helperText={errors.ocupacion} fullWidth />
            <TextField label="Estado civil" value={data.estado_civil} onChange={(event) => setData('estado_civil', event.target.value)} error={Boolean(errors.estado_civil)} helperText={errors.estado_civil} fullWidth />
            <TextField label="Fecha de registro" type="date" value={data.fecha_registro} onChange={(event) => setData('fecha_registro', event.target.value)} error={Boolean(errors.fecha_registro)} helperText={errors.fecha_registro ?? 'Si se deja vacio, se usa la fecha actual.'} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Correo electronico" type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} error={Boolean(errors.email)} helperText={errors.email} fullWidth required />
            <TextField label={mode === 'create' ? 'Contrasena' : 'Nueva contrasena'} type="password" value={data.password} onChange={(event) => setData('password', event.target.value)} error={Boolean(errors.password)} helperText={errors.password ?? (mode === 'edit' ? 'Deja este campo vacio si no quieres cambiar la contrasena.' : '')} fullWidth required={mode === 'create'} />
        </Box>
    );
}
