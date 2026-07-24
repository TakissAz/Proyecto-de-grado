import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { X, User, Calendar, Clock, FileText, ChevronRight, ChevronLeft, Search, Check } from 'lucide-react';
import { Boton } from '@/Components/ui/boton';
import clsx from 'clsx';
import type { BloqueHorario, PacienteOption, ProfesionalOption } from './tipos';
import { TIPOS_CITA, MODALIDADES } from './tipos';

interface Props {
    abierto: boolean;
    onCerrar: () => void;
    pacientes: PacienteOption[];
    profesional: ProfesionalOption;
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

const PASOS = [
    { id: 1, label: 'Paciente', icon: User },
    { id: 2, label: 'Horario', icon: Clock },
    { id: 3, label: 'Detalles', icon: FileText },
];

export default function ModalCrearCita({ abierto, onCerrar, pacientes, profesional, tipoProfesional, rutaStore, rutaBloques, inicial, metodo = 'post' }: Props) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        id_paciente: inicial?.id_paciente ?? '',
        id_profesional: inicial?.id_profesional ?? profesional.id,
        fecha_cita: inicial?.fecha_cita ?? '',
        hora_inicio: inicial?.hora_inicio ?? '',
        tipo_cita: inicial?.tipo_cita ?? TIPOS_CITA[0],
        modalidad: inicial?.modalidad ?? 'presencial',
        motivo: inicial?.motivo ?? '',
        observaciones: inicial?.observaciones ?? '',
    });

    const [paso, setPaso] = useState(1);
    const [bloques, setBloques] = useState<BloqueHorario[]>([]);
    const [cargandoBloques, setCargandoBloques] = useState(false);
    const [horaFin, setHoraFin] = useState(inicial?.hora_fin ?? '');
    const [buscarPaciente, setBuscarPaciente] = useState('');

    const listaPacientes: PacienteOption[] = Array.isArray(pacientes) ? pacientes : Object.values(pacientes) as PacienteOption[];

    // Cargar bloques cuando cambian fecha
    useEffect(() => {
        if (data.fecha_cita && data.id_profesional) {
            setCargandoBloques(true);
            fetch(`${rutaBloques}?fecha=${data.fecha_cita}&id_profesional=${data.id_profesional}`, {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            })
                .then(r => r.json())
                .then((b: BloqueHorario[]) => {
                    if (inicial?.hora_inicio) {
                        const idx = b.findIndex(bl => bl.hora_inicio === inicial.hora_inicio);
                        if (idx >= 0 && !b[idx].disponible) { b[idx].disponible = true; }
                    }
                    setBloques(b);
                })
                .catch(() => setBloques([]))
                .finally(() => setCargandoBloques(false));
        } else { setBloques([]); }
    }, [data.fecha_cita, data.id_profesional]);

    const handleSubmit = () => {
        if (metodo === 'put') { put(rutaStore, { onSuccess: onCerrar }); }
        else { post(rutaStore, { onSuccess: onCerrar }); }
    };

    const pacientesFiltrados = buscarPaciente
        ? listaPacientes.filter(p => p.nombre_completo.toLowerCase().includes(buscarPaciente.toLowerCase()) || p.ci.includes(buscarPaciente))
        : listaPacientes;

    const pacienteSeleccionado = listaPacientes.find(p => p.id_paciente === Number(data.id_paciente));

    // Validar paso actual
    const puedeAvanzar = () => {
        if (paso === 1) return !!data.id_paciente;
        if (paso === 2) return !!data.fecha_cita && !!data.hora_inicio;
        return true;
    };

    if (!abierto) return null;

    return (
        <div className="modal modal-open z-50">
            <div className="modal-box max-w-lg bg-surface-card p-0 overflow-hidden dark:bg-surface-card-dark">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border dark:border-surface-border-dark">
                    <h3 className="text-[15px] font-bold text-ink dark:text-ink-dark">
                        {metodo === 'put' ? 'Editar cita' : 'Nueva cita'}
                    </h3>
                    <button type="button" onClick={onCerrar} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-black/[0.04] transition-colors dark:hover:bg-white/[0.04]">
                        <X size={15} strokeWidth={1.8} className="text-ink-muted dark:text-ink-muted-dark" />
                    </button>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-1 px-5 py-3 bg-black/[0.01] dark:bg-white/[0.01]">
                    {PASOS.map((p, i) => {
                        const Icon = p.icon;
                        const activo = paso === p.id;
                        const completado = paso > p.id;
                        return (
                            <div key={p.id} className="flex items-center gap-1 flex-1">
                                <button
                                    type="button"
                                    onClick={() => completado && setPaso(p.id)}
                                    className={clsx(
                                        'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-all flex-1 justify-center',
                                        activo ? 'bg-brand-green text-white' :
                                        completado ? 'bg-brand-green/10 text-brand-green-dark dark:text-brand-green cursor-pointer' :
                                        'text-ink-muted dark:text-ink-muted-dark'
                                    )}
                                >
                                    {completado ? <Check size={10} strokeWidth={2.5} /> : <Icon size={10} strokeWidth={1.8} />}
                                    {p.label}
                                </button>
                                {i < PASOS.length - 1 && <ChevronRight size={10} className="text-ink-muted/30 dark:text-ink-muted-dark/30 shrink-0" />}
                            </div>
                        );
                    })}
                </div>

                {/* Contenido del paso */}
                <div className="px-5 py-4 min-h-[320px]">
                    {/* PASO 1: Seleccionar paciente */}
                    {paso === 1 && (
                        <div className="space-y-3">
                            <p className="text-[12px] font-semibold text-ink dark:text-ink-dark">¿Para quién es la cita?</p>

                            {/* Buscador */}
                            <div className="flex items-center gap-2 rounded-xl border border-surface-border px-3 py-2 dark:border-surface-border-dark">
                                <Search size={13} strokeWidth={1.8} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
                                <input
                                    type="text"
                                    value={buscarPaciente}
                                    onChange={e => setBuscarPaciente(e.target.value)}
                                    placeholder="Buscar por nombre o CI..."
                                    className="flex-1 bg-transparent text-[12px] text-ink outline-none placeholder:text-ink-muted/50 dark:text-ink-dark"
                                />
                            </div>

                            {/* Lista de pacientes */}
                            <div className="max-h-[220px] overflow-y-auto space-y-1 rounded-xl border border-surface-border p-1.5 dark:border-surface-border-dark">
                                {pacientesFiltrados.length === 0 ? (
                                    <p className="py-6 text-center text-[11px] text-ink-muted dark:text-ink-muted-dark">No se encontraron pacientes</p>
                                ) : (
                                    pacientesFiltrados.map(p => (
                                        <button
                                            key={p.id_paciente}
                                            type="button"
                                            onClick={() => setData('id_paciente', p.id_paciente as any)}
                                            className={clsx(
                                                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors',
                                                Number(data.id_paciente) === p.id_paciente
                                                    ? 'bg-brand-green/10 border border-brand-green/30 dark:bg-brand-green/[0.06]'
                                                    : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                                            )}
                                        >
                                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green/10 text-[9px] font-bold text-brand-green-dark dark:text-brand-green shrink-0">
                                                {p.nombre_completo.slice(0, 2).toUpperCase()}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[12px] font-semibold text-ink dark:text-ink-dark truncate">{p.nombre_completo}</p>
                                                <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark">CI: {p.ci}</p>
                                            </div>
                                            {Number(data.id_paciente) === p.id_paciente && (
                                                <Check size={14} strokeWidth={2.5} className="text-brand-green-dark dark:text-brand-green shrink-0" />
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                            {errors.id_paciente && <p className="text-[10px] text-category-fruits">{errors.id_paciente}</p>}
                        </div>
                    )}

                    {/* PASO 2: Fecha y horario */}
                    {paso === 2 && (
                        <div className="space-y-4">
                            <p className="text-[12px] font-semibold text-ink dark:text-ink-dark">Selecciona fecha y horario</p>

                            {/* Paciente seleccionado (resumen) */}
                            {pacienteSeleccionado && (
                                <div className="flex items-center gap-2 rounded-lg bg-brand-green/[0.04] px-3 py-2 border border-brand-green/20 dark:bg-brand-green/[0.03]">
                                    <span className="flex h-6 w-6 items-center justify-center rounded bg-brand-green/15 text-[8px] font-bold text-brand-green-dark dark:text-brand-green">
                                        {pacienteSeleccionado.nombre_completo.slice(0, 2).toUpperCase()}
                                    </span>
                                    <span className="text-[11px] font-semibold text-ink dark:text-ink-dark">{pacienteSeleccionado.nombre_completo}</span>
                                </div>
                            )}

                            {/* Fecha */}
                            <div>
                                <label className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark uppercase tracking-wider block mb-1.5">
                                    <Calendar size={10} className="inline mr-1" />Fecha de la cita
                                </label>
                                <input
                                    type="date"
                                    value={data.fecha_cita}
                                    onChange={e => { setData('hora_inicio', ''); setData('fecha_cita', e.target.value); }}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full rounded-xl border border-surface-border bg-transparent px-3 py-2.5 text-[12px] font-medium text-ink outline-none transition focus:border-brand-green/50 focus:ring-2 focus:ring-brand-green/10 dark:border-surface-border-dark dark:text-ink-dark"
                                />
                                {errors.fecha_cita && <p className="text-[10px] text-category-fruits mt-1">{errors.fecha_cita}</p>}
                            </div>

                            {/* Bloques */}
                            {data.fecha_cita && (
                                <div>
                                    <label className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark uppercase tracking-wider block mb-2">
                                        <Clock size={10} className="inline mr-1" />Horario disponible
                                    </label>
                                    {cargandoBloques ? (
                                        <div className="flex items-center justify-center gap-2 py-6">
                                            <span className="loading loading-spinner loading-xs text-brand-green" />
                                            <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Consultando...</span>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-4 gap-1.5">
                                            {bloques.map(b => {
                                                const seleccionado = data.hora_inicio === b.hora_inicio;
                                                return (
                                                    <button
                                                        key={b.hora_inicio}
                                                        type="button"
                                                        disabled={!b.disponible}
                                                        onClick={() => { setData('hora_inicio', b.hora_inicio); setHoraFin(b.hora_fin); }}
                                                        className={clsx(
                                                            'rounded-lg border px-2 py-2.5 text-center transition-all',
                                                            seleccionado
                                                                ? 'border-brand-green bg-brand-green/10 ring-1 ring-brand-green/30 dark:bg-brand-green/[0.06]'
                                                                : b.disponible
                                                                    ? 'border-surface-border hover:border-brand-green/40 dark:border-surface-border-dark'
                                                                    : 'border-surface-border/50 opacity-40 cursor-not-allowed dark:border-surface-border-dark/50'
                                                        )}
                                                    >
                                                        <p className={clsx('text-[12px] font-bold', seleccionado ? 'text-brand-green-dark dark:text-brand-green' : b.disponible ? 'text-ink dark:text-ink-dark' : 'text-ink-muted dark:text-ink-muted-dark')}>
                                                            {b.hora_inicio}
                                                        </p>
                                                        <p className={clsx('text-[8px] mt-0.5', seleccionado ? 'text-brand-green-dark/70 dark:text-brand-green/70' : 'text-ink-muted/60 dark:text-ink-muted-dark/60')}>
                                                            {b.disponible ? (b.pasado ? 'Pasado' : seleccionado ? '✓' : 'Libre') : 'Ocupado'}
                                                        </p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {errors.hora_inicio && <p className="text-[10px] text-category-fruits mt-1.5">{errors.hora_inicio}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* PASO 3: Detalles */}
                    {paso === 3 && (
                        <div className="space-y-3">
                            <p className="text-[12px] font-semibold text-ink dark:text-ink-dark">Detalles de la cita</p>

                            {/* Resumen visual */}
                            <div className="flex items-center gap-3 rounded-xl bg-brand-green/[0.04] border border-brand-green/20 px-3 py-2.5 dark:bg-brand-green/[0.03]">
                                <div className="text-center">
                                    <p className="text-[14px] font-bold text-brand-green-dark dark:text-brand-green">{data.hora_inicio || '—'}</p>
                                    <p className="text-[8px] text-ink-muted dark:text-ink-muted-dark">{horaFin}</p>
                                </div>
                                <div className="w-px h-8 bg-brand-green/20" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-semibold text-ink dark:text-ink-dark truncate">{pacienteSeleccionado?.nombre_completo}</p>
                                    <p className="text-[9px] text-ink-muted dark:text-ink-muted-dark">{data.fecha_cita} · 60 min</p>
                                </div>
                            </div>

                            {/* Tipo + Modalidad como botones seleccionables */}
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark block mb-2">Tipo de cita</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {TIPOS_CITA.map(t => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setData('tipo_cita', t)}
                                                className={clsx(
                                                    'rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-all',
                                                    data.tipo_cita === t
                                                        ? 'border-brand-green bg-brand-green/10 text-brand-green-dark dark:bg-brand-green/[0.08] dark:text-brand-green'
                                                        : 'border-surface-border text-ink-muted hover:border-brand-green/30 hover:text-ink dark:border-surface-border-dark dark:text-ink-muted-dark dark:hover:text-ink-dark'
                                                )}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark block mb-2">Modalidad</label>
                                    <div className="flex gap-1.5">
                                        {MODALIDADES.map(m => (
                                            <button
                                                key={m.value}
                                                type="button"
                                                onClick={() => setData('modalidad', m.value)}
                                                className={clsx(
                                                    'flex-1 rounded-lg border px-3 py-2 text-[11px] font-medium text-center transition-all',
                                                    data.modalidad === m.value
                                                        ? 'border-brand-green bg-brand-green/10 text-brand-green-dark dark:bg-brand-green/[0.08] dark:text-brand-green'
                                                        : 'border-surface-border text-ink-muted hover:border-brand-green/30 hover:text-ink dark:border-surface-border-dark dark:text-ink-muted-dark dark:hover:text-ink-dark'
                                                )}
                                            >
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Motivo */}
                            <div>
                                <label className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark block mb-1">Motivo de la consulta *</label>
                                <textarea
                                    value={data.motivo}
                                    onChange={e => setData('motivo', e.target.value)}
                                    rows={2}
                                    placeholder="¿Cuál es el motivo de esta cita?"
                                    className="w-full rounded-xl border border-surface-border bg-transparent px-3 py-2.5 text-[11px] text-ink outline-none transition focus:border-brand-green/50 focus:ring-2 focus:ring-brand-green/10 dark:border-surface-border-dark dark:text-ink-dark"
                                />
                                {errors.motivo && <p className="text-[10px] text-category-fruits">{errors.motivo}</p>}
                            </div>

                            {/* Observaciones */}
                            <div>
                                <label className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark block mb-1">Observaciones (opcional)</label>
                                <textarea
                                    value={data.observaciones}
                                    onChange={e => setData('observaciones', e.target.value)}
                                    rows={2}
                                    placeholder="Notas adicionales..."
                                    className="w-full rounded-xl border border-surface-border bg-transparent px-3 py-2.5 text-[11px] text-ink outline-none transition focus:border-brand-green/50 focus:ring-2 focus:ring-brand-green/10 dark:border-surface-border-dark dark:text-ink-dark"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer: navegación */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-surface-border dark:border-surface-border-dark bg-black/[0.01] dark:bg-white/[0.01]">
                    <div>
                        {paso > 1 && (
                            <Boton type="button" variante="ghost" tamano="sm" onClick={() => setPaso(paso - 1)}>
                                <ChevronLeft size={12} strokeWidth={1.8} /> Atrás
                            </Boton>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Boton type="button" variante="ghost" tamano="sm" onClick={onCerrar}>Cancelar</Boton>
                        {paso < 3 ? (
                            <Boton type="button" variante="primary" tamano="sm" disabled={!puedeAvanzar()} onClick={() => setPaso(paso + 1)}>
                                Siguiente <ChevronRight size={12} strokeWidth={1.8} />
                            </Boton>
                        ) : (
                            <Boton type="button" variante="primary" tamano="sm" disabled={processing || !data.motivo.trim()} onClick={handleSubmit}>
                                {processing ? 'Guardando...' : (metodo === 'put' ? 'Actualizar' : 'Confirmar cita')}
                            </Boton>
                        )}
                    </div>
                </div>
            </div>
            <button type="button" className="modal-backdrop" onClick={onCerrar} aria-label="Cerrar" />
        </div>
    );
}
