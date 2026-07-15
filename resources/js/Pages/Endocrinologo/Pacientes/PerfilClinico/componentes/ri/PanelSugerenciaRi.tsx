import { Badge } from '@/Components/ui/badge';
import { IndicadorRiItem } from './IndicadorRiItem';
import { ListaAlertasRi } from './ListaAlertasRi';
import type { EvaluacionRiData } from '../../tipos';

interface Props {
    evaluacion: EvaluacionRiData;
}

const etiquetas: Record<string, { texto: string; variante: 'error' | 'warning' | 'info' | 'success' }> = {
    compatible_resistencia_insulina: { texto: 'Compatible con RI', variante: 'error' },
    sospecha_clinica_pendiente_confirmacion: { texto: 'Sospecha clínica, pendiente confirmación', variante: 'warning' },
    datos_insuficientes: { texto: 'Datos insuficientes', variante: 'info' },
    no_compatible: { texto: 'No compatible con RI', variante: 'success' },
};

export function PanelSugerenciaRi({ evaluacion }: Props) {
    const sugerencia = etiquetas[evaluacion.diagnostico_sugerido] ?? etiquetas.datos_insuficientes;

    return (
        <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-wider font-bold text-base-content/40">
                Indicadores metabólicos evaluados (sugerencia del sistema)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <IndicadorRiItem
                    label="HOMA-IR elevado"
                    cumple={evaluacion.homa_ir_elevado}
                    detalle={evaluacion.homa_ir != null ? `${evaluacion.homa_ir}` : undefined}
                />
                <IndicadorRiItem label="Hiperinsulinemia" cumple={evaluacion.hiperinsulinemia} />
                <IndicadorRiItem label="Alteración glucémica" cumple={evaluacion.alteracion_glucemica} />
                <IndicadorRiItem label="Signos físicos asociados" cumple={evaluacion.signos_fisicos_asociados} />
                <IndicadorRiItem label="Dislipidemia asociada" cumple={evaluacion.dislipidemia_asociada} />
                <IndicadorRiItem label="Antecedentes relevantes" cumple={evaluacion.antecedentes_relevantes} />
            </div>

            <div className="flex flex-wrap gap-1.5">
                <Badge variante={sugerencia.variante}>{sugerencia.texto}</Badge>
                <Badge variante={evaluacion.riesgo_sugerido === 'alto' ? 'error' : evaluacion.riesgo_sugerido === 'moderado' ? 'warning' : 'ghost'}>
                    Riesgo sugerido: {evaluacion.riesgo_sugerido}
                </Badge>
            </div>

            <ListaAlertasRi alertas={evaluacion.alertas_datos_faltantes} />

            <p className="text-[10px] text-base-content/40 italic">
                Sugerencia generada a partir de indicadores metabólicos registrados. La confirmación diagnóstica corresponde al especialista.
            </p>
        </div>
    );
}
