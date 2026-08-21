import clsx from 'clsx';
import { CalendarDays, CheckCircle2, CircleMinus, ClipboardCheck, HeartPulse, ShieldAlert, Stethoscope } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import type { DiagnosticoPmosData } from '../../tipos';

interface Props { diagnostico: DiagnosticoPmosData; }

export function PanelConfirmacionPmos({ diagnostico }: Props) {
    const criterios = Math.max(0, Math.min(3, diagnostico.total_criterios_rotterdam ?? 0));
    const porcentaje = Math.round((criterios / 3) * 100);
    const fenotipo = etiqueta(diagnostico.fenotipo_pmos, 'No aplica');
    const severidad = etiqueta(diagnostico.severidad_clinica, 'No clasificada');
    const riesgo = etiqueta(diagnostico.riesgo_metabolico, 'No evaluado');

    return (
        <section className="space-y-4">

            {/* ── Header ── */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green">
                        <Stethoscope size={18} strokeWidth={1.8} />
                    </div>
                    <div>
                        <p className="text-[9.5px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Valoración endocrinológica</p>
                        <h4 className="text-[14px] font-bold text-ink dark:text-ink-dark">Diagnóstico clínico PMOS</h4>
                    </div>
                </div>
                <Badge color={diagnostico.diagnostico_confirmado ? 'red' : 'gray'}>
                    <ClipboardCheck size={11} strokeWidth={2} />
                    {diagnostico.diagnostico_confirmado ? 'Diagnóstico confirmado' : 'No confirmado'}
                </Badge>
            </div>

            {/* ── Resumen: Anillo + Indicadores ── */}
            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4">

                {/* Anillo de criterios */}
                <div className="flex flex-col items-center justify-center rounded-xl border border-surface-border bg-black/[0.02] p-4 dark:border-surface-border-dark dark:bg-white/[0.03]">
                    <div
                        className="relative grid h-20 w-20 place-items-center rounded-full"
                        style={{ background: `conic-gradient(#4CAF50 ${porcentaje}%, transparent 0)` }}
                    >
                        <div className="grid h-[58px] w-[58px] place-items-center rounded-full bg-surface-card dark:bg-surface-card-dark">
                            <div className="text-center">
                                <strong className="text-[20px] font-bold text-brand-green-dark dark:text-brand-green">{criterios}</strong>
                                <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">/3</span>
                            </div>
                        </div>
                    </div>
                    <p className="mt-2 text-[10.5px] font-bold text-ink dark:text-ink-dark">Criterios de Rotterdam</p>
                    <p className="text-[9px] text-ink-muted dark:text-ink-muted-dark">{porcentaje}% de criterios presentes</p>
                </div>

                {/* Indicadores + escalas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <DatoItem icono={<HeartPulse size={13} strokeWidth={1.8} />} label="Fenotipo clínico" valor={fenotipo} color="text-brand-green-dark dark:text-brand-green" />
                    <DatoItem icono={<CalendarDays size={13} strokeWidth={1.8} />} label="Fecha de valoración" valor={formatearFecha(diagnostico.fecha_diagnostico)} color="text-ink-muted dark:text-ink-muted-dark" />
                    <Escala titulo="Severidad clínica" valor={diagnostico.severidad_clinica} opciones={['leve', 'moderada', 'severa']} />
                    <Escala titulo="Riesgo metabólico" valor={diagnostico.riesgo_metabolico} opciones={['bajo', 'moderado', 'alto']} />
                </div>
            </div>

            {/* ── Fundamento de la decisión ── */}
            <div>
                <p className="text-[11px] font-bold text-ink dark:text-ink-dark mb-1">Fundamento de la decisión</p>
                <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark mb-3">
                    El diagnóstico se sustenta en al menos 2 de 3 criterios de Rotterdam y el descarte de otras causas.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Evidencia cumple={diagnostico.cumple_alteracion_ovulatoria} titulo="1. Alteración ovulatoria" detalle={diagnostico.cumple_alteracion_ovulatoria ? 'Ciclos irregulares, oligomenorrea, amenorrea o evidencia de anovulación.' : 'No se documentó alteración ovulatoria.'} />
                    <Evidencia cumple={diagnostico.cumple_hiperandrogenismo} titulo="2. Hiperandrogenismo" detalle={detalleHiperandrogenismo(diagnostico)} />
                    <Evidencia cumple={diagnostico.cumple_morfologia_ovarica} titulo="3. Morfología ovárica" detalle={diagnostico.cumple_morfologia_ovarica ? 'Hallazgos ecográficos compatibles con morfología poliquística.' : 'La ecografía no aporta este criterio.'} />
                    <Evidencia cumple={diagnostico.diagnosticos_diferenciales_descartados} titulo="Descarte diferencial" detalle={diagnostico.diagnosticos_diferenciales_descartados ? 'Se registró el descarte de causas endocrinas alternativas.' : 'El descarte diferencial está pendiente o incompleto.'} />
                </div>

                {/* Interpretación */}
                <div className="mt-3 rounded-xl border border-brand-green/20 bg-brand-green/5 px-3.5 py-2.5 dark:bg-brand-green/[0.06]">
                    <p className="text-[11.5px] text-ink dark:text-ink-dark leading-relaxed">
                        <span className="font-bold">Interpretación:</span> {interpretacionPmos(diagnostico, criterios)}
                    </p>
                </div>
            </div>

            {/* ── Conclusión y recomendaciones ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <BloqueTexto icono={<ClipboardCheck size={14} strokeWidth={1.8} />} titulo="Conclusión médica" texto={diagnostico.conclusion_medica} vacio="Sin conclusión médica registrada." />
                <BloqueTexto icono={<ShieldAlert size={14} strokeWidth={1.8} />} titulo="Plan y recomendaciones" texto={diagnostico.recomendaciones_medicas} vacio="Sin recomendaciones registradas." />
            </div>
        </section>
    );
}

/* ── Componentes internos ── */

function DatoItem({ icono, label, valor, color }: { icono: React.ReactNode; label: string; valor: string; color: string }) {
    return (
        <div className="rounded-xl border border-surface-border bg-black/[0.02] px-3 py-2.5 dark:border-surface-border-dark dark:bg-white/[0.03]">
            <div className={clsx('mb-1.5 flex items-center gap-1.5', color)}>
                {icono}
                <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-[12.5px] font-bold capitalize text-ink dark:text-ink-dark">{valor}</p>
        </div>
    );
}

function Escala({ titulo, valor, opciones }: { titulo: string; valor?: string | null; opciones: string[] }) {
    const actual = normalizar(valor);
    const indice = opciones.indexOf(actual);
    return (
        <div className="rounded-xl border border-surface-border bg-black/[0.02] px-3 py-2.5 dark:border-surface-border-dark dark:bg-white/[0.03]">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{titulo}</span>
                <strong className="text-[11px] font-bold capitalize text-ink dark:text-ink-dark">
                    {etiqueta(valor, titulo.includes('Riesgo') ? 'No evaluado' : 'No clasificada')}
                </strong>
            </div>
            <div className="grid grid-cols-3 gap-1">
                {opciones.map((opcion, i) => (
                    <div key={opcion}>
                        <div className={clsx('h-1.5 rounded-full', indice >= i ? colorEscala(i) : 'bg-black/[0.06] dark:bg-white/[0.06]')} />
                        <p className="mt-1 text-center text-[8px] capitalize text-ink-muted dark:text-ink-muted-dark">{opcion}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Evidencia({ cumple, titulo, detalle }: { cumple: boolean; titulo: string; detalle: string }) {
    return (
        <div className={clsx(
            'rounded-xl border px-3 py-2.5',
            cumple
                ? 'border-brand-green/25 bg-brand-green/5 dark:bg-brand-green/[0.06]'
                : 'border-surface-border bg-black/[0.015] dark:border-surface-border-dark dark:bg-white/[0.02]'
        )}>
            <div className="mb-1 flex items-center gap-2">
                {cumple
                    ? <CheckCircle2 size={13} strokeWidth={1.8} className="shrink-0 text-brand-green-dark dark:text-brand-green" />
                    : <CircleMinus size={13} strokeWidth={1.8} className="shrink-0 text-ink-muted/40 dark:text-ink-muted-dark/40" />
                }
                <h6 className="text-[11px] font-bold text-ink dark:text-ink-dark">{titulo}</h6>
            </div>
            <p className="text-[10px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">{detalle}</p>
            <span className={clsx(
                'mt-1.5 inline-block rounded-lg px-2 py-0.5 text-[9px] font-semibold',
                cumple
                    ? 'bg-brand-green/15 text-brand-green-dark dark:text-brand-green'
                    : 'bg-black/[0.04] text-ink-muted dark:bg-white/[0.04] dark:text-ink-muted-dark'
            )}>
                {cumple ? 'Criterio presente' : 'Criterio ausente'}
            </span>
        </div>
    );
}

function BloqueTexto({ icono, titulo, texto, vacio }: { icono: React.ReactNode; titulo: string; texto?: string | null; vacio: string }) {
    return (
        <div className="rounded-xl border border-surface-border bg-black/[0.015] px-4 py-3 dark:border-surface-border-dark dark:bg-white/[0.02]">
            <div className="mb-1.5 flex items-center gap-2 text-brand-green-dark dark:text-brand-green">
                {icono}
                <h5 className="text-[10px] font-semibold uppercase tracking-wider">{titulo}</h5>
            </div>
            <p className={clsx('text-[12px] leading-relaxed whitespace-pre-line', texto ? 'text-ink dark:text-ink-dark' : 'italic text-ink-muted dark:text-ink-muted-dark')}>
                {texto || vacio}
            </p>
        </div>
    );
}

/* ── Utilidades ── */
function detalleHiperandrogenismo(d: DiagnosticoPmosData) {
    if (!d.cumple_hiperandrogenismo) return 'No se documentó hiperandrogenismo clínico ni bioquímico.';
    if (d.cumple_hiperandrogenismo_clinico && d.cumple_hiperandrogenismo_bioquimico) return 'Existe evidencia clínica y bioquímica de hiperandrogenismo.';
    return d.cumple_hiperandrogenismo_clinico ? 'Existe evidencia clínica de hiperandrogenismo.' : 'Existe evidencia bioquímica de hiperandrogenismo.';
}

function interpretacionPmos(d: DiagnosticoPmosData, total: number) {
    if (total >= 2 && d.diagnosticos_diferenciales_descartados)
        return `Se cumplen ${total} criterios de Rotterdam y se descartaron diagnósticos alternativos; el patrón corresponde al fenotipo ${etiqueta(d.fenotipo_pmos, 'no clasificado')}.`;
    if (total >= 2)
        return `Se cumplen ${total} criterios de Rotterdam, pero el diagnóstico permanece en estudio hasta completar el descarte diferencial.`;
    return `Solo se cumplen ${total} criterios de Rotterdam; no se alcanza el mínimo diagnóstico de 2 criterios.`;
}

function colorEscala(indice: number) {
    return ['bg-brand-green', 'bg-brand-orange', 'bg-category-fruits'][indice];
}

function normalizar(valor?: string | null) {
    return (valor ?? '').toLowerCase().replace(/_/g, ' ');
}

function etiqueta(valor?: string | null, vacio = 'No registrado') {
    const limpio = normalizar(valor);
    return limpio ? limpio.charAt(0).toUpperCase() + limpio.slice(1) : vacio;
}

function formatearFecha(fecha: string) {
    const valor = new Date(`${fecha}T00:00:00`);
    return Number.isNaN(valor.getTime())
        ? fecha
        : valor.toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' });
}
