import { useForm } from '@inertiajs/react';
import { X, Scale } from 'lucide-react';
import { useEffect } from 'react';
import { Boton } from '@/Components/ui/boton';
import { normalizarFechaInput, type Registro, type Opciones } from '../../tipos';

interface Props {
    abierto: boolean;
    cerrar: () => void;
    registro: Registro | null;
    pacienteId: number;
    opciones: Opciones;
}

const NIVELES_ACTIVIDAD: Record<string, string> = {
    sedentario: 'Sedentario',
    ligero: 'Ligero',
    moderado: 'Moderado',
    activo: 'Activo',
    muy_activo: 'Muy activo',
};

export default function ModalEvaluacion({ abierto, cerrar, registro, pacienteId, opciones }: Props) {
    const id = registro?.id_evaluacion_nutricional;
    const url = `/nutricionista/pacientes/${pacienteId}/perfil-nutricional/evaluacion${id ? `/${id}` : ''}`;

    const { data, setData, post, put, processing, errors, clearErrors } = useForm({
        fecha_evaluacion: normalizarFechaInput(registro?.fecha_evaluacion) || new Date().toISOString().split('T')[0],
        nivel_actividad: String(registro?.nivel_actividad ?? ''),
        peso: String(registro?.peso ?? ''),
        talla: String(registro?.talla ?? ''),
        circunferencia_cintura: String(registro?.circunferencia_cintura ?? ''),
        circunferencia_cadera: String(registro?.circunferencia_cadera ?? ''),
        porcentaje_grasa: String(registro?.porcentaje_grasa ?? ''),
        masa_muscular: String(registro?.masa_muscular ?? ''),
        observaciones: String(registro?.observaciones ?? ''),
    });

    useEffect(() => {
        if (!abierto) return;
        clearErrors();
    }, [abierto]);

    if (!abierto) return null;

    const enviar = (e: React.FormEvent) => {
        e.preventDefault();
        const opciones = { preserveScroll: true, onSuccess: cerrar };
        registro ? put(url, opciones) : post(url, opciones);
    };

    return (
        <div className="modal modal-open z-50">
            <div className="modal-box max-w-xl bg-surface-card p-0 overflow-hidden dark:bg-surface-card-dark">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border dark:border-surface-border-dark">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-green/15">
                            <Scale size={14} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-bold text-ink dark:text-ink-dark">
                                {id ? 'Editar evaluación' : 'Registrar evaluación'}
                            </h3>
                            <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark">Antropometría y composición corporal</p>
                        </div>
                    </div>
                    <button type="button" onClick={cerrar} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-black/[0.04] transition-colors dark:hover:bg-white/[0.04]">
                        <X size={15} strokeWidth={1.8} className="text-ink-muted dark:text-ink-muted-dark" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={enviar} className="px-5 py-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Fecha + Actividad */}
                    <div className="grid grid-cols-2 gap-3">
                        <Campo label="Fecha" error={errors.fecha_evaluacion}>
                            <input type="date" value={data.fecha_evaluacion} onChange={e => setData('fecha_evaluacion', e.target.value)} className="campo-input" />
                        </Campo>
                        <Campo label="Nivel de actividad" error={errors.nivel_actividad}>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(NIVELES_ACTIVIDAD).map(([key, label]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setData('nivel_actividad', key)}
                                        className={`rounded-lg border px-2 py-1 text-[10px] font-medium transition-all ${
                                            data.nivel_actividad === key
                                                ? 'border-brand-green bg-brand-green/10 text-brand-green-dark dark:bg-brand-green/[0.08] dark:text-brand-green'
                                                : 'border-surface-border text-ink-muted hover:border-brand-green/30 dark:border-surface-border-dark dark:text-ink-muted-dark'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </Campo>
                    </div>

                    {/* Medidas principales */}
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">Medidas antropométricas</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <Campo label="Peso (kg)" error={errors.peso}>
                                <input type="number" step="0.01" value={data.peso} onChange={e => setData('peso', e.target.value)} placeholder="70.5" className="campo-input" />
                            </Campo>
                            <Campo label="Talla (m)" error={errors.talla}>
                                <input type="number" step="0.01" value={data.talla} onChange={e => setData('talla', e.target.value)} placeholder="1.65" className="campo-input" />
                            </Campo>
                            <Campo label="Cintura (cm)" error={errors.circunferencia_cintura}>
                                <input type="number" step="0.01" value={data.circunferencia_cintura} onChange={e => setData('circunferencia_cintura', e.target.value)} placeholder="80" className="campo-input" />
                            </Campo>
                            <Campo label="Cadera (cm)" error={errors.circunferencia_cadera}>
                                <input type="number" step="0.01" value={data.circunferencia_cadera} onChange={e => setData('circunferencia_cadera', e.target.value)} placeholder="95" className="campo-input" />
                            </Campo>
                        </div>
                    </div>

                    {/* Composición corporal */}
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">Composición corporal</p>
                        <div className="grid grid-cols-2 gap-2">
                            <Campo label="Grasa corporal (%)" error={errors.porcentaje_grasa}>
                                <input type="number" step="0.01" value={data.porcentaje_grasa} onChange={e => setData('porcentaje_grasa', e.target.value)} placeholder="25.0" className="campo-input" />
                            </Campo>
                            <Campo label="Masa muscular (kg)" error={errors.masa_muscular}>
                                <input type="number" step="0.01" value={data.masa_muscular} onChange={e => setData('masa_muscular', e.target.value)} placeholder="28.0" className="campo-input" />
                            </Campo>
                        </div>
                    </div>

                    {/* Observaciones */}
                    <Campo label="Observaciones" error={errors.observaciones}>
                        <textarea value={data.observaciones} onChange={e => setData('observaciones', e.target.value)} rows={2} placeholder="Notas relevantes sobre la evaluación..." className="campo-input resize-none" />
                    </Campo>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-surface-border dark:border-surface-border-dark bg-black/[0.01] dark:bg-white/[0.01]">
                    <Boton variante="ghost" tamano="sm" onClick={cerrar}>Cancelar</Boton>
                    <Boton variante="primary" tamano="sm" onClick={(e: any) => enviar(e)} disabled={processing}>
                        {processing ? 'Guardando...' : (id ? 'Actualizar' : 'Registrar')}
                    </Boton>
                </div>
            </div>
            <button type="button" className="modal-backdrop" onClick={cerrar} aria-label="Cerrar" />
        </div>
    );
}

/* ═══ Campo reutilizable ═══ */
function Campo({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark block mb-1">{label}</label>
            {children}
            {error && <p className="text-[9px] text-category-fruits mt-0.5">{error}</p>}
        </div>
    );
}
