import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Boton } from '@/Components/ui/boton';
import BloquesHorario from './BloquesHorario';
import type { BloqueHorario, PacienteOption, ProfesionalOption } from './tipos';
import { TIPOS_CITA, MODALIDADES } from './tipos';

interface Props {
    pacientes: PacienteOption[];
    profesional: ProfesionalOption; // El profesional logueado, auto-asignado
    tipoProfesional: string;
    rutaStore: string;
    rutaBloques: string;
    inicial?: {
        id_cita?: number;
        id_paciente?: number;
        id_profesional?: number;
        fecha_cita?: string;
        hora_inicio?: string;
        hora_fin?: string;
        tipo_cita?: string;
        modalidad?: string;
        motivo?: string;
        observaciones?: string | null;
    };
    metodo?: 'post' | 'put';
}

export default function CitaFormulario({ pacientes, profesional, tipoProfesional, rutaStore, rutaBloques, inicial, metodo = 'post' }: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        id_paciente: inicial?.id_paciente ?? '',
        id_profesional: inicial?.id_profesional ?? profesional.id,
        fecha_cita: inicial?.fecha_cita ?? '',
        hora_inicio: inicial?.hora_inicio ?? '',
        tipo_cita: inicial?.tipo_cita ?? TIPOS_CITA[0],
        modalidad: inicial?.modalidad ?? 'presencial',
        motivo: inicial?.motivo ?? '',
        observaciones: inicial?.observaciones ?? '',
    });

    const [bloques, setBloques] = useState<BloqueHorario[]>([]);
    const [cargandoBloques, setCargandoBloques] = useState(false);
    const [horaFin, setHoraFin] = useState(inicial?.hora_fin ?? '');
    const [buscarPaciente, setBuscarPaciente] = useState('');

    // Asegurar que pacientes sea siempre un array
    const listaPacientes: PacienteOption[] = Array.isArray(pacientes) ? pacientes : Object.values(pacientes) as PacienteOption[];

    // Cargar bloques cuando cambian fecha + profesional
    useEffect(() => {
        if (data.fecha_cita && data.id_profesional) {
            setCargandoBloques(true);
            fetch(`${rutaBloques}?fecha=${data.fecha_cita}&id_profesional=${data.id_profesional}`, {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            })
                .then(r => r.json())
                .then((b: BloqueHorario[]) => {
                    setBloques(b);
                    // Si estamos editando y el bloque actual existe, mantenerlo seleccionado
                    if (inicial?.hora_inicio && !b.find(bl => bl.hora_inicio === data.hora_inicio && bl.disponible)) {
                        // El bloque actual podría estar ocupado por la misma cita, marcarlo como disponible
                        const idx = b.findIndex(bl => bl.hora_inicio === inicial.hora_inicio);
                        if (idx >= 0) b[idx].disponible = true;
                        setBloques([...b]);
                    }
                })
                .catch(() => setBloques([]))
                .finally(() => setCargandoBloques(false));
        } else {
            setBloques([]);
        }
    }, [data.fecha_cita, data.id_profesional]);

    const handleSeleccionarBloque = (horaInicio: string, horaFinBloque: string) => {
        setData('hora_inicio', horaInicio);
        setHoraFin(horaFinBloque);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (metodo === 'put') {
            put(rutaStore);
        } else {
            post(rutaStore);
        }
    };

    const pacientesFiltrados = buscarPaciente
        ? listaPacientes.filter(p => p.nombre_completo.toLowerCase().includes(buscarPaciente.toLowerCase()) || p.ci.includes(buscarPaciente))
        : listaPacientes;

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Columna izquierda: datos de la cita */}
                <div className="space-y-4">
                    {/* Paciente */}
                    <div>
                        <label className="text-[11px] font-semibold text-ink dark:text-ink-dark block mb-1.5">Paciente *</label>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o CI..."
                            value={buscarPaciente}
                            onChange={e => setBuscarPaciente(e.target.value)}
                            className="input input-bordered input-sm w-full mb-1.5 bg-transparent"
                        />
                        <select
                            value={data.id_paciente}
                            onChange={e => setData('id_paciente', e.target.value as any)}
                            className="select select-bordered select-sm w-full bg-transparent"
                        >
                            <option value="">— Seleccionar paciente —</option>
                            {pacientesFiltrados.map(p => (
                                <option key={p.id_paciente} value={p.id_paciente}>
                                    {p.nombre_completo} (CI: {p.ci})
                                </option>
                            ))}
                        </select>
                        {errors.id_paciente && <p className="text-[10px] text-category-fruits mt-1">{errors.id_paciente}</p>}
                    </div>

                    {/* Profesional (auto-asignado) */}
                    <div>
                        <label className="text-[11px] font-semibold text-ink dark:text-ink-dark block mb-1.5">Profesional</label>
                        <div className="flex items-center gap-2 rounded-lg border border-surface-border bg-black/[0.01] px-3 py-2 dark:border-surface-border-dark dark:bg-white/[0.02]">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-green/15 text-[9px] font-bold text-brand-green-dark dark:text-brand-green">
                                {profesional.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-[12px] font-semibold text-ink dark:text-ink-dark">{profesional.name}</p>
                                <p className="text-[9.5px] text-ink-muted dark:text-ink-muted-dark capitalize">{tipoProfesional}</p>
                            </div>
                        </div>
                    </div>

                    {/* Fecha */}
                    <div>
                        <label className="text-[11px] font-semibold text-ink dark:text-ink-dark block mb-1.5">Fecha *</label>
                        <input
                            type="date"
                            value={data.fecha_cita}
                            onChange={e => setData('fecha_cita', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="input input-bordered input-sm w-full bg-transparent"
                        />
                        {errors.fecha_cita && <p className="text-[10px] text-category-fruits mt-1">{errors.fecha_cita}</p>}
                    </div>

                    {/* Tipo + Modalidad */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-semibold text-ink dark:text-ink-dark block mb-1.5">Tipo de cita *</label>
                            <select value={data.tipo_cita} onChange={e => setData('tipo_cita', e.target.value)} className="select select-bordered select-sm w-full bg-transparent">
                                {TIPOS_CITA.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] font-semibold text-ink dark:text-ink-dark block mb-1.5">Modalidad *</label>
                            <select value={data.modalidad} onChange={e => setData('modalidad', e.target.value)} className="select select-bordered select-sm w-full bg-transparent">
                                {MODALIDADES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Motivo */}
                    <div>
                        <label className="text-[11px] font-semibold text-ink dark:text-ink-dark block mb-1.5">Motivo *</label>
                        <textarea
                            value={data.motivo}
                            onChange={e => setData('motivo', e.target.value)}
                            rows={3}
                            className="textarea textarea-bordered w-full text-[12px] bg-transparent"
                            placeholder="Motivo de la consulta..."
                        />
                        {errors.motivo && <p className="text-[10px] text-category-fruits mt-1">{errors.motivo}</p>}
                    </div>

                    {/* Observaciones */}
                    <div>
                        <label className="text-[11px] font-semibold text-ink dark:text-ink-dark block mb-1.5">Observaciones</label>
                        <textarea
                            value={data.observaciones}
                            onChange={e => setData('observaciones', e.target.value)}
                            rows={2}
                            className="textarea textarea-bordered w-full text-[12px] bg-transparent"
                            placeholder="Notas adicionales (opcional)"
                        />
                    </div>
                </div>

                {/* Columna derecha: bloques de horario */}
                <div className="card-elevated p-4 lg:sticky lg:top-20 lg:self-start">
                    <p className="text-[12px] font-bold text-ink dark:text-ink-dark mb-3">Seleccionar horario</p>
                    <BloquesHorario
                        bloques={bloques}
                        seleccionado={data.hora_inicio || null}
                        onSeleccionar={handleSeleccionarBloque}
                        cargando={cargandoBloques}
                    />
                    {data.hora_inicio && (
                        <div className="mt-3 rounded-lg bg-brand-green/10 px-3 py-2 dark:bg-brand-green/[0.06]">
                            <p className="text-[10px] font-semibold text-brand-green-dark dark:text-brand-green">
                                Horario seleccionado: {data.hora_inicio} – {horaFin} (60 min)
                            </p>
                        </div>
                    )}
                    {errors.hora_inicio && <p className="text-[10px] text-category-fruits mt-2">{errors.hora_inicio}</p>}
                </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border dark:border-surface-border-dark">
                <Boton type="submit" variante="primary" tamano="md" disabled={processing || !data.hora_inicio}>
                    {processing ? 'Guardando...' : (metodo === 'put' ? 'Actualizar cita' : 'Programar cita')}
                </Boton>
            </div>
        </form>
    );
}
