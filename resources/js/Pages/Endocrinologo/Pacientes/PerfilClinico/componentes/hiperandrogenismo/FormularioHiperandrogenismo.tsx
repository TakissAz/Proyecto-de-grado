import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { HiperandrogenismoData } from '../../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    existente?: HiperandrogenismoData | null;
    onCerrar: () => void;
}

interface FormData {
    id_consulta_endocrinologica: number | string;
    acne: boolean;
    acne_grado: string;
    hirsutismo: boolean;
    hirsutismo_zona: string;
    puntaje_ferriman_gallwey: string;
    alopecia_androgenica: boolean;
    seborrea: boolean;
    inicio_sintomas: string;
    progresion_sintomas: string;
    observaciones: string;
}

export default function FormularioHiperandrogenismo({ abierto, idPaciente, idConsulta, existente, onCerrar }: Props) {
    const esEdicion = Boolean(existente);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '',
        acne: existente?.acne ?? false,
        acne_grado: existente?.acne_grado ?? 'no_aplica',
        hirsutismo: existente?.hirsutismo ?? false,
        hirsutismo_zona: existente?.hirsutismo_zona ?? '',
        puntaje_ferriman_gallwey: existente?.puntaje_ferriman_gallwey?.toString() ?? '',
        alopecia_androgenica: existente?.alopecia_androgenica ?? false,
        seborrea: existente?.seborrea ?? false,
        inicio_sintomas: existente?.inicio_sintomas ?? '',
        progresion_sintomas: existente?.progresion_sintomas ?? '',
        observaciones: existente?.observaciones ?? '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/hiperandrogenismo/${existente!.id_historia_hiperandrogenica}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/hiperandrogenismo`;
        post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } });
    };

    const handleCerrar = () => { reset(); onCerrar(); };

    if (!abierto) return null;

    return (
        <dialog className="modal modal-open" key={existente?.id_historia_hiperandrogenica ?? 'new'}>
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">
                    {esEdicion ? 'Editar hiperandrogenismo' : 'Registrar hiperandrogenismo'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Signos clínicos</p>

                    {/* Acné */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                        <Checkbox label="Presencia de acné" checked={data.acne} onChange={(v) => setData('acne', v)} />
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Grado de acné</span></div>
                            <select className="select select-bordered select-sm w-full" value={data.acne_grado} onChange={(e) => setData('acne_grado', e.target.value)} disabled={!data.acne}>
                                <option value="no_aplica">No aplica</option>
                                <option value="leve">Leve</option>
                                <option value="moderado">Moderado</option>
                                <option value="severo">Severo</option>
                            </select>
                        </label>
                    </div>

                    {/* Hirsutismo */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                        <Checkbox label="Presencia de hirsutismo" checked={data.hirsutismo} onChange={(v) => setData('hirsutismo', v)} />
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Zonas afectadas</span></div>
                            <input type="text" className="input input-bordered input-sm w-full" placeholder="Ej: mentón, labio superior" value={data.hirsutismo_zona} onChange={(e) => setData('hirsutismo_zona', e.target.value)} disabled={!data.hirsutismo} />
                        </label>
                    </div>

                    <label className="form-control w-full max-w-xs">
                        <div className="label"><span className="label-text text-xs">Puntaje Ferriman-Gallwey (0-36)</span></div>
                        <input type="number" min="0" max="36" className="input input-bordered input-sm w-full" value={data.puntaje_ferriman_gallwey} onChange={(e) => setData('puntaje_ferriman_gallwey', e.target.value)} />
                        <div className="label"><span className="label-text-alt text-base-content/40">≥ 8 = positivo para hirsutismo</span></div>
                    </label>

                    <div className="divider my-1" />

                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Otros signos</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Checkbox label="Alopecia androgénica" checked={data.alopecia_androgenica} onChange={(v) => setData('alopecia_androgenica', v)} />
                        <Checkbox label="Seborrea" checked={data.seborrea} onChange={(v) => setData('seborrea', v)} />
                    </div>

                    <div className="divider my-1" />

                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Evolución</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Inicio de síntomas</span></div>
                            <input type="text" className="input input-bordered input-sm w-full" placeholder="Ej: pubertad, hace 2 años" value={data.inicio_sintomas} onChange={(e) => setData('inicio_sintomas', e.target.value)} />
                        </label>
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Progresión</span></div>
                            <select className="select select-bordered select-sm w-full" value={data.progresion_sintomas} onChange={(e) => setData('progresion_sintomas', e.target.value)}>
                                <option value="">Sin especificar</option>
                                <option value="estable">Estable</option>
                                <option value="progresivo">Progresivo</option>
                                <option value="regresivo">Regresivo</option>
                            </select>
                        </label>
                    </div>

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

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <span className="text-sm text-base-content/80">{label}</span>
        </label>
    );
}
