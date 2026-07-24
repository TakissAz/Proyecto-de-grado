declare const route:any;
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {PageProps} from '@/types';
import {Head,Link,router} from '@inertiajs/react';
import {Activity,ClipboardCheck,ShieldCheck} from 'lucide-react';
import {useEffect,useState} from 'react';
import AuditoriaFiltros from './components/AuditoriaFiltros';
import AuditoriaPaginacion from './components/AuditoriaPaginacion';
import AuditoriaTabla from './components/AuditoriaTabla';
import type {EstadoFlujoPaciente,EstadoPaciente,FiltrosAuditoria,PacientesPaginados} from './components/types';
interface Props extends PageProps{pacientes:PacientesPaginados;filtros:FiltrosAuditoria;estados:EstadoPaciente[];estados_flujo:EstadoFlujoPaciente[];origenes:string[];}
export default function Pacientes({pacientes,filtros,estados,estados_flujo,origenes,flash}:Props){
 const[buscar,setBuscar]=useState(filtros.buscar??'');const[estado,setEstado]=useState(filtros.estado??'');const[flujo,setFlujo]=useState(filtros.estado_flujo??'');const[origen,setOrigen]=useState(filtros.origen_registro??'');
 useEffect(()=>{setBuscar(filtros.buscar??'');setEstado(filtros.estado??'');setFlujo(filtros.estado_flujo??'');setOrigen(filtros.origen_registro??'');},[filtros]);
 const filtrar=(page=1)=>router.get(route('admin.auditoria.pacientes'),{buscar,estado,estado_flujo:flujo,origen_registro:origen,page},{preserveState:true,preserveScroll:true,replace:true});
 const limpiar=()=>{setBuscar('');setEstado('');setFlujo('');setOrigen('');router.get(route('admin.auditoria.pacientes'),{},{preserveState:true,preserveScroll:true,replace:true});};
 return <AuthenticatedLayout title="Auditoría de pacientes"><Head title="Auditoría de pacientes"/><div className="space-y-5">
  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><div className="mb-1.5 flex items-center gap-2 text-brand-green-dark dark:text-brand-green"><ShieldCheck size={15}/><span className="text-[10.5px] font-bold uppercase tracking-[.14em]">Control clínico</span></div><h1 className="text-[22px] font-bold tracking-tight text-ink dark:text-ink-dark">Auditoría de pacientes</h1><p className="mt-1 text-[12.5px] text-ink-muted dark:text-ink-muted-dark">Supervisa el origen, responsables y evolución de cada expediente clínico.</p></div><Link href={route('admin.auditoria.actividad')} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-surface-border bg-surface-card px-3.5 py-2 text-[11.5px] font-semibold text-ink shadow-card hover:border-brand-green/30 dark:border-surface-border-dark dark:bg-surface-card-dark dark:text-ink-dark"><Activity size={14}/> Ver actividad</Link></div>
  {flash?.success&&<div className="rounded-xl border border-brand-green/20 bg-brand-green-soft/60 px-4 py-3 text-xs text-brand-green-dark dark:bg-brand-green-dark/15 dark:text-brand-green">{flash.success}</div>}
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div className="card-elevated flex items-center gap-3 p-4"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-green-soft text-brand-green-dark dark:bg-brand-green-dark/20 dark:text-brand-green"><ClipboardCheck size={16}/></span><div><p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Expedientes registrados</p><p className="text-[17px] font-bold text-ink dark:text-ink-dark">{pacientes.meta.total}</p></div></div><div className="card-elevated flex items-center gap-3 p-4"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-category-others/10 text-category-others dark:bg-category-others/15"><Activity size={16}/></span><div><p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Trazabilidad</p><p className="text-[12.5px] font-semibold text-ink dark:text-ink-dark">Registro de cambios activo</p></div></div></div>
  <section className="card-elevated overflow-hidden"><AuditoriaFiltros total={pacientes.meta.total} buscar={buscar} estado={estado} flujo={flujo} origen={origen} estados={estados} flujos={estados_flujo} origenes={origenes} onBuscar={setBuscar} onEstado={setEstado} onFlujo={setFlujo} onOrigen={setOrigen} onFiltrar={()=>filtrar(1)} onLimpiar={limpiar}/><AuditoriaTabla pacientes={pacientes.data}/><AuditoriaPaginacion mostrando={pacientes.data.length} total={pacientes.meta.total} pagina={pacientes.meta.current_page} ultima={pacientes.meta.last_page} onCambiar={filtrar}/></section>
 </div></AuthenticatedLayout>;
}
