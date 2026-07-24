import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { HistoriaMenstrualData } from '../../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    historiaExistente?: HistoriaMenstrualData | null;
    onCerrar: () => void;
}

interface FormData {
    id_consulta_endocrinologica: number | string;
    fecha_ultima_menstruacion: string;
    edad_menarquia: string;
    regularidad_ciclo: string;
    duracion_ciclo_dias: string;
    intervalo_entre_ciclos_dias: string;
    amenorrea: boolean;
    oligomenorrea: boolean;
    sangrado_abundante: boolean;
    dolor_menstrual: boolean;
    sospecha_anovulacion: boolean;
    progesterona_lutea: string;
    confirma_anovulacion_por_progesterona: boolean;
    observaciones: string;
}

export default function FormularioHistoriaMenstrual({ abierto, idPaciente, idConsulta, historiaExistente, onCerrar }: Props) {
    const esEdicion = Boolean(historiaExistente);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        id_consulta_endocrinologica: historiaExistente?.id_consulta_endocrinologica ?? idConsulta ?? '',
        fecha_ultima_menstruacion: historiaExistente?.fecha_ultima_menstruacion ?? '',
        edad_menarquia: historiaExistente?.edad_menarquia?.toString() ?? '',
        regularidad_ciclo: historiaExistente?.regularidad_ciclo ?? '',
        duracion_ciclo_dias: historiaExistente?.duracion_ciclo_dias?.toString() ?? '',
        intervalo_entre_ciclos_dias: historiaExistente?.intervalo_entre_ciclos_dias?.toString() ?? '',
        amenorrea: historiaExistente?.amenorrea ?? false,
        oligomenorrea: historiaExistente?.oligomenorrea ?? false,
        sangrado_abundante: historiaExistente?.sangrado_abundante ?? false,
        dolor_menstrual: historiaExistente?.dolor_menstrual ?? false,
        sospecha_anovulacion: historiaExistente?.sospecha_anovulacion ?? false,
        progesterona_lutea: historiaExistente?.progesterona_lutea?.toString() ?? '',
        confirma_anovulacion_por_progesterona: historiaExistente?.confirma_anovulacion_por_progesterona ?? false,
        observaciones: historiaExistente?.observaciones ?? '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/historia-menstrual/${historiaExistente!.id_historia_menstrual}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/historia-menstrual`;
        post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } });
    };

    const handleCerrar = () => { reset(); onCerrar(); };

    if (!abierto) return null;

    return (
        <dialog className="modal modal-open" key={historiaExistente?.id_historia_menstrual ?? 'new'}>
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">
                    {esEdicion ? 'Editar historia menstrual' : 'Registrar historia menstrual'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Ciclo menstrual */}
                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Datos del ciclo menstrual</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Regularidad del ciclo</span></div>
                            <select className="select select-bordered select-sm w-full" value={data.regularidad_ciclo} onChange={(e) => setData('regularidad_ciclo', e.target.value)}>
                                <option value="">Sin especificar</option>
                                <option value="regular">Regular</option>
                                <option value="irregular">Irregular</option>
                                <option value="ausente">Ausente</option>
                            </select>
                            {errors.regularidad_ciclo ? <div className="label"><span className="label-text-alt text-error text-xs">{errors.regularidad_ciclo}</span></div> : null}
                        </label>

                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Duración del ciclo (días)</span></div>
                            <input type="number" className="input input-bordered input-sm w-full" value={data.duracion_ciclo_dias} onChange={(e) => setData('duracion_ciclo_dias', e.target.value)} />
                            {errors.duracion_ciclo_dias ? <div className="label"><span className="label-text-alt text-error text-xs">{errors.duracion_ciclo_dias}</span></div> : null}
                        </label>

                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Intervalo entre ciclos (días)</span></div>
                            <input type="number" className="input input-bordered input-sm w-full" value={data.intervalo_entre_ciclos_dias} onChange={(e) => setData('intervalo_entre_ciclos_dias', e.target.value)} />
                        </label>

                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Fecha última menstruación</span></div>
                            <input type="date" className="input input-bordered input-sm w-full" value={data.fecha_ultima_menstruacion} onChange={(e) => setData('fecha_ultima_menstruacion', e.target.value)} />
                        </label>

                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Edad menarquía (años)</span></div>
                            <input type="number" className="input input-bordered input-sm w-full" value={data.edad_menarquia} onChange={(e) => setData('edad_menarquia', e.target.value)} />
                        </label>

                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Progesterona lútea (ng/mL)</span></div>
                            <input type="number" step="0.01" className="input input-bordered input-sm w-full" value={data.progesterona_lutea} onChange={(e) => setData('progesterona_lutea', e.target.value)} />
                        </label>
                    </div>

                    <div className="divider my-1" />

                    {/* Hallazgos */}
                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Hallazgos clínicos</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Checkbox label="Amenorrea" checked={data.amenorrea} onChange={(v) => setData('amenorrea', v)} />
                        <Checkbox label="Oligomenorrea" checked={data.oligomenorrea} onChange={(v) => setData('oligomenorrea', v)} />
                        <Checkbox label="Sangrado abundante" checked={data.sangrado_abundante} onChange={(v) => setData('sangrado_abundante', v)} />
                        <Checkbox label="Dolor menstrual (dismenorrea)" checked={data.dolor_menstrual} onChange={(v) => setData('dolor_menstrual', v)} />
                        <Checkbox label="Sospecha de anovulación" checked={data.sospecha_anovulacion} onChange={(v) => setData('sospecha_anovulacion', v)} />
                        <Checkbox label="Anovulación confirmada por progesterona" checked={data.confirma_anovulacion_por_progesterona} onChange={(v) => setData('confirma_anovulacion_por_progesterona', v)} />
                    </div>

                    <div className="divider my-1" />

                    <label className="form-control w-full">
                        <div className="label"><span className="label-text text-xs">Observaciones</span></div>
                        <textarea className="textarea textarea-bordered text-sm" rows={3} value={data.observaciones} onChange={(e) => setData('observaciones', e.target.value)} />
                    </label>

                    {/* Acciones */}
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
