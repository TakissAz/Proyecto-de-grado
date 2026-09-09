import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ProgresoPacienteCard, { type Progreso } from '@/Components/paciente/ProgresoPacienteCard';
import { Head } from '@inertiajs/react';
import { Download, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

interface Registro { id: number; fecha: string | null; peso: number | null; imc: number | null; cintura: number | null; cadera: number | null; porcentaje_grasa: number | null; masa_muscular: number | null }
interface Props { paciente: { nombre: string } | null; progresoPaciente: Progreso | null; historialProgreso: Registro[] }

const fecha = (valor: string | null) => valor ? new Date(`${valor}T12:00:00`).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin fecha';
const n = (valor: number | null, unidad = '') => valor === null ? '—' : `${Number(valor).toLocaleString('es-BO', { maximumFractionDigits: 1 })}${unidad}`;

export default function ProgresoPage({ paciente, progresoPaciente, historialProgreso }: Props) {
    return <AuthenticatedLayout title="Mi progreso">
        <Head title="Mi progreso" />
        <main className="mx-auto w-full max-w-[1280px] space-y-5 px-4 sm:px-6 lg:px-8">
            <Cabecera icono={<TrendingUp size={19} />} titulo="Mi progreso" descripcion="Revisa la evolución de tus medidas, adherencia y avances nutricionales." nombre={paciente?.nombre} />
            <ProgresoPacienteCard progreso={progresoPaciente} />
            <Historial registros={historialProgreso} />
        </main>
    </AuthenticatedLayout>;
}

function Cabecera({ icono, titulo, descripcion, nombre }: { icono: React.ReactNode; titulo: string; descripcion: string; nombre?: string }) {
    return <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-brand-green/20 bg-brand-green/[0.035] p-5 dark:bg-brand-green/[0.045]"><div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green">{icono}</div><div><p className="text-[9.5px] font-bold uppercase tracking-wider text-brand-green-dark dark:text-brand-green">Portal del paciente</p><h1 className="mt-0.5 text-[18px] font-bold text-ink dark:text-ink-dark">{titulo}</h1><p className="mt-1 text-[11px] text-ink-muted dark:text-ink-muted-dark">{nombre ? `${nombre}, ` : ''}{descripcion}</p></div></div><a href={route('paciente.progreso.reporte-pdf')} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-brand-green-dark"><Download size={14}/> Descargar mi reporte PDF</a></header>;
}

function Historial({ registros }: { registros: Registro[] }) {
    return <section className="rounded-3xl border border-surface-border bg-surface-card p-5 shadow-sm dark:border-surface-border-dark dark:bg-surface-card-dark"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[9px] font-bold uppercase tracking-[.14em] text-brand-green-dark dark:text-brand-green">Mi historial</p><h2 className="mt-0.5 text-[16px] font-bold text-ink dark:text-ink-dark">Cada control cuenta una parte de tu historia</h2><p className="mt-1 text-[11px] text-ink-muted dark:text-ink-muted-dark">Tus mediciones se ordenan cronológicamente para que veas cambios reales.</p></div><span className="rounded-full bg-brand-green/10 px-3 py-1.5 text-[10px] font-bold text-brand-green-dark dark:text-brand-green">{registros.length} control{registros.length === 1 ? '' : 'es'}</span></div>{registros.length ? <><div className="mt-5 overflow-x-auto"><div className="flex min-w-[620px] items-end gap-3 px-2 pb-1">{registros.map((r, i) => <Punto key={r.id} registro={r} primero={i === 0} ultimo={i === registros.length - 1} />)}</div></div><div className="mt-5 overflow-x-auto rounded-2xl border border-surface-border dark:border-surface-border-dark"><table className="w-full min-w-[680px] text-left"><thead className="bg-black/[.02] text-[9px] uppercase tracking-wider text-ink-muted dark:bg-white/[.03] dark:text-ink-muted-dark"><tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Peso</th><th className="px-4 py-3">IMC</th><th className="px-4 py-3">Cintura</th><th className="px-4 py-3">% grasa</th><th className="px-4 py-3">Masa muscular</th></tr></thead><tbody>{registros.map(r => <tr key={r.id} className="border-t border-surface-border/70 text-[11px] dark:border-surface-border-dark"><td className="px-4 py-3 font-semibold text-ink dark:text-ink-dark">{fecha(r.fecha)}</td><td className="px-4 py-3">{n(r.peso, ' kg')}</td><td className="px-4 py-3">{n(r.imc)}</td><td className="px-4 py-3">{n(r.cintura, ' cm')}</td><td className="px-4 py-3">{n(r.porcentaje_grasa, '%')}</td><td className="px-4 py-3">{n(r.masa_muscular, ' kg')}</td></tr>)}</tbody></table></div></> : <p className="mt-5 rounded-2xl bg-black/[.025] p-6 text-center text-[11px] text-ink-muted dark:bg-white/[.035] dark:text-ink-muted-dark">Cuando tengas controles nutricionales, aparecerán aquí y podrás descargarlos en tu reporte.</p>}</section>;
}

function Punto({ registro, primero, ultimo }: { registro: Registro; primero: boolean; ultimo: boolean }) { const alto = registro.peso === null ? 18 : Math.max(24, Math.min(110, registro.peso)); return <div className="flex min-w-28 flex-1 flex-col items-center"><div className="mb-2 text-center"><p className="text-[13px] font-bold text-brand-green-dark dark:text-brand-green">{n(registro.peso, ' kg')}</p><p className="text-[9px] text-ink-muted dark:text-ink-muted-dark">{primero ? 'Inicio' : ultimo ? 'Actual' : 'Control'}</p></div><div className="flex h-28 w-full items-end justify-center rounded-xl bg-brand-green/[.035] px-5 dark:bg-brand-green/[.055]"><div className={clsx('w-full rounded-t-lg bg-brand-green transition-all', ultimo && 'bg-brand-green-dark')} style={{ height: `${alto}px` }}/></div><p className="mt-2 text-[9px] text-ink-muted dark:text-ink-muted-dark">{fecha(registro.fecha)}</p></div>; }
