import { Badge } from '@/Components/ui/badge';
import type { EstadoFlujo } from '../tipos';

interface Props {
    estadoFlujo: EstadoFlujo;
}

const colores: Record<string, 'ghost' | 'primary' | 'success' | 'warning'> = {
    registro_inicial: 'ghost',
    en_evaluacion: 'primary',
    diagnostico_completo: 'success',
    inactivo: 'warning',
};

export default function IndicadorEstadoFlujo({ estadoFlujo }: Props) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-base-content/60">Flujo clínico:</span>
                    <Badge variante={colores[estadoFlujo.etapa] ?? 'ghost'}>{estadoFlujo.etiqueta}</Badge>
                </div>
                <span className="text-[10px] text-base-content/40">
                    {estadoFlujo.secciones_completadas} / {estadoFlujo.total_secciones} secciones
                </span>
            </div>
            <progress className="progress progress-primary w-full h-2" value={estadoFlujo.porcentaje} max="100" />
        </div>
    );
}
