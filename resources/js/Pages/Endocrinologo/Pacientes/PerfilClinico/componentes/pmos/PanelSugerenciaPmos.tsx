import { Badge } from '@/Components/ui/badge';
import { CriterioPmosItem } from './CriterioPmosItem';
import { ListaAlertasPmos } from './ListaAlertasPmos';
import type { EvaluacionPmosData } from '../../tipos';

interface Props {
    evaluacion: EvaluacionPmosData;
}

const etiquetas: Record<string, { texto: string; color: 'orange' | 'gray' | 'green' | 'red' }> = {
    compatible_pmos: { texto: 'Compatible con PMOS', color: 'orange' },
    pendiente_descartar_diferenciales: { texto: 'Pendiente descartar diferenciales', color: 'gray' },
    datos_insuficientes: { texto: 'Datos insuficientes', color: 'gray' },
    no_compatible: { texto: 'No compatible con PMOS', color: 'green' },
};

export function PanelSugerenciaPmos({ evaluacion }: Props) {
    const sugerencia = etiquetas[evaluacion.diagnostico_sugerido] ?? etiquetas.datos_insuficientes;

    return (
        <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-muted dark:text-ink-muted-dark">
                Evaluación de criterios Rotterdam (sugerencia del sistema)
            </p>

            {/* Criterios */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <CriterioPmosItem label="1. Alteración ovulatoria" cumple={evaluacion.cumple_alteracion_ovulatoria} />
                <CriterioPmosItem
                    label="2. Hiperandrogenismo"
                    cumple={evaluacion.cumple_hiperandrogenismo}
                    detalle={evaluacion.tipo_hiperandrogenismo !== 'ninguno' ? evaluacion.tipo_hiperandrogenismo.replace(/_/g, ' ') : undefined}
                />
                <CriterioPmosItem label="3. Morfología ovárica" cumple={evaluacion.cumple_morfologia_ovarica} />
            </div>

            {/* Resumen */}
            <div className="flex flex-wrap gap-1.5">
                <Badge color={evaluacion.total_criterios_rotterdam >= 2 ? 'orange' : 'gray'}>
                    {evaluacion.total_criterios_rotterdam}/3 criterios
                </Badge>
                <Badge color={evaluacion.diagnosticos_diferenciales_descartados ? 'green' : 'orange'}>
                    {evaluacion.diagnosticos_diferenciales_descartados ? 'Diferenciales descartados' : 'Diferenciales pendientes'}
                </Badge>
                <Badge color={sugerencia.color}>{sugerencia.texto}</Badge>
                {evaluacion.fenotipo_sugerido && (
                    <Badge color="purple">Fenotipo: {evaluacion.fenotipo_sugerido.replace(/_/g, ' ')}</Badge>
                )}
            </div>

            {/* Alertas */}
            <ListaAlertasPmos alertas={evaluacion.alertas_datos_faltantes} />

            {/* Disclaimer */}
            <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark italic">
                Sugerencia generada a partir de los datos clínicos registrados. La confirmación diagnóstica corresponde al especialista.
            </p>
        </div>
    );
}
