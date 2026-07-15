import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { EcografiaData } from '../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    existente?: EcografiaData | null;
    onCerrar: () => void;
}

interface FormData {
    id_consulta_endocrinologica: number | string;
    fecha_ecografia: string;
    tipo_ecografia: string;
    volumen_ovario_derecho: string;
    volumen_ovario_izquierdo: string;
    foliculos_ovario_derecho: string;
    foliculos_ovario_izquierdo: string;
    distribucion_periferica: boolean;
    observaciones: string;
}

export default function FormularioEcografia({ abierto, idPaciente, idConsulta, existente, onCerrar }: Props) {
    const esEdicion = Boolean(existente);
    const hoy = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '',
        fecha_ecografia: existente?.fecha_ecografia ?? hoy,
        tipo_ecografia: existente?.tipo_ecografia ?? '',
        volumen_ovario_derecho: existente?.volumen_ovario_derecho?.toString() ?? '',
        volumen_ovario_izquierdo: existente?.volumen_ovario_izquierdo?.toString() ?? '',
        foliculos_ovario_derecho: existente?.foliculos_ovario_derecho?.toString() ?? '',
        foliculos_ovario_izquierdo: existente?.foliculos_ovario_izquierdo?.toString() ?? '',
        distribucion_periferica: existente?.distribucion_periferica ?? false,
        observaciones: existente?.observaciones ?? '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/ecografia/${existente!.id_ecografia}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/ecografia`;
        post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } });
    };

    const handleCerrar = () => { reset(); onCerrar(); };

    // Preview compatibilidad
    const volDer = parseFloat(data.volumen_ovario_derecho) || 0;
    const volIzq = parseFloat(data.volumen_ovario_izquierdo) || 0;
    const folDer = parseInt(data.foliculos_ovario_derecho) || 0;
    const folIzq = parseInt(data.foliculos_ovario_izquierdo) || 0;
    const compatiblePreview = volDer >= 10 || volIzq >= 10 || folDer >= 12 || folIzq >= 12;

    if (!abierto) return null;

    return (
        <dialog className="modal modal-open" key={existente?.id_ecografia ?? 'new'}>
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">
                    {esEdicion ? 'Editar evaluación ecográfica' : 'Registrar evaluación ecográfica'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Fecha de ecografía</span></div>
                            <input type="date" className="input input-bordered input-sm w-full" value={data.fecha_ecografia} onChange={(e) => setData('fecha_ecografia', e.target.value)} required />
                            {errors.fecha_ecografia ? <div className="label"><span className="label-text-alt text-error text-xs">{errors.fecha_ecografia}</span></div> : null}
                        </label>
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Tipo de ecografía</span></div>
                            <select className="select select-bordered select-sm w-full" value={data.tipo_ecografia} onChange={(e) => setData('tipo_ecografia', e.target.value)}>
                                <option value="">Sin especificar</option>
                                <option value="transvaginal">Transvaginal</option>
                                <option value="abdominal">Abdominal</option>
                                <option value="otra">Otra</option>
                            </select>
                        </label>
                    </div>

                    <div className="divider my-1" />

                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Ovario derecho</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InputNum label="Volumen ovario derecho (mL)" value={data.volumen_ovario_derecho} onChange={(v) => setData('volumen_ovario_derecho', v)} error={errors.volumen_ovario_derecho} step="0.01" hint="Compatible si ≥ 10 mL" />
                        <InputNum label="Conteo folicular OD" value={data.foliculos_ovario_derecho} onChange={(v) => setData('foliculos_ovario_derecho', v)} error={errors.foliculos_ovario_derecho} hint="Compatible si ≥ 12" />
                    </div>

                    <div className="divider my-1" />

                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Ovario izquierdo</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InputNum label="Volumen ovario izquierdo (mL)" value={data.volumen_ovario_izquierdo} onChange={(v) => setData('volumen_ovario_izquierdo', v)} error={errors.volumen_ovario_izquierdo} step="0.01" hint="Compatible si ≥ 10 mL" />
                        <InputNum label="Conteo folicular OI" value={data.foliculos_ovario_izquierdo} onChange={(v) => setData('foliculos_ovario_izquierdo', v)} error={errors.foliculos_ovario_izquierdo} hint="Compatible si ≥ 12" />
                    </div>

                    <div className="divider my-1" />

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={data.distribucion_periferica} onChange={(e) => setData('distribucion_periferica', e.target.checked)} />
                        <span className="text-sm text-base-content/80">Distribución periférica de folículos</span>
                    </label>

                    {compatiblePreview ? (
                        <div className="alert alert-warning text-xs py-2">
                            Morfología compatible con PMOS (se confirma en backend)
                        </div>
                    ) : null}

                    <label className="form-control w-full">
                        <div className="label"><span className="label-text text-xs">Observaciones</span></div>
                        <textarea className="textarea textarea-bordered text-sm" rows={3} value={data.observaciones} onChange={(e) => setData('observaciones', e.target.value)} />
                    </label>

                    <div className="modal-action">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={handleCerrar} disabled={processing}>Cancelar</button>
                        <button type="submit" className="btn btn-primary btn-sm gap-1.5" disabled={processing}>
                            <Save size={14} /> {processing ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Registrar'}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop"><button onClick={handleCerrar}>close</button></form>
        </dialog>
    );
}

function InputNum({ label, value, onChange, error, step, hint }: {
    label: string; value: string; onChange: (v: string) => void; error?: string; step?: string; hint?: string;
}) {
    return (
        <label className="form-control w-full">
            <div className="label"><span className="label-text text-xs">{label}</span></div>
            <input type="number" step={step} className="input input-bordered input-sm w-full" value={value} onChange={(e) => onChange(e.target.value)} />
            {error ? <div className="label"><span className="label-text-alt text-error text-xs">{error}</span></div> : null}
            {hint && !error ? <div className="label"><span className="label-text-alt text-base-content/40">{hint}</span></div> : null}
        </label>
    );
}
