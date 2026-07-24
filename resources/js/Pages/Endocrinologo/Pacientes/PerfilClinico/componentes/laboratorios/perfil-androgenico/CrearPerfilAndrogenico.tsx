import { useForm } from '@inertiajs/react';
import { X, Save, FlaskConical, FileText } from 'lucide-react';
import { Boton } from '@/Components/ui/boton';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    onCerrar: () => void;
}

export default function CrearPerfilAndrogenico({ abierto, idPaciente, idConsulta, onCerrar }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        id_consulta_endocrinologica: idConsulta ?? '',
        fecha_resultado: '',
        testosterona_total: '',
        testosterona_libre: '',
        shbg: '',
        indice_androgenico_libre: '',
        dhea_s: '',
        androstenediona: '',
        hiperandrogenismo_bioquimico: false,
        interpretacion: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/endocrinologo/pacientes/${idPaciente}/laboratorios/perfil-androgenico`, {
            preserveScroll: true,
            onSuccess: () => { reset(); onCerrar(); },
        });
    }

    function handleCerrar() { reset(); onCerrar(); }

    if (!abierto) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-[3px] p-4">
            <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-surface-border bg-surface-card shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-surface-border bg-surface-card px-6 py-4 dark:border-surface-border-dark dark:bg-surface-card-dark">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-category-fruits/15 text-category-fruits">
                            <FlaskConical size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-ink dark:text-ink-dark">Perfil androgénico</h2>
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Nuevo registro de andrógenos</p>
                        </div>
                    </div>
                    <button type="button" onClick={handleCerrar} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-black/[0.05] dark:text-ink-muted-dark dark:hover:bg-white/[0.06]">
                        <X size={18} strokeWidth={1.8} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Fecha */}
                    <div className="max-w-xs">
                        <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Fecha del resultado</p>
                        <input type="date" value={data.fecha_resultado} onChange={(e) => setData('fecha_resultado', e.target.value)} className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" required />
                        {errors.fecha_resultado && <p className="mt-1 text-[10.5px] text-category-fruits">{errors.fecha_resultado}</p>}
                    </div>

                    {/* Valores hormonales */}
                    <div>
                        <p className="text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-3">Valores hormonales</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <InputLab label="Testosterona total" unidad="ng/dL" placeholder="15-70" value={data.testosterona_total} onChange={(v) => setData('testosterona_total', v)} />
                            <InputLab label="Testosterona libre" unidad="pg/mL" placeholder="0.5-4.5" value={data.testosterona_libre} onChange={(v) => setData('testosterona_libre', v)} />
                            <InputLab label="SHBG" unidad="nmol/L" placeholder="20-130" value={data.shbg} onChange={(v) => setData('shbg', v)} />
                            <InputLab label="Índice androgénico libre" unidad="" placeholder="<5" value={data.indice_androgenico_libre} onChange={(v) => setData('indice_androgenico_libre', v)} />
                            <InputLab label="DHEA-S" unidad="μg/dL" placeholder="35-430" value={data.dhea_s} onChange={(v) => setData('dhea_s', v)} />
                            <InputLab label="Androstenediona" unidad="ng/mL" placeholder="0.3-3.3" value={data.androstenediona} onChange={(v) => setData('androstenediona', v)} />
                        </div>
                    </div>

                    {/* Conclusión */}
                    <div>
                        <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-surface-border px-4 py-3 transition-all hover:border-brand-green/30 dark:border-surface-border-dark dark:hover:border-brand-green/30">
                            <input type="checkbox" checked={data.hiperandrogenismo_bioquimico} onChange={(e) => setData('hiperandrogenismo_bioquimico', e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-surface-border text-brand-green focus:ring-brand-green/30 dark:border-surface-border-dark" />
                            <div>
                                <p className="text-[12.5px] font-semibold text-ink dark:text-ink-dark">Hiperandrogenismo bioquímico</p>
                                <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Al menos un andrógeno por encima del rango normal</p>
                            </div>
                        </label>
                    </div>

                    {/* Interpretación */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <FileText size={11} strokeWidth={2} className="text-category-others" />
                            Interpretación
                        </label>
                        <textarea rows={3} value={data.interpretacion} onChange={(e) => setData('interpretacion', e.target.value)} placeholder="Interpretación clínica de los resultados..." className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 resize-y min-h-[70px] dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 border-t border-surface-border pt-4 dark:border-surface-border-dark">
                        <Boton type="button" variante="ghost" tamano="sm" onClick={handleCerrar}>Cancelar</Boton>
                        <Boton type="submit" variante="primary" tamano="md" disabled={processing}>
                            <Save size={14} strokeWidth={1.8} /> {processing ? 'Guardando...' : 'Registrar'}
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
            <p className="text-[8.5px] text-ink-muted/50 dark:text-ink-muted-dark/50 mt-0.5">Ref: {placeholder}</p>
        </div>
    );
}
