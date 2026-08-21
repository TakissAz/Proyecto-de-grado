import { useForm } from '@inertiajs/react';
import { X, Save, HeartPulse, User, Users, Pill, FileText, Plus, Trash2 } from 'lucide-react';
import { Boton } from '@/Components/ui/boton';
import type {
    AntecedenteFamiliarDetalle,
    AntecedentePersonalDetalle,
    AntecedentesData,
    MedicamentoDetalle,
} from '../../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    existente?: AntecedentesData | null;
    onCerrar: () => void;
}

interface FormData {
    id_consulta_endocrinologica: number | string;
    antecedentes_personales_detalle: AntecedentePersonalDetalle[];
    antecedentes_familiares_detalle: AntecedenteFamiliarDetalle[];
    medicamentos_detalle: MedicamentoDetalle[];
    observaciones: string;
}

const hoy = new Date().toISOString().split('T')[0];

const personalVacio = (): AntecedentePersonalDetalle => ({
    antecedente: '',
    fecha_diagnostico: hoy,
    observacion: '',
});

const familiarVacio = (): AntecedenteFamiliarDetalle => ({
    antecedente: '',
    parentesco: '',
    observacion: '',
});

const medicamentoVacio = (): MedicamentoDetalle => ({
    nombre: '',
    dosis: '',
    frecuencia: '',
    motivo: '',
    fecha_inicio: hoy,
    estado: 'actual',
});

function personalesIniciales(a?: AntecedentesData | null): AntecedentePersonalDetalle[] {
    if (a?.antecedentes_personales_detalle?.length) return a.antecedentes_personales_detalle;
    if (!a) return [personalVacio()];
    return [
        a.diabetes_personal && 'Diabetes mellitus',
        a.hipertension_personal && 'Hipertensión arterial',
        a.dislipidemia_personal && 'Dislipidemia',
        a.enfermedad_tiroidea && 'Enfermedad tiroidea',
        a.hiperprolactinemia_previa && 'Hiperprolactinemia',
    ]
        .filter(Boolean)
        .map((v) => ({ ...personalVacio(), antecedente: String(v) }));
}

function familiaresIniciales(a?: AntecedentesData | null): AntecedenteFamiliarDetalle[] {
    if (a?.antecedentes_familiares_detalle?.length) return a.antecedentes_familiares_detalle;
    if (!a) return [familiarVacio()];
    return [
        a.diabetes_familiar && 'Diabetes mellitus',
        a.hipertension_familiar && 'Hipertensión arterial',
        a.dislipidemia_familiar && 'Dislipidemia',
    ]
        .filter(Boolean)
        .map((v) => ({ ...familiarVacio(), antecedente: String(v), parentesco: 'no_especificado' }));
}

function medicamentosIniciales(a?: AntecedentesData | null): MedicamentoDetalle[] {
    if (a?.medicamentos_detalle?.length) return a.medicamentos_detalle;
    if (!a) return [medicamentoVacio()];
    return [
        a.uso_metformina && 'Metformina',
        a.uso_anticonceptivos && 'Anticonceptivos',
        a.uso_corticoides && 'Corticoides',
        a.otros_medicamentos,
    ]
        .filter(Boolean)
        .map((v) => ({ ...medicamentoVacio(), nombre: String(v) }));
}

const PARENTESCOS = [
    { value: 'madre', label: 'Madre' },
    { value: 'padre', label: 'Padre' },
    { value: 'hermana', label: 'Hermana' },
    { value: 'hermano', label: 'Hermano' },
    { value: 'abuela_materna', label: 'Abuela materna' },
    { value: 'abuelo_materno', label: 'Abuelo materno' },
    { value: 'abuela_paterna', label: 'Abuela paterna' },
    { value: 'abuelo_paterno', label: 'Abuelo paterno' },
    { value: 'tia', label: 'Tía' },
    { value: 'tio', label: 'Tío' },
    { value: 'otro', label: 'Otro' },
    { value: 'no_especificado', label: 'No especificado' },
];

/* ─── Clase base de input (igual que historia menstrual) ─── */
const inputCls =
    'w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark';

export default function FormularioAntecedentes({
    abierto,
    idPaciente,
    idConsulta,
    existente,
    onCerrar,
}: Props) {
    const esEdicion = Boolean(existente);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '',
        antecedentes_personales_detalle: personalesIniciales(existente),
        antecedentes_familiares_detalle: familiaresIniciales(existente),
        medicamentos_detalle: medicamentosIniciales(existente),
        observaciones: existente?.observaciones ?? '',
    });

    function cambiar<T>(campo: keyof FormData, i: number, clave: keyof T, valor: string) {
        const arr = [...(data[campo] as T[])];
        arr[i] = { ...arr[i], [clave]: valor };
        setData(campo, arr as never);
    }

    function quitar(campo: keyof FormData, i: number) {
        setData(campo, (data[campo] as unknown[]).filter((_, idx) => idx !== i) as never);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/antecedentes/${existente!.id_antecedente}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/antecedentes`;
        post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } });
    }

    function handleCerrar() { reset(); onCerrar(); }

    if (!abierto) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-[3px] p-4">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-surface-border bg-surface-card shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark">

                {/* ── Header ── */}
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-surface-border bg-surface-card px-6 py-4 dark:border-surface-border-dark dark:bg-surface-card-dark">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green">
                            <HeartPulse size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-ink dark:text-ink-dark">
                                {esEdicion ? 'Editar antecedentes clínicos' : 'Nuevo registro de antecedentes'}
                            </h2>
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                                Registre cada antecedente y medicamento de forma individual
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleCerrar}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-black/[0.05] dark:text-ink-muted-dark dark:hover:bg-white/[0.06]"
                    >
                        <X size={18} strokeWidth={1.8} />
                    </button>
                </div>

                {/* ── Body ── */}
                <form onSubmit={handleSubmit} className="p-6 space-y-7">

                    {/* ─── Antecedentes personales ─── */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-2 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                                <User size={11} strokeWidth={2} className="text-brand-green-dark dark:text-brand-green" />
                                Antecedentes personales
                            </label>
                            <button
                                type="button"
                                onClick={() => setData('antecedentes_personales_detalle', [...data.antecedentes_personales_detalle, personalVacio()])}
                                className="flex items-center gap-1.5 rounded-lg border border-brand-green/30 px-3 py-1.5 text-[11.5px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green/8 dark:border-brand-green/30 dark:text-brand-green"
                            >
                                <Plus size={13} strokeWidth={2} /> Agregar
                            </button>
                        </div>

                        {data.antecedentes_personales_detalle.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-surface-border py-6 text-center text-[12.5px] text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark">
                                Sin registros. Haga clic en <span className="font-semibold">Agregar</span> para añadir uno.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {data.antecedentes_personales_detalle.map((f, i) => (
                                    <div key={i} className="relative grid grid-cols-1 gap-3 rounded-xl border border-surface-border bg-black/[0.015] p-4 pr-12 sm:grid-cols-2 dark:border-surface-border-dark dark:bg-white/[0.02]">
                                        <div>
                                            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Antecedente *</p>
                                            <input
                                                required
                                                placeholder="Ej. Hipotiroidismo"
                                                value={f.antecedente}
                                                onChange={(e) => cambiar<AntecedentePersonalDetalle>('antecedentes_personales_detalle', i, 'antecedente', e.target.value)}
                                                className={inputCls}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Fecha de diagnóstico</p>
                                            <input
                                                type="date"
                                                value={f.fecha_diagnostico ?? hoy}
                                                onChange={(e) => cambiar<AntecedentePersonalDetalle>('antecedentes_personales_detalle', i, 'fecha_diagnostico', e.target.value)}
                                                className={inputCls}
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Observación</p>
                                            <input
                                                placeholder="Detalle clínico opcional"
                                                value={f.observacion ?? ''}
                                                onChange={(e) => cambiar<AntecedentePersonalDetalle>('antecedentes_personales_detalle', i, 'observacion', e.target.value)}
                                                className={inputCls}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            title="Eliminar"
                                            onClick={() => quitar('antecedentes_personales_detalle', i)}
                                            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted/50 transition-colors hover:bg-category-fruits/10 hover:text-category-fruits dark:text-ink-muted-dark/50"
                                        >
                                            <Trash2 size={14} strokeWidth={1.8} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ─── Antecedentes familiares ─── */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-2 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                                <Users size={11} strokeWidth={2} className="text-category-dairy" />
                                Antecedentes familiares
                            </label>
                            <button
                                type="button"
                                onClick={() => setData('antecedentes_familiares_detalle', [...data.antecedentes_familiares_detalle, familiarVacio()])}
                                className="flex items-center gap-1.5 rounded-lg border border-category-dairy/30 px-3 py-1.5 text-[11.5px] font-semibold text-category-dairy transition-colors hover:bg-category-dairy/8"
                            >
                                <Plus size={13} strokeWidth={2} /> Agregar
                            </button>
                        </div>

                        {data.antecedentes_familiares_detalle.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-surface-border py-6 text-center text-[12.5px] text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark">
                                Sin registros. Haga clic en <span className="font-semibold">Agregar</span> para añadir uno.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {data.antecedentes_familiares_detalle.map((f, i) => (
                                    <div key={i} className="relative grid grid-cols-1 gap-3 rounded-xl border border-surface-border bg-black/[0.015] p-4 pr-12 sm:grid-cols-2 dark:border-surface-border-dark dark:bg-white/[0.02]">
                                        <div>
                                            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Antecedente *</p>
                                            <input
                                                required
                                                placeholder="Ej. Diabetes mellitus"
                                                value={f.antecedente}
                                                onChange={(e) => cambiar<AntecedenteFamiliarDetalle>('antecedentes_familiares_detalle', i, 'antecedente', e.target.value)}
                                                className={inputCls}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Familiar *</p>
                                            <select
                                                required
                                                value={f.parentesco}
                                                onChange={(e) => cambiar<AntecedenteFamiliarDetalle>('antecedentes_familiares_detalle', i, 'parentesco', e.target.value)}
                                                className={inputCls}
                                            >
                                                <option value="">Seleccione</option>
                                                {PARENTESCOS.map((p) => (
                                                    <option key={p.value} value={p.value}>{p.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Observación</p>
                                            <input
                                                placeholder="Detalle opcional"
                                                value={f.observacion ?? ''}
                                                onChange={(e) => cambiar<AntecedenteFamiliarDetalle>('antecedentes_familiares_detalle', i, 'observacion', e.target.value)}
                                                className={inputCls}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            title="Eliminar"
                                            onClick={() => quitar('antecedentes_familiares_detalle', i)}
                                            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted/50 transition-colors hover:bg-category-fruits/10 hover:text-category-fruits dark:text-ink-muted-dark/50"
                                        >
                                            <Trash2 size={14} strokeWidth={1.8} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ─── Medicamentos ─── */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-2 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                                <Pill size={11} strokeWidth={2} className="text-brand-orange" />
                                Medicamentos actuales
                            </label>
                            <button
                                type="button"
                                onClick={() => setData('medicamentos_detalle', [...data.medicamentos_detalle, medicamentoVacio()])}
                                className="flex items-center gap-1.5 rounded-lg border border-brand-orange/30 px-3 py-1.5 text-[11.5px] font-semibold text-brand-orange transition-colors hover:bg-brand-orange/8"
                            >
                                <Plus size={13} strokeWidth={2} /> Agregar
                            </button>
                        </div>

                        {data.medicamentos_detalle.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-surface-border py-6 text-center text-[12.5px] text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark">
                                Sin registros. Haga clic en <span className="font-semibold">Agregar</span> para añadir uno.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {data.medicamentos_detalle.map((f, i) => (
                                    <div key={i} className="relative grid grid-cols-1 gap-3 rounded-xl border border-surface-border bg-black/[0.015] p-4 pr-12 sm:grid-cols-2 dark:border-surface-border-dark dark:bg-white/[0.02]">
                                        <div>
                                            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Medicamento *</p>
                                            <input
                                                required
                                                placeholder="Nombre o principio activo"
                                                value={f.nombre}
                                                onChange={(e) => cambiar<MedicamentoDetalle>('medicamentos_detalle', i, 'nombre', e.target.value)}
                                                className={inputCls}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Dosis</p>
                                            <input
                                                placeholder="Ej. 500 mg"
                                                value={f.dosis ?? ''}
                                                onChange={(e) => cambiar<MedicamentoDetalle>('medicamentos_detalle', i, 'dosis', e.target.value)}
                                                className={inputCls}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Frecuencia</p>
                                            <input
                                                placeholder="Ej. cada 12 h"
                                                value={f.frecuencia ?? ''}
                                                onChange={(e) => cambiar<MedicamentoDetalle>('medicamentos_detalle', i, 'frecuencia', e.target.value)}
                                                className={inputCls}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Motivo / indicación</p>
                                            <input
                                                placeholder="Indicación clínica"
                                                value={f.motivo ?? ''}
                                                onChange={(e) => cambiar<MedicamentoDetalle>('medicamentos_detalle', i, 'motivo', e.target.value)}
                                                className={inputCls}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            title="Eliminar"
                                            onClick={() => quitar('medicamentos_detalle', i)}
                                            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted/50 transition-colors hover:bg-category-fruits/10 hover:text-category-fruits dark:text-ink-muted-dark/50"
                                        >
                                            <Trash2 size={14} strokeWidth={1.8} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ─── Observaciones generales ─── */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <FileText size={11} strokeWidth={2} className="text-category-others" />
                            Observaciones generales
                        </label>
                        <textarea
                            rows={3}
                            value={data.observaciones}
                            onChange={(e) => setData('observaciones', e.target.value)}
                            placeholder="Notas clínicas relevantes del registro..."
                            className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 resize-y min-h-[80px] dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                        />
                    </div>

                    {/* ─── Error global ─── */}
                    {Object.keys(errors).length > 0 && (
                        <p className="rounded-xl border border-category-fruits/25 bg-category-fruits/8 px-4 py-3 text-[12.5px] text-category-fruits">
                            Revise los campos obligatorios marcados con *.
                        </p>
                    )}

                    {/* ─── Footer ─── */}
                    <div className="flex items-center justify-end gap-3 border-t border-surface-border pt-4 dark:border-surface-border-dark">
                        <Boton type="button" variante="ghost" tamano="sm" onClick={handleCerrar}>
                            Cancelar
                        </Boton>
                        <Boton type="submit" variante="primary" tamano="md" disabled={processing}>
                            <Save size={14} strokeWidth={1.8} />
                            {processing ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Registrar antecedentes'}
                        </Boton>
                    </div>
                </form>
            </div>
        </div>
    );
}
