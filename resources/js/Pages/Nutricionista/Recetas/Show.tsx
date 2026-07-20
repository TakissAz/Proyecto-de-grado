import { Head } from '@inertiajs/react';
import { ArrowLeft, SquarePen, Clock, Users, Leaf } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { BotonLink } from '@/Components/ui/boton';
import { Badge } from '@/Components/ui/badge';
import EstadoPill from '@/Components/ui/estado-pill';
import type { PageProps } from '@/types';

interface IngredienteDetalle {
  id_receta_alimento: number;
  id_alimento: number;
  nombre_alimento: string;
  grupo_alimentario: string;
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
  calorias_totales: number;
  proteinas_totales: number;
  carbohidratos_totales: number;
  grasas_totales: number;
  fibra_total: number;
  observaciones: string | null;
  estado: string;
  ingredientes: IngredienteDetalle[];
}

interface Props extends PageProps {
  receta: Receta;
}

const tipoComidaLabel: Record<string, string> = {
  desayuno: 'Desayuno',
  media_manana: 'Media mañana',
  almuerzo: 'Almuerzo',
  merienda: 'Merienda',
  cena: 'Cena',
  colacion: 'Colación',
};

export default function Show({ receta }: Props) {
  return (
    <AuthenticatedLayout title="Detalle de receta">
      <Head title={`${receta.nombre} - Receta`} />

      <div className="space-y-5">
        {/* Header card */}
        <div className="card-elevated p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-semibold text-ink dark:text-ink-dark">{receta.nombre}</h2>
                <EstadoPill activo={receta.estado === 'activo'} textoActivo="Activa" textoInactivo="Inactiva" />
              </div>
              {receta.descripcion && (
                <p className="mt-1 text-[12.5px] text-ink-muted dark:text-ink-muted-dark">
                  {receta.descripcion}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[11.5px] text-ink-muted dark:text-ink-muted-dark">
                <Badge color="blue">{tipoComidaLabel[receta.tipo_comida] ?? receta.tipo_comida}</Badge>
                <span className="flex items-center gap-1">
                  <Users size={13} strokeWidth={1.8} /> {receta.porciones} porción{receta.porciones !== 1 ? 'es' : ''}
                </span>
                {receta.tiempo_preparacion_minutos && (
                  <span className="flex items-center gap-1">
                    <Clock size={13} strokeWidth={1.8} /> {receta.tiempo_preparacion_minutos} min
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <BotonLink href="/nutricionista/recetas" variante="ghost">
                <ArrowLeft size={14} strokeWidth={1.8} /> Volver
              </BotonLink>
              <BotonLink href={`/nutricionista/recetas/${receta.id_receta}/edit`} variante="outline">
                <SquarePen size={14} strokeWidth={1.8} /> Editar
              </BotonLink>
            </div>
          </div>
        </div>

        {/* Resumen nutricional */}
        <div className="card-elevated p-5">
          <h3 className="mb-3 text-[13px] font-semibold text-ink dark:text-ink-dark">Resumen nutricional total</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="text-center">
              <p className="text-[18px] font-bold text-ink dark:text-ink-dark">{receta.calorias_totales}</p>
              <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Calorías</p>
            </div>
            <div className="text-center">
              <p className="text-[18px] font-bold text-ink dark:text-ink-dark">{receta.proteinas_totales}g</p>
              <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Proteínas</p>
            </div>
            <div className="text-center">
              <p className="text-[18px] font-bold text-ink dark:text-ink-dark">{receta.carbohidratos_totales}g</p>
              <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Carbohidratos</p>
            </div>
            <div className="text-center">
              <p className="text-[18px] font-bold text-ink dark:text-ink-dark">{receta.grasas_totales}g</p>
              <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Grasas</p>
            </div>
            <div className="text-center">
              <p className="text-[18px] font-bold text-ink dark:text-ink-dark">{receta.fibra_total}g</p>
              <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Fibra</p>
            </div>
          </div>
        </div>

        {/* Ingredientes */}
        <div className="card-elevated overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-[13px] font-semibold text-ink dark:text-ink-dark">Ingredientes</h3>
            <p className="mt-0.5 text-[11.5px] text-ink-muted dark:text-ink-muted-dark">
              {receta.ingredientes.length} ingrediente{receta.ingredientes.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11.5px]">
              <thead>
                <tr className="border-y border-surface-border text-[10.5px] font-semibold uppercase tracking-wide text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark">
                  <th className="px-5 py-2">Alimento</th>
                  <th className="px-3 py-2">Grupo</th>
                  <th className="px-3 py-2 text-right">Cant</th>
                  <th className="px-3 py-2">Und</th>
                  <th className="px-3 py-2 text-right">Cal</th>
                  <th className="px-3 py-2 text-right">Prot</th>
                  <th className="px-3 py-2 text-right">Carb</th>
                  <th className="px-3 py-2 text-right">Gras</th>
                  <th className="px-3 py-2 text-right">Fibra</th>
                  <th className="px-3 py-2">Disp.</th>
                  <th className="px-5 py-2">Obs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border dark:divide-surface-border-dark">
                {receta.ingredientes.map((ing) => (
                  <tr key={ing.id_receta_alimento}>
                    <td className="px-5 py-2.5 font-medium text-ink dark:text-ink-dark">{ing.nombre_alimento}</td>
                    <td className="px-3 py-2.5">
                      <Badge color="gray">{ing.grupo_alimentario}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right text-ink dark:text-ink-dark">{ing.cantidad}</td>
                    <td className="px-3 py-2.5 text-ink-muted dark:text-ink-muted-dark">{ing.unidad}</td>
                    <td className="px-3 py-2.5 text-right text-ink dark:text-ink-dark">{ing.calorias_preview.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-right text-ink dark:text-ink-dark">{ing.proteinas_preview.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-right text-ink dark:text-ink-dark">{ing.carbohidratos_preview.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-right text-ink dark:text-ink-dark">{ing.grasas_preview.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-right text-ink dark:text-ink-dark">{ing.fibra_preview.toFixed(1)}</td>
                    <td className="px-3 py-2.5">
                      {ing.disponibilidad_temporal === 'estacional' ? (
                        <Badge color="orange">
                          <Leaf size={10} strokeWidth={1.8} className="mr-0.5" />
                          Estacional
                        </Badge>
                      ) : (
                        <Badge color="green">Permanente</Badge>
                      )}
                    </td>
                    <td className="px-5 py-2.5 text-ink-muted dark:text-ink-muted-dark">{ing.observaciones || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Preparación */}
        {receta.preparacion && (
          <div className="card-elevated p-5">
            <h3 className="mb-2 text-[13px] font-semibold text-ink dark:text-ink-dark">Preparación</h3>
            <p className="whitespace-pre-line text-[12.5px] text-ink dark:text-ink-dark">{receta.preparacion}</p>
          </div>
        )}

        {/* Observaciones */}
        {receta.observaciones && (
          <div className="card-elevated p-5">
            <h3 className="mb-2 text-[13px] font-semibold text-ink dark:text-ink-dark">Observaciones</h3>
            <p className="whitespace-pre-line text-[12.5px] text-ink-muted dark:text-ink-muted-dark">{receta.observaciones}</p>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
