import { AlertTriangle, BrainCircuit, CheckCircle2, Info } from 'lucide-react';

export interface PrediccionRiesgoAdherencia {
    riesgo_baja_adherencia:'bajo'|'medio'|'alto'; probabilidad_riesgo:number; score:number;
    factores_influyentes:string[]; recomendacion_predictiva:string; fecha_prediccion:string; sin_datos:boolean;
    modelo:{tipo:string;nombre:string;version:string;preparado_para:string};
}

export default function PrediccionRiesgoAdherenciaCard({ prediccionRiesgoAdherencia:p }:{prediccionRiesgoAdherencia?:PrediccionRiesgoAdherencia|null}) {
 if(!p) return <div className="alert"><Info size={18}/><span>La predicción de adherencia aún no está disponible.</span></div>;
 const estilo=p.riesgo_baja_adherencia==='alto'?'error':p.riesgo_baja_adherencia==='medio'?'warning':'success';
 const clases={error:{icon:'bg-error/10 text-error',badge:'badge-error',progress:'progress-error',alert:'alert-error'},warning:{icon:'bg-warning/10 text-warning',badge:'badge-warning',progress:'progress-warning',alert:'alert-warning'},success:{icon:'bg-success/10 text-success',badge:'badge-success',progress:'progress-success',alert:'alert-success'}}[estilo];
 const Icon=p.riesgo_baja_adherencia==='bajo'?CheckCircle2:AlertTriangle;
 return <div className="card border border-base-300 bg-base-100 shadow-sm"><div className="card-body gap-4 p-5">
  <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex gap-3"><span className={`rounded-xl p-2.5 ${clases.icon}`}><BrainCircuit size={22}/></span><div><h3 className="font-bold">Predicción de riesgo de baja adherencia</h3><p className="text-xs opacity-60">Baseline explicable basado en seguimiento nutricional.</p></div></div><span className={`badge gap-1 capitalize ${clases.badge}`}><Icon size={13}/>{p.sin_datos?'Sin datos':`Riesgo ${p.riesgo_baja_adherencia}`}</span></div>
  {p.sin_datos?<div className="alert"><Info size={17}/><span>Aún no hay seguimientos suficientes; se mantendrá el monitoreo.</span></div>:<><div><div className="mb-1 flex justify-between text-xs"><span>Probabilidad estimada</span><b>{Math.round(p.probabilidad_riesgo*100)}%</b></div><progress className={`progress w-full ${clases.progress}`} value={p.probabilidad_riesgo*100} max="100"/></div><div><p className="mb-2 text-xs font-bold uppercase opacity-50">Factores influyentes</p>{p.factores_influyentes.length?<ul className="list-disc space-y-1 pl-5 text-sm">{p.factores_influyentes.map(x=><li key={x}>{x}</li>)}</ul>:<p className="text-sm opacity-60">No se identificaron factores de riesgo relevantes.</p>}</div></>}
  <div className={`alert ${clases.alert}`}><span className="text-sm">{p.recomendacion_predictiva}</span></div>
  <div className="flex flex-wrap justify-between gap-2 border-t border-base-200 pt-3 text-[11px] opacity-60"><span>{p.modelo.nombre} · v{p.modelo.version}</span><span>{new Date(p.fecha_prediccion).toLocaleString('es-BO')}</span></div>
  <p className="text-xs italic opacity-60">Esta predicción es un apoyo complementario y no reemplaza la evaluación profesional de la nutricionista.</p>
 </div></div>;
}
