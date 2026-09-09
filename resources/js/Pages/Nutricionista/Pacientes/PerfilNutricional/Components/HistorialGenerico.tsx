import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Download, TrendingDown, TrendingUp, Minus, CirclePlus, CircleMinus, GitCompareArrows, type LucideIcon } from 'lucide-react';
import AvatarPaciente from '@/Components/ui/avatar-paciente';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { etiqueta } from '../tipos';

interface Campo {
    key: string;
    label: string;
    destacar?: (valor: any) => boolean;
}

interface Props {
    titulo: string;
    descripcion: string;
    icono: LucideIcon;
    colorIcono: string;
    bgIcono: string;
    paciente: { id_paciente: number; nombres: string; apellido_paterno: string; apellido_materno?: string | null; ci: string; user?: { avatar_url?: string | null } | null };
    registros: Record<string, any>[];
    campos: Campo[];
    campoFecha?: string;
    tipoHistorial: 'evaluaciones' | 'habitos' | 'preferencias' | 'restricciones' | 'objetivos' | 'requerimientos';
    camposGrafico?: string[];
}

export default function HistorialGenerico({ titulo, descripcion, icono: Icono, colorIcono, bgIcono, paciente, registros, campos, campoFecha = 'created_at', tipoHistorial, camposGrafico }: Props) {
    const nombre = [paciente.nombres, paciente.apellido_paterno, paciente.apellido_materno].filter(Boolean).join(' ');
    const id = paciente.id_paciente;
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');
    const filtrados = useMemo(() => registros.filter(r => {
        const fecha = String(r[campoFecha] ?? '').slice(0, 10);
        return (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
    }), [registros, campoFecha, desde, hasta]);
    const numericos = useMemo(() => (camposGrafico ?? campos.map(c => c.key)).filter(key => filtrados.filter(r => r[key] !== null && r[key] !== '' && Number.isFinite(Number(r[key]))).length >= 2).slice(0, 4), [campos, camposGrafico, filtrados]);
    const reporte = `/nutricionista/pacientes/${id}/perfil-nutricional/historial/${tipoHistorial}/reporte-pdf?${new URLSearchParams({ ...(desde ? { desde } : {}), ...(hasta ? { hasta } : {}) })}`;

    return (
        <AuthenticatedLayout title={titulo}>
            <Head title={`${titulo}: ${nombre}`} />
            <div className="space-y-5">
                {/* Cabecera */}
                <div className="card-elevated overflow-hidden">
                    <div className="relative h-16 bg-gradient-to-r from-brand-green/10 via-brand-green/5 to-transparent dark:from-brand-green/[0.06] dark:via-brand-green/[0.03] dark:to-transparent">
                        <Link
                            href={`/nutricionista/pacientes/${id}/perfil-nutricional`}
                            className="absolute left-5 top-4 flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-ink backdrop-blur-sm transition-colors hover:bg-white dark:bg-black/40 dark:text-ink-dark dark:hover:bg-black/60"
                        >
                            <ArrowLeft size={12} strokeWidth={1.8} /> Perfil nutricional
                        </Link>
                    </div>
                    <div className="px-5 pb-4 -mt-5">
                        <div className="flex items-end gap-3">
                            <div className="rounded-full border-[3px] border-surface-card shadow-md dark:border-surface-card-dark">
                                <AvatarPaciente nombre={nombre} avatarUrl={paciente.user?.avatar_url} size="lg" />
                            </div>
                            <div className="flex-1 pb-0.5">
                                <h1 className="text-[16px] font-bold text-ink dark:text-ink-dark">{nombre}</h1>
                                <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">CI: {paciente.ci}</p>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-lg bg-brand-green/10 px-3 py-1.5 dark:bg-brand-green/[0.08]">
                                <Icono size={12} strokeWidth={1.8} className={colorIcono} />
                                <span className="text-[11px] font-semibold text-brand-green-dark dark:text-brand-green">
                                    {filtrados.length} registro{filtrados.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-surface-border dark:border-surface-border-dark">
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">{descripcion}</p>
                        </div>
                    </div>
                </div>

                <section className="card-elevated overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border bg-black/[0.015] px-5 py-4 dark:border-surface-border-dark dark:bg-white/[0.015]">
                        <div><p className="text-[12px] font-bold text-ink dark:text-ink-dark">Reporte del historial</p><p className="mt-0.5 text-[10px] text-ink-muted dark:text-ink-muted-dark">Selecciona un periodo para analizar la evolución y generar el documento profesional.</p></div>
                        <div className="flex flex-wrap items-end gap-2.5">
                            <CampoFecha label="Desde" value={desde} onChange={setDesde} />
                            <CampoFecha label="Hasta" value={hasta} min={desde || undefined} onChange={setHasta} />
                            <a href={reporte} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-green px-4 text-[10.5px] font-bold text-white shadow-sm shadow-brand-green/20 transition hover:-translate-y-0.5 hover:bg-brand-green-dark hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-green/30"><Download size={14}/> Descargar PDF</a>
                        </div>
                    </div>
                    <div className="px-5 pb-5"><ResumenVisual registros={filtrados} campos={campos} numericos={numericos} campoFecha={campoFecha} tipoHistorial={tipoHistorial} /></div>
                </section>

                {/* Registros */}
                {filtrados.length === 0 ? (
                    <div className="card-elevated flex flex-col items-center gap-2 px-5 py-14 text-center">
                        <Icono size={28} strokeWidth={1.2} className="text-ink-muted/30 dark:text-ink-muted-dark/30" />
                        <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark">No existen registros</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtrados.map((r, idx) => (
                            <div key={idx} className="card-elevated overflow-hidden">
                                {/* Header del registro */}
                                <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-border dark:border-surface-border-dark">
                                    <div className="flex items-center gap-2">
                                        <div className={clsx('flex h-6 w-6 items-center justify-center rounded-md text-[9px] font-bold', bgIcono, colorIcono)}>
                                            {filtrados.length - idx}
                                        </div>
                                        <p className="text-[11.5px] font-semibold text-ink dark:text-ink-dark">Registro #{filtrados.length - idx}</p>
                                    </div>
                                    <span className="flex items-center gap-1 text-[10px] text-ink-muted dark:text-ink-muted-dark">
                                        <Calendar size={10} strokeWidth={1.8} />
                                        {formatearFecha(r[campoFecha])}
                                    </span>
                                </div>

                                {/* Datos */}
                                <div className="px-4 py-3">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {campos.map(campo => {
                                            const valor = r[campo.key];
                                            const dest = campo.destacar?.(valor) ?? false;
                                            return (
                                                <div key={campo.key} className="rounded-lg bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03]">
                                                    <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">{campo.label}</p>
                                                    {esHistorialDeListas(tipoHistorial) ? <ListaEtiquetas valor={valor} /> : <p className={clsx('text-[12px] font-bold', dest ? 'text-brand-orange' : 'text-ink dark:text-ink-dark')}>{etiqueta(valor)}</p>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {r.observaciones && (
                                        <div className="mt-2 rounded-md bg-black/[0.02] px-2.5 py-1.5 dark:bg-white/[0.02]">
                                            <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark leading-relaxed">{String(r.observaciones)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

function CampoFecha({ label, value, min, onChange }: { label:string; value:string; min?:string; onChange:(value:string)=>void }) {
    return <label className="block"><span className="mb-1.5 block text-[8.5px] font-bold uppercase tracking-[0.12em] text-ink-muted dark:text-ink-muted-dark">{label}</span><span className="relative block"><Calendar size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-green-dark dark:text-brand-green"/><input type="date" value={value} min={min} onChange={e=>onChange(e.target.value)} className="h-10 w-[150px] rounded-xl border border-surface-border bg-surface-card pl-9 pr-3 text-[10.5px] font-medium text-ink outline-none transition [color-scheme:light] hover:border-brand-green/40 focus:border-brand-green focus:ring-2 focus:ring-brand-green/10 dark:border-surface-border-dark dark:bg-surface-card-dark dark:text-ink-dark dark:[color-scheme:dark]"/></span></label>;
}

function ResumenVisual({ registros, campos, numericos, campoFecha, tipoHistorial }: { registros: Record<string, any>[]; campos: Campo[]; numericos: string[]; campoFecha: string; tipoHistorial: Props['tipoHistorial'] }) {
    const [activo, setActivo] = useState(numericos[0] ?? '');
    if (!registros.length) return null;
    const ordenados = [...registros].reverse();
    const etiquetas = Object.fromEntries(campos.map(c => [c.key, c.label]));
    if (esHistorialDeListas(tipoHistorial)) {
        return <ComparacionListas registros={ordenados} campos={campos} campoFecha={campoFecha} tipo={tipoHistorial} />;
    }
    if (tipoHistorial === 'requerimientos') {
        return <ComparacionRequerimientos registros={ordenados} campoFecha={campoFecha} />;
    }
    if (!numericos.length) {
        return <div className="mt-4 rounded-xl border border-surface-border p-4 dark:border-surface-border-dark"><p className="text-[10px] font-semibold text-ink dark:text-ink-dark">Resumen documental</p><p className="mt-1 text-[9.5px] text-ink-muted">{registros.length} registros disponibles. Este historial contiene información descriptiva y se presenta en el PDF como una línea temporal, sin gráficos artificiales.</p></div>;
    }
    const key = numericos.includes(activo) ? activo : numericos[0];
    const datos = ordenados.map(r => ({ valor:Number(r[key]), fecha:r[campoFecha] })).filter(p => Number.isFinite(p.valor));
    const valores=datos.map(p=>p.valor), min=Math.min(...valores), max=Math.max(...valores), rango=Math.max(max-min,1);
    const inicial=valores[0], actual=valores.at(-1) ?? inicial, cambio=actual-inicial;
    const porcentajeCambio = inicial !== 0 ? (cambio / inicial) * 100 : 0;
    const unidad = unidadIndicador(key);
    const lectura = interpretarCambio(key, cambio, actual);
    const puntos=valores.map((v,i)=>`${18+(i/Math.max(valores.length-1,1))*464},${112-((v-min)/rango)*76}`).join(' ');
    const Tendencia=cambio>0?TrendingUp:cambio<0?TrendingDown:Minus;
    return <div className="mt-4 rounded-xl border border-surface-border p-4 dark:border-surface-border-dark">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[11px] font-bold text-ink dark:text-ink-dark">Evolución del paciente</p><p className="text-[9.5px] text-ink-muted">Un indicador a la vez para facilitar la lectura.</p></div><div className="flex flex-wrap gap-1">{numericos.map(k=><button key={k} type="button" onClick={()=>setActivo(k)} className={clsx('rounded-lg px-2.5 py-1 text-[9px] font-semibold',key===k?'bg-brand-green text-white':'bg-black/[0.04] text-ink-muted dark:bg-white/[0.06]')}>{etiquetas[k]}</button>)}</div></div>
        <div className="mt-3 grid gap-4 md:grid-cols-[1fr_230px]"><svg viewBox="0 0 500 145" className="h-36 w-full" role="img" aria-label={`Evolución de ${etiquetas[key]}`}><line x1="18" y1="112" x2="482" y2="112" stroke="currentColor" className="text-surface-border dark:text-surface-border-dark"/><polyline points={puntos} fill="none" stroke="#38b826" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>{valores.map((v,i)=>{const x=18+(i/Math.max(valores.length-1,1))*464;const y=112-((v-min)/rango)*76;return <g key={i}><circle cx={x} cy={y} r="4" fill="#38b826"/><text x={x} y={Math.max(12,y-9)} textAnchor={i===0?'start':i===valores.length-1?'end':'middle'} className="fill-current text-[9px] font-semibold text-ink dark:text-ink-dark">{v.toLocaleString('es-BO')} {unidad}</text><text x={x} y="132" textAnchor={i===0?'start':i===valores.length-1?'end':'middle'} className="fill-current text-[8px] text-ink-muted">{fechaCorta(datos[i].fecha)}</text></g>})}</svg><div className="rounded-xl bg-brand-green/[0.05] p-3 dark:bg-brand-green/[0.07]"><p className="text-[9px] uppercase text-ink-muted">{etiquetas[key]} actual</p><p className="mt-1 text-xl font-bold text-ink dark:text-ink-dark">{actual.toLocaleString('es-BO')} <span className="text-xs text-ink-muted">{unidad}</span></p><p className={clsx('mt-1 flex items-center gap-1 text-[10px] font-bold',cambio===0?'text-ink-muted':'text-brand-green-dark dark:text-brand-green')}><Tendencia size={12}/>{cambio>0?'+':''}{cambio.toLocaleString('es-BO')} {unidad} ({porcentajeCambio>0?'+':''}{porcentajeCambio.toFixed(1)}%)</p><p className="mt-3 text-[9.5px] font-semibold text-ink dark:text-ink-dark">¿Qué significa?</p><p className="mt-1 text-[9.5px] leading-relaxed text-ink-muted">{lectura}</p></div></div>
    </div>;
}

function ComparacionRequerimientos({ registros, campoFecha }: { registros: Record<string, any>[]; campoFecha: string }) {
    const actual = registros.at(-1);
    const anterior = registros.at(-2);
    if (!actual) return null;
    const indicadores = [
        { key:'calorias_objetivo', label:'Calorías objetivo', unidad:'kcal/día', explicacion:'Meta energética final: GET más el ajuste definido por las reglas.' },
        { key:'tmb', label:'TMB', unidad:'kcal', explicacion:'Cambia principalmente cuando varían peso, talla o edad de referencia.' },
        { key:'get', label:'GET', unidad:'kcal', explicacion:'Refleja la TMB multiplicada por el factor del nivel de actividad.' },
        { key:'peso_referencia', label:'Peso de referencia', unidad:'kg', explicacion:'Peso de la evaluación que el sistema utilizó para este cálculo.' },
    ];
    return <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-green/15 bg-brand-green/[0.035] p-3.5"><div><p className="text-[11px] font-bold text-ink dark:text-ink-dark">Último recálculo frente al anterior</p><p className="mt-0.5 text-[9.5px] text-ink-muted dark:text-ink-muted-dark">Vigente: {formatearFecha(actual[campoFecha])}{anterior ? ` · Comparado con ${formatearFecha(anterior[campoFecha])}` : ' · Primer cálculo disponible'}</p></div><span className="rounded-lg bg-brand-green/10 px-2.5 py-1 text-[9.5px] font-bold text-brand-green-dark dark:text-brand-green">{registros.length} cálculo{registros.length === 1 ? '' : 's'}</span></div>
        <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">{indicadores.map(indicador=>{const valor=Number(actual[indicador.key]);const previo=anterior?Number(anterior[indicador.key]):null;const delta=previo!==null&&Number.isFinite(previo)?valor-previo:null;const pct=delta!==null&&previo!==null&&previo!==0?(delta/previo)*100:null;const Tendencia=delta===null||delta===0?Minus:delta>0?TrendingUp:TrendingDown;return <article key={indicador.key} className="rounded-xl border border-surface-border bg-black/[0.015] p-3.5 dark:border-surface-border-dark dark:bg-white/[0.02]"><p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{indicador.label}</p><p className="mt-1 text-[18px] font-black text-ink dark:text-ink-dark">{valor.toLocaleString('es-BO',{maximumFractionDigits:2})} <span className="text-[9px] font-semibold text-ink-muted">{indicador.unidad}</span></p>{delta!==null?<p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-brand-green-dark dark:text-brand-green"><Tendencia size={12}/>{delta>0?'+':''}{delta.toLocaleString('es-BO',{maximumFractionDigits:2})} {indicador.unidad}{pct!==null&&` (${pct>0?'+':''}${pct.toFixed(1)}%)`}</p>:<p className="mt-1 text-[9.5px] text-ink-muted">Sin cálculo anterior</p>}<p className="mt-2 border-t border-surface-border pt-2 text-[9px] leading-relaxed text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark">{indicador.explicacion}</p></article>})}</div>
        {anterior && <div className="rounded-xl border border-info/15 bg-info/[0.035] px-3.5 py-2.5 text-[9.5px] text-ink-muted dark:text-ink-muted-dark"><strong className="text-ink dark:text-ink-dark">Origen del cambio:</strong> peso {Number(anterior.peso_referencia).toLocaleString('es-BO')} → {Number(actual.peso_referencia).toLocaleString('es-BO')} kg; actividad {etiqueta(anterior.nivel_actividad)} → {etiqueta(actual.nivel_actividad)}; factor {Number(anterior.factor_actividad).toLocaleString('es-BO')} → {Number(actual.factor_actividad).toLocaleString('es-BO')}.</div>}
    </div>;
}

function esHistorialDeListas(tipo: Props['tipoHistorial']): boolean {
    return tipo === 'preferencias' || tipo === 'restricciones';
}

function convertirLista(valor: unknown): string[] {
    if (Array.isArray(valor)) return valor.map(String).map(v => v.trim()).filter(Boolean);
    if (!valor) return [];
    const texto = String(valor).trim();
    if (texto.startsWith('[')) {
        try { const datos = JSON.parse(texto); if (Array.isArray(datos)) return datos.map(String).map(v => v.trim()).filter(Boolean); } catch { /* texto separado por comas */ }
    }
    return texto.split(',').map(v => v.trim()).filter(Boolean);
}

function ListaEtiquetas({ valor }: { valor: unknown }) {
    const items = convertirLista(valor);
    if (!items.length) return <span className="text-[10.5px] italic text-ink-muted dark:text-ink-muted-dark">Sin registros</span>;
    return <div className="flex flex-wrap gap-1.5">{items.map(item => <span key={item.toLocaleLowerCase()} className="rounded-full border border-brand-green/15 bg-brand-green/[0.06] px-2 py-0.5 text-[10px] font-semibold text-ink dark:text-ink-dark">{item}</span>)}</div>;
}

function ComparacionListas({ registros, campos, campoFecha, tipo }: { registros: Record<string, any>[]; campos: Campo[]; campoFecha: string; tipo: Props['tipoHistorial'] }) {
    const actual = registros.at(-1);
    const anterior = registros.at(-2);
    if (!actual) return null;
    const cambios = campos.map(campo => {
        const actuales = convertirLista(actual[campo.key]);
        const previos = convertirLista(anterior?.[campo.key]);
        const normalizar = (v:string) => v.toLocaleLowerCase('es');
        return {
            ...campo,
            agregados: actuales.filter(v => !previos.some(p => normalizar(p) === normalizar(v))),
            retirados: previos.filter(v => !actuales.some(a => normalizar(a) === normalizar(v))),
        };
    }).filter(c => c.agregados.length || c.retirados.length);
    const totalAgregados = cambios.reduce((n,c) => n + c.agregados.length, 0);
    const totalRetirados = cambios.reduce((n,c) => n + c.retirados.length, 0);
    return <div className="mt-4 overflow-hidden rounded-2xl border border-surface-border dark:border-surface-border-dark">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-black/[0.018] px-4 py-3 dark:bg-white/[0.025]">
            <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green-dark dark:text-brand-green"><GitCompareArrows size={15}/></span><div><p className="text-[11px] font-bold text-ink dark:text-ink-dark">Cambios del registro vigente</p><p className="text-[9.5px] text-ink-muted dark:text-ink-muted-dark">Comparación con {anterior ? `el control del ${formatearFecha(anterior[campoFecha])}` : 'el primer registro disponible'}.</p></div></div>
            <div className="flex gap-2"><span className="rounded-lg bg-brand-green/10 px-2.5 py-1 text-[9.5px] font-bold text-brand-green-dark dark:text-brand-green">+{totalAgregados} incorporados</span><span className="rounded-lg bg-category-fruits/10 px-2.5 py-1 text-[9.5px] font-bold text-category-fruits">−{totalRetirados} retirados</span></div>
        </div>
        <div className="p-4">{!anterior ? <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Este es el primer registro. Los elementos cargados se muestran como información inicial.</p> : cambios.length === 0 ? <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">No hubo cambios en {tipo === 'restricciones' ? 'las restricciones y alertas alimentarias' : 'las preferencias alimentarias'} respecto al control anterior.</p> : <div className="grid gap-2.5 md:grid-cols-2">{cambios.map(c => <div key={c.key} className="rounded-xl border border-surface-border p-3 dark:border-surface-border-dark"><p className="mb-2 text-[9.5px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{c.label}</p>{c.agregados.length > 0 && <div className="mb-2 flex flex-wrap items-center gap-1.5"><CirclePlus size={13} className="text-brand-green"/>{c.agregados.map(v=><span key={`a-${v}`} className="rounded-full bg-brand-green/10 px-2 py-0.5 text-[9.5px] font-semibold text-brand-green-dark dark:text-brand-green">{v}</span>)}</div>}{c.retirados.length > 0 && <div className="flex flex-wrap items-center gap-1.5"><CircleMinus size={13} className="text-category-fruits"/>{c.retirados.map(v=><span key={`r-${v}`} className="rounded-full bg-category-fruits/10 px-2 py-0.5 text-[9.5px] font-semibold text-category-fruits line-through decoration-category-fruits/60">{v}</span>)}</div>}</div>)}</div>}</div>
    </div>;
}

function fechaCorta(valor: unknown): string { const [,m,d]=String(valor??'').slice(0,10).split('-'); return m&&d?`${d}/${m}`:'—'; }
function formatearFecha(valor: unknown): string { const [a,m,d]=String(valor??'').slice(0,10).split('-'); return a&&m&&d?`${d}/${m}/${a}`:'—'; }
function unidadIndicador(key:string):string { return key==='peso'||key==='masa_muscular'?'kg':key==='circunferencia_cintura'?'cm':key==='porcentaje_grasa'?'%':key==='indice_habitos'?'pts':''; }
function interpretarCambio(key:string,cambio:number,actual:number):string {
    if (cambio===0) return 'El indicador se mantuvo estable entre ambos controles. Conviene observar más mediciones antes de concluir una tendencia.';
    const direccion=cambio>0?'aumentó':'disminuyó';
    if(key==='peso') return `El peso ${direccion}. Este cambio no es positivo o negativo por sí solo: debe contrastarse con la meta de peso, cintura y composición corporal.`;
    if(key==='circunferencia_cintura') return `La cintura ${direccion}. En mujeres adultas, ${actual>=80?'el valor actual amerita seguimiento del riesgo abdominal':'el valor actual está por debajo del punto orientativo de 80 cm'}, considerando siempre el criterio profesional.`;
    if(key==='porcentaje_grasa') return `La grasa corporal ${direccion}. El valor actual se compara de forma orientativa con el rango de 21–32,9% para mujeres adultas y con el método de medición utilizado.`;
    if(key==='masa_muscular') return `La masa muscular ${direccion}. Se valora principalmente su conservación o progreso junto con peso, actividad física y objetivo nutricional.`;
    if(key==='indice_habitos') return `El índice ${direccion}. El valor actual se interpreta como ${actual>=80?'favorable':actual>=55?'por mejorar':'atención prioritaria'}: considera consumos de riesgo, regularidad, desayuno, ansiedad y hambre nocturna.`;
    return `El indicador ${direccion} respecto al primer control. La relevancia depende del objetivo nutricional definido.`;
}

function ResumenVisualAntiguo({ registros, campos, numericos, campoFecha }: { registros: Record<string, any>[]; campos: Campo[]; numericos: string[]; campoFecha: string }) {
    if (!registros.length) return null;
    const ordenados = [...registros].reverse();
    const etiquetas = Object.fromEntries(campos.map(c => [c.key, c.label]));
    if (!numericos.length) {
        return <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{ordenados.slice(-4).map((r,i)=>{const completos=campos.filter(c=>r[c.key]!==null&&r[c.key]!==''&&r[c.key]!==undefined).length;const p=Math.round(completos/Math.max(campos.length,1)*100);return <div key={i} className="rounded-xl border border-surface-border p-3 dark:border-surface-border-dark"><p className="text-[9px] uppercase text-ink-muted">{String(r[campoFecha]??'').slice(0,10)||'Sin fecha'}</p><p className="mt-1 text-lg font-bold text-brand-green">{p}%</p><div className="mt-2 h-1.5 rounded-full bg-black/5 dark:bg-white/10"><div className="h-full rounded-full bg-brand-green" style={{width:`${p}%`}}/></div><p className="mt-1 text-[9px] text-ink-muted">Datos completados</p></div>})}</div>;
    }
    return <div className="mt-4 grid gap-3 lg:grid-cols-2">{numericos.map((key,serieIndex)=>{const valores=ordenados.map(r=>Number(r[key])).filter(Number.isFinite);const min=Math.min(...valores),max=Math.max(...valores),rango=Math.max(max-min,1);const puntos=valores.map((v,i)=>`${10+(i/Math.max(valores.length-1,1))*280},${92-((v-min)/rango)*72}`).join(' ');return <div key={key} className="rounded-xl border border-surface-border p-3 dark:border-surface-border-dark"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase text-ink-muted">{etiquetas[key]}</span><span className="flex items-center gap-1 text-[10px] font-bold text-brand-green"><TrendingUp size={11}/>{valores.at(-1)?.toLocaleString('es-BO')}</span></div><svg viewBox="0 0 300 105" className="mt-2 h-24 w-full" role="img" aria-label={`Evolución de ${etiquetas[key]}`}><line x1="10" y1="92" x2="290" y2="92" stroke="currentColor" className="text-surface-border dark:text-surface-border-dark"/><polyline points={puntos} fill="none" stroke={serieIndex%2?'#f59e0b':'#38b826'} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>{valores.map((v,i)=><circle key={i} cx={10+(i/Math.max(valores.length-1,1))*280} cy={92-((v-min)/rango)*72} r="3.5" fill={serieIndex%2?'#f59e0b':'#38b826'}/>)}</svg><div className="flex justify-between text-[9px] text-ink-muted"><span>Mín. {min.toLocaleString('es-BO')}</span><span>Máx. {max.toLocaleString('es-BO')}</span></div></div>})}</div>;
}
