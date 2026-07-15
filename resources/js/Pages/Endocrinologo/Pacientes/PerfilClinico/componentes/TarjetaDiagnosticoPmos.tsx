import { Heart, Plus, Edit } from 'lucide-react';
import { Tarjeta } from '@/Components/ui/tarjeta';
import { Badge } from '@/Components/ui/badge';
import { PanelSugerenciaPmos } from './pmos/PanelSugerenciaPmos';
import { PanelConfirmacionPmos } from './pmos/PanelConfirmacionPmos';
import type { DiagnosticoPmosData, EvaluacionPmosData } from '../tipos';

interface Props {
    evaluacion: EvaluacionPmosData;
    diagnostico: DiagnosticoPmosData | null;
    onRegistrar: () => void;
    onEditar: () => void;
}

export default function TarjetaDiagnosticoPmos({ evaluacion, diagnostico, onRegistrar, onEditar }: Props) {
    return (
        <Tarjeta>
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <Heart size={18} className={diagnostico?.diagnostico_confirmado ? 'text-error' : 'text-base-content/30'} />
                    <h3 className="font-bold text-base-content text-sm">Diagnóstico PMOS</h3>
                    {diagnostico ? (
                        <Badge variante={diagnostico.diagnostico_confirmado ? 'error' : 'ghost'}>
                            {diagnostico.diagnostico_confirmado ? 'Confirmado' : 'No confirmado'}
                        </Badge>
                    ) : (
                        <Badge>Pendiente de evaluación</Badge>
                    )}
                </div>
                {diagnostico ? (
                    <button onClick={onEditar} className="btn btn-outline btn-primary btn-xs gap-1">
                        <Edit size={13} /> Editar
                    </button>
                ) : (
                    <button onClick={onRegistrar} className="btn btn-primary btn-sm gap-1.5">
                        <Plus size={14} /> Registrar diagnóstico
                    </button>
                )}
            </div>

            <div className="border-b border-base-300 mb-3" />

            {/* Sugerencia del sistema */}
            <PanelSugerenciaPmos evaluacion={evaluacion} />

            {/* Confirmación del especialista */}
            {diagnostico ? (
                <>
                    <div className="border-b border-base-300 my-3" />
                    <PanelConfirmacionPmos diagnostico={diagnostico} />
                </>
            ) : null}
        </Tarjeta>
    );
}
