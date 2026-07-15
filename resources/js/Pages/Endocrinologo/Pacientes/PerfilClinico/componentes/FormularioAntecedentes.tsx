import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { AntecedentesData } from '../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    existente?: AntecedentesData | null;
    onCerrar: () => void;
}

interface FormData {
    id_consulta_endocrinologica: number | string;
    diabetes_familiar: boolean;
    diabetes_personal: boolean;
    hipertension_familiar: boolean;
    hipertension_personal: boolean;
    dislipidemia_familiar: boolean;
    dislipidemia_personal: boolean;
    enfermedad_tiroidea: boolean;
    hiperprolactinemia_previa: boolean;
    uso_anticonceptivos: boolean;
    uso_metformina: boolean;
    uso_corticoides: boolean;
    otros_medicamentos: string;
    observaciones: string;
}

export default function FormularioAntecedentes({ abierto, idPaciente, idConsulta, existente, onCerrar }: Props) {
    const esEdicion = Boolean(existente);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '',
        diabetes_familiar: existente?.diabetes_familiar ?? false,
        diabetes_personal: existente?.diabetes_personal ?? false,
        hipertension_familiar: existente?.hipertension_familiar ?? false,
        hipertension_personal: existente?.hipertension_personal ?? false,
        dislipidemia_familiar: existente?.dislipidemia_familiar ?? false,
        dislipidemia_personal: existente?.dislipidemia_personal ?? false,
        enfermedad_tiroidea: existente?.enfermedad_tiroidea ?? false,
        hiperprolactinemia_previa: existente?.hiperprolactinemia_previa ?? false,
        uso_anticonceptivos: existente?.uso_anticonceptivos ?? false,
        uso_metformina: existente?.uso_metformina ?? false,
        uso_corticoides: existente?.uso_corticoides ?? false,
        otros_medicamentos: existente?.otros_medicamentos ?? '',
        observaciones: existente?.observaciones ?? '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/antecedentes/${existente!.id_antecedente}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/antecedentes`;
        post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } });
    };

    const handleCerrar = () => { reset(); onCerrar(); };

    if (!abierto) return null;

    return (
        <dialog className="modal modal-open" key={existente?.id_antecedente ?? 'new'}>
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">
                    {esEdicion ? 'Editar antecedentes endocrino-metabólicos' : 'Registrar antecedentes endocrino-metabólicos'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Personales */}
                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Antecedentes personales</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Checkbox label="Diabetes personal" checked={data.diabetes_personal} onChange={(v) => setData('diabetes_personal', v)} />
                        <Checkbox label="Hipertensión personal" checked={data.hipertension_personal} onChange={(v) => setData('hipertension_personal', v)} />
                        <Checkbox label="Dislipidemia personal" checked={data.dislipidemia_personal} onChange={(v) => setData('dislipidemia_personal', v)} />
                        <Checkbox label="Enfermedad tiroidea" checked={data.enfermedad_tiroidea} onChange={(v) => setData('enfermedad_tiroidea', v)} />
                        <Checkbox label="Hiperprolactinemia previa" checked={data.hiperprolactinemia_previa} onChange={(v) => setData('hiperprolactinemia_previa', v)} />
                    </div>

                    <div className="divider my-1" />

                    {/* Familiares */}
                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Antecedentes familiares</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Checkbox label="Diabetes familiar" checked={data.diabetes_familiar} onChange={(v) => setData('diabetes_familiar', v)} />
                        <Checkbox label="Hipertensión familiar" checked={data.hipertension_familiar} onChange={(v) => setData('hipertension_familiar', v)} />
                        <Checkbox label="Dislipidemia familiar" checked={data.dislipidemia_familiar} onChange={(v) => setData('dislipidemia_familiar', v)} />
                    </div>

                    <div className="divider my-1" />

                    {/* Medicamentos */}
                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Medicamentos en uso actual</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Checkbox label="Metformina" checked={data.uso_metformina} onChange={(v) => setData('uso_metformina', v)} />
                        <Checkbox label="Anticonceptivos" checked={data.uso_anticonceptivos} onChange={(v) => setData('uso_anticonceptivos', v)} />
                        <Checkbox label="Corticoides" checked={data.uso_corticoides} onChange={(v) => setData('uso_corticoides', v)} />
                    </div>

                    <label className="form-control w-full">
                        <div className="label"><span className="label-text text-xs">Otros medicamentos</span></div>
                        <textarea className="textarea textarea-bordered text-sm" rows={2} placeholder="Listar otros medicamentos si aplica" value={data.otros_medicamentos} onChange={(e) => setData('otros_medicamentos', e.target.value)} />
                    </label>

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

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <span className="text-sm text-base-content/80">{label}</span>
        </label>
    );
}
