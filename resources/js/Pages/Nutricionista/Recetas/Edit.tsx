import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Plus, Trash2, Leaf } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Alerta from '@/Components/ui/alerta';
import { Boton, BotonLink } from '@/Components/ui/boton';
import { Campo, CampoSelect } from '@/Components/ui/campo';
import { Badge } from '@/Components/ui/badge';
import type { PageProps } from '@/types';

interface AlimentoOption {
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
  disponibilidad_temporal?: string | null;
}

interface IngredienteExistente {
  id_receta_alimento: number;
  id_alimento: number;
  nombre_alimento: string;
  cantidad: number;
  unidad: string;
  observaciones: string | null;
  calorias_preview: number;
  proteinas_preview: number;
  carbohidratos_preview: number;
  grasas_preview: number;
  fibra_preview: number;
  disponibilidad_temporal?: string | null;
}

interface Receta {
  id_receta: number;
  nombre: string;
  descripcion: string | null;
  tipo_comida: string;
  porciones: number;
  tiempo_preparacion_minutos: number | null;
  preparacion: string | null;
  observaciones: string | null;
  ingredientes: IngredienteExistente[];
}

interface Ingrediente {
  id_receta_alimento?: number;
  id_alimento: number;
  nombre_alimento: string;
  cantidad: number;
  unidad: string;
  observaciones: string;
  calorias_preview: number;
  proteinas_preview: number;
  carbohidratos_preview: number;
  grasas_preview: number;
  fibra_preview: number;
  disponibilidad_temporal?: string | null;
}

interface FormData {
  nombre: string;
  descripcion: string;
  tipo_comida: string;
  porciones: number | string;
  tiempo_preparacion_minutos: number | string;
  preparacion: string;
  observaciones: string;
  ingredientes: Ingrediente[];
}

interface Props extends PageProps {
  receta: Receta;
  alimentos: AlimentoOption[];
}

export default function Edit({ receta, alimentos, flash }: Props) {
  const initialIngredientes: Ingrediente[] = receta.ingredientes.map((ing) => ({
    id_receta_alimento: ing.id_receta_alimento,
    id_alimento: ing.id_alimento,
    nombre_alimento: ing.nombre_alimento,
    cantidad: ing.cantidad,
    unidad: ing.unidad,
    observaciones: ing.observaciones ?? '',
    calorias_preview: ing.calorias_preview,
    proteinas_preview: ing.proteinas_preview,
    carbohidratos_preview: ing.carbohidratos_preview,
    grasas_preview: ing.grasas_preview,
    fibra_preview: ing.fibra_preview,
    disponibilidad_temporal: ing.disponibilidad_temporal,
  }));

  const { data, setData, post, processing, errors } = useForm<FormData>({
    nombre: receta.nombre,
    descripcion: receta.descripcion ?? '',
    tipo_comida: receta.tipo_comida,
    porciones: receta.porciones,
    tiempo_preparacion_minutos: receta.tiempo_preparacion_minutos ?? '',
    preparacion: receta.preparacion ?? '',
    observaciones: receta.observaciones ?? '',
    ingredientes: initialIngredientes,
  });

  const [selAlimento, setSelAlimento] = useState('');
  const [selCantidad, setSelCantidad] = useState('');
  const [selUnidad, setSelUnidad] = useState('g');
  const [selObs, setSelObs] = useState('');

  function agregarIngrediente() {
    const alimento = alimentos.find((a) => a.id_alimento === Number(selAlimento));
    if (!alimento || !selCantidad) return;

    const cantidad = Number(selCantidad);
    const factor = cantidad / alimento.cantidad_base;

    const nuevo: Ingrediente = {
      id_alimento: alimento.id_alimento,
      nombre_alimento: alimento.nombre,
      cantidad,
      unidad: selUnidad,
      observaciones: selObs,
      calorias_preview: Math.round(alimento.calorias * factor * 100) / 100,
      proteinas_preview: Math.round(alimento.proteinas * factor * 100) / 100,
      carbohidratos_preview: Math.round(alimento.carbohidratos * factor * 100) / 100,
      grasas_preview: Math.round(alimento.grasas * factor * 100) / 100,
      fibra_preview: Math.round(alimento.fibra * factor * 100) / 100,
      disponibilidad_temporal: alimento.disponibilidad_temporal,
    };

    setData('ingredientes', [...data.ingredientes, nuevo]);
    setSelAlimento('');
    setSelCantidad('');
    setSelUnidad('g');
    setSelObs('');
  }

  function quitarIngrediente(index: number) {
    setData('ingredientes', data.ingredientes.filter((_, i) => i !== index));
  }

  const totales = data.ingredientes.reduce(
    (acc, ing) => ({
      calorias: acc.calorias + ing.calorias_preview,
      proteinas: acc.proteinas + ing.proteinas_preview,
      carbohidratos: acc.carbohidratos + ing.carbohidratos_preview,
      grasas: acc.grasas + ing.grasas_preview,
      fibra: acc.fibra + ing.fibra_preview,
    }),
    { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0, fibra: 0 }
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    post(`/nutricionista/recetas/${receta.id_receta}?_method=PUT`);
  }

  return (
    <AuthenticatedLayout title="Editar receta">
      <Head title="Editar receta" />

      <div className="space-y-5">
        {flash?.success && <Alerta tipo="success">{flash.success}</Alerta>}
        {flash?.error && <Alerta tipo="error">{flash.error}</Alerta>}

        <div className="card-elevated space-y-5 p-5">
          <div>
            <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">Editar receta</h3>
            <p className="mt-0.5 text-[11.5px] text-ink-muted dark:text-ink-muted-dark">
              Modifica los datos de la receta y sus ingredientes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos generales */}
            <fieldset className="space-y-4">
              <legend className="text-[13px] font-semibold text-ink dark:text-ink-dark">Datos generales</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                  label="Nombre"
                  value={data.nombre}
                  onChange={(e) => setData('nombre', e.target.value)}
                  error={errors.nombre}
                  required
                />
                <CampoSelect
                  label="Tipo de comida"
                  value={data.tipo_comida}
                  onChange={(e) => setData('tipo_comida', e.target.value)}
                  error={errors.tipo_comida}
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="desayuno">Desayuno</option>
                  <option value="media_manana">Media mañana</option>
                  <option value="almuerzo">Almuerzo</option>
                  <option value="merienda">Merienda</option>
                  <option value="cena">Cena</option>
                  <option value="colacion">Colación</option>
                </CampoSelect>
                <Campo
                  label="Porciones"
                  type="number"
                  min={1}
                  value={data.porciones}
                  onChange={(e) => setData('porciones', e.target.value)}
                  error={errors.porciones}
                  required
                />
                <Campo
                  label="Tiempo de preparación (min)"
                  type="number"
                  min={0}
                  value={data.tiempo_preparacion_minutos}
                  onChange={(e) => setData('tiempo_preparacion_minutos', e.target.value)}
                  error={errors.tiempo_preparacion_minutos}
                />
              </div>
              <label className="block">
                <span className="mb-1.5 block text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                  Descripción
                </span>
                <textarea
                  value={data.descripcion}
                  onChange={(e) => setData('descripcion', e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-surface-border bg-[#FAF9F6] px-3 py-2 text-[12.5px] text-ink outline-none transition-colors
                    focus:border-brand-green/50 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                />
                {errors.descripcion && (
                  <span className="mt-1 block text-[11px] text-category-fruits">{errors.descripcion}</span>
                )}
              </label>
            </fieldset>

            {/* Constructor de ingredientes */}
            <fieldset className="space-y-4">
              <legend className="text-[13px] font-semibold text-ink dark:text-ink-dark">Ingredientes</legend>

              <div className="grid gap-3 rounded-lg border border-surface-border p-4 dark:border-surface-border-dark sm:grid-cols-5">
                <CampoSelect
                  label="Alimento"
                  value={selAlimento}
                  onChange={(e) => setSelAlimento(e.target.value)}
                  wrapperClassName="sm:col-span-2"
                >
                  <option value="">Seleccionar alimento...</option>
                  {alimentos.map((a) => (
                    <option key={a.id_alimento} value={a.id_alimento}>
                      {a.nombre} ({a.grupo_alimentario})
                    </option>
                  ))}
                </CampoSelect>
                <Campo
                  label="Cantidad"
                  type="number"
                  min={0.1}
                  step="0.1"
                  value={selCantidad}
                  onChange={(e) => setSelCantidad(e.target.value)}
                />
                <CampoSelect
                  label="Unidad"
                  value={selUnidad}
                  onChange={(e) => setSelUnidad(e.target.value)}
                >
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="unidad">unidad</option>
                </CampoSelect>
                <div className="flex items-end">
                  <Boton
                    type="button"
                    variante="primary"
                    tamano="sm"
                    onClick={agregarIngrediente}
                    disabled={!selAlimento || !selCantidad}
                  >
                    <Plus size={14} strokeWidth={1.8} /> Agregar
                  </Boton>
                </div>
              </div>

              {data.ingredientes.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11.5px]">
                    <thead>
                      <tr className="border-b border-surface-border text-[10.5px] font-semibold uppercase tracking-wide text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark">
                        <th className="px-3 py-2">Alimento</th>
                        <th className="px-2 py-2 text-right">Cant</th>
                        <th className="px-2 py-2">Und</th>
                        <th className="px-2 py-2 text-right">Cal</th>
                        <th className="px-2 py-2 text-right">Prot</th>
                        <th className="px-2 py-2 text-right">Carb</th>
                        <th className="px-2 py-2 text-right">Gras</th>
                        <th className="px-2 py-2 text-right">Fibra</th>
                        <th className="px-2 py-2">Obs</th>
                        <th className="px-2 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border dark:divide-surface-border-dark">
                      {data.ingredientes.map((ing, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 font-medium text-ink dark:text-ink-dark">
                            <span className="flex items-center gap-1.5">
                              {ing.nombre_alimento}
                              {ing.disponibilidad_temporal === 'estacional' && (
                                <Badge color="orange">
                                  <Leaf size={10} strokeWidth={1.8} className="mr-0.5" />
                                  Estacional
                                </Badge>
                              )}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-right">{ing.cantidad}</td>
                          <td className="px-2 py-2">{ing.unidad}</td>
                          <td className="px-2 py-2 text-right">{ing.calorias_preview.toFixed(1)}</td>
                          <td className="px-2 py-2 text-right">{ing.proteinas_preview.toFixed(1)}</td>
                          <td className="px-2 py-2 text-right">{ing.carbohidratos_preview.toFixed(1)}</td>
                          <td className="px-2 py-2 text-right">{ing.grasas_preview.toFixed(1)}</td>
                          <td className="px-2 py-2 text-right">{ing.fibra_preview.toFixed(1)}</td>
                          <td className="px-2 py-2 text-ink-muted dark:text-ink-muted-dark">{ing.observaciones || '—'}</td>
                          <td className="px-2 py-2">
                            <button
                              type="button"
                              onClick={() => quitarIngrediente(i)}
                              className="flex h-6 w-6 items-center justify-center rounded text-ink-muted transition-colors
                                hover:bg-category-fruits/10 hover:text-category-fruits dark:text-ink-muted-dark"
                            >
                              <Trash2 size={13} strokeWidth={1.8} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-black/[0.02] font-semibold dark:bg-white/[0.02]">
                        <td className="px-3 py-2 text-ink dark:text-ink-dark" colSpan={3}>Totales</td>
                        <td className="px-2 py-2 text-right text-ink dark:text-ink-dark">{totales.calorias.toFixed(1)}</td>
                        <td className="px-2 py-2 text-right text-ink dark:text-ink-dark">{totales.proteinas.toFixed(1)}</td>
                        <td className="px-2 py-2 text-right text-ink dark:text-ink-dark">{totales.carbohidratos.toFixed(1)}</td>
                        <td className="px-2 py-2 text-right text-ink dark:text-ink-dark">{totales.grasas.toFixed(1)}</td>
                        <td className="px-2 py-2 text-right text-ink dark:text-ink-dark">{totales.fibra.toFixed(1)}</td>
                        <td colSpan={2}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {errors.ingredientes && (
                <span className="block text-[11px] text-category-fruits">{errors.ingredientes}</span>
              )}
            </fieldset>

            {/* Preparación y observaciones */}
            <fieldset className="space-y-4">
              <legend className="text-[13px] font-semibold text-ink dark:text-ink-dark">Preparación y observaciones</legend>
              <label className="block">
                <span className="mb-1.5 block text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                  Preparación
                </span>
                <textarea
                  value={data.preparacion}
                  onChange={(e) => setData('preparacion', e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-surface-border bg-[#FAF9F6] px-3 py-2 text-[12.5px] text-ink outline-none transition-colors
                    focus:border-brand-green/50 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                />
                {errors.preparacion && (
                  <span className="mt-1 block text-[11px] text-category-fruits">{errors.preparacion}</span>
                )}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                  Observaciones
                </span>
                <textarea
                  value={data.observaciones}
                  onChange={(e) => setData('observaciones', e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-surface-border bg-[#FAF9F6] px-3 py-2 text-[12.5px] text-ink outline-none transition-colors
                    focus:border-brand-green/50 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                />
                {errors.observaciones && (
                  <span className="mt-1 block text-[11px] text-category-fruits">{errors.observaciones}</span>
                )}
              </label>
            </fieldset>

            {/* Actions */}
            <div className="flex justify-end gap-2 border-t border-surface-border pt-5 dark:border-surface-border-dark">
              <BotonLink href="/nutricionista/recetas" variante="ghost">
                <ArrowLeft size={14} strokeWidth={1.8} /> Volver
              </BotonLink>
              <Boton type="submit" variante="primary" disabled={processing}>
                <Save size={14} strokeWidth={1.8} /> {processing ? 'Guardando...' : 'Guardar cambios'}
              </Boton>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
