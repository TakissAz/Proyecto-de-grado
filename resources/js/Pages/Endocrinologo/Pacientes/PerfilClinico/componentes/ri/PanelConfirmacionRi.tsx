import { Activity, CalendarDays, ChartNoAxesCombined, CheckCircle2, CircleMinus, ClipboardCheck, Droplets, Gauge, ShieldAlert } from 'lucide-react';
import type { DiagnosticoRiData } from '../../tipos';

interface Props { diagnostico: DiagnosticoRiData; }

export function PanelConfirmacionRi({ diagnostico }: Props) {
    return <section className="overflow-hidden rounded-2xl border border-secondary/20 bg-gradient-to-br from-base-100 via-base-100 to-secondary/5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-300/70 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/10 text-secondary"><Activity size={20} /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-secondary/70">Valoración metabólica</p><h4 className="text-base font-bold">Diagnóstico de resistencia a la insulina</h4></div></div>
            <span className={`badge gap-1.5 ${diagnostico.resistencia_confirmada ? 'badge-warning' : 'badge-ghost'}`}><ClipboardCheck size={12} />{diagnostico.resistencia_confirmada ? 'Resistencia confirmada' : 'No confirmada'}</span>
        </div>

        <div className="p-4 sm:p-5">
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                <Metrica icono={<Gauge size={15} />} titulo="HOMA-IR" valor={numero(diagnostico.homa_ir)} />
                <Metrica icono={<ChartNoAxesCombined size={15} />} titulo="QUICKI" valor={numero(diagnostico.quicki)} />
                <Metrica icono={<Droplets size={15} />} titulo="Glucosa" valor={numero(diagnostico.glucosa_ayunas)} unidad="mg/dL" />
                <Metrica icono={<Activity size={15} />} titulo="Insulina" valor={numero(diagnostico.insulina_ayunas)} unidad="µU/mL" />
                <Metrica icono={<Droplets size={15} />} titulo="Triglicéridos" valor={numero(diagnostico.trigliceridos)} unidad="mg/dL" />
                <Metrica icono={<ShieldAlert size={15} />} titulo="HDL" valor={numero(diagnostico.hdl)} unidad="mg/dL" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Escala titulo="Grado de resistencia" valor={diagnostico.grado_resistencia} opciones={['leve', 'moderada', 'severa']} />
                <Escala titulo="Riesgo de diabetes" valor={diagnostico.riesgo_diabetes} opciones={['bajo', 'moderado', 'alto']} />
                <Escala titulo="Riesgo cardiometabólico" valor={diagnostico.riesgo_cardiometabolico} opciones={['bajo', 'moderado', 'alto']} />
                <div className="rounded-xl border border-base-300 bg-base-100 p-3"><div className="mb-3 flex items-center gap-2 text-base-content/50"><CalendarDays size={15} /><span className="text-[10px] font-bold uppercase tracking-wider">Fecha de valoración</span></div><p className="text-sm font-bold capitalize">{formatearFecha(diagnostico.fecha_diagnostico)}</p></div>
            </div>
        </div>

        <div className="border-t border-base-300/70 px-4 py-4 sm:px-5">
            <div className="mb-3"><p className="text-xs font-bold uppercase tracking-[0.12em] text-base-content/70">Fundamento de la decisión</p><p className="mt-0.5 text-[11px] text-base-content/50">Comparación transparente de los resultados con los puntos de corte utilizados por el análisis metabólico.</p></div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <EvidenciaRi titulo="HOMA-IR" valor={diagnostico.homa_ir} unidad="" cumple={valor(diagnostico.homa_ir) >= 2.5} referencia="Resistencia confirmada ≥ 2.5" detalle={detalleHoma(diagnostico.homa_ir)} />
                <EvidenciaRi titulo="Control glucémico" valor={diagnostico.glucosa_ayunas} unidad=" mg/dL" cumple={valor(diagnostico.glucosa_ayunas) >= 100 || valor(diagnostico.hemoglobina_glicosilada) >= 5.7} referencia="Glucosa ≥ 100 o HbA1c ≥ 5.7%" detalle={`HbA1c: ${numero(diagnostico.hemoglobina_glicosilada)}%`} />
                <EvidenciaRi titulo="Triglicéridos" valor={diagnostico.trigliceridos} unidad=" mg/dL" cumple={valor(diagnostico.trigliceridos) >= 150} referencia="Elevados ≥ 150 mg/dL" detalle="Contribuye al riesgo cardiometabólico." />
                <EvidenciaRi titulo="Colesterol HDL" valor={diagnostico.hdl} unidad=" mg/dL" cumple={diagnostico.hdl != null && valor(diagnostico.hdl) < 50} referencia="Bajo < 50 mg/dL" detalle="Un valor bajo incrementa el riesgo cardiometabólico." />
            </div>
            <div className="mt-3 rounded-xl border border-secondary/15 bg-secondary/5 px-3 py-2.5 text-xs text-base-content/75"><b>Interpretación:</b> {interpretacionRi(diagnostico)}</div>
        </div>

        <div className="grid gap-3 border-t border-base-300/70 bg-base-200/25 p-4 sm:grid-cols-2 sm:p-5">
            <BloqueTexto icono={<ClipboardCheck size={17} />} titulo="Conclusión médica" texto={diagnostico.conclusion_medica} vacio="Sin conclusión médica registrada." />
            <BloqueTexto icono={<ShieldAlert size={17} />} titulo="Plan y recomendaciones" texto={diagnostico.recomendaciones_medicas} vacio="Sin recomendaciones registradas." />
        </div>
    </section>;
}

function Metrica({ icono, titulo, valor, unidad }: { icono: React.ReactNode; titulo: string; valor: string; unidad?: string }) {
    return <div className="rounded-xl border border-base-300 bg-base-100 p-3"><div className="mb-1 flex items-center gap-1.5 text-secondary">{icono}<span className="text-[9px] font-bold uppercase tracking-wide">{titulo}</span></div><p className="text-lg font-black leading-tight">{valor}</p>{unidad && <p className="text-[9px] text-base-content/40">{unidad}</p>}</div>;
}

function Escala({ titulo, valor, opciones }: { titulo: string; valor?: string | null; opciones: string[] }) {
    const actual = normalizar(valor); const indice = opciones.indexOf(actual);
    return <div className="rounded-xl border border-base-300 bg-base-100 p-3"><div className="mb-2 flex min-h-8 items-start justify-between gap-2"><span className="text-[9px] font-bold uppercase tracking-wider text-base-content/50">{titulo}</span><strong className="text-xs capitalize">{etiqueta(valor)}</strong></div><div className="grid grid-cols-3 gap-1">{opciones.map((opcion, i) => <div key={opcion}><div className={`h-2 rounded-full ${indice >= i ? ['bg-success', 'bg-warning', 'bg-error'][i] : 'bg-base-300'}`} /><p className="mt-1 text-center text-[8px] capitalize text-base-content/45">{opcion}</p></div>)}</div></div>;
}

function BloqueTexto({ icono, titulo, texto, vacio }: { icono: React.ReactNode; titulo: string; texto?: string | null; vacio: string }) {
    return <div className="rounded-xl border border-base-300/80 bg-base-100 p-4"><div className="mb-2 flex items-center gap-2 text-secondary">{icono}<h5 className="text-xs font-bold uppercase tracking-wide">{titulo}</h5></div><p className={`whitespace-pre-line text-sm leading-relaxed ${texto ? 'text-base-content/80' : 'italic text-base-content/40'}`}>{texto || vacio}</p></div>;
}

function EvidenciaRi({ titulo, valor: dato, unidad, cumple, referencia, detalle }: { titulo: string; valor?: number | string | null; unidad: string; cumple: boolean; referencia: string; detalle: string }) {
    const disponible = dato != null && dato !== '';
    return <div className={`rounded-xl border p-3 ${cumple ? 'border-warning/30 bg-warning/5' : 'border-base-300 bg-base-200/30'}`}><div className="mb-1.5 flex items-center gap-2">{cumple ? <CheckCircle2 size={15} className="shrink-0 text-warning" /> : <CircleMinus size={15} className="shrink-0 text-base-content/30" />}<h6 className="text-[11px] font-bold">{titulo}</h6></div><p className="text-base font-black">{disponible ? `${dato}${unidad}` : 'No disponible'}</p><p className="mt-1 text-[9px] font-semibold text-base-content/50">Referencia: {referencia}</p><p className="mt-1 text-[10px] leading-relaxed text-base-content/55">{detalle}</p></div>;
}

function detalleHoma(homa?: number | string | null) { const n = valor(homa); if (homa == null) return 'No se dispone de un valor para sustentar la clasificación.'; if (n >= 5) return 'Valor compatible con grado severo.'; if (n >= 3) return 'Valor compatible con grado moderado.'; if (n >= 2.5) return 'Valor compatible con grado leve.'; return 'Valor por debajo del punto de corte diagnóstico.'; }
function interpretacionRi(d: DiagnosticoRiData) { const homa = valor(d.homa_ir); const tgAlto = valor(d.trigliceridos) >= 150; const hdlBajo = d.hdl != null && valor(d.hdl) < 50; const partes = [homa >= 2.5 ? `HOMA-IR ${numero(d.homa_ir)} confirma resistencia de grado ${etiqueta(d.grado_resistencia).toLowerCase()}` : 'HOMA-IR no confirma resistencia']; if (tgAlto && hdlBajo) partes.push('triglicéridos elevados y HDL bajo sustentan riesgo cardiometabólico alto'); else if (tgAlto || hdlBajo) partes.push('una alteración lipídica sustenta riesgo cardiometabólico moderado'); return `${partes.join('; ')}.`; }
function valor(dato?: number | string | null) { const n = Number(dato); return Number.isFinite(n) ? n : 0; }

function numero(valor?: number | string | null) { return valor == null || valor === '' ? 'N/D' : String(valor); }
function normalizar(valor?: string | null) { return (valor ?? '').toLowerCase().replace(/_/g, ' '); }
function etiqueta(valor?: string | null) { const limpio = normalizar(valor); return limpio ? limpio.charAt(0).toUpperCase() + limpio.slice(1) : 'No evaluado'; }
function formatearFecha(fecha: string) { const valor = new Date(`${fecha}T00:00:00`); return Number.isNaN(valor.getTime()) ? fecha : valor.toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' }); }
