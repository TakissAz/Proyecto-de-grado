import type { DiagnosticoPmosData } from '../../tipos';

interface Props {
    diagnostico: DiagnosticoPmosData;
}

export function PanelConfirmacionPmos({ diagnostico }: Props) {
    return (
        <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-wider font-bold text-base-content/40">
                Diagnóstico del especialista
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {diagnostico.fenotipo_pmos ? <Detalle etiqueta="Fenotipo" valor={diagnostico.fenotipo_pmos.replace(/_/g, ' ')} /> : null}
                {diagnostico.severidad_clinica ? <Detalle etiqueta="Severidad" valor={diagnostico.severidad_clinica} /> : null}
                {diagnostico.riesgo_metabolico ? <Detalle etiqueta="Riesgo metabólico" valor={diagnostico.riesgo_metabolico} /> : null}
                <Detalle etiqueta="Fecha" valor={diagnostico.fecha_diagnostico} />
            </div>

            {diagnostico.conclusion_medica ? (
                <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-base-content/40">Conclusión médica</p>
                    <p className="text-sm text-base-content mt-0.5">{diagnostico.conclusion_medica}</p>
                </div>
            ) : null}

            {diagnostico.recomendaciones_medicas ? (
                <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-base-content/40">Recomendaciones</p>
                    <p className="text-sm text-base-content mt-0.5">{diagnostico.recomendaciones_medicas}</p>
                </div>
            ) : null}
        </div>
    );
}

function Detalle({ etiqueta, valor }: { etiqueta: string; valor: string }) {
    return (
        <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-base-content/40">{etiqueta}</p>
            <p className="text-sm font-medium text-base-content capitalize">{valor}</p>
        </div>
    );
}
