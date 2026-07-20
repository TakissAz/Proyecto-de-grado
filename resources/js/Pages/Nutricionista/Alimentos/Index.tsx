import { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import clsx from 'clsx';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Alerta from '@/Components/ui/alerta';
import { BotonLink } from '@/Components/ui/boton';
import { Badge } from '@/Components/ui/badge';
import EstadoPill from '@/Components/ui/estado-pill';
import type { PageProps } from '@/types';
import { Plus, Search, X, SquarePen, CheckCircle2, Filter } from 'lucide-react';

export interface AlimentoRow {
  id_alimento: number;
  nombre: string;
  grupo_alimentario: string;
  unidad_base: string;
  cantidad_base: number;
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  fibra: number;
  indice_glucemico: number | null;
  disponibilidad_temporal: string | null;
  temporada_escasez: string | null;
  mensaje_disponibilidad: string | null;
  observaciones: string | null;
  estado: string;
  created_at: string;
  updated_at: string;
}

interface PaginatedAlimentos {
  data: AlimentoRow[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

interface Props extends PageProps {
  alimentos: PaginatedAlimentos;
  filtros: { buscar: string; estado: string };
}

export default function Index({ alimentos, filtros, flash }: Props) {
  const [buscar, setBuscar] = useState(filtros.buscar ?? '');
  const [estado, setEstado] = useState(filtros.estado ?? '');
  const buscarRef = useRef(buscar);
  const estadoRef = useRef(estado);
  buscarRef.current = buscar;
  estadoRef.current = estado;

  useEffect(() => {
    setBuscar(filtros.buscar ?? '');
    setEstado(filtros.estado ?? '');
  }, [filtros.buscar, filtros.estado]);

  function aplicarFiltros(pagina = 1) {
    const params = new URLSearchParams();
    if (buscarRef.current) params.set('buscar', buscarRef.current);
    if (estadoRef.current) params.set('estado', estadoRef.current);
    params.set('page', String(pagina));
    window.location.href = `/nutricionista/alimentos?${params.toString()}`;
  }

  function limpiarFiltros() {
    setBuscar('');
    setEstado('');
    window.location.href = '/nutricionista/alimentos';
  }

  function cambiarEstado(idAlimento: number, accion: 'activar' | 'inactivar') {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/nutricionista/alimentos/${idAlimento}/${accion}`;
    form.style.display = 'none';

    const csrf = document.createElement('input');
    csrf.name = '_token';
    csrf.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

    const method = document.createElement('input');
    method.name = '_method';
    method.value = 'PATCH';

    form.append(csrf, method);
    document.body.appendChild(form);
    form.submit();
  }

  return (
    <AuthenticatedLayout title="Alimentos">
      <Head title="Alimentos - Nutricionista" />

      <div className="space-y-5">
        {flash?.success && <Alerta tipo="success">{flash.success}</Alerta>}
        {flash?.error && <Alerta tipo="error">{flash.error}</Alerta>}

        <div className="card-elevated overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 pb-4 pt-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">
                  Catálogo de Alimentos
                </h3>
                <p className="mt-0.5 text-[11.5px] text-ink-muted dark:text-ink-muted-dark">
                  {alimentos.meta.total} alimento{alimentos.meta.total !== 1 ? 's' : ''} registrado{alimentos.meta.total !== 1 ? 's' : ''}
                </p>
              </div>

              <BotonLink href="/nutricionista/alimentos/create" variante="primary" tamano="md">
                <Plus size={14} strokeWidth={1.8} /> Nuevo alimento
              </BotonLink>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); aplicarFiltros(1); }}
              className="flex flex-wrap items-end gap-2.5"
            >
              <div className="relative">
                <Search
                  size={14}
                  strokeWidth={1.8}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted dark:text-ink-muted-dark"
                />
                <input
                  placeholder="Buscar alimento..."
                  value={buscar}
                  onChange={(e) => setBuscar(e.target.value)}
                  className="w-[200px] rounded-lg border border-surface-border bg-[#FAF9F6] py-1.5 pl-8 pr-3
                    text-xs text-ink outline-none focus:border-brand-green/40
                    dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                />
              </div>

              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="rounded-lg border border-surface-border bg-[#FAF9F6] px-3 py-1.5
                  text-xs text-ink outline-none focus:border-brand-green/40
                  dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>

              <button
                type="submit"
                className="flex items-center gap-1 rounded-lg border border-surface-border px-3 py-1.5
                  text-xs text-ink transition-colors hover:border-brand-green/30
                  dark:border-surface-border-dark dark:text-ink-dark"
              >
                <Filter size={12} strokeWidth={1.8} /> Filtrar
              </button>

              {(buscar || estado) && (
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-ink-muted
                    transition-colors hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark"
                >
                  <X size={12} strokeWidth={1.8} /> Limpiar
                </button>
              )}
            </form>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-y border-surface-border text-[11px] font-semibold uppercase tracking-wide text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark">
                  <th className="px-5 py-3">Nombre</th>
                  <th className="px-3 py-3">Grupo</th>
                  <th className="px-3 py-3">Unidad</th>
                  <th className="px-3 py-3 text-right">Cal</th>
                  <th className="px-3 py-3 text-right">Prot</th>
                  <th className="px-3 py-3 text-right">Carb</th>
                  <th className="px-3 py-3 text-right">Gras</th>
                  <th className="px-3 py-3 text-right">IG</th>
                  <th className="px-3 py-3">Disp.</th>
                  <th className="px-3 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border dark:divide-surface-border-dark">
                {alimentos.data.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-5 py-8 text-center text-[12px] text-ink-muted dark:text-ink-muted-dark">
                      No se encontraron alimentos.
                    </td>
                  </tr>
                ) : (
                  alimentos.data.map((alimento) => (
                    <tr key={alimento.id_alimento} className="transition-colors hover:bg-black/[0.01] dark:hover:bg-white/[0.02]">
                      <td className="px-5 py-3 font-medium text-ink dark:text-ink-dark">{alimento.nombre}</td>
                      <td className="px-3 py-3">
                        <Badge color="gray">{alimento.grupo_alimentario}</Badge>
                      </td>
                      <td className="px-3 py-3 text-ink-muted dark:text-ink-muted-dark">
                        {alimento.cantidad_base} {alimento.unidad_base}
                      </td>
                      <td className="px-3 py-3 text-right text-ink dark:text-ink-dark">{alimento.calorias}</td>
                      <td className="px-3 py-3 text-right text-ink dark:text-ink-dark">{alimento.proteinas}</td>
                      <td className="px-3 py-3 text-right text-ink dark:text-ink-dark">{alimento.carbohidratos}</td>
                      <td className="px-3 py-3 text-right text-ink dark:text-ink-dark">{alimento.grasas}</td>
                      <td className="px-3 py-3 text-right text-ink-muted dark:text-ink-muted-dark">
                        {alimento.indice_glucemico ?? '—'}
                      </td>
                      <td className="px-3 py-3">
                        {alimento.disponibilidad_temporal === 'estacional' ? (
                          <Badge color="orange">Estacional</Badge>
                        ) : (
                          <Badge color="green">Permanente</Badge>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <EstadoPill activo={alimento.estado === 'activo'} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/nutricionista/alimentos/${alimento.id_alimento}/edit`}
                            title="Editar"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors
                              hover:bg-brand-orange/10 hover:text-brand-orange dark:text-ink-muted-dark"
                          >
                            <SquarePen size={14} strokeWidth={1.8} />
                          </Link>

                          {alimento.estado === 'inactivo' ? (
                            <button
                              type="button"
                              title="Activar"
                              onClick={() => cambiarEstado(alimento.id_alimento, 'activar')}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors
                                hover:bg-brand-green-soft hover:text-brand-green-dark
                                dark:text-ink-muted-dark dark:hover:bg-brand-green-dark/20 dark:hover:text-brand-green"
                            >
                              <CheckCircle2 size={14} strokeWidth={1.8} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              title="Inactivar"
                              onClick={() => cambiarEstado(alimento.id_alimento, 'inactivar')}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors
                                hover:bg-category-fruits/10 hover:text-category-fruits dark:text-ink-muted-dark"
                            >
                              <X size={14} strokeWidth={1.8} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-surface-border px-5 py-3.5 dark:border-surface-border-dark sm:flex-row">
            <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark">
              Mostrando {alimentos.data.length} de {alimentos.meta.total} alimentos
            </p>

            {alimentos.meta.last_page > 1 && (
              <div className="flex items-center gap-1">
                {Array.from({ length: alimentos.meta.last_page }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => aplicarFiltros(i + 1)}
                    className={clsx(
                      'flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-semibold transition-colors',
                      alimentos.meta.current_page === i + 1
                        ? 'bg-brand-green text-white'
                        : 'text-ink-muted hover:bg-[#F5F3EE] dark:text-ink-muted-dark dark:hover:bg-white/[0.04]'
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
