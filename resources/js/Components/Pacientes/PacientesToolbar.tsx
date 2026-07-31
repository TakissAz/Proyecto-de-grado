import { Filter, Plus, Search, X } from 'lucide-react';
import { BotonLink } from '@/Components/ui/boton';

interface PacientesToolbarProps {
  total: number;
  buscar: string;
  basePath?: string;
  onBuscarChange: (value: string) => void;
  onSubmit: () => void;
  onLimpiar: () => void;
}

const TABS = ['Todos', 'Activos', 'Inactivos'] as const;

export default function PacientesToolbar({
  total,
  buscar,
  basePath = '/endocrinologo/pacientes',
  onBuscarChange,
  onSubmit,
  onLimpiar,
}: PacientesToolbarProps) {
  return (
    <div className="px-5 pb-4 pt-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">
            Lista de Pacientes
          </h3>
          <p className="mt-0.5 text-[11.5px] text-ink-muted dark:text-ink-muted-dark">
            {total} paciente{total !== 1 ? 's' : ''} registrada{total !== 1 ? 's' : ''}
          </p>
        </div>

        <BotonLink href={`${basePath}/create`} variante="primary" tamano="md">
          <Plus size={14} strokeWidth={1.8} /> Nuevo paciente
        </BotonLink>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex gap-4 border-b border-surface-border text-[12.5px] dark:border-surface-border-dark">
          {TABS.map((tab, i) => (
            <span
              key={tab}
              className={
                i === 0
                  ? 'cursor-pointer border-b-2 border-brand-green-dark pb-2 font-semibold text-brand-green-dark dark:text-brand-green'
                  : 'cursor-pointer pb-2 text-ink-muted transition-colors hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark'
              }
            >
              {tab}
            </span>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto"
        >
          <div className="relative min-w-[180px] flex-1 sm:flex-none">
            <Search
              size={14}
              strokeWidth={1.8}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted dark:text-ink-muted-dark"
            />
            <input
              placeholder="Buscar paciente..."
              value={buscar}
              onChange={(e) => onBuscarChange(e.target.value)}
              className="w-full rounded-lg sm:w-[200px] border border-surface-border bg-[#FAF9F6] py-1.5 pl-8 pr-3
                text-xs text-ink outline-none focus:border-brand-green/40
                dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg border border-surface-border px-3 py-1.5
              text-xs text-ink transition-colors hover:border-brand-green/30
              dark:border-surface-border-dark dark:text-ink-dark"
          >
            <Filter size={12} strokeWidth={1.8} /> Filtrar
          </button>
          {buscar ? (
            <button
              type="button"
              onClick={onLimpiar}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-ink-muted
                transition-colors hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark"
            >
              <X size={12} strokeWidth={1.8} /> Limpiar
            </button>
          ) : null}
        </form>
      </div>
    </div>
  );
}
