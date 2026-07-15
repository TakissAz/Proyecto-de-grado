import { DollarSign, Users, Activity, MoreHorizontal, Filter, Plus } from 'lucide-react';
import clsx from 'clsx';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Tarjeta, { TarjetaStat } from '@/Components/ui/tarjeta';

interface Paciente {
  nombre: string;
  diagnostico: 'Tipo 1' | 'Tipo 2' | 'Tiroides' | 'Obesidad' | 'Prediabetes';
  glucosa: string;
  proximaCita: string;
  costoConsulta: string;
  estado: 'Confirmado' | 'Pendiente';
}

const diagnosticoStyles: Record<Paciente['diagnostico'], string> = {
  'Tipo 1': 'bg-category-grains/20 text-category-grains dark:bg-category-grains/25',
  'Tipo 2': 'bg-category-fruits/20 text-category-fruits dark:bg-category-fruits/25',
  Tiroides: 'bg-category-veggies/20 text-category-veggies dark:bg-category-veggies/25',
  Obesidad: 'bg-category-protein/20 text-category-protein dark:bg-category-protein/25',
  Prediabetes: 'bg-category-dairy/20 text-category-dairy dark:bg-category-dairy/25',
};

const pacientes: Paciente[] = [
  { nombre: 'Ana Torres', diagnostico: 'Tipo 2', glucosa: '126 mg/dL', proximaCita: '18 Jul', costoConsulta: '$45', estado: 'Confirmado' },
  { nombre: 'Luis Fernandez', diagnostico: 'Tiroides', glucosa: '—', proximaCita: '19 Jul', costoConsulta: '$40', estado: 'Pendiente' },
  { nombre: 'Maria Rojas', diagnostico: 'Prediabetes', glucosa: '108 mg/dL', proximaCita: '20 Jul', costoConsulta: '$35', estado: 'Confirmado' },
  { nombre: 'Carlos Perez', diagnostico: 'Tipo 1', glucosa: '142 mg/dL', proximaCita: '21 Jul', costoConsulta: '$45', estado: 'Confirmado' },
  { nombre: 'Sofia Vargas', diagnostico: 'Obesidad', glucosa: '—', proximaCita: '22 Jul', costoConsulta: '$50', estado: 'Pendiente' },
];

export default function Dashboard() {
  return (
    <AuthenticatedLayout title="Panel del Endocrinologo">
      {/* Tarjetas de estadisticas */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaStat
          label="Ingresos del mes"
          value="$3,450"
          delta="+2.5%"
          tone="green"
          icon={<DollarSign size={17} strokeWidth={1.8} />}
        />
        <TarjetaStat
          label="Pacientes activos"
          value="128"
          delta="+5.2%"
          tone="orange"
          icon={<Users size={17} strokeWidth={1.8} />}
        />
        <TarjetaStat
          label="Consultas del mes"
          value="64"
          delta="+3.9%"
          tone="peach"
          icon={<Activity size={17} strokeWidth={1.8} />}
        />

        <Tarjeta>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark">
                Pacientes por diagnostico
              </div>
              <div className="text-[22px] font-bold text-ink dark:text-ink-dark">
                128 <span className="text-[11px] font-normal text-ink-muted dark:text-ink-muted-dark">pacientes</span>
              </div>
            </div>
            <MoreHorizontal size={16} className="cursor-pointer text-ink-muted dark:text-ink-muted-dark" />
          </div>

          <div className="mb-2.5 flex h-2 overflow-hidden rounded-md">
            <div className="w-[35%] bg-category-grains" />
            <div className="w-[28%] bg-category-fruits" />
            <div className="w-[20%] bg-category-veggies" />
            <div className="w-[17%] bg-category-protein" />
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-ink dark:text-ink-dark">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-category-grains" />
                Tipo 2
              </span>
              <span className="text-ink-muted dark:text-ink-muted-dark">45 pacientes · 35%</span>
            </div>
            <div className="flex justify-between text-ink dark:text-ink-dark">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-category-fruits" />
                Tipo 1
              </span>
              <span className="text-ink-muted dark:text-ink-muted-dark">36 pacientes · 28%</span>
            </div>
          </div>
        </Tarjeta>
      </div>

      {/* Tabla de proximas consultas */}
      <Tarjeta>
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
          <div>
            <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">
              Proximas Consultas
            </h3>
            <div className="mt-2 flex gap-4 border-b border-surface-border text-[12.5px] text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark">
              <span className="border-b-2 border-brand-green-dark pb-2 font-semibold text-brand-green-dark dark:text-brand-green">
                Todos
              </span>
              <span className="cursor-pointer pb-2">Confirmados</span>
              <span className="cursor-pointer pb-2">Pendientes</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <input
              placeholder="Buscar paciente"
              className="rounded-lg border border-surface-border bg-[#FAF9F6] px-3 py-1.5 text-xs
                text-ink-muted focus:outline-none dark:border-surface-border-dark
                dark:bg-[#20232B] dark:text-ink-muted-dark"
            />
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg border border-surface-border px-3.5 py-1.5
                text-xs text-ink dark:border-surface-border-dark dark:text-ink-dark"
            >
              <Filter size={12} /> Filtrar
            </button>
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg bg-brand-green px-4 py-2 text-xs
                font-bold text-white"
            >
              <Plus size={14} /> Nuevo paciente
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="border-b border-surface-border text-left text-[11px] font-semibold text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark">
                <th className="px-2.5 py-2">Paciente</th>
                <th className="px-2.5 py-2">Diagnostico</th>
                <th className="px-2.5 py-2">Glucosa</th>
                <th className="px-2.5 py-2">Proxima cita</th>
                <th className="px-2.5 py-2">Costo consulta</th>
                <th className="px-2.5 py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((paciente) => (
                <tr
                  key={paciente.nombre}
                  className="border-b border-[#F5F2EB] text-[12.5px] dark:border-[#262A32]"
                >
                  <td className="px-2.5 py-2.5 font-semibold text-ink dark:text-ink-dark">
                    {paciente.nombre}
                  </td>
                  <td className="px-2.5 py-2.5">
                    <span className={clsx('pill', diagnosticoStyles[paciente.diagnostico])}>
                      {paciente.diagnostico}
                    </span>
                  </td>
                  <td className="px-2.5 py-2.5 text-ink dark:text-ink-dark">{paciente.glucosa}</td>
                  <td className="px-2.5 py-2.5 text-ink dark:text-ink-dark">{paciente.proximaCita}</td>
                  <td className="px-2.5 py-2.5 text-ink dark:text-ink-dark">{paciente.costoConsulta}</td>
                  <td className="px-2.5 py-2.5">
                    <span
                      className={clsx(
                        'inline-flex items-center gap-1.5 text-[11.5px] font-semibold',
                        paciente.estado === 'Confirmado'
                          ? 'text-brand-green-dark dark:text-brand-green'
                          : 'text-ink-muted dark:text-ink-muted-dark'
                      )}
                    >
                      <span
                        className={clsx(
                          'status-dot',
                          paciente.estado === 'Confirmado'
                            ? 'bg-brand-green-dark'
                            : 'bg-[#E4E0D6] dark:bg-[#2B2F38]'
                        )}
                      />
                      {paciente.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Tarjeta>
    </AuthenticatedLayout>
  );
}
