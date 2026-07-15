import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { EvaluacionFisicaData } from '../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    existente?: EvaluacionFisicaData | null;
    onCerrar: () => void;
}

interface FormData {
    id_consulta_endocrinologica: number | string;
    peso: string;
    talla: string;
    circunferencia_cintura: string;
    circunferencia_cadera: string;
    presion_sistolica: string;
    presion_diastolica: string;
    acantosis_nigricans: boolean;
    skin_tags: boolean;
    galactorrea: boolean;
    hirsutismo_visible: boolean;
    puntaje_ferriman_gallwey: string;
    acne_visible: boolean;
    alopecia_visible: boolean;
    observaciones: string;
}

export default function FormularioEvaluacionFisica({ abierto, idPaciente, idConsulta, existente, onCerrar }: Props) {
    const esEdicion = Boolean(existente);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '',
        peso: existente?.peso?.toString() ?? '',
        talla: existente?.talla?.toString() ?? '',
        circunferencia_cintura: existente?.circunferencia_cintura?.toString() ?? '',
        circunferencia_cadera: existente?.circunferencia_cadera?.toString() ?? '',
        presion_sistolica: existente?.presion_sistolica?.toString() ?? '',
        presion_diastolica: existente?.presion_diastolica?.toString() ?? '',
        acantosis_nigricans: existente?.acantosis_nigricans ?? false,
        skin_tags: existente?.skin_tags ?? false,
        galactorrea: existente?.galactorrea ?? false,
        hirsutismo_visible: existente?.hirsutismo_visible ?? false,
        puntaje_ferriman_gallwey: existente?.puntaje_ferriman_gallwey?.toString() ?? '',
        acne_visible: existente?.acne_visible ?? false,
        alopecia_visible: existente?.alopecia_visible ?? false,
        observaciones: existente?.observaciones ?? '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/evaluacion-fisica/${existente!.id_evaluacion_fisica}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/evaluacion-fisica`;
        post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } });
    };

    const handleCerrar = () => { reset(); onCerrar(); };

    // Preview IMC e ICC
    const pesoNum = parseFloat(data.peso) || 0;
    const tallaNum = parseFloat(data.talla) || 0;
    const imcPreview = pesoNum > 0 && tallaNum > 0 ? (pesoNum / (tallaNum * tallaNum)).toFixed(2) : '-';

    const cinturaNum = parseFloat(data.circunferencia_cintura) || 0;
    const caderaNum = parseFloat(data.circunferencia_cadera) || 0;
    const iccPreview = cinturaNum > 0 && caderaNum > 0 ? (cinturaNum / caderaNum).toFixed(2) : '-';

    if (!abierto) return null;

    return (
        <dialog className="modal modal-open" key={existente?.id_evaluacion_fisica ?? 'new'}>
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">
                    {esEdicion ? 'Editar evaluación física' : 'Registrar evaluación física'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Antropometría */}
                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Antropometría</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <InputNum label="Peso (kg)" value={data.peso} onChange={(v) => setData('peso', v)} error={errors.peso} step="0.01" />
                        <InputNum label="Talla (m)" value={data.talla} onChange={(v) => setData('talla', v)} error={errors.talla} step="0.01" placeholder="Ej: 1.65" />
                        <div>
                            <div className="label"><span className="label-text text-xs">IMC (calculado)</span></div>
                            <input type="text" className="input input-bordered input-sm w-full bg-base-200" value={imcPreview} disabled />
                            <div className="label"><span className="label-text-alt text-base-content/40">Se calcula en backend</span></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <InputNum label="Cintura (cm)" value={data.circunferencia_cintura} onChange={(v) => setData('circunferencia_cintura', v)} error={errors.circunferencia_cintura} step="0.1" hint="Riesgo ≥ 80 cm" />
                        <InputNum label="Cadera (cm)" value={data.circunferencia_cadera} onChange={(v) => setData('circunferencia_cadera', v)} error={errors.circunferencia_cadera} step="0.1" />
                        <div>
                            <div className="label"><span className="label-text text-xs">ICC (calculado)</span></div>
                            <input type="text" className="input input-bordered input-sm w-full bg-base-200" value={iccPreview} disabled />
                        </div>
                    </div>

                    <div className="divider my-1" />

                    {/* Presión arterial */}
                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Presión arterial</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InputNum label="PA sistólica (mmHg)" value={data.presion_sistolica} onChange={(v) => setData('presion_sistolica', v)} error={errors.presion_sistolica} />
                        <InputNum label="PA diastólica (mmHg)" value={data.presion_diastolica} onChange={(v) => setData('presion_diastolica', v)} error={errors.presion_diastolica} />
                    </div>

                    <div className="divider my-1" />

                    {/* Hallazgos */}
                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Hallazgos al examen físico</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Checkbox label="Acantosis nigricans" checked={data.acantosis_nigricans} onChange={(v) => setData('acantosis_nigricans', v)} />
                        <Checkbox label="Acrocordones (skin tags)" checked={data.skin_tags} onChange={(v) => setData('skin_tags', v)} />
                        <Checkbox label="Galactorrea" checked={data.galactorrea} onChange={(v) => setData('galactorrea', v)} />
                        <Checkbox label="Hirsutismo visible" checked={data.hirsutismo_visible} onChange={(v) => setData('hirsutismo_visible', v)} />
                        <Checkbox label="Acné visible" checked={data.acne_visible} onChange={(v) => setData('acne_visible', v)} />
                        <Checkbox label="Alopecia visible" checked={data.alopecia_visible} onChange={(v) => setData('alopecia_visible', v)} />
                    </div>

                    <InputNum label="Puntaje Ferriman-Gallwey (0-36)" value={data.puntaje_ferriman_gallwey} onChange={(v) => setData('puntaje_ferriman_gallwey', v)} error={errors.puntaje_ferriman_gallwey} className="max-w-xs" />

                    <div className="divider my-1" />

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

function InputNum({ label, value, onChange, error, step, placeholder, hint, className }: {
    label: string; value: string; onChange: (v: string) => void; error?: string; step?: string; placeholder?: string; hint?: string; className?: string;
}) {
    return (
        <label className={`form-control w-full ${className ?? ''}`}>
            <div className="label"><span className="label-text text-xs">{label}</span></div>
            <input type="number" step={step} placeholder={placeholder} className="input input-bordered input-sm w-full" value={value} onChange={(e) => onChange(e.target.value)} />
            {error ? <div className="label"><span className="label-text-alt text-error text-xs">{error}</span></div> : null}
            {hint && !error ? <div className="label"><span className="label-text-alt text-base-content/40">{hint}</span></div> : null}
        </label>
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
