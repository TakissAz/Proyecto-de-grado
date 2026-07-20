import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Alerta from '@/Components/ui/alerta';
import { Boton, BotonLink } from '@/Components/ui/boton';
import { Campo, CampoSelect } from '@/Components/ui/campo';
import type { PageProps } from '@/types';

interface FormData {
  nombre: string;
  grupo_alimentario: string;
  unidad_base: string;
  cantidad_base: number | string;
  calorias: number | string;
  proteinas: number | string;
  carbohidratos: number | string;
  grasas: number | string;
  fibra: number | string;
  indice_glucemico: number | string;
  observaciones: string;
}

export default function Create({ flash }: PageProps) {
  const { data, setData, post, processing, errors } = useForm<FormData>({
    nombre: '',
    grupo_alimentario: '',
    unidad_base: 'g',
    cantidad_base: 100,
    calorias: '',
    proteinas: '',
    carbohidratos: '',
    grasas: '',
    fibra: '',
    indice_glucemico: '',
    observaciones: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    post('/nutricionista/alimentos');
  }

  return (
    <AuthenticatedLayout title="Registrar alimento">
      <Head title="Registrar alimento" />

      <div className="space-y-5">
        {flash?.success && <Alerta tipo="success">{flash.success}</Alerta>}
        {flash?.error && <Alerta tipo="error">{flash.error}</Alerta>}

        <div className="card-elevated space-y-5 p-5">
          <div>
            <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">Nuevo alimento</h3>
            <p className="mt-0.5 text-[11.5px] text-ink-muted dark:text-ink-muted-dark">
              Completa la información nutricional del alimento.
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
                  label="Grupo alimentario"
                  value={data.grupo_alimentario}
                  onChange={(e) => setData('grupo_alimentario', e.target.value)}
                  error={errors.grupo_alimentario}
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="proteina">Proteína</option>
                  <option value="carbohidrato">Carbohidrato</option>
                  <option value="verdura">Verdura</option>
                  <option value="fruta">Fruta</option>
                  <option value="lacteo">Lácteo</option>
                  <option value="grasa">Grasa</option>
                  <option value="legumbre">Legumbre</option>
                  <option value="semilla">Semilla</option>
                  <option value="bebida">Bebida</option>
                  <option value="otro">Otro</option>
                </CampoSelect>
                <CampoSelect
                  label="Unidad base"
                  value={data.unidad_base}
                  onChange={(e) => setData('unidad_base', e.target.value)}
                  error={errors.unidad_base}
                  required
                >
                  <option value="g">Gramos (g)</option>
                  <option value="ml">Mililitros (ml)</option>
                  <option value="unidad">Unidad</option>
                </CampoSelect>
                <Campo
                  label="Cantidad base"
                  type="number"
                  min={1}
                  step="0.01"
                  value={data.cantidad_base}
                  onChange={(e) => setData('cantidad_base', e.target.value)}
                  error={errors.cantidad_base}
                  required
                />
              </div>
            </fieldset>

            {/* Valores nutricionales */}
            <fieldset className="space-y-4">
              <legend className="text-[13px] font-semibold text-ink dark:text-ink-dark">Valores nutricionales</legend>
              <div className="grid gap-4 sm:grid-cols-3">
                <Campo
                  label="Calorías (kcal)"
                  type="number"
                  min={0}
                  step="0.01"
                  value={data.calorias}
                  onChange={(e) => setData('calorias', e.target.value)}
                  error={errors.calorias}
                  required
                />
                <Campo
                  label="Proteínas (g)"
                  type="number"
                  min={0}
                  step="0.01"
                  value={data.proteinas}
                  onChange={(e) => setData('proteinas', e.target.value)}
                  error={errors.proteinas}
                  required
                />
                <Campo
                  label="Carbohidratos (g)"
                  type="number"
                  min={0}
                  step="0.01"
                  value={data.carbohidratos}
                  onChange={(e) => setData('carbohidratos', e.target.value)}
                  error={errors.carbohidratos}
                  required
                />
                <Campo
                  label="Grasas (g)"
                  type="number"
                  min={0}
                  step="0.01"
                  value={data.grasas}
                  onChange={(e) => setData('grasas', e.target.value)}
                  error={errors.grasas}
                  required
                />
                <Campo
                  label="Fibra (g)"
                  type="number"
                  min={0}
                  step="0.01"
                  value={data.fibra}
                  onChange={(e) => setData('fibra', e.target.value)}
                  error={errors.fibra}
                />
                <Campo
                  label="Índice glucémico"
                  type="number"
                  min={0}
                  max={100}
                  step="1"
                  value={data.indice_glucemico}
                  onChange={(e) => setData('indice_glucemico', e.target.value)}
                  error={errors.indice_glucemico}
                />
              </div>
            </fieldset>

            {/* Observaciones */}
            <fieldset className="space-y-4">
              <legend className="text-[13px] font-semibold text-ink dark:text-ink-dark">Observaciones</legend>
              <label className="block">
                <span className="mb-1.5 block text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                  Observaciones
                </span>
                <textarea
                  value={data.observaciones}
                  onChange={(e) => setData('observaciones', e.target.value)}
                  rows={3}
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
              <BotonLink href="/nutricionista/alimentos" variante="ghost">
                <ArrowLeft size={14} strokeWidth={1.8} /> Volver
              </BotonLink>
              <Boton type="submit" variante="primary" disabled={processing}>
                <Save size={14} strokeWidth={1.8} /> {processing ? 'Guardando...' : 'Registrar alimento'}
              </Boton>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
