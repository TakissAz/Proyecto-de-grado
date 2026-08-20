import { useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import clsx from 'clsx';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Alerta from '@/Components/ui/alerta';
import { BotonLink } from '@/Components/ui/boton';
import { Badge } from '@/Components/ui/badge';
import EstadoPill from '@/Components/ui/estado-pill';
import type { PageProps } from '@/types';
import { Plus, Search, X, SquarePen, CheckCircle2, Filter, ChevronLeft, ChevronRight, Leaf, Wheat, Apple, Fish, Milk, Drumstick, PackageOpen } from 'lucide-react';

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
  const [grupoCarrusel, setGrupoCarrusel] = useState('todos');
  const [indiceActivo, setIndiceActivo] = useState(0);
  const inicioSwipe = useRef<number | null>(null);
  buscarRef.current = buscar;
  estadoRef.current = estado;

  useEffect(() => {
    setBuscar(filtros.buscar ?? '');
    setEstado(filtros.estado ?? '');
  }, [filtros.buscar, filtros.estado]);

  const grupos = useMemo(
    () => [...new Set(alimentos.data.map((alimento) => alimento.grupo_alimentario).filter(Boolean))],
    [alimentos.data],
  );
  const alimentosCarrusel = useMemo(
    () => grupoCarrusel === 'todos'
      ? alimentos.data
      : alimentos.data.filter((alimento) => alimento.grupo_alimentario === grupoCarrusel),
    [alimentos.data, grupoCarrusel],
  );

  useEffect(() => {
    setIndiceActivo(0);
  }, [grupoCarrusel, alimentosCarrusel.length]);

  function moverCarrusel(direccion: number) {
    if (alimentosCarrusel.length < 2) return;
    setIndiceActivo((indice) => (indice + direccion + alimentosCarrusel.length) % alimentosCarrusel.length);
  }

  function iconoGrupo(grupo: string) {
    const nombre = grupo.toLowerCase();
    if (nombre.includes('fruta')) return Apple;
    if (nombre.includes('verdura') || nombre.includes('vegetal')) return Leaf;
    if (nombre.includes('cereal') || nombre.includes('grano')) return Wheat;
    if (nombre.includes('pescado') || nombre.includes('marisco')) return Fish;
    if (nombre.includes('lácteo') || nombre.includes('lacteo')) return Milk;
    if (nombre.includes('carne') || nombre.includes('prote')) return Drumstick;
    return PackageOpen;
  }

  function fondoGrupo(grupo: string) {
    const nombre = grupo.toLowerCase();
    if (nombre.includes('fruta')) return 'linear-gradient(155deg, #f7a542 0%, #d85d2d 52%, #7d2d24 100%)';
    if (nombre.includes('verdura') || nombre.includes('vegetal')) return 'linear-gradient(155deg, #8abf5b 0%, #377c47 52%, #153d2a 100%)';
    if (nombre.includes('cereal') || nombre.includes('grano')) return 'linear-gradient(155deg, #f2ce69 0%, #b17a31 52%, #69411f 100%)';
    if (nombre.includes('pescado') || nombre.includes('marisco')) return 'linear-gradient(155deg, #57b7d8 0%, #22739c 52%, #163a62 100%)';
    if (nombre.includes('lácteo') || nombre.includes('lacteo')) return 'linear-gradient(155deg, #a5cae0 0%, #6285a4 52%, #344d75 100%)';
    if (nombre.includes('carne') || nombre.includes('prote')) return 'linear-gradient(155deg, #d87767 0%, #9f3d42 52%, #542234 100%)';
    return 'linear-gradient(155deg, #849ca6 0%, #466575 52%, #233744 100%)';
  }

  function estiloPanel(posicion: number): React.CSSProperties {
    const distancia = Math.abs(posicion);
    const lado = posicion < 0 ? -1 : 1;
    return {
      transform: `translateX(${posicion * 35}%) translateZ(${-distancia * 145}px) rotateY(${lado * -44}deg) scale(${Math.max(0.54, 1 - distancia * 0.18)})`,
      opacity: Math.max(0, 1 - distancia * 0.3),
      zIndex: 20 - distancia,
      pointerEvents: distancia > 3 ? 'none' : 'auto',
    };
  }

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

        <section
          className="relative isolate overflow-hidden rounded-2xl bg-[#101512] px-4 pb-5 pt-5 shadow-[0_18px_45px_rgba(16,24,20,0.2)] sm:px-6"
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') moverCarrusel(-1);
            if (event.key === 'ArrowRight') moverCarrusel(1);
          }}
          tabIndex={0}
          aria-label="Carrusel de productos disponibles"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_75%,rgba(105,177,95,0.24),transparent_40%),linear-gradient(180deg,#424842_0%,#1c211d_52%,#080a09_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-200/75">Catálogo nutricional</p>
              <h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">Productos disponibles</h2>
              <p className="mt-1 text-xs text-white/60">Explora cada alimento y su información nutricional.</p>
            </div>
            <label className="shrink-0">
              <span className="sr-only">Seleccionar categoría</span>
              <select
                value={grupoCarrusel}
                onChange={(event) => setGrupoCarrusel(event.target.value)}
                className="rounded-md border border-white/25 bg-black/30 px-3 py-2 text-xs font-medium text-white outline-none transition hover:bg-black/45 focus:border-white/70"
              >
                <option value="todos">Todas las categorías</option>
                {grupos.map((grupo) => <option key={grupo} value={grupo}>{grupo}</option>)}
              </select>
            </label>
          </div>

          <div
            className="relative z-10 mx-auto mt-2 h-[310px] max-w-6xl touch-pan-y overflow-hidden [perspective:1050px] sm:h-[340px]"
            onTouchStart={(event) => { inicioSwipe.current = event.touches[0].clientX; }}
            onTouchEnd={(event) => {
              const inicio = inicioSwipe.current;
              const final = event.changedTouches[0]?.clientX;
              inicioSwipe.current = null;
              if (inicio !== null && final !== undefined && Math.abs(final - inicio) > 42) moverCarrusel(final < inicio ? 1 : -1);
            }}
          >
            {alimentosCarrusel.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-white/65">No hay productos en esta categoría.</div>
            ) : alimentosCarrusel.map((alimento, indice) => {
              let posicion = indice - indiceActivo;
              if (posicion > alimentosCarrusel.length / 2) posicion -= alimentosCarrusel.length;
              if (posicion < -alimentosCarrusel.length / 2) posicion += alimentosCarrusel.length;
              const Icono = iconoGrupo(alimento.grupo_alimentario);
              const esCentral = posicion === 0;
              return (
                <button
                  key={alimento.id_alimento}
                  type="button"
                  onClick={() => setIndiceActivo(indice)}
                  aria-label={`Ver ${alimento.nombre}`}
                  className="absolute left-1/2 top-8 h-[225px] w-[178px] -translate-x-1/2 overflow-hidden rounded-sm border-[3px] border-white/90 text-left shadow-2xl transition-[transform,opacity] duration-500 ease-out sm:top-5 sm:h-[260px] sm:w-[210px]"
                  style={estiloPanel(posicion)}
                >
                  <div className="absolute inset-0" style={{ background: fondoGrupo(alimento.grupo_alimentario) }} />
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.23),transparent_42%)]" />
                  <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-lime-200/25 blur-2xl" />
                  <div className="relative flex h-full flex-col items-center justify-center px-4 text-center text-white">
                    <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/15 shadow-lg backdrop-blur-sm">
                      <Icono size={29} strokeWidth={1.5} />
                    </span>
                    <p className="text-lg font-semibold leading-tight">{alimento.nombre}</p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/75">{alimento.grupo_alimentario}</p>
                  </div>
                  {esCentral && (
                    <div className="absolute inset-x-0 bottom-0 bg-[#092e25]/85 px-2 py-2 text-center text-[9px] font-bold uppercase tracking-[0.08em] text-white">
                      {alimento.calorias} kcal · {alimento.proteinas} g proteína
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative z-20 -mt-2 flex items-center justify-center gap-3">
            <button type="button" onClick={() => moverCarrusel(-1)} aria-label="Producto anterior" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white transition hover:bg-white/20"><ChevronLeft size={17} /></button>
            <div className="flex gap-1.5">
              {alimentosCarrusel.slice(0, 8).map((alimento, indice) => <button key={alimento.id_alimento} type="button" onClick={() => setIndiceActivo(indice)} aria-label={`Ir a ${alimento.nombre}`} className={clsx('h-1.5 rounded-full transition-all', indice === indiceActivo ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70')} />)}
            </div>
            <button type="button" onClick={() => moverCarrusel(1)} aria-label="Producto siguiente" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white transition hover:bg-white/20"><ChevronRight size={17} /></button>
          </div>
        </section>

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
