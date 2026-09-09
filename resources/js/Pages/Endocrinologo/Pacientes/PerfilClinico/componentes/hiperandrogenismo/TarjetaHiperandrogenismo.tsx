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

    const criteriosPrincipales = [
        acneRelevante,
        hiperandrogenismo.hirsutismo || ferrimanAlto,
        hiperandrogenismo.alopecia_androgenica,
    ].filter(Boolean).length;
    const criterioDeterminante = ferrimanAlto
        ? `Ferriman–Gallwey de ${hiperandrogenismo.puntaje_ferriman_gallwey}, por encima del umbral clínico de 8.`
        : hiperandrogenismo.hirsutismo
            ? 'Hirsutismo clínico presente; falta completar la escala Ferriman–Gallwey.'
            : acneRelevante
                ? `Acné ${formatGrado(hiperandrogenismo.acne_grado).toLowerCase()}, considerado clínicamente relevante.`
                : hiperandrogenismo.alopecia_androgenica
                    ? 'Alopecia androgénica presente como manifestación clínica relevante.'
                    : null;

    // Datos para el gráfico de severidad
    const radarData = [
        { label: 'Acné', valor: hiperandrogenismo.acne ? (hiperandrogenismo.acne_grado === 'severo' ? 3 : hiperandrogenismo.acne_grado === 'moderado' ? 2 : 1) : 0, max: 3, tipo: 'escala' as const, descripcion: hiperandrogenismo.acne ? formatGrado(hiperandrogenismo.acne_grado) : 'Ausente', referencia: 'Moderado/Severo = relevante', color: 'bg-category-fruits', colorTexto: 'text-category-fruits' },
        { label: 'Hirsutismo (F-G)', valor: hiperandrogenismo.puntaje_ferriman_gallwey ?? (hiperandrogenismo.hirsutismo ? 1 : 0), max: hiperandrogenismo.puntaje_ferriman_gallwey != null ? 36 : 1, tipo: hiperandrogenismo.puntaje_ferriman_gallwey != null ? 'escala' as const : 'binario' as const, descripcion: hiperandrogenismo.puntaje_ferriman_gallwey != null ? `${hiperandrogenismo.puntaje_ferriman_gallwey} pts` : hiperandrogenismo.hirsutismo ? 'Presente · sin puntaje' : 'No evaluado', referencia: hiperandrogenismo.puntaje_ferriman_gallwey != null ? '≥ 8 pts = positivo' : 'Conviene completar la escala F-G', color: 'bg-brand-orange', colorTexto: 'text-brand-orange' },
        { label: 'Alopecia', valor: hiperandrogenismo.alopecia_androgenica ? 1 : 0, max: 1, tipo: 'binario' as const, descripcion: hiperandrogenismo.alopecia_androgenica ? 'Presente' : 'Ausente', referencia: 'Presente = relevante', color: 'bg-category-dairy', colorTexto: 'text-category-dairy' },
        { label: 'Seborrea', valor: hiperandrogenismo.seborrea ? 1 : 0, max: 1, tipo: 'binario' as const, descripcion: hiperandrogenismo.seborrea ? 'Presente' : 'Ausente', referencia: 'Signo menor', color: 'bg-category-grains', colorTexto: 'text-category-grains' },
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
                <div className="flex min-h-full flex-col">
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

                    {/* Interpretación: ocupa el espacio restante junto al gráfico */}
                    <div className={clsx('mt-3 flex-1 rounded-xl border px-4 py-3', tieneHA ? 'border-brand-orange/25 bg-brand-orange/[0.06]' : 'border-brand-green/20 bg-brand-green/[0.05]')}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Interpretación clínica</p>
                            {tieneHA && <span className="rounded-full bg-brand-orange/15 px-2 py-1 text-[9.5px] font-bold text-brand-orange">{criteriosPrincipales} criterio(s) principal(es)</span>}
                        </div>
                        <p className={clsx('mt-1 text-[12.5px] font-bold', tieneHA ? 'text-brand-orange' : 'text-brand-green-dark dark:text-brand-green')}>
                            {tieneHA ? 'Compatible con hiperandrogenismo clínico' : 'Sin evidencia clínica relevante'}
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">
                            {criterioDeterminante ?? 'Los signos registrados no alcanzan actualmente criterios clínicos de relevancia.'}
                            {hiperandrogenismo.seborrea && ' La seborrea se considera un signo complementario, no determinante por sí solo.'}
                        </p>
                    </div>
                </div>
            </div>

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
