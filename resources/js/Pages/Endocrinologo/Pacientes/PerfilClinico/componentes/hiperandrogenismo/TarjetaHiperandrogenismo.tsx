import clsx from 'clsx';
import { Link } from '@inertiajs/react';
import { AlertTriangle, Edit, Plus, History } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Boton } from '@/Components/ui/boton';
import GraficoSeveridad from './GraficoSeveridad';
import type { HiperandrogenismoData } from '../../tipos';

interface Props {
    hiperandrogenismo: HiperandrogenismoData | null;
    idPaciente: number;
    onRegistrar: () => void;
    onEditar: () => void;
}

export default function TarjetaHiperandrogenismo({ hiperandrogenismo, idPaciente, onRegistrar, onEditar }: Props) {
    if (!hiperandrogenismo) {
        return (
            <div className="p-5">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange/10">
                        <AlertTriangle size={15} strokeWidth={1.8} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-semibold text-ink dark:text-ink-dark">Hiperandrogenismo</h3>
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Pendiente de registro</p>
                    </div>
                </div>
                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark mb-4 leading-relaxed">
                    No se ha registrado la evaluación de hiperandrogenismo clínico. Este dato es necesario para el criterio de hiperandrogenismo en el diagnóstico PMOS.
                </p>
                <Boton variante="primary" tamano="sm" onClick={onRegistrar}>
                    <Plus size={13} strokeWidth={1.8} /> Registrar hiperandrogenismo
                </Boton>
            </div>
        );
    }

    const tieneHallazgos = hiperandrogenismo.acne || hiperandrogenismo.hirsutismo || hiperandrogenismo.alopecia_androgenica || hiperandrogenismo.seborrea;
    const ferrimanAlto = (hiperandrogenismo.puntaje_ferriman_gallwey ?? 0) >= 8;
    const acneRelevante = hiperandrogenismo.acne && (hiperandrogenismo.acne_grado === 'moderado' || hiperandrogenismo.acne_grado === 'severo');
    const tieneHA = hiperandrogenismo.hirsutismo || hiperandrogenismo.alopecia_androgenica || acneRelevante || ferrimanAlto;

    const hallazgos = [
        acneRelevante && `Acné ${formatGrado(hiperandrogenismo.acne_grado)}`,
        hiperandrogenismo.hirsutismo && 'Hirsutismo',
        ferrimanAlto && `Ferriman-Gallwey ≥ 8`,
        hiperandrogenismo.alopecia_androgenica && 'Alopecia androgénica',
        hiperandrogenismo.seborrea && 'Seborrea',
        hiperandrogenismo.progresion_sintomas === 'progresivo' && 'Progresión activa',
    ].filter(Boolean) as string[];

    // Datos para el gráfico de severidad
    const radarData = [
        { label: 'Acné', valor: hiperandrogenismo.acne ? (hiperandrogenismo.acne_grado === 'severo' ? 3 : hiperandrogenismo.acne_grado === 'moderado' ? 2 : 1) : 0, max: 3, descripcion: hiperandrogenismo.acne ? formatGrado(hiperandrogenismo.acne_grado) : 'Ausente', referencia: 'Moderado/Severo = relevante', color: 'bg-category-fruits', colorTexto: 'text-category-fruits' },
        { label: 'Hirsutismo (F-G)', valor: hiperandrogenismo.puntaje_ferriman_gallwey ?? 0, max: 20, descripcion: hiperandrogenismo.puntaje_ferriman_gallwey != null ? `${hiperandrogenismo.puntaje_ferriman_gallwey} pts` : 'No evaluado', referencia: '≥ 8 pts = positivo', color: 'bg-brand-orange', colorTexto: 'text-brand-orange' },
        { label: 'Alopecia', valor: hiperandrogenismo.alopecia_androgenica ? 2 : 0, max: 3, descripcion: hiperandrogenismo.alopecia_androgenica ? 'Presente' : 'Ausente', referencia: 'Presente = relevante', color: 'bg-category-dairy', colorTexto: 'text-category-dairy' },
        { label: 'Seborrea', valor: hiperandrogenismo.seborrea ? 1.5 : 0, max: 3, descripcion: hiperandrogenismo.seborrea ? 'Presente' : 'Ausente', referencia: 'Signo menor', color: 'bg-category-grains', colorTexto: 'text-category-grains' },
    ];

    return (
        <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                    <div className={clsx('flex h-8 w-8 items-center justify-center rounded-xl', tieneHA ? 'bg-brand-orange/15' : 'bg-brand-green/15')}>
                        <AlertTriangle size={15} strokeWidth={1.8} className={tieneHA ? 'text-brand-orange' : 'text-brand-green-dark dark:text-brand-green'} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Hiperandrogenismo</h3>
                            <Badge color={tieneHA ? 'orange' : tieneHallazgos ? 'gray' : 'green'}>
                                {tieneHA ? 'Hiperandrogenismo clínico' : tieneHallazgos ? 'Hallazgos leves' : 'Sin signos'}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Boton variante="primary" tamano="xs" onClick={onRegistrar}>
                        <Plus size={12} strokeWidth={1.8} /> Nuevo registro
                    </Boton>
                    <Link
                        href={`/endocrinologo/pacientes/${idPaciente}/hiperandrogenismo/historial`}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[0.03] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.04] dark:hover:text-ink-dark"
                    >
                        <History size={12} strokeWidth={1.8} /> Historial
                    </Link>
                    <button onClick={onEditar} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green-soft dark:text-brand-green dark:hover:bg-brand-green-dark/15">
                        <Edit size={12} strokeWidth={1.8} /> Editar
                    </button>
                </div>
            </div>

            {/* Gráfico de severidad + Datos */}
            <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4">
                {/* Gráfico visual de severidad */}
                <GraficoSeveridad datos={radarData} tieneHA={tieneHA} />

                {/* Datos clínicos */}
                <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">
                        Evaluación clínica
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <DatoItem label="Acné" valor={hiperandrogenismo.acne ? formatGrado(hiperandrogenismo.acne_grado) : 'No'} destacar={acneRelevante} />
                        <DatoItem label="Hirsutismo" valor={hiperandrogenismo.hirsutismo ? (hiperandrogenismo.hirsutismo_zona ?? 'Sí') : 'No'} destacar={hiperandrogenismo.hirsutismo} />
                        <DatoItem label="Ferriman-Gallwey" valor={hiperandrogenismo.puntaje_ferriman_gallwey != null ? `${hiperandrogenismo.puntaje_ferriman_gallwey} pts` : '—'} destacar={ferrimanAlto} />
                        <DatoItem label="Alopecia" valor={hiperandrogenismo.alopecia_androgenica ? 'Presente' : 'No'} destacar={hiperandrogenismo.alopecia_androgenica} />
                        {hiperandrogenismo.inicio_sintomas && <DatoItem label="Inicio" valor={hiperandrogenismo.inicio_sintomas} />}
                        {hiperandrogenismo.progresion_sintomas && <DatoItem label="Progresión" valor={formatProgresion(hiperandrogenismo.progresion_sintomas)} destacar={hiperandrogenismo.progresion_sintomas === 'progresivo'} />}
                    </div>
                </div>
            </div>

            {/* Hallazgos como badges */}
            {hallazgos.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {hallazgos.map((h) => (
                        <Badge key={h} color={h.includes('Ferriman') || h.includes('Progresión') ? 'red' : 'orange'}>{h}</Badge>
                    ))}
                </div>
            )}

            {/* Interpretación */}
            <p className={clsx('text-[12px] font-medium', tieneHA ? 'text-brand-orange' : 'text-ink-muted dark:text-ink-muted-dark')}>
                {tieneHA ? 'Datos compatibles con hiperandrogenismo clínico.' : 'Sin signos clínicos relevantes registrados.'}
            </p>

            {/* Observaciones */}
            {hiperandrogenismo.observaciones && (
                <div className="rounded-xl border border-surface-border px-4 py-3 dark:border-surface-border-dark">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">Observaciones</p>
                    <p className="text-[12.5px] text-ink dark:text-ink-dark leading-relaxed">{hiperandrogenismo.observaciones}</p>
                </div>
            )}
        </div>
    );
}

function DatoItem({ label, valor, destacar }: { label: string; valor?: string | null; destacar?: boolean }) {
    return (
        <div className="rounded-lg bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03]">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">{label}</p>
            <p className={clsx('text-[12.5px] font-bold', destacar ? 'text-brand-orange' : 'text-ink dark:text-ink-dark')}>{valor ?? '—'}</p>
        </div>
    );
}

function formatGrado(grado: string): string {
    const map: Record<string, string> = { no_aplica: 'No aplica', leve: 'Leve', moderado: 'Moderado', severo: 'Severo' };
    return map[grado] ?? grado;
}

function formatProgresion(progresion: string): string {
    const map: Record<string, string> = { estable: 'Estable', progresivo: 'Progresivo', regresivo: 'Regresivo' };
    return map[progresion] ?? progresion;
}
