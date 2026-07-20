import { useEffect, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import clsx from 'clsx';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Alerta from '@/Components/ui/alerta';
import { Boton } from '@/Components/ui/boton';
import { Badge } from '@/Components/ui/badge';
import ModalCrearReceta from '@/Components/Nutricion/Recetas/ModalCrearReceta';
import ModalVerReceta, { type RecetaDetalle } from '@/Components/Nutricion/Recetas/ModalVerReceta';
import ModalEditarReceta from '@/Components/Nutricion/Recetas/ModalEditarReceta';
import type { AlimentoOpcion } from '@/Components/Nutricion/Recetas/BuscadorIngredientes';
import type { PageProps } from '@/types';
import {
  Plus, Search, X, SquarePen, Eye, Filter,
  Flame, Power, PowerOff, CookingPot,
} from 'lucide-react';

export interface RecetaRow {
  id_receta: number;
  nombre: string;
  descripcion: string | null;
  tipo_comida: string;
  porciones: number;
  tiempo_preparacion_minutos: number | null;
  calorias_totales: number;
  proteinas_totales: number;
  carbohidratos_totales: number;
  grasas_totales: number;
  fibra_total: number;
  observaciones: string | null;
  estado: string;
  created_at: string;
  updated_at: string;
}

interface PaginatedRecetas {
  data: RecetaRow[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

interface Props extends PageProps {
  recetas: PaginatedRecetas;
  filtros: { buscar: string; estado: string };
  alimentos?: AlimentoOpcion[];
}

const tipoComidaLabel: Record<string, string> = {
  desayuno: 'Desayuno',
  media_manana: 'Media manana',
  almuerzo: 'Almuerzo',
  merienda: 'Merienda',
  cena: 'Cena',
  colacion: 'Colacion',
};

const tipoComidaColor: Record<string, string> = {
  desayuno: 'orange',
  media_manana: 'green',
  almuerzo: 'blue',
  merienda: 'purple',
  cena: 'gray',
  colacion: 'green',
};

export default function Index({ recetas, filtros, flash, alimentos }: Props) {
  const [buscar, setBuscar] = useState(filtros.buscar ?? '');
  const [estado, setEstado] = useState(filtros.estado ?? '');
  const [modalCrear, setModalCrear] = useState(false);
  const [modalVer, setModalVer] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [recetaDetalle, setRecetaDetalle] = useState<RecetaDetalle | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const buscarRef = useRef(buscar);
  const estadoRef = useRef(estado);
  buscarRef.current = buscar;
  estadoRef.current = estado;

  useEffect(() => {
    setBuscar(filtros.buscar ?? '');
    setEstado(filtros.estado ?? '');
  }, [filtros.buscar, filtros.estado]);

  async function cargarReceta(idReceta: number, modo: 'ver' | 'editar') {
    setCargandoDetalle(true);
    setRecetaDetalle(null);

    if (modo === 'ver') setModalVer(true);
    else setModalEditar(true);

    try {
      const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
      const res = await fetch(`/nutricionista/recetas/${idReceta}`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrfToken,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setRecetaDetalle(data);
      }
    } catch {
      // silently handle
    } finally {
      setCargandoDetalle(false);
    }
  }

  function cerrarModalVer() {
    setModalVer(false);
    setRecetaDetalle(null);
  }

  function cerrarModalEditar() {
    setModalEditar(false);
    setRecetaDetalle(null);
  }

  function handleRecetaEditada() {
    cerrarModalEditar();
    window.location.reload();
  }

  function aplicarFiltros(pagina = 1, estadoOverride?: string) {
    const params = new URLSearchParams();
    if (buscarRef.current) params.set('buscar', buscarRef.current);
    const est = estadoOverride !== undefined ? estadoOverride : estadoRef.current;
    if (est) params.set('estado', est);
    params.set('page', String(pagina));
    window.location.href = `/nutricionista/recetas?${params.toString()}`;
  }

  function limpiarFiltros() {
    setBuscar('');
    setEstado('');
    window.location.href = '/nutricionista/recetas';
  }

  function cambiarEstado(idReceta: number, accion: 'activar' | 'inactivar') {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/nutricionista/recetas/${idReceta}/${accion}`;
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
    <AuthenticatedLayout title="Recetas">
      <Head title="Recetas - Nutricionista" />

      <div className="space-y-5">
        {flash?.success && <Alerta tipo="success">{flash.success}</Alerta>}
        {flash?.error && <Alerta tipo="error">{flash.error}</Alerta>}

        <div className="card-elevated overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 pb-4 pt-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">Lista de Recetas</h3>
                <p className="mt-0.5 text-[11.5px] text-ink-muted dark:text-ink-muted-dark">
                  {recetas.meta.total} receta{recetas.meta.total !== 1 ? 's' : ''} registrada{recetas.meta.total !== 1 ? 's' : ''}
                </p>
              </div>
              <Boton variante="primary" tamano="md" onClick={() => setModalCrear(true)}>
                <Plus size={14} strokeWidth={1.8} /> Nueva receta
              </Boton>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
              {/* Tabs de estado */}
              <div className="flex gap-4 border-b border-surface-border text-[12.5px] dark:border-surface-border-dark">
                <button type="button" onClick={() => { setEstado(''); aplicarFiltros(1, ''); }} className={clsx('pb-2 font-semibold transition-colors', !estado ? 'border-b-2 border-brand-green-dark text-brand-green-dark dark:border-brand-green dark:text-brand-green' : 'text-ink-muted hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark')}>
                  Todos
                </button>
                <button type="button" onClick={() => { setEstado('activo'); aplicarFiltros(1, 'activo'); }} className={clsx('pb-2 font-semibold transition-colors', estado === 'activo' ? 'border-b-2 border-brand-green-dark text-brand-green-dark dark:border-brand-green dark:text-brand-green' : 'text-ink-muted hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark')}>
                  Activas
                </button>
                <button type="button" onClick={() => { setEstado('inactivo'); aplicarFiltros(1, 'inactivo'); }} className={clsx('pb-2 font-semibold transition-colors', estado === 'inactivo' ? 'border-b-2 border-brand-green-dark text-brand-green-dark dark:border-brand-green dark:text-brand-green' : 'text-ink-muted hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark')}>
                  Inactivas
                </button>
              </div>

              {/* Buscador + Filtrar */}
              <form onSubmit={(e) => { e.preventDefault(); aplicarFiltros(1); }} className="flex items-center gap-2.5">
                <div className="relative">
                  <Search size={14} strokeWidth={1.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted dark:text-ink-muted-dark" />
                  <input
                    placeholder="Buscar receta..."
                    value={buscar}
                    onChange={(e) => setBuscar(e.target.value)}
                    className="w-[200px] rounded-lg border border-surface-border bg-[#FAF9F6] py-1.5 pl-8 pr-3 text-xs text-ink outline-none focus:border-brand-green/40 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                  />
                </div>
                <button type="submit" className="flex items-center gap-1 rounded-lg border border-surface-border px-3 py-1.5 text-xs text-ink transition-colors hover:border-brand-green/30 dark:border-surface-border-dark dark:text-ink-dark">
                  <Filter size={12} strokeWidth={1.8} /> Filtrar
                </button>
                {buscar && (
                  <button type="button" onClick={limpiarFiltros} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-ink-muted transition-colors hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark">
                    <X size={12} strokeWidth={1.8} /> Limpiar
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Tabla */}
          {recetas.data.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
              <CookingPot size={28} strokeWidth={1.2} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
              <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark">No se encontraron recetas</p>
              <p className="text-[11px] text-ink-muted/60 dark:text-ink-muted-dark/60">Crea tu primera receta con el boton de arriba</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className="border-b border-surface-border text-left text-[11px] font-semibold text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark">
                    <th className="px-5 py-2.5">Nombre</th>
                    <th className="px-3 py-2.5">Tipo</th>
                    <th className="px-3 py-2.5 text-right">Calorias</th>
                    <th className="px-3 py-2.5 text-right">Porciones</th>
                    <th className="px-3 py-2.5 text-right">Tiempo</th>
                    <th className="px-5 py-2.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {recetas.data.map((receta, idx) => (
                    <tr
                      key={receta.id_receta}
                      className={clsx(
                        'border-b border-[#F5F2EB] transition-colors hover:bg-[#FAFAF8] dark:border-[#262A32] dark:hover:bg-white/[0.02]',
                        idx % 2 !== 0 && 'bg-[#FDFCFA] dark:bg-[#1A1D24]',
                        receta.estado === 'inactivo' && 'opacity-50'
                      )}
                    >
                      <td className="px-5 py-3 text-[12.5px] font-semibold text-ink dark:text-ink-dark">{receta.nombre}</td>
                      <td className="px-3 py-3">
                        <Badge color={(tipoComidaColor[receta.tipo_comida] ?? 'gray') as any}>
                          {tipoComidaLabel[receta.tipo_comida] ?? receta.tipo_comida}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ink dark:text-ink-dark">
                          <Flame size={11} strokeWidth={1.8} className="text-brand-orange" />
                          {Number(receta.calorias_totales).toFixed(0)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right text-[12.5px] text-ink dark:text-ink-dark">{receta.porciones}</td>
                      <td className="px-3 py-3 text-right text-[12.5px] text-ink-muted dark:text-ink-muted-dark">
                        {receta.tiempo_preparacion_minutos ? `${receta.tiempo_preparacion_minutos} min` : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => cargarReceta(receta.id_receta, 'ver')} title="Ver" className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-brand-green-soft hover:text-brand-green-dark dark:text-ink-muted-dark dark:hover:bg-brand-green-dark/20 dark:hover:text-brand-green">
                            <Eye size={14} strokeWidth={1.8} />
                          </button>
                          <button type="button" onClick={() => cargarReceta(receta.id_receta, 'editar')} title="Editar" className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-brand-orange/10 hover:text-brand-orange dark:text-ink-muted-dark">
                            <SquarePen size={14} strokeWidth={1.8} />
                          </button>
                          {receta.estado === 'inactivo' ? (
                            <button type="button" title="Activar" onClick={() => cambiarEstado(receta.id_receta, 'activar')} className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-brand-green-soft hover:text-brand-green-dark dark:text-ink-muted-dark dark:hover:bg-brand-green-dark/20 dark:hover:text-brand-green">
                              <Power size={14} strokeWidth={1.8} />
                            </button>
                          ) : (
                            <button type="button" title="Inactivar" onClick={() => cambiarEstado(receta.id_receta, 'inactivar')} className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-category-fruits/10 hover:text-category-fruits dark:text-ink-muted-dark">
                              <PowerOff size={14} strokeWidth={1.8} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginacion */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-surface-border px-5 py-3.5 dark:border-surface-border-dark sm:flex-row">
            <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark">
              Mostrando {recetas.data.length} de {recetas.meta.total} recetas
            </p>
            {recetas.meta.last_page > 1 && (
              <div className="flex items-center gap-1">
                {Array.from({ length: recetas.meta.last_page }, (_, i) => (
                  <button key={i} type="button" onClick={() => aplicarFiltros(i + 1)} className={clsx('flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-semibold transition-colors', recetas.meta.current_page === i + 1 ? 'bg-brand-green text-white' : 'text-ink-muted hover:bg-[#F5F3EE] dark:text-ink-muted-dark dark:hover:bg-white/[0.04]')}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ModalCrearReceta abierto={modalCrear} alimentos={alimentos ?? []} onCerrar={() => setModalCrear(false)} />
      <ModalVerReceta abierto={modalVer} receta={recetaDetalle} cargando={cargandoDetalle} onCerrar={cerrarModalVer} />
      <ModalEditarReceta abierto={modalEditar} receta={recetaDetalle} cargando={cargandoDetalle} alimentos={alimentos ?? []} onCerrar={cerrarModalEditar} onGuardado={handleRecetaEditada} />
    </AuthenticatedLayout>
  );
}
