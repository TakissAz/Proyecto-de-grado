import { router } from '@inertiajs/react';
import { AlertTriangle, Check, Clock3, HeartHandshake, LoaderCircle, MessageCircleHeart, Send, Stethoscope } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

export interface RetroalimentacionPacienteItem { id_retroalimentacion_paciente:number; tipo_retroalimentacion:string; rol_emisor:string; prioridad:string; mensaje:string; leido_por_paciente:boolean; fecha_lectura_paciente:string|null; created_at:string|null; profesional:string|null; contexto:{plan:string|null;comida:string|null;sintoma_fecha:string|null} }
export interface RetroalimentacionesPaciente { items:RetroalimentacionPacienteItem[]; total_no_leidas:number }

const tipos = [
    { id: 'malestar', label: 'Tengo un malestar', icon: AlertTriangle },
    { id: 'consulta', label: 'Tengo una duda', icon: MessageCircleHeart },
    { id: 'ingredientes', label: 'No consigo un ingrediente', icon: HeartHandshake },
    { id: 'otro', label: 'Otro mensaje', icon: Send },
] as const;
const etiqueta = (tipo:string) => tipos.find(item => item.id === tipo)?.label ?? tipo.replaceAll('_', ' ');
const fecha = (valor:string|null) => valor ? new Intl.DateTimeFormat('es-BO', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', timeZone:'America/La_Paz' }).format(new Date(valor)) : 'Ahora';

export default function RetroalimentacionesNutricionistaCard({ retroalimentaciones }: { retroalimentaciones:RetroalimentacionesPaciente|null }) {
    const [tipo, setTipo] = useState<(typeof tipos)[number]['id']>('malestar');
    const [mensaje, setMensaje] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState<string|null>(null);
    const [procesando, setProcesando] = useState<number|null>(null);
    const items = [...(retroalimentaciones?.items ?? [])].reverse();
    const enviar = async () => {
        if (mensaje.trim().length < 3) { setError('Cuéntale un poco más a tu nutricionista.'); return; }
        setEnviando(true); setError(null);
        try {
            const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
            const respuesta = await fetch('/paciente/mensajes-nutricionista', { method:'POST', headers:{ 'Content-Type':'application/json', Accept:'application/json', 'X-CSRF-TOKEN':token }, body:JSON.stringify({ tipo, mensaje }) });
            const datos = await respuesta.json();
            if (!respuesta.ok) throw new Error(datos.message ?? 'No pudimos enviar tu mensaje.');
            setMensaje(''); router.reload({ only:['retroalimentaciones'] });
        } catch (e) { setError(e instanceof Error ? e.message : 'No pudimos enviar tu mensaje.'); }
        finally { setEnviando(false); }
    };
    const marcarLeido = async (id:number) => {
        setProcesando(id);
        try { const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? ''; const r = await fetch(`/paciente/retroalimentaciones/${id}/marcar-leida`, { method:'POST', headers:{Accept:'application/json','X-CSRF-TOKEN':token} }); if (r.ok) router.reload({only:['retroalimentaciones']}); }
        finally { setProcesando(null); }
    };

    return <section className="overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-sm dark:border-surface-border-dark dark:bg-surface-card-dark">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border bg-gradient-to-r from-brand-green/[.07] to-transparent px-5 py-4 dark:border-surface-border-dark dark:from-brand-green/[.10]"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green"><Stethoscope size={19}/></div><div><p className="text-[9px] font-bold uppercase tracking-[.14em] text-brand-green-dark dark:text-brand-green">Acompañamiento personal</p><h2 className="mt-0.5 text-[15px] font-bold text-ink dark:text-ink-dark">Habla con tu nutricionista</h2><p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Envía una duda o un malestar para que lo tenga en cuenta.</p></div></div>{(retroalimentaciones?.total_no_leidas ?? 0) > 0 && <span className="rounded-full bg-brand-green/15 px-3 py-1.5 text-[10px] font-bold text-brand-green-dark dark:text-brand-green">{retroalimentaciones?.total_no_leidas} respuesta(s) nueva(s)</span>}</header>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_330px]">
            <div className="min-h-[320px] space-y-3 bg-black/[.012] p-4 dark:bg-white/[.012]">
                {items.length === 0 ? <div className="flex min-h-[280px] flex-col items-center justify-center text-center"><MessageCircleHeart size={30} className="text-brand-green/35"/><p className="mt-3 text-[13px] font-bold text-ink dark:text-ink-dark">Tu conversación empieza aquí</p><p className="mt-1 max-w-xs text-[11px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">Puedes avisar cómo te sientes, preguntar por una comida o contar si se te dificulta conseguir algo.</p></div> : items.map(item => {
                    const esPaciente = item.rol_emisor === 'paciente';
                    return <article key={item.id_retroalimentacion_paciente} className={clsx('flex gap-2', esPaciente ? 'justify-end' : 'justify-start')}>
                        {!esPaciente && <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-green/15 text-brand-green-dark dark:text-brand-green"><Stethoscope size={13}/></div>}
                        <div className={clsx('max-w-[84%] rounded-2xl px-3.5 py-3 shadow-sm', esPaciente ? 'rounded-br-sm bg-category-dairy text-white' : 'rounded-bl-sm border border-surface-border bg-surface-card dark:border-surface-border-dark dark:bg-surface-card-dark')}>
                            <div className={clsx('mb-1.5 flex flex-wrap items-center gap-1.5 text-[9px]', esPaciente ? 'text-white/75' : 'text-ink-muted dark:text-ink-muted-dark')}><span className="font-bold">{esPaciente ? 'Tú' : (item.profesional ?? 'Tu nutricionista')}</span><span>·</span><span className="capitalize">{etiqueta(item.tipo_retroalimentacion)}</span><span>·</span><time>{fecha(item.created_at)}</time></div><p className={clsx('whitespace-pre-wrap text-[12px] leading-relaxed', esPaciente ? 'text-white' : 'text-ink dark:text-ink-dark')}>{item.mensaje}</p>
                            {!esPaciente && !item.leido_por_paciente && <button type="button" disabled={procesando === item.id_retroalimentacion_paciente} onClick={() => marcarLeido(item.id_retroalimentacion_paciente)} className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-brand-green-dark disabled:opacity-50 dark:text-brand-green"><Check size={12}/>{procesando === item.id_retroalimentacion_paciente ? 'Guardando...' : 'Entendido'}</button>}
                        </div>
                    </article>;
                })}
            </div>
            <aside className="border-t border-surface-border p-4 dark:border-surface-border-dark lg:border-l lg:border-t-0"><div className="flex items-center gap-2"><HeartHandshake size={15} className="text-category-dairy"/><div><h3 className="text-[12px] font-bold text-ink dark:text-ink-dark">Enviar un mensaje</h3><p className="text-[9.5px] text-ink-muted dark:text-ink-muted-dark">Tu nutricionista recibirá una alerta.</p></div></div><div className="mt-3 grid grid-cols-2 gap-2">{tipos.map(({id,label,icon:Icon}) => <button key={id} type="button" onClick={() => setTipo(id)} className={clsx('flex min-h-12 items-center gap-2 rounded-xl border px-2.5 text-left text-[9.5px] font-bold transition', tipo === id ? 'border-brand-green/35 bg-brand-green/10 text-brand-green-dark dark:text-brand-green' : 'border-surface-border text-ink-muted hover:border-brand-green/20 dark:border-surface-border-dark dark:text-ink-muted-dark')}><Icon size={13}/>{label}</button>)}</div><textarea value={mensaje} onChange={e => setMensaje(e.target.value)} maxLength={1200} placeholder={tipo === 'malestar' ? 'Describe qué sientes, cuándo comenzó y qué comiste antes si lo recuerdas.' : 'Escribe tu mensaje para nutrición...'} className="mt-3 min-h-[125px] w-full resize-none rounded-xl border border-surface-border bg-black/[.015] px-3 py-3 text-[11.5px] text-ink outline-none placeholder:text-ink-muted/70 focus:border-brand-green/40 dark:border-surface-border-dark dark:bg-white/[.02] dark:text-ink-dark dark:placeholder:text-ink-muted-dark/70"/>{error && <p className="mt-2 text-[10px] font-medium text-category-fruits">{error}</p>}<button type="button" disabled={enviando} onClick={enviar} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green px-3 py-2.5 text-[11px] font-bold text-white transition hover:bg-brand-green-dark disabled:opacity-60">{enviando ? <LoaderCircle size={14} className="animate-spin"/> : <Send size={14}/>} {enviando ? 'Enviando...' : 'Enviar a nutrición'}</button><p className="mt-3 flex gap-1.5 text-[9px] leading-relaxed text-ink-muted dark:text-ink-muted-dark"><Clock3 size={11} className="mt-0.5 shrink-0"/>No reemplaza atención de urgencia. Si tienes síntomas graves, busca atención médica inmediata.</p></aside>
        </div>
    </section>;
}
