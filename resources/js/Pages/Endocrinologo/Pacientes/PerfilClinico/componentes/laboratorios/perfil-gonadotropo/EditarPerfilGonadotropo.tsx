import { useForm } from '@inertiajs/react';
import { X, Save, FlaskConical, FileText } from 'lucide-react';
import { Boton } from '@/Components/ui/boton';
import type { PerfilGonadotropoData } from '../../../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    data: PerfilGonadotropoData;
    onCerrar: () => void;
}

export default function EditarPerfilGonadotropo({ abierto, idPaciente, data: existente, onCerrar }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        id_consulta_endocrinologica: existente.id_consulta_endocrinologica,
        fecha_resultado: existente.fecha_resultado ?? '',
        lh: existente.lh?.toString() ?? '',
        fsh: existente.fsh?.toString() ?? '',
        relacion_lh_fsh: existente.relacion_lh_fsh?.toString() ?? '',
        estradiol: existente.estradiol?.toString() ?? '',
        progesterona: existente.progesterona?.toString() ?? '',
        progesterona_dia_ciclo: existente.progesterona_dia_ciclo?.toString() ?? '',
        progesterona_fase_ciclo: existente.progesterona_fase_ciclo ?? '',
        interpretacion: existente.interpretacion ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/endocrinologo/pacientes/${idPaciente}/laboratorios/perfil-gonadotropo/${existente.id_perfil_gonadotropo}?_method=PUT`, {
            preserveScroll: true, onSuccess: () => { reset(); onCerrar(); },
        });
    }

    function handleCerrar() { reset(); onCerrar(); }
    if (!abierto) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-[3px] p-4">
            <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-surface-border bg-surface-card shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark">
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-surface-border bg-surface-card px-6 py-4 dark:border-surface-border-dark dark:bg-surface-card-dark">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange">
                            <FlaskConical size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-ink dark:text-ink-dark">Editar perfil gonadotropo</h2>
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Modifica los valores del registro actual</p>
                        </div>
                    </div>
                    <button type="button" onClick={handleCerrar} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-black/[0.05] dark:text-ink-muted-dark dark:hover:bg-white/[0.06]">
                        <X size={18} strokeWidth={1.8} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="max-w-xs">
                        <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Fecha del resultado</p>
                        <input type="date" value={data.fecha_resultado} onChange={(e) => setData('fecha_resultado', e.target.value)} className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" required />
                    </div>

                    <div>
                        <p className="text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-3">Gonadotropinas y esteroides</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <InputLab label="LH" unidad="mUI/mL" placeholder="1-12" value={data.lh} onChange={(v) => setData('lh', v)} />
                            <InputLab label="FSH" unidad="mUI/mL" placeholder="3-10" value={data.fsh} onChange={(v) => setData('fsh', v)} />
                            <InputLab label="Relación LH/FSH" unidad="" placeholder="<2" value={data.relacion_lh_fsh} onChange={(v) => setData('relacion_lh_fsh', v)} />
                            <InputLab label="Estradiol" unidad="pg/mL" placeholder="30-400" value={data.estradiol} onChange={(v) => setData('estradiol', v)} />
                            <InputLab label="Progesterona" unidad="ng/mL" placeholder=">10 ovul." value={data.progesterona} onChange={(v) => setData('progesterona', v)} />
                            <InputLab label="Día del ciclo" unidad="" placeholder="21" value={data.progesterona_dia_ciclo} onChange={(v) => setData('progesterona_dia_ciclo', v)} />
                        </div>
                    </div>

                    <div className="max-w-xs">
                        <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Fase del ciclo</p>
                        <select value={data.progesterona_fase_ciclo} onChange={(e) => setData('progesterona_fase_ciclo', e.target.value)} className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark">
                            <option value="">Sin especificar</option>
                            <option value="folicular">Folicular</option>
                            <option value="ovulatoria">Ovulatoria</option>
                            <option value="lutea">Lútea</option>
                        </select>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 mb-2 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <FileText size={11} strokeWidth={2} className="text-category-others" /> Interpretación
                        </label>
                        <textarea rows={3} value={data.interpretacion} onChange={(e) => setData('interpretacion', e.target.value)} placeholder="Interpretación clínica..." className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 resize-y min-h-[70px] dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" />
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-surface-border pt-4 dark:border-surface-border-dark">
                        <Boton type="button" variante="ghost" tamano="sm" onClick={handleCerrar}>Cancelar</Boton>
                        <Boton type="submit" variante="primary" tamano="md" disabled={processing}>
                            <Save size={14} strokeWidth={1.8} /> {processing ? 'Guardando...' : 'Guardar cambios'}
                        </Boton>
                    </div>
                </form>
            </div>
        </div>
    );
}

function InputLab({ label, unidad, placeholder, value, onChange }: { label: string; unidad: string; placeholder: string; value: string; onChange: (v: string) => void }) {
    return (
        <div>
            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1">{label}</p>
            <div className="relative">
                <input type="number" step="0.01" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-2.5 pr-14 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                {unidad && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-ink-muted/50 dark:text-ink-muted-dark/50">{unidad}</span>}
            </div>
        </div>
    );
}
