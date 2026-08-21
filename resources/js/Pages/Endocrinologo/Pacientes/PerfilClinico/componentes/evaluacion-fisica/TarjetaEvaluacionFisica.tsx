import clsx from 'clsx';
import { Link } from '@inertiajs/react';
import { Activity, Edit, Plus, History, Calendar, Scale, Eye } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Boton } from '@/Components/ui/boton';
import GraficoIMC from './GraficoIMC';
import type { EvaluacionFisicaData } from '../../tipos';

interface Props {
    evaluacion: EvaluacionFisicaData | null;
    idPaciente: number;
    onRegistrar: () => void;
    onEditar: () => void;
}

function parsearObservaciones(obs: string | null | undefined): { otrosHallazgos: string[]; textoLibre: string } {
    if (!obs) return { otrosHallazgos: [], textoLibre: '' };
    const bloqueRegex = /\[Otros hallazgos\]\n((?:• .+\n?)*)/;
    const match = obs.match(bloqueRegex);
    if (!match) return { otrosHallazgos: [], textoLibre: obs.trim() };
    const otrosHallazgos = match[1].split('\n').map(l => l.replace(/^• /, '').trim()).filter(Boolean);
    const textoLibre = obs.replace(bloqueRegex, '').trim();
    return { otrosHallazgos, textoLibre };
}

function DatoItem({ label, valor, destacar, subtexto }: {
    label: string; valor?: string | null; destacar?: boolean; subtexto?: string;
}) {
    return (
        <div className="rounded-xl border border-surface-border bg-black/[0.02] px-3 py-2.5 dark:border-surface-border-dark dark:bg-white/[0.03]">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">{label}</p>
            <p className={clsx('text-[13px] font-bold', destacar ? 'text-brand-orange' : 'text-ink dark:text-ink-dark')}>
                {valor ?? '—'}
            </p>
            {subtexto && (
                <p className={clsx('text-[9.5px] mt-0.5', destacar ? 'text-brand-orange/70' : 'text-ink-muted dark:text-ink-muted-dark')}>
                    {subtexto}
                </p>
            )}
        </div>
    );
}

export default function TarjetaEvaluacionFisica({ evaluacion, idPaciente, onRegistrar, onEditar }: Props) {

    /* ── Estado vacío ── */
    if (!evaluacion) {
        return (
            <div className="p-5">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-green/10">
                        <Activity size={15} strokeWidth={1.8} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-semibold text-ink dark:text-ink-dark">Evaluación física endocrina</h3>
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Pendiente de registro</p>
                    </div>
                </div>
                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark mb-4 leading-relaxed">
                    No se ha registrado la evaluación física. Estos datos son necesarios para evaluar el riesgo metabólico.
                </p>
                <Boton variante="primary" tamano="sm" onClick={onRegistrar}>
                    <Plus size={13} strokeWidth={1.8} /> Registrar evaluación física
                </Boton>
            </div>
        );
    }

    /* ── Alertas metabólicas ── */
    const alertas: string[] = [];
    if (evaluacion.imc != null && evaluacion.imc >= 30) alertas.push('Obesidad');
    else if (evaluacion.imc != null && evaluacion.imc >= 25) alertas.push('Sobrepeso');
    if (evaluacion.circunferencia_cintura != null && evaluacion.circunferencia_cintura >= 80) alertas.push('Cintura ≥ 80 cm');
    if (evaluacion.presion_sistolica != null && evaluacion.presion_sistolica >= 130) alertas.push('PA elevada');
    if (evaluacion.indice_cintura_cadera != null && evaluacion.indice_cintura_cadera >= 0.85) alertas.push('ICC elevado');

    /* ── Hallazgos fijos ── */
    const hallazgosFijos = [
        evaluacion.acantosis_nigricans && 'Acantosis nigricans',
        evaluacion.skin_tags && 'Acrocordones',
        evaluacion.hirsutismo_visible && (
            evaluacion.puntaje_ferriman_gallwey != null
                ? `Hirsutismo (F-G: ${evaluacion.puntaje_ferriman_gallwey})`
                : 'Hirsutismo visible'
        ),
        evaluacion.acne_visible && 'Acné visible',
        evaluacion.alopecia_visible && 'Alopecia visible',
        evaluacion.galactorrea && 'Galactorrea',
    ].filter(Boolean) as string[];

    const { otrosHallazgos, textoLibre } = parsearObservaciones(evaluacion.observaciones);
    const todosHallazgos = [...hallazgosFijos, ...otrosHallazgos];
    const tieneHallazgos = alertas.length > 0 || todosHallazgos.length > 0;

    return (
        <div className="p-5 space-y-4">

            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                    <div className={clsx('flex h-8 w-8 items-center justify-center rounded-xl',
                        tieneHallazgos ? 'bg-brand-orange/15' : 'bg-brand-green/15')}>
                        <Activity size={15} strokeWidth={1.8}
                            className={tieneHallazgos ? 'text-brand-orange' : 'text-brand-green-dark dark:text-brand-green'} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Evaluación física</h3>
                            <Badge color={tieneHallazgos ? 'orange' : 'green'}>
                                {tieneHallazgos ? 'Hallazgos relevantes' : 'Sin hallazgos'}
                            </Badge>
                        </div>
                        {evaluacion.created_at && (
                            <p className="flex items-center gap-1 text-[10.5px] text-ink-muted dark:text-ink-muted-dark mt-0.5">
                                <Calendar size={10} strokeWidth={1.8} />
                                Registrado el {evaluacion.created_at}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Boton variante="primary" tamano="xs" onClick={onRegistrar}>
                        <Plus size={12} strokeWidth={1.8} /> Nuevo registro
                    </Boton>
                    <Link href={`/endocrinologo/pacientes/${idPaciente}/evaluacion-fisica/historial`}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[0.03] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.04] dark:hover:text-ink-dark">
                        <History size={12} strokeWidth={1.8} /> Historial
                    </Link>
                    <button onClick={onEditar}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green-soft dark:text-brand-green dark:hover:bg-brand-green-dark/15">
                        <Edit size={12} strokeWidth={1.8} /> Editar
                    </button>
                </div>
            </div>

            {/* ── Gráfico IMC + Datos clínicos ── */}
            <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4">

                {/* Gráfico IMC (solo si hay) */}
                {evaluacion.imc != null && (
                    <GraficoIMC imc={evaluacion.imc} />
                )}

                {/* Datos clínicos */}
                <div className={clsx(!evaluacion.imc && 'sm:col-span-2')}>
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">
                        <Scale size={10} strokeWidth={2} className="text-brand-green-dark dark:text-brand-green" />
                        Evaluación clínica
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <DatoItem label="Peso" valor={evaluacion.peso != null ? `${evaluacion.peso} kg` : null} />
                        <DatoItem label="Talla" valor={evaluacion.talla != null ? `${evaluacion.talla} m` : null} />
                        <DatoItem label="IMC" valor={evaluacion.imc != null ? `${evaluacion.imc}` : null}
                            destacar={evaluacion.imc != null && evaluacion.imc >= 25}
                            subtexto={evaluacion.imc != null ? (evaluacion.imc < 18.5 ? 'Bajo peso' : evaluacion.imc < 25 ? 'Normal' : evaluacion.imc < 30 ? 'Sobrepeso' : 'Obesidad') : undefined} />
                        <DatoItem label="Cintura" valor={evaluacion.circunferencia_cintura != null ? `${evaluacion.circunferencia_cintura} cm` : null}
                            destacar={evaluacion.circunferencia_cintura != null && evaluacion.circunferencia_cintura >= 80}
                            subtexto={evaluacion.circunferencia_cintura != null && evaluacion.circunferencia_cintura >= 80 ? 'Riesgo ≥ 80 cm' : undefined} />
                        <DatoItem label="Cadera" valor={evaluacion.circunferencia_cadera != null ? `${evaluacion.circunferencia_cadera} cm` : null} />
                        <DatoItem label="ICC" valor={evaluacion.indice_cintura_cadera != null ? `${evaluacion.indice_cintura_cadera}` : null}
                            destacar={evaluacion.indice_cintura_cadera != null && evaluacion.indice_cintura_cadera >= 0.85}
                            subtexto={evaluacion.indice_cintura_cadera != null && evaluacion.indice_cintura_cadera >= 0.85 ? 'Elevado ≥ 0.85' : undefined} />
                        {(evaluacion.presion_sistolica || evaluacion.presion_diastolica) && (
                            <>
                                <DatoItem label="PA sistólica" valor={evaluacion.presion_sistolica != null ? `${evaluacion.presion_sistolica} mmHg` : null}
                                    destacar={evaluacion.presion_sistolica != null && evaluacion.presion_sistolica >= 130}
                                    subtexto={evaluacion.presion_sistolica != null && evaluacion.presion_sistolica >= 130 ? 'Elevada' : undefined} />
                                <DatoItem label="PA diastólica" valor={evaluacion.presion_diastolica != null ? `${evaluacion.presion_diastolica} mmHg` : null}
                                    destacar={evaluacion.presion_diastolica != null && evaluacion.presion_diastolica >= 85}
                                    subtexto={evaluacion.presion_diastolica != null && evaluacion.presion_diastolica >= 85 ? 'Elevada' : undefined} />
                            </>
                        )}
                        {evaluacion.puntaje_ferriman_gallwey != null && (
                            <DatoItem label="Ferriman-Gallwey" valor={`${evaluacion.puntaje_ferriman_gallwey} pts`}
                                destacar={evaluacion.puntaje_ferriman_gallwey >= 8}
                                subtexto={evaluacion.puntaje_ferriman_gallwey >= 8 ? '≥ 8 = positivo' : 'Normal'} />
                        )}
                    </div>
                </div>
            </div>

            {/* ── Hallazgos al examen físico ── */}
            {todosHallazgos.length > 0 && (
                <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">
                        <Eye size={10} strokeWidth={2} className="text-brand-orange" />
                        Hallazgos al examen físico
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {hallazgosFijos.map(h => <Badge key={h} color="orange">{h}</Badge>)}
                        {otrosHallazgos.map((h, i) => <Badge key={`otro-${i}`} color="gray">{h}</Badge>)}
                    </div>
                </div>
            )}

            {/* ── Alertas metabólicas ── */}
            {alertas.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {alertas.map(a => <Badge key={a} color="red">{a}</Badge>)}
                </div>
            )}

            {/* ── Interpretación ── */}
            <p className={clsx('text-[12px] font-medium',
                tieneHallazgos ? 'text-brand-orange' : 'text-ink-muted dark:text-ink-muted-dark')}>
                {tieneHallazgos
                    ? 'Existen hallazgos físicos relevantes para el riesgo metabólico.'
                    : 'Sin hallazgos físicos relevantes registrados.'}
            </p>

            {/* ── Observaciones ── */}
            {textoLibre && (
                <div className="rounded-xl border border-surface-border px-4 py-3 dark:border-surface-border-dark">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">Observaciones</p>
                    <p className="text-[12.5px] text-ink dark:text-ink-dark leading-relaxed">{textoLibre}</p>
                </div>
            )}
        </div>
    );
}
