import { useForm } from '@inertiajs/react';
import { Save, ShieldCheck } from 'lucide-react';
import { Boton } from '@/Components/ui/boton';
import { Campo, CampoSelect } from '@/Components/ui/campo';

export interface ReglaNutricional {
  id_regla_nutricional: number;
  codigo: string;
  nombre: string;
  tipo_regla: string;
  condicion_campo: string;
  condicion_operador: string;
  condicion_valor: unknown[] | string | number | null;
  resultado: Record<string, number | string>;
  prioridad: number;
  descripcion: string | null;
  fuente: string | null;
}

interface DatosFormulario {
  codigo: string; nombre: string; tipo_regla: string; condicion_campo: string;
  condicion_operador: string; condicion_valor: string; prioridad: number | string;
  descripcion: string; fuente: string; ajuste_calorico: number | string;
  porcentaje_proteinas: number | string; porcentaje_carbohidratos: number | string;
  porcentaje_grasas: number | string; fibra_diaria: number | string;
  calorias_minimas: number | string; observacion_resultado: string;
}

const inicial = (regla?: ReglaNutricional): DatosFormulario => ({
  codigo: regla?.codigo ?? '', nombre: regla?.nombre ?? '', tipo_regla: regla?.tipo_regla ?? 'ajuste_calorico',
  condicion_campo: regla?.condicion_campo ?? 'objetivo_principal', condicion_operador: regla?.condicion_operador ?? '=',
  condicion_valor: Array.isArray(regla?.condicion_valor) ? regla.condicion_valor.join(', ') : String(regla?.condicion_valor ?? ''), prioridad: regla?.prioridad ?? 10,
  descripcion: regla?.descripcion ?? '', fuente: regla?.fuente ?? '',
  ajuste_calorico: regla?.resultado?.ajuste_calorico ?? '', porcentaje_proteinas: regla?.resultado?.porcentaje_proteinas ?? '',
  porcentaje_carbohidratos: regla?.resultado?.porcentaje_carbohidratos ?? '', porcentaje_grasas: regla?.resultado?.porcentaje_grasas ?? '',
  fibra_diaria: regla?.resultado?.fibra_diaria ?? '', calorias_minimas: regla?.resultado?.calorias_minimas ?? '',
  observacion_resultado: String(regla?.resultado?.observacion ?? ''),
});

export default function FormularioRegla({ regla }: { regla?: ReglaNutricional }) {
  const { data, setData, post, processing, errors } = useForm<DatosFormulario>(inicial(regla));
  const esEdicion = Boolean(regla);
  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    post(esEdicion ? `/nutricionista/reglas-nutricionales/${regla!.id_regla_nutricional}?_method=PUT` : '/nutricionista/reglas-nutricionales');
  };
  const error = (campo: keyof DatosFormulario | 'resultado') => errors[campo as keyof DatosFormulario];

  return (
    <form onSubmit={guardar} className="space-y-5">
      <section className="card-elevated p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-xl bg-brand-green/15 p-2 text-brand-green-dark dark:text-brand-green"><ShieldCheck size={18} /></div>
          <div><h3 className="text-sm font-bold text-ink dark:text-ink-dark">Identificación profesional</h3><p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Nombre visible y fundamento de la regla.</p></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Campo label="Código técnico" required maxLength={30} value={data.codigo} onChange={e => setData('codigo', e.target.value.toUpperCase())} error={error('codigo')} placeholder="RN-012" />
          <Campo label="Nombre profesional" required maxLength={150} value={data.nombre} onChange={e => setData('nombre', e.target.value)} error={error('nombre')} placeholder="Ajuste para objetivo metabólico" />
          <Campo label="Descripción clínica" maxLength={1000} value={data.descripcion} onChange={e => setData('descripcion', e.target.value)} error={error('descripcion')} wrapperClassName="md:col-span-2" />
          <Campo label="Fuente o referencia" maxLength={255} value={data.fuente} onChange={e => setData('fuente', e.target.value)} error={error('fuente')} wrapperClassName="md:col-span-2" />
        </div>
      </section>

      <section className="card-elevated p-5">
        <h3 className="mb-1 text-sm font-bold text-ink dark:text-ink-dark">¿Cuándo debe aplicarse?</h3>
        <p className="mb-4 text-[11px] text-ink-muted dark:text-ink-muted-dark">Define la condición clínica sin escribir JSON.</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <CampoSelect label="Grupo de decisión" value={data.tipo_regla} onChange={e => setData('tipo_regla', e.target.value)} error={error('tipo_regla')}>
            <option value="ajuste_calorico">Ajuste calórico</option><option value="distribucion_macros">Distribución de macros</option><option value="limite_calorico">Límite de seguridad</option>
          </CampoSelect>
          <CampoSelect label="Dato evaluado" value={data.condicion_campo} onChange={e => setData('condicion_campo', e.target.value)} error={error('condicion_campo')}>
            <option value="objetivo_principal">Objetivo principal</option><option value="nivel_actividad">Nivel de actividad</option><option value="edad">Edad</option><option value="peso">Peso</option><option value="talla">Talla</option><option value="calorias_objetivo">Calorías preliminares</option>
          </CampoSelect>
          <CampoSelect label="Comparación" value={data.condicion_operador} onChange={e => setData('condicion_operador', e.target.value)} error={error('condicion_operador')}>
            <option value="=">Es igual a</option><option value="!=">Es diferente de</option><option value=">">Es mayor que</option><option value=">=">Es mayor o igual</option><option value="<">Es menor que</option><option value="<=">Es menor o igual</option><option value="in">Está entre estos valores</option><option value="not_in">No está entre estos valores</option><option value="default">Regla por defecto</option>
          </CampoSelect>
          <Campo label="Valor esperado" disabled={data.condicion_operador === 'default'} value={data.condicion_valor} onChange={e => setData('condicion_valor', e.target.value)} error={error('condicion_valor')} placeholder={['in', 'not_in'].includes(data.condicion_operador) ? 'valor_1, valor_2' : 'Valor'} />
          <Campo label="Prioridad clínica" type="number" required min={1} max={999} value={data.prioridad} onChange={e => setData('prioridad', e.target.value)} error={error('prioridad')} />
        </div>
      </section>

      <section className="card-elevated p-5">
        <h3 className="mb-1 text-sm font-bold text-ink dark:text-ink-dark">¿Qué modifica la regla?</h3>
        <p className="mb-4 text-[11px] text-ink-muted dark:text-ink-muted-dark">Completa solamente los resultados que correspondan. Si defines macros, deben sumar 100%.</p>
        {error('resultado') && <p className="mb-3 rounded-lg bg-category-fruits/10 p-2 text-xs text-category-fruits">{error('resultado')}</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Campo label="Ajuste calórico (kcal)" type="number" step="0.01" value={data.ajuste_calorico} onChange={e => setData('ajuste_calorico', e.target.value)} error={error('ajuste_calorico')} />
          <Campo label="Proteínas (%)" type="number" min={0} max={100} step="0.01" value={data.porcentaje_proteinas} onChange={e => setData('porcentaje_proteinas', e.target.value)} error={error('porcentaje_proteinas')} />
          <Campo label="Carbohidratos (%)" type="number" min={0} max={100} step="0.01" value={data.porcentaje_carbohidratos} onChange={e => setData('porcentaje_carbohidratos', e.target.value)} error={error('porcentaje_carbohidratos')} />
          <Campo label="Grasas (%)" type="number" min={0} max={100} step="0.01" value={data.porcentaje_grasas} onChange={e => setData('porcentaje_grasas', e.target.value)} error={error('porcentaje_grasas')} />
          <Campo label="Fibra diaria (g)" type="number" min={0} max={100} step="0.01" value={data.fibra_diaria} onChange={e => setData('fibra_diaria', e.target.value)} error={error('fibra_diaria')} />
          <Campo label="Calorías mínimas" type="number" min={800} max={3000} step="1" value={data.calorias_minimas} onChange={e => setData('calorias_minimas', e.target.value)} error={error('calorias_minimas')} />
          <Campo label="Explicación del resultado" maxLength={500} value={data.observacion_resultado} onChange={e => setData('observacion_resultado', e.target.value)} error={error('observacion_resultado')} wrapperClassName="sm:col-span-2 lg:col-span-3" />
        </div>
      </section>

      <div className="flex justify-end"><Boton type="submit" variante="primary" tamano="md" disabled={processing}><Save size={14} /> {processing ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear regla'}</Boton></div>
    </form>
  );
}
