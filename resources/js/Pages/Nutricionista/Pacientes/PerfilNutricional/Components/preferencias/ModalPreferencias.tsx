import { useForm } from '@inertiajs/react';
import { X, Heart } from 'lucide-react';
import { useEffect } from 'react';
import { Boton } from '@/Components/ui/boton';
import type { Registro } from '../../tipos';

interface Props {
    abierto: boolean;
    cerrar: () => void;
    registro: Registro | null;
    pacienteId: number;
}

const CAMPOS: { name: string; label: string; placeholder: string }[] = [
    { name: 'alimentos_preferidos', label: 'Alimentos preferidos', placeholder: 'Ej: pollo, arroz, frutas, verduras...' },
    { name: 'alimentos_no_preferidos', label: 'Alimentos no preferidos', placeholder: 'Ej: hígado, brócoli, mariscos...' },
    { name: 'comidas_preferidas', label: 'Comidas preferidas', placeholder: 'Ej: desayuno, almuerzo tipo casero...' },
    { name: 'comidas_frecuentes', label: 'Comidas frecuentes', placeholder: 'Ej: sopa, guiso, ensalada...' },
    { name: 'preparaciones_preferidas', label: 'Preparaciones preferidas', placeholder: 'Ej: al horno, a la plancha, hervido...' },
    { name: 'sabores_preferidos', label: 'Sabores preferidos', placeholder: 'Ej: dulce, salado, picante...' },
];

export default function ModalPreferencias({ abierto, cerrar, registro, pacienteId }: Props) {
    const id = registro?.id_preferencia_alimentaria;
    const url = `/nutricionista/pacientes/${pacienteId}/perfil-nutricional/preferencias${id ? `/${id}` : ''}`;

    const { data, setData, post, put, processing, errors, clearErrors } = useForm({
        alimentos_preferidos: String(registro?.alimentos_preferidos ?? ''),
        alimentos_no_preferidos: String(registro?.alimentos_no_preferidos ?? ''),
        comidas_preferidas: String(registro?.comidas_preferidas ?? ''),
        comidas_frecuentes: String(registro?.comidas_frecuentes ?? ''),
        preparaciones_preferidas: String(registro?.preparaciones_preferidas ?? ''),
        sabores_preferidos: String(registro?.sabores_preferidos ?? ''),
        observaciones: String(registro?.observaciones ?? ''),
    });

    useEffect(() => { if (abierto) clearErrors(); }, [abierto]);

    if (!abierto) return null;

    const enviar = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: cerrar };
        registro ? put(url, opts) : post(url, opts);
    };

    return (
        <div className="modal modal-open z-50">
            <div className="modal-box max-w-lg bg-surface-card p-0 overflow-hidden dark:bg-surface-card-dark">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border dark:border-surface-border-dark">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-category-dairy/15">
                            <Heart size={14} strokeWidth={1.8} className="text-category-dairy" />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-bold text-ink dark:text-ink-dark">{id ? 'Editar preferencias' : 'Registrar preferencias'}</h3>
                            <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark">Gustos y afinidades alimentarias del paciente</p>
                        </div>
                    </div>
                    <button type="button" onClick={cerrar} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
                        <X size={15} strokeWidth={1.8} className="text-ink-muted dark:text-ink-muted-dark" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={enviar} className="px-5 py-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {CAMPOS.map(campo => (
                        <div key={campo.name}>
                            <label className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark block mb-1">{campo.label}</label>
                            <textarea
                                value={(data as any)[campo.name]}
                                onChange={e => setData(campo.name as any, e.target.value)}
                                rows={2}
                                placeholder={campo.placeholder}
                                className="campo-input resize-none"
                            />
                            {(errors as any)[campo.name] && <p className="text-[9px] text-category-fruits mt-0.5">{(errors as any)[campo.name]}</p>}
                        </div>
                    ))}

                    {/* Observaciones */}
                    <div>
                        <label className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark block mb-1">Observaciones</label>
                        <textarea value={data.observaciones} onChange={e => setData('observaciones', e.target.value)} rows={2} placeholder="Notas adicionales..." className="campo-input resize-none" />
                    </div>
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
