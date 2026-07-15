import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';

interface Props {
    abierto: boolean;
    idPaciente: number;
    nombrePaciente: string;
    urlGuardar: string;
    onCerrar: () => void;
}

export default function ModalNuevaConsulta({ abierto, idPaciente, nombrePaciente, urlGuardar, onCerrar }: Props) {
    const hoy = new Date().toISOString().split('T')[0];
    const { data, setData, post, processing, errors, reset } = useForm({
        fecha_consulta: hoy,
        motivo_consulta: '',
        sospecha_pmos: false,
        sospecha_resistencia_insulina: false,
        observaciones_generales: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(urlGuardar, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } });
    };

    if (!abierto) return null;

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-lg">
                <h3 className="font-bold text-lg">Iniciar consulta endocrinológica</h3>
                <p className="text-xs text-base-content/50 mb-4">{nombrePaciente}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="form-control w-full">
                        <div className="label"><span className="label-text text-xs">Fecha de consulta</span></div>
                        <input type="date" className="input input-bordered input-sm w-full" value={data.fecha_consulta} onChange={e => setData('fecha_consulta', e.target.value)} required />
                        {errors.fecha_consulta ? <div className="label"><span className="label-text-alt text-error text-xs">{errors.fecha_consulta}</span></div> : null}
                    </label>

                    <label className="form-control w-full">
                        <div className="label"><span className="label-text text-xs">Motivo de consulta</span></div>
                        <textarea className="textarea textarea-bordered text-sm" rows={2} value={data.motivo_consulta} onChange={e => setData('motivo_consulta', e.target.value)} required />
                        {errors.motivo_consulta ? <div className="label"><span className="label-text-alt text-error text-xs">{errors.motivo_consulta}</span></div> : null}
                    </label>

                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Sospechas clínicas</p>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={data.sospecha_pmos} onChange={e => setData('sospecha_pmos', e.target.checked)} />
                            <span className="text-sm text-base-content/80">Sospecha de PMOS</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={data.sospecha_resistencia_insulina} onChange={e => setData('sospecha_resistencia_insulina', e.target.checked)} />
                            <span className="text-sm text-base-content/80">Sospecha de resistencia a la insulina</span>
                        </label>
                    </div>

                    <label className="form-control w-full">
                        <div className="label"><span className="label-text text-xs">Observaciones</span></div>
                        <textarea className="textarea textarea-bordered text-sm" rows={3} value={data.observaciones_generales} onChange={e => setData('observaciones_generales', e.target.value)} />
                    </label>

                    <div className="modal-action">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { reset(); onCerrar(); }} disabled={processing}>Omitir</button>
                        <button type="submit" className="btn btn-primary btn-sm gap-1.5" disabled={processing}>
                            <Save size={14} /> {processing ? 'Guardando...' : 'Iniciar consulta'}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop"><button onClick={() => { reset(); onCerrar(); }}>close</button></form>
        </dialog>
    );
}
