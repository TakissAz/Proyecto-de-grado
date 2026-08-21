import clsx from 'clsx';
import { Activity, CalendarDays, ChartNoAxesCombined, CheckCircle2, CircleMinus, ClipboardCheck, Droplets, Gauge, ShieldAlert } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import type { DiagnosticoRiData } from '../../tipos';

interface Props { diagnostico: DiagnosticoRiData; }

export function PanelConfirmacionRi({ diagnostico }: Props) {
    return (
        <section className="space-y-4">

            {/* ── Header ── */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange/15">
                        <Activity size={18} strokeWidth={1.8} className="text-brand-orange" />
                    </div>
                    <div>
                        <p className="text-[9.5px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Valoración metabólica</p>
                        <h4 className="text-[14px] font-bold text-ink dark:text-ink-dark">Diagnóstico de resistencia a la insulina</h4>
                    </div>
                </div>
                <Badge color={diagnostico.resistencia_confirmada ? 'orange' : 'gray'}>
                    <ClipboardCheck size={11} strokeWidth={2} />
                    {diagnostico.resistencia_confirmada ? 'Resistencia confirmada' : 'No confirmada'}
                </Badge>
            </div>

            {/* ── Métricas principales ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                <Metrica icono={<Gauge size={13} strokeWidth={1.8} />} titulo="HOMA-IR" valor={numero(diagnostico.homa_ir)} destacar={valor(diagnostico.homa_ir) >= 2.5} />
                <Metrica icono={<ChartNoAxesCombined size={13} strokeWidth={1.8} />} titulo="QUICKI" valor={numero(diagnostico.quicki)} />
                <Metrica icono={<Droplets size={13} strokeWidth={1.8} />} titulo="Glucosa" valor={numero(diagnostico.glucosa_ayunas)} unidad="mg/dL" destacar={valor(diagnostico.glucosa_ayunas) >= 100} />
                <Metrica icono={<Activity size={13} strokeWidth={1.8} />} titulo="Insulina" valor={numero(diagnostico.insulina_ayunas)} unidad="µU/mL" />
                <Metrica icono={<Droplets size={13} strokeWidth={1.8} />} titulo="Triglicéridos" valor={numero(diagnostico.trigliceridos)} unidad="mg/dL" destacar={valor(diagnostico.trigliceridos) >= 150} />
                <Metrica icono={<ShieldAlert size={13} strokeWidth={1.8} />} titulo="HDL" valor={numero(diagnostico.hdl)} unidad="mg/dL" destacar={diagnostico.hdl != null && valor(diagnostico.hdl) < 50} />
            </div>

            {/* ── Escalas + Fecha ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Escala titulo="Grado de resistencia" valor={diagnostico.grado_resistencia} opciones={['leve', 'moderada', 'severa']} />
                <Escala titulo="Riesgo de diabetes" valor={diagnostico.riesgo_diabetes} opciones={['bajo', 'moderado', 'alto']} />
                <Escala titulo="Riesgo cardiometabólico" valor={diagnostico.riesgo_cardiometabolico} opciones={['bajo', 'moderado', 'alto']} />
                <DatoItem icono={<CalendarDays size={13} strokeWidth={1.8} />} label="Fecha de valoración" valor={formatearFecha(diagnostico.fecha_diagnostico)} />
            </div>

            {/* ── Fundamento de la decisión ── */}
            <div>
                <p className="text-[11px] font-bold text-ink dark:text-ink-dark mb-1">Fundamento de la decisión</p>
                <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark mb-3">
                    Comparación de resultados con puntos de corte del análisis metabólico.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <EvidenciaRi titulo="HOMA-IR" valor={diagnostico.homa_ir} unidad="" cumple={valor(diagnostico.homa_ir) >= 2.5} referencia="≥ 2.5" detalle={detalleHoma(diagnostico.homa_ir)} />
                    <EvidenciaRi titulo="Control glucémico" valor={diagnostico.glucosa_ayunas} unidad=" mg/dL" cumple={valor(diagnostico.glucosa_ayunas) >= 100 || valor(diagnostico.hemoglobina_glicosilada) >= 5.7} referencia="Glucosa ≥ 100 o HbA1c ≥ 5.7%" detalle={`HbA1c: ${numero(diagnostico.hemoglobina_glicosilada)}%`} />
                    <EvidenciaRi titulo="Triglicéridos" valor={diagnostico.trigliceridos} unidad=" mg/dL" cumple={valor(diagnostico.trigliceridos) >= 150} referencia="≥ 150 mg/dL" detalle="Contribuye al riesgo cardiometabólico." />
                    <EvidenciaRi titulo="HDL" valor={diagnostico.hdl} unidad=" mg/dL" cumple={diagnostico.hdl != null && valor(diagnostico.hdl) < 50} referencia="< 50 mg/dL" detalle="Un valor bajo incrementa el riesgo." />
                </div>

                {/* Interpretación */}
                <div className="mt-3 rounded-xl border border-brand-orange/20 bg-brand-orange/5 px-3.5 py-2.5 dark:bg-brand-orange/[0.06]">
                    <p className="text-[11.5px] text-ink dark:text-ink-dark leading-relaxed">
                        <span className="font-bold">Interpretación:</span> {interpretacionRi(diagnostico)}
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

function Metrica({ icono, titulo, valor, unidad, destacar }: { icono: React.ReactNode; titulo: string; valor: string; unidad?: string; destacar?: boolean }) {
    return (
        <div className="rounded-xl border border-surface-border bg-black/[0.02] px-3 py-2.5 dark:border-surface-border-dark dark:bg-white/[0.03]">
            <div className="mb-1 flex items-center gap-1.5 text-brand-orange">
                {icono}
                <span className="text-[8.5px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{titulo}</span>
            </div>
            <p className={clsx('text-[16px] font-bold leading-tight', destacar ? 'text-brand-orange' : 'text-ink dark:text-ink-dark')}>{valor}</p>
            {unidad && <p className="text-[8.5px] text-ink-muted dark:text-ink-muted-dark">{unidad}</p>}
        </div>
    );
}

function DatoItem({ icono, label, valor }: { icono: React.ReactNode; label: string; valor: string }) {
    return (
        <div className="rounded-xl border border-surface-border bg-black/[0.02] px-3 py-2.5 dark:border-surface-border-dark dark:bg-white/[0.03]">
            <div className="mb-1.5 flex items-center gap-1.5 text-ink-muted dark:text-ink-muted-dark">
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
                <strong className="text-[11px] font-bold capitalize text-ink dark:text-ink-dark">{etiqueta(valor)}</strong>
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

function EvidenciaRi({ titulo, valor: dato, unidad, cumple, referencia, detalle }: {
    titulo: string; valor?: number | string | null; unidad: string; cumple: boolean; referencia: string; detalle: string;
}) {
    const disponible = dato != null && dato !== '';
    return (
        <div className={clsx(
            'rounded-xl border px-3 py-2.5',
            cumple
                ? 'border-brand-orange/25 bg-brand-orange/5 dark:bg-brand-orange/[0.06]'
                : 'border-surface-border bg-black/[0.015] dark:border-surface-border-dark dark:bg-white/[0.02]'
        )}>
            <div className="mb-1 flex items-center gap-2">
                {cumple
                    ? <CheckCircle2 size={13} strokeWidth={1.8} className="shrink-0 text-brand-orange" />
                    : <CircleMinus size={13} strokeWidth={1.8} className="shrink-0 text-ink-muted/40 dark:text-ink-muted-dark/40" />
                }
                <h6 className="text-[11px] font-bold text-ink dark:text-ink-dark">{titulo}</h6>
            </div>
            <p className={clsx('text-[14px] font-bold', cumple ? 'text-brand-orange' : 'text-ink dark:text-ink-dark')}>
                {disponible ? `${dato}${unidad}` : 'N/D'}
            </p>
            <p className="mt-1 text-[9px] font-semibold text-ink-muted dark:text-ink-muted-dark">Ref: {referencia}</p>
            <p className="mt-0.5 text-[10px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">{detalle}</p>
        </div>
    );
}

function BloqueTexto({ icono, titulo, texto, vacio }: { icono: React.ReactNode; titulo: string; texto?: string | null; vacio: string }) {
    return (
        <div className="rounded-xl border border-surface-border bg-black/[0.015] px-4 py-3 dark:border-surface-border-dark dark:bg-white/[0.02]">
            <div className="mb-1.5 flex items-center gap-2 text-brand-orange">
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
function detalleHoma(homa?: number | string | null) {
    const n = valor(homa);
    if (homa == null) return 'Sin valor disponible.';
    if (n >= 5) return 'Grado severo.';
    if (n >= 3) return 'Grado moderado.';
    if (n >= 2.5) return 'Grado leve.';
    return 'Bajo el punto de corte.';
}

function interpretacionRi(d: DiagnosticoRiData) {
    const homa = valor(d.homa_ir);
    const tgAlto = valor(d.trigliceridos) >= 150;
    const hdlBajo = d.hdl != null && valor(d.hdl) < 50;
    const partes = [
        homa >= 2.5
            ? `HOMA-IR ${numero(d.homa_ir)} confirma resistencia de grado ${etiqueta(d.grado_resistencia).toLowerCase()}`
            : 'HOMA-IR no confirma resistencia',
    ];
    if (tgAlto && hdlBajo) partes.push('triglicéridos elevados y HDL bajo sustentan riesgo cardiometabólico alto');
    else if (tgAlto || hdlBajo) partes.push('una alteración lipídica sustenta riesgo cardiometabólico moderado');
    return `${partes.join('; ')}.`;
}

function colorEscala(indice: number) {
    return ['bg-brand-green', 'bg-brand-orange', 'bg-category-fruits'][indice];
}

function valor(dato?: number | string | null) {
    const n = Number(dato);
    return Number.isFinite(n) ? n : 0;
}

function numero(v?: number | string | null) {
    return v == null || v === '' ? 'N/D' : String(v);
}

function normalizar(valor?: string | null) {
    return (valor ?? '').toLowerCase().replace(/_/g, ' ');
}

function etiqueta(valor?: string | null) {
    const limpio = normalizar(valor);
    return limpio ? limpio.charAt(0).toUpperCase() + limpio.slice(1) : 'No evaluado';
}

function formatearFecha(fecha: string) {
    const v = new Date(`${fecha}T00:00:00`);
    return Number.isNaN(v.getTime()) ? fecha : v.toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' });
}
