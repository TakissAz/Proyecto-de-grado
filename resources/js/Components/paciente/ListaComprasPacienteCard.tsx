import { Clipboard, Printer, ShoppingBasket } from 'lucide-react';
import { useState } from 'react';

interface ItemCompra { nombre:string; cantidad:number; unidad:string; usado_en:string[] }
interface CategoriaCompra { nombre:string; items:ItemCompra[] }
interface IndicacionManual { nombre:string; cantidad:number; unidad:string|null; observaciones:string|null; usado_en:string[] }
export interface ListaCompras { resumen:{total_items:number;total_categorias:number;tiene_indicaciones_manuales:boolean};categorias:CategoriaCompra[];indicaciones_manuales:IndicacionManual[] }

const numero=(valor:number)=>new Intl.NumberFormat('es-BO',{maximumFractionDigits:2}).format(valor);

export default function ListaComprasPacienteCard({lista}:{lista:ListaCompras|null}){
 const [copiado,setCopiado]=useState(false);
 if(!lista)return null;
 const texto=lista.categorias.map(c=>`${c.nombre}\n${c.items.map(i=>`- ${i.nombre}: ${numero(i.cantidad)} ${i.unidad}`).join('\n')}`).join('\n\n');
 const copiar=async()=>{await navigator.clipboard.writeText(texto);setCopiado(true);window.setTimeout(()=>setCopiado(false),1800)};
 return <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm print:shadow-none">
  <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex gap-3"><span className="rounded-2xl bg-primary/10 p-3 text-primary"><ShoppingBasket/></span><div><h2 className="text-xl font-extrabold">Lista de compras semanal</h2><p className="text-sm text-base-content/60">{lista.resumen.total_items} productos organizados en {lista.resumen.total_categorias} categorías.</p></div></div><div className="flex gap-2 print:hidden"><button className="btn btn-sm btn-outline" onClick={copiar}><Clipboard size={15}/>{copiado?'Copiada':'Copiar lista'}</button><button className="btn btn-sm btn-outline" onClick={()=>window.print()}><Printer size={15}/>Imprimir</button></div></div>
  <div className="mt-5 grid items-start gap-4 md:grid-cols-2">{lista.categorias.map(c=><details className="collapse-arrow collapse border border-base-300" open key={c.nombre}><summary className="collapse-title font-bold">{c.nombre} <span className="badge badge-ghost badge-sm ml-2">{c.items.length}</span></summary><ul className="collapse-content space-y-3">{c.items.map((i,index)=><li key={`${i.nombre}-${i.unidad}-${index}`}><div className="flex justify-between gap-3"><span className="font-semibold">{i.nombre}</span><span className="badge badge-primary badge-outline whitespace-nowrap">{numero(i.cantidad)} {i.unidad}</span></div>{i.usado_en.length>0&&<p className="mt-1 text-xs text-base-content/50">Para: {i.usado_en.join(', ')}</p>}</li>)}</ul></details>)}</div>
  {lista.resumen.total_items===0&&lista.indicaciones_manuales.length===0&&<div className="alert mt-5">No hay ingredientes suficientes para generar una lista de compras.</div>}
  {lista.indicaciones_manuales.length>0&&<div className="alert alert-warning mt-5 items-start"><div><h3 className="font-bold">Indicaciones que debes revisar</h3><p className="text-sm">Estos componentes no tienen ingredientes estructurados; consulta la indicación del plan.</p><ul className="mt-2 list-disc pl-5 text-sm">{lista.indicaciones_manuales.map((i,index)=><li key={index}><b>{i.nombre}</b>{i.observaciones?`: ${i.observaciones}`:''} <span className="opacity-60">({i.usado_en.join(', ')})</span></li>)}</ul></div></div>}
 </section>
}
