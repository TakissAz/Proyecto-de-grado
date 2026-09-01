import axios, { AxiosError } from 'axios';
import { AlertTriangle, Bot, FileText, Lightbulb, LoaderCircle, MessageSquareText, RefreshCw, SearchCheck, Sparkles, UserRound, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

type Accion = 'explicar_plan' | 'ajustar_siguiente' | 'alternativas' | 'auditar' | 'resumen_paciente' | 'redactar_reporte' | 'consulta';
interface Resultado { accion:string; titulo:string; resumen:string; hallazgos:string[]; recomendaciones:string[]; alertas:string[]; alternativas:{id_receta:number;nombre:string;motivo:string}[]; proveedor:string; modelo:string; requiere_validacion_profesional:boolean }
interface Opcion { id:Accion; titulo:string; descripcion:string; icono:typeof Sparkles }

const OPCIONES: Opcion[] = [
    { id:'auditar', titulo:'Auditar el plan', descripcion:'Diversidad, equilibrio, fibra y datos incompletos.', icono:SearchCheck },
    { id:'alternativas', titulo:'Buscar alternativas', descripcion:'Compara recetas previamente validadas por las reglas.', icono:UtensilsCrossed },
    { id:'ajustar_siguiente', titulo:'Ajustar siguiente plan', descripcion:'Usa adherencia, síntomas y retroalimentación.', icono:RefreshCw },
    { id:'explicar_plan', titulo:'Explicar selección', descripcion:'Fundamenta el plan y sus recetas.', icono:Lightbulb },
    { id:'resumen_paciente', titulo:'Resumen para paciente', descripcion:'Genera orientación sencilla y práctica.', icono:UserRound },
    { id:'redactar_reporte', titulo:'Borrador de reporte', descripcion:'Prepara un resumen profesional revisable.', icono:FileText },
    { id:'consulta', titulo:'Pregunta profesional', descripcion:'Consulta el expediente nutricional autorizado.', icono:MessageSquareText },
];

export default function CopilotoNutricionalGroq({ planId }: { planId:number }) {
    const [accion, setAccion] = useState<Accion>('auditar');
    const [pregunta, setPregunta] = useState('');
    const [tipo, setTipo] = useState('almuerzo');
    const [resultado, setResultado] = useState<Resultado|null>(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    const ejecutar = async () => {
        setCargando(true); setError(''); setResultado(null);
        try {
            const respuesta = await axios.post<{success:boolean;data:Resultado}>(`/nutricionista/planes-alimentarios/${planId}/copiloto`, {
                accion,
                pregunta: pregunta.trim() || null,
                tipo_comida: accion === 'alternativas' ? tipo : null,
            }, { headers:{Accept:'application/json'} });
            setResultado(respuesta.data.data);
        } catch (e) {
            const respuesta = (e as AxiosError<{message?:string;errors?:Record<string,string[]>}>).response;
            const dato = respuesta?.data;
            const validacion = Object.values(dato?.errors ?? {})[0]?.[0];
            if (respuesta?.status === 429) {
                setError(dato?.message || 'Groq alcanzó su límite temporal. Espera unos segundos antes de volver a consultar.');
            } else if (respuesta?.status === 422) {
                setError(validacion || 'Escribe una pregunta profesional válida antes de consultar.');
            } else {
                setError(dato?.message || 'No se pudo consultar el copiloto nutricional.');
            }
        } finally { setCargando(false) }
    };

    return <section className="overflow-hidden rounded-2xl border border-brand-green/25 bg-surface-card dark:bg-surface-card-dark">
        <div className="border-b border-surface-border bg-brand-green/[0.045] px-5 py-4 dark:border-surface-border-dark dark:bg-brand-green/[0.055]">
            <div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green"><Bot size={20}/></div><div><h3 className="text-[14px] font-bold text-ink dark:text-ink-dark">Copiloto nutricional Groq</h3><p className="mt-0.5 text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Analiza y propone; las reglas clínicas filtran y la nutricionista decide.</p></div></div>
        </div>
        <div className="space-y-4 p-4">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{OPCIONES.map(opcion => { const Icono=opcion.icono; return <button key={opcion.id} type="button" onClick={()=>{setAccion(opcion.id);setResultado(null);setError('')}} className={clsx('rounded-xl border p-3 text-left transition-colors', accion===opcion.id?'border-brand-green/40 bg-brand-green/[0.07]':'border-surface-border hover:bg-black/[0.02] dark:border-surface-border-dark dark:hover:bg-white/[0.025]')}><Icono size={15} className={accion===opcion.id?'text-brand-green-dark dark:text-brand-green':'text-ink-muted'}/><p className="mt-2 text-[11px] font-bold text-ink dark:text-ink-dark">{opcion.titulo}</p><p className="mt-0.5 text-[9.5px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">{opcion.descripcion}</p></button>})}</div>

            {(accion==='consulta'||accion==='alternativas') && <div className="grid gap-3 sm:grid-cols-[180px_1fr]">{accion==='alternativas'&&<label><span className="mb-1 block text-[10px] font-semibold text-ink-muted">Tiempo de comida</span><select value={tipo} onChange={e=>setTipo(e.target.value)} className="w-full rounded-lg border border-surface-border bg-surface-card px-3 py-2.5 text-[11px] dark:border-surface-border-dark dark:bg-surface-card-dark dark:text-ink-dark"><option value="desayuno">Desayuno</option><option value="almuerzo">Almuerzo</option><option value="merienda">Merienda</option><option value="cena">Cena</option></select></label>}<label className={accion==='consulta'?'sm:col-span-2':''}><span className="mb-1 block text-[10px] font-semibold text-ink-muted">{accion==='consulta'?'Pregunta para el copiloto':'Necesidad adicional (opcional)'}</span><textarea value={pregunta} onChange={e=>setPregunta(e.target.value)} maxLength={1000} rows={2} placeholder={accion==='consulta'?'Ej.: ¿Qué comidas tienen menor aporte de fibra?':'Ej.: alternativa más rápida de preparar'} className="w-full resize-none rounded-lg border border-surface-border bg-surface-card px-3 py-2.5 text-[11px] outline-none focus:border-brand-green/50 dark:border-surface-border-dark dark:bg-surface-card-dark dark:text-ink-dark"/></label></div>}

            <div className="flex flex-wrap items-center justify-between gap-3"><p className="flex items-center gap-1.5 text-[9.5px] text-ink-muted"><AlertTriangle size={11}/> Ninguna sugerencia se aplica automáticamente.</p><button type="button" disabled={cargando||(accion==='consulta'&&!pregunta.trim())} onClick={ejecutar} className="inline-flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2.5 text-[11px] font-bold text-white disabled:opacity-50">{cargando?<LoaderCircle size={13} className="animate-spin"/>:<Sparkles size={13}/>} {cargando?'Analizando...':'Generar análisis'}</button></div>
            {error&&<div className="rounded-xl border border-category-fruits/25 bg-category-fruits/[0.06] px-4 py-3 text-[11px] text-category-fruits">{error}</div>}
            {resultado&&<ResultadoCopiloto resultado={resultado}/>} 
        </div>
    </section>;
}

function ResultadoCopiloto({resultado:r}:{resultado:Resultado}) {
    return <article className="space-y-4 rounded-2xl border border-brand-green/25 bg-brand-green/[0.035] p-4">
        <div><div className="flex flex-wrap items-center gap-2"><h4 className="text-[13px] font-bold text-ink dark:text-ink-dark">{r.titulo}</h4><span className="rounded-md bg-brand-green/10 px-2 py-1 text-[9px] font-bold text-brand-green-dark dark:text-brand-green">Groq · revisión profesional</span></div><p className="mt-2 text-[11px] leading-relaxed text-ink/80 dark:text-ink-dark/80">{r.resumen}</p></div>
        <div className="grid gap-4 md:grid-cols-2"><Lista titulo="Hallazgos" items={r.hallazgos}/><Lista titulo="Sugerencias" items={r.recomendaciones}/>{r.alertas.length>0&&<Lista titulo="Alertas" items={r.alertas} alerta/>}</div>
        {r.alternativas.length>0&&<div><p className="mb-2 text-[9.5px] font-bold uppercase tracking-wider text-ink-muted">Alternativas compatibles</p><div className="grid gap-2 md:grid-cols-2">{r.alternativas.map(x=><div key={x.id_receta} className="rounded-xl border border-surface-border bg-surface-card/70 p-3 dark:border-surface-border-dark dark:bg-surface-card-dark/70"><p className="text-[11px] font-bold text-ink dark:text-ink-dark">{x.nombre}</p><p className="mt-1 text-[9.5px] text-ink-muted">{x.motivo}</p></div>)}</div></div>}
    </article>;
}
function Lista({titulo,items,alerta=false}:{titulo:string;items:string[];alerta?:boolean}) { return <div><p className={clsx('mb-1.5 text-[9.5px] font-bold uppercase tracking-wider',alerta?'text-brand-orange':'text-ink-muted')}>{titulo}</p>{items.length?<ul className="ml-4 list-disc space-y-1 text-[10.5px] text-ink/80 dark:text-ink-dark/80">{items.map((x,i)=><li key={i}>{x}</li>)}</ul>:<p className="text-[10px] italic text-ink-muted">Sin elementos adicionales.</p>}</div> }
