import { Badge } from '@/Components/ui/badge';
import { CriterioPmosItem } from './CriterioPmosItem';
import { ListaAlertasPmos } from './ListaAlertasPmos';
import type { EvaluacionPmosData } from '../../tipos';

interface Props {
    evaluacion: EvaluacionPmosData;
}

const etiquetas: Record<string, { texto: string; variante: 'warning' | 'info' | 'success' | 'error' }> = {
    compatible_pmos: { texto: 'Compatible con PMOS', variante: 'warning' },
    pendiente_descartar_diferenciales: { texto: 'Pendiente descartar diferenciales', variante: 'info' },
    datos_insuficientes: { texto: 'Datos insuficientes', variante: 'info' },
    no_compatible: { texto: 'No compatible con PMOS', variante: 'success' },
};

export function PanelSugerenciaPmos({ evaluacion }: Props) {
    const sugerencia = etiquetas[evaluacion.diagnostico_sugerido] ?? etiquetas.datos_insuficientes;

    return (
        <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-wider font-bold text-base-content/40">
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
                <Badge variante={evaluacion.total_criterios_rotterdam >= 2 ? 'warning' : 'ghost'}>
                    {evaluacion.total_criterios_rotterdam}/3 criterios
                </Badge>
                <Badge variante={evaluacion.diagnosticos_diferenciales_descartados ? 'success' : 'warning'}>
                    {evaluacion.diagnosticos_diferenciales_descartados ? 'Diferenciales descartados' : 'Diferenciales pendientes'}
                </Badge>
                <Badge variante={sugerencia.variante}>{sugerencia.texto}</Badge>
                {evaluacion.fenotipo_sugerido ? (
                    <Badge>Fenotipo: {evaluacion.fenotipo_sugerido.replace(/_/g, ' ')}</Badge>
                ) : null}
            </div>

            {/* Alertas */}
            <ListaAlertasPmos alertas={evaluacion.alertas_datos_faltantes} />

            {/* Disclaimer */}
            <p className="text-[10px] text-base-content/40 italic">
                Sugerencia generada a partir de los datos clínicos registrados. La confirmación diagnóstica corresponde al especialista.
            </p>
        </div>
    );
}
