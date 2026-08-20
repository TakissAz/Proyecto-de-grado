import { CalendarDays, CheckCircle2, CircleMinus, ClipboardCheck, HeartPulse, ShieldAlert, Stethoscope } from 'lucide-react';
import type { DiagnosticoPmosData } from '../../tipos';

interface Props { diagnostico: DiagnosticoPmosData; }

export function PanelConfirmacionPmos({ diagnostico }: Props) {
    const criterios = Math.max(0, Math.min(3, diagnostico.total_criterios_rotterdam ?? 0));
    const porcentaje = Math.round((criterios / 3) * 100);
    const fenotipo = etiqueta(diagnostico.fenotipo_pmos, 'No aplica');
    const severidad = etiqueta(diagnostico.severidad_clinica, 'No clasificada');
    const riesgo = etiqueta(diagnostico.riesgo_metabolico, 'No evaluado');

    return <section className="overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-base-100 via-base-100 to-primary/5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-300/70 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Stethoscope size={20} /></span>
                <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary/70">Valoración endocrinológica</p><h4 className="text-base font-bold text-base-content">Diagnóstico clínico PMOS</h4></div>
            </div>
            <span className={`badge gap-1.5 ${diagnostico.diagnostico_confirmado ? 'badge-error' : 'badge-ghost'}`}><ClipboardCheck size={12} />{diagnostico.diagnostico_confirmado ? 'Diagnóstico confirmado' : 'No confirmado'}</span>
        </div>

        <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[150px_1fr]">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-base-200/55 p-4 text-center">
                <div className="relative grid h-24 w-24 place-items-center rounded-full" style={{ background: `conic-gradient(var(--color-primary) ${porcentaje}%, var(--color-base-300) 0)` }}>
                    <div className="grid h-[72px] w-[72px] place-items-center rounded-full bg-base-100"><div><strong className="text-2xl text-primary">{criterios}</strong><span className="text-xs text-base-content/50">/3</span></div></div>
                </div>
                <p className="mt-2 text-xs font-bold">Criterios de Rotterdam</p><p className="text-[10px] text-base-content/50">{porcentaje}% de criterios presentes</p>
            </div>

            <div className="grid content-start gap-3 sm:grid-cols-2">
                <Indicador icono={<HeartPulse size={16} />} titulo="Fenotipo clínico" valor={fenotipo} tono="primary" />
                <Indicador icono={<CalendarDays size={16} />} titulo="Fecha de valoración" valor={formatearFecha(diagnostico.fecha_diagnostico)} tono="neutral" />
                <Escala titulo="Severidad clínica" valor={diagnostico.severidad_clinica} opciones={['leve', 'moderada', 'severa']} />
                <Escala titulo="Riesgo metabólico" valor={diagnostico.riesgo_metabolico} opciones={['bajo', 'moderado', 'alto']} />
            </div>
        </div>

        <div className="border-t border-base-300/70 px-4 py-4 sm:px-5">
            <div className="mb-3"><p className="text-xs font-bold uppercase tracking-[0.12em] text-base-content/70">Fundamento de la decisión</p><p className="mt-0.5 text-[11px] text-base-content/50">El diagnóstico se sustenta en al menos 2 de 3 criterios de Rotterdam y el descarte de otras causas.</p></div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Evidencia cumple={diagnostico.cumple_alteracion_ovulatoria} titulo="1. Alteración ovulatoria" detalle={diagnostico.cumple_alteracion_ovulatoria ? 'Ciclos irregulares, oligomenorrea, amenorrea o evidencia de anovulación.' : 'No se documentó alteración ovulatoria.'} />
                <Evidencia cumple={diagnostico.cumple_hiperandrogenismo} titulo="2. Hiperandrogenismo" detalle={detalleHiperandrogenismo(diagnostico)} />
                <Evidencia cumple={diagnostico.cumple_morfologia_ovarica} titulo="3. Morfología ovárica" detalle={diagnostico.cumple_morfologia_ovarica ? 'Hallazgos ecográficos compatibles con morfología poliquística.' : 'La ecografía no aporta este criterio.'} />
                <Evidencia cumple={diagnostico.diagnosticos_diferenciales_descartados} titulo="Descarte diferencial" detalle={diagnostico.diagnosticos_diferenciales_descartados ? 'Se registró el descarte de causas endocrinas alternativas.' : 'El descarte diferencial está pendiente o incompleto.'} esencial />
            </div>
            <div className="mt-3 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5 text-xs text-base-content/75"><b>Interpretación:</b> {interpretacionPmos(diagnostico, criterios)}</div>
        </div>

        <div className="grid gap-3 border-t border-base-300/70 bg-base-200/25 p-4 sm:grid-cols-2 sm:p-5">
            <BloqueTexto icono={<ClipboardCheck size={17} />} titulo="Conclusión médica" texto={diagnostico.conclusion_medica} vacio="Sin conclusión médica registrada." />
            <BloqueTexto icono={<ShieldAlert size={17} />} titulo="Plan y recomendaciones" texto={diagnostico.recomendaciones_medicas} vacio="Sin recomendaciones registradas." />
        </div>
    </section>;
}

function Indicador({ icono, titulo, valor, tono }: { icono: React.ReactNode; titulo: string; valor: string; tono: 'primary' | 'neutral' }) {
    return <div className="rounded-xl border border-base-300 bg-base-100 p-3"><div className={`mb-2 flex items-center gap-2 ${tono === 'primary' ? 'text-primary' : 'text-base-content/50'}`}>{icono}<span className="text-[10px] font-bold uppercase tracking-wider">{titulo}</span></div><p className="text-sm font-bold capitalize text-base-content">{valor}</p></div>;
}

function Escala({ titulo, valor, opciones }: { titulo: string; valor?: string | null; opciones: string[] }) {
    const actual = normalizar(valor); const indice = opciones.indexOf(actual);
    return <div className="rounded-xl border border-base-300 bg-base-100 p-3"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50">{titulo}</span><strong className="text-xs capitalize">{etiqueta(valor, titulo.includes('Riesgo') ? 'No evaluado' : 'No clasificada')}</strong></div><div className="grid grid-cols-3 gap-1">{opciones.map((opcion, i) => <div key={opcion}><div className={`h-2 rounded-full ${indice >= i ? colorEscala(i) : 'bg-base-300'}`} /><p className="mt-1 text-center text-[9px] capitalize text-base-content/45">{opcion}</p></div>)}</div></div>;
}

function BloqueTexto({ icono, titulo, texto, vacio }: { icono: React.ReactNode; titulo: string; texto?: string | null; vacio: string }) {
    return <div className="rounded-xl border border-base-300/80 bg-base-100 p-4"><div className="mb-2 flex items-center gap-2 text-primary">{icono}<h5 className="text-xs font-bold uppercase tracking-wide">{titulo}</h5></div><p className={`whitespace-pre-line text-sm leading-relaxed ${texto ? 'text-base-content/80' : 'italic text-base-content/40'}`}>{texto || vacio}</p></div>;
}

function Evidencia({ cumple, titulo, detalle, esencial = false }: { cumple: boolean; titulo: string; detalle: string; esencial?: boolean }) {
    return <div className={`rounded-xl border p-3 ${cumple ? 'border-success/25 bg-success/5' : esencial ? 'border-warning/30 bg-warning/5' : 'border-base-300 bg-base-200/30'}`}><div className="mb-1.5 flex items-center gap-2">{cumple ? <CheckCircle2 size={15} className="shrink-0 text-success" /> : <CircleMinus size={15} className="shrink-0 text-base-content/30" />}<h6 className="text-[11px] font-bold">{titulo}</h6></div><p className="text-[10px] leading-relaxed text-base-content/55">{detalle}</p><span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${cumple ? 'bg-success/15 text-success' : 'bg-base-300/60 text-base-content/50'}`}>{cumple ? 'Criterio presente' : 'Criterio ausente'}</span></div>;
}

function detalleHiperandrogenismo(d: DiagnosticoPmosData) {
    if (!d.cumple_hiperandrogenismo) return 'No se documentó hiperandrogenismo clínico ni bioquímico.';
    if (d.cumple_hiperandrogenismo_clinico && d.cumple_hiperandrogenismo_bioquimico) return 'Existe evidencia clínica y bioquímica de hiperandrogenismo.';
    return d.cumple_hiperandrogenismo_clinico ? 'Existe evidencia clínica de hiperandrogenismo.' : 'Existe evidencia bioquímica de hiperandrogenismo.';
}

function interpretacionPmos(d: DiagnosticoPmosData, total: number) {
    if (total >= 2 && d.diagnosticos_diferenciales_descartados) return `Se cumplen ${total} criterios de Rotterdam y se descartaron diagnósticos alternativos; el patrón corresponde al fenotipo ${etiqueta(d.fenotipo_pmos, 'no clasificado')}.`;
    if (total >= 2) return `Se cumplen ${total} criterios de Rotterdam, pero el diagnóstico permanece en estudio hasta completar el descarte diferencial.`;
    return `Solo se cumplen ${total} criterios de Rotterdam; no se alcanza el mínimo diagnóstico de 2 criterios.`;
}

function colorEscala(indice: number) { return ['bg-success', 'bg-warning', 'bg-error'][indice]; }
function normalizar(valor?: string | null) { return (valor ?? '').toLowerCase().replace(/_/g, ' '); }
function etiqueta(valor?: string | null, vacio = 'No registrado') { const limpio = normalizar(valor); return limpio ? limpio.charAt(0).toUpperCase() + limpio.slice(1) : vacio; }
function formatearFecha(fecha: string) { const valor = new Date(`${fecha}T00:00:00`); return Number.isNaN(valor.getTime()) ? fecha : valor.toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' }); }
