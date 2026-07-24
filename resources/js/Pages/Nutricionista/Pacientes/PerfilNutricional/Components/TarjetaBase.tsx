import { CheckCircle2, ClipboardPlus, Pencil, type LucideIcon } from 'lucide-react';
import { etiqueta, type Registro } from '../tipos';

export default function TarjetaBase({ titulo, descripcion, icono: Icono, registro, campos, abrir, bloqueada = false }: { titulo: string; descripcion: string; icono: LucideIcon; registro: Registro | null; campos: [string, string][]; abrir: () => void; bloqueada?: boolean }) {
    return <section className="card border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md">
        <div className="card-body gap-5 p-4 sm:p-6">
            <div className="flex flex-col items-start justify-between gap-3 min-[400px]:flex-row"><div className="flex gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><Icono size={21}/></span><div><h2 className="font-bold">{titulo}</h2><p className="mt-1 text-xs text-base-content/60">{descripcion}</p></div></div><span className={`badge gap-1 ${registro ? 'badge-success badge-outline' : 'badge-ghost'}`}>{registro ? <CheckCircle2 size={12}/> : null}{registro ? 'Registrado' : 'Pendiente'}</span></div>
            {registro ? <dl className="grid grid-cols-2 gap-x-5 gap-y-3">{campos.map(([clave, label]) => <div key={clave} className="min-w-0"><dt className="text-[11px] font-semibold uppercase tracking-wide text-base-content/50">{label}</dt><dd className="mt-0.5 truncate text-sm font-medium capitalize" title={etiqueta(registro[clave])}>{etiqueta(registro[clave])}</dd></div>)}</dl> : <div className="rounded-xl border border-dashed border-base-300 bg-base-200/40 p-4 text-sm text-base-content/60">Aún no se registraron datos en esta sección.</div>}
            <div className="card-actions justify-stretch sm:justify-end"><button className="btn btn-primary btn-sm w-full gap-2 sm:w-auto" onClick={abrir} disabled={bloqueada}>{registro ? <Pencil size={14}/> : <ClipboardPlus size={14}/>} {registro ? 'Editar' : 'Registrar'}</button></div>
        </div>
    </section>;
}
