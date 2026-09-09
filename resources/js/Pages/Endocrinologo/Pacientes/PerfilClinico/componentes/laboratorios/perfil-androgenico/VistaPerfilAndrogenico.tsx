import clsx from 'clsx';
import { Badge } from '@/Components/ui/badge';
import type { PerfilAndrogenicoData } from '../../../tipos';
import { BaraRango, type ParamColor } from '../BaraRango';

const RANGOS = [
 {label:'Testosterona total',key:'testosterona_total',unidad:'ng/dL',min:15,max:70,color:'violet'},
 {label:'Testosterona libre',key:'testosterona_libre',unidad:'pg/mL',min:.5,max:4.5,color:'rose'},
 {label:'SHBG',key:'shbg',unidad:'nmol/L',min:20,max:130,color:'cyan',invertido:true},
 {label:'DHEA-S',key:'dhea_s',unidad:'µg/dL',min:35,max:430,color:'amber'},
 {label:'Androstenediona',key:'androstenediona',unidad:'ng/mL',min:.3,max:3.3,color:'indigo'},
] as const;

export default function VistaPerfilAndrogenico({data}:{data:PerfilAndrogenicoData}){
 return <div className="space-y-4"><div className="space-y-2.5">{RANGOS.map(r=>{const valor=(data as any)[r.key] as number|null;if(valor==null)return null;return <BaraRango key={r.key} label={r.label} valor={valor} unidad={r.unidad} min={r.min} max={r.max} color={r.color as ParamColor} invertido={'invertido'in r&&r.invertido}/>})}</div>
 {data.indice_androgenico_libre!=null&&<div className="rounded-lg bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03]"><p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-ink-muted">Índice androgénico libre</p><p className={clsx('text-[13px] font-bold',data.indice_androgenico_libre>5?'text-brand-orange':'text-category-dairy')}>{data.indice_androgenico_libre}</p></div>}
 <Badge color={data.hiperandrogenismo_bioquimico?'orange':'green'}>{data.hiperandrogenismo_bioquimico?'Hiperandrogenismo bioquímico positivo':'Sin hiperandrogenismo bioquímico'}</Badge>
 {data.interpretacion&&<div className="rounded-xl border border-surface-border px-3 py-2.5 dark:border-surface-border-dark"><p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Interpretación</p><p className="text-[12px] text-ink dark:text-ink-dark">{data.interpretacion}</p></div>}</div>;
}
