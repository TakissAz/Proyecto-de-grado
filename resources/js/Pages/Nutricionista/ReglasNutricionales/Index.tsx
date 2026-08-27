import { Head, Link, router } from '@inertiajs/react';
import { BrainCircuit, Plus, Search, SquarePen, Target } from 'lucide-react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Alerta from '@/Components/ui/alerta';
import { BotonLink } from '@/Components/ui/boton';
import type { PageProps } from '@/types';
import type { ReglaNutricional } from './FormularioRegla';

interface Props extends PageProps {
  reglas: { data: ReglaNutricional[]; current_page: number; last_page: number; total: number };
  filtros: { buscar: string; tipo: string };
}

const etiqueta = (valor: string) => ({ ajuste_calorico: 'Ajuste calórico', distribucion_macros: 'Distribución de macros', limite_calorico: 'Límite de seguridad', objetivo_principal: 'Objetivo principal', nivel_actividad: 'Nivel de actividad', calorias_objetivo: 'Calorías preliminares', default: 'Siempre que no aplique otra regla', in: 'está entre', not_in: 'no está entre', '=': 'es igual a', '!=': 'es diferente de', '>': 'es mayor que', '>=': 'es mayor o igual que', '<': 'es menor que', '<=': 'es menor o igual que' }[valor] ?? valor.replaceAll('_', ' '));

const resultadoTexto = (resultado: Record<string, number | string>) => Object.entries(resultado).map(([clave, valor]) => `${etiqueta(clave)}: ${valor}`).join(' · ');
const condicionTexto = (valor: ReglaNutricional['condicion_valor']) => Array.isArray(valor) ? valor.join(', ') : String(valor ?? '');

export default function Index({ reglas, filtros, flash }: Props) {
  const [buscar, setBuscar] = useState(filtros.buscar ?? '');
  const [tipo, setTipo] = useState(filtros.tipo ?? '');
  const filtrar = (e?: React.FormEvent) => {
    e?.preventDefault();
    router.get('/nutricionista/reglas-nutricionales', { buscar, tipo }, { preserveState: true, replace: true });
  };

  return (
    <AuthenticatedLayout title="Reglas nutricionales">
      <Head title="Reglas nutricionales" />
      <div className="space-y-5">
        {flash?.success && <Alerta tipo="success">{flash.success}</Alerta>}
        <section className="card-elevated overflow-hidden">
          <div className="border-b border-surface-border p-5 dark:border-surface-border-dark">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex gap-3"><div className="rounded-xl bg-brand-green/15 p-2.5 text-brand-green-dark dark:text-brand-green"><BrainCircuit size={20} /></div><div><h2 className="text-base font-bold text-ink dark:text-ink-dark">Biblioteca de reglas profesionales</h2><p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">Estas reglas fundamentan cálculos futuros. Los requerimientos ya calculados conservan la versión utilizada.</p></div></div>
              <BotonLink href="/nutricionista/reglas-nutricionales/create" variante="primary" tamano="md"><Plus size={14} /> Nueva regla</BotonLink>
            </div>
            <form onSubmit={filtrar} className="mt-5 flex flex-wrap gap-2">
              <div className="relative min-w-[230px] flex-1"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" /><input value={buscar} onChange={e => setBuscar(e.target.value)} placeholder="Buscar por código o nombre" className="w-full rounded-lg border border-surface-border bg-[#FAF9F6] py-2 pl-9 pr-3 text-xs outline-none focus:border-brand-green/50 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" /></div>
              <select value={tipo} onChange={e => { setTipo(e.target.value); router.get('/nutricionista/reglas-nutricionales', { buscar, tipo: e.target.value }, { preserveState: true, replace: true }); }} className="rounded-lg border border-surface-border bg-[#FAF9F6] px-3 py-2 text-xs dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"><option value="">Todos los grupos</option><option value="ajuste_calorico">Ajuste calórico</option><option value="distribucion_macros">Distribución de macros</option><option value="limite_calorico">Límite de seguridad</option></select>
              <button className="rounded-lg border border-surface-border px-4 py-2 text-xs font-semibold text-ink dark:border-surface-border-dark dark:text-ink-dark">Filtrar</button>
            </form>
          </div>

          <div className="grid gap-3 p-5 lg:grid-cols-2">
            {reglas.data.map(regla => (
              <article key={regla.id_regla_nutricional} className="rounded-xl border border-surface-border bg-black/[0.015] p-4 dark:border-surface-border-dark dark:bg-white/[0.02]">
                <div className="flex items-start justify-between gap-3"><div><span className="inline-flex rounded-md bg-brand-green/10 px-2 py-1 text-[9px] font-bold text-brand-green-dark dark:text-brand-green">{regla.codigo}</span><h3 className="mt-2 text-[13px] font-bold text-ink dark:text-ink-dark">{regla.nombre}</h3><p className="mt-1 text-[10.5px] text-ink-muted dark:text-ink-muted-dark">{etiqueta(regla.tipo_regla)} · prioridad {regla.prioridad}</p></div><Link href={`/nutricionista/reglas-nutricionales/${regla.id_regla_nutricional}/edit`} className="rounded-lg border border-surface-border p-2 text-ink-muted hover:border-brand-green/40 hover:text-brand-green-dark dark:border-surface-border-dark dark:text-ink-muted-dark"><SquarePen size={14} /></Link></div>
                <div className="mt-3 rounded-lg bg-white/70 p-3 dark:bg-black/10"><p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark"><Target size={11} /> Condición</p><p className="mt-1 text-[11px] text-ink dark:text-ink-dark">{regla.condicion_operador === 'default' ? etiqueta('default') : `${etiqueta(regla.condicion_campo)} ${etiqueta(regla.condicion_operador)} ${condicionTexto(regla.condicion_valor)}`}</p></div>
                <p className="mt-3 text-[11px] font-semibold text-brand-green-dark dark:text-brand-green">{resultadoTexto(regla.resultado)}</p>
                {regla.descripcion && <p className="mt-2 text-[10.5px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">{regla.descripcion}</p>}
                {regla.fuente && <p className="mt-2 border-t border-surface-border pt-2 text-[9.5px] italic text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark">Fuente: {regla.fuente}</p>}
              </article>
            ))}
            {!reglas.data.length && <div className="col-span-full py-14 text-center text-xs text-ink-muted">No se encontraron reglas nutricionales.</div>}
          </div>

          {reglas.last_page > 1 && <div className="flex justify-center gap-1 border-t border-surface-border p-4 dark:border-surface-border-dark">{Array.from({ length: reglas.last_page }, (_, i) => <button key={i} onClick={() => router.get('/nutricionista/reglas-nutricionales', { buscar, tipo, page: i + 1 })} className={`h-8 w-8 rounded-lg text-xs ${reglas.current_page === i + 1 ? 'bg-brand-green text-white' : 'text-ink-muted'}`}>{i + 1}</button>)}</div>}
        </section>
      </div>
    </AuthenticatedLayout>
  );
}
