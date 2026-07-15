import clsx from 'clsx';
import { Link } from '@inertiajs/react';
import { ScanSearch, Edit, Plus, History } from 'lucide-react';
import { Tarjeta } from '@/Components/ui/tarjeta';
import { Badge } from '@/Components/ui/badge';
import type { EcografiaData } from '../tipos';

interface Props {
    ecografia: EcografiaData | null;
    idPaciente: number;
    onRegistrar: () => void;
    onEditar: () => void;
}

export default function TarjetaEcografia({ ecografia, idPaciente, onRegistrar, onEditar }: Props) {
    if (!ecografia) {
        return (
            <Tarjeta>
                <div className="flex items-center gap-2 mb-2">
                    <ScanSearch size={18} className="text-base-content/30" />
                    <h3 className="font-bold text-base-content text-sm">Evaluación ecográfica</h3>
                    <Badge>Pendiente</Badge>
                </div>
                <p className="text-xs text-base-content/60 mb-3">
                    No se ha registrado evaluación ecográfica. Es necesaria para evaluar el criterio de morfología ovárica en el diagnóstico PMOS.
                </p>
                <button onClick={onRegistrar} className="btn btn-primary btn-sm gap-1.5">
                    <Plus size={14} /> Registrar ecografía
                </button>
            </Tarjeta>
        );
    }

    const alertas: string[] = [];
    if (ecografia.volumen_ovario_derecho != null && ecografia.volumen_ovario_derecho >= 10) alertas.push(`Vol. OD elevado (${ecografia.volumen_ovario_derecho} mL)`);
    if (ecografia.volumen_ovario_izquierdo != null && ecografia.volumen_ovario_izquierdo >= 10) alertas.push(`Vol. OI elevado (${ecografia.volumen_ovario_izquierdo} mL)`);
    if (ecografia.foliculos_ovario_derecho != null && ecografia.foliculos_ovario_derecho >= 12) alertas.push(`Folículos OD elevados (${ecografia.foliculos_ovario_derecho})`);
    if (ecografia.foliculos_ovario_izquierdo != null && ecografia.foliculos_ovario_izquierdo >= 12) alertas.push(`Folículos OI elevados (${ecografia.foliculos_ovario_izquierdo})`);
    if (ecografia.morfologia_compatible_pmos) alertas.push('Morfología compatible con PMOS');
    if (ecografia.distribucion_periferica) alertas.push('Distribución periférica');

    const tieneHallazgos = alertas.length > 0;
    const interpretacion = ecografia.morfologia_compatible_pmos
        ? 'Hallazgos ecográficos compatibles con morfología ovárica PMOS.'
        : 'Sin hallazgos ecográficos compatibles registrados.';

    return (
        <Tarjeta>
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <ScanSearch size={18} className={ecografia.morfologia_compatible_pmos ? 'text-warning' : 'text-success'} />
                    <h3 className="font-bold text-base-content text-sm">Evaluación ecográfica</h3>
                    <Badge variante={ecografia.morfologia_compatible_pmos ? 'warning' : 'success'}>
                        {ecografia.morfologia_compatible_pmos ? 'Morfología compatible PMOS' : 'Sin hallazgos compatibles'}
                    </Badge>
                </div>
                <div className="flex items-center gap-1.5">
                    <Link href={`/endocrinologo/pacientes/${idPaciente}/ecografia/historial`} className="btn btn-ghost btn-xs gap-1 text-base-content/60">
                        <History size={13} /> Historial
                    </Link>
                    <button onClick={onEditar} className="btn btn-outline btn-primary btn-xs gap-1">
                        <Edit size={13} /> Editar
                    </button>
                </div>
            </div>

            <div className="border-b border-base-300 mb-3" />

            {/* Datos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                <Detalle etiqueta="Fecha" valor={ecografia.fecha_ecografia} />
                <Detalle etiqueta="Tipo" valor={formatTipo(ecografia.tipo_ecografia)} />
                <Detalle etiqueta="Vol. ovario derecho" valor={ecografia.volumen_ovario_derecho != null ? `${ecografia.volumen_ovario_derecho} mL` : null} />
                <Detalle etiqueta="Vol. ovario izquierdo" valor={ecografia.volumen_ovario_izquierdo != null ? `${ecografia.volumen_ovario_izquierdo} mL` : null} />
                <Detalle etiqueta="Folículos OD" valor={ecografia.foliculos_ovario_derecho?.toString()} />
                <Detalle etiqueta="Folículos OI" valor={ecografia.foliculos_ovario_izquierdo?.toString()} />
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-1.5 mb-3">
                {tieneHallazgos ? (
                    alertas.map(a => <Badge key={a} variante="warning">{a}</Badge>)
                ) : (
                    <Badge variante="success">Sin hallazgos ecográficos compatibles</Badge>
                )}
            </div>

            {/* Interpretación */}
            <p className={clsx('text-xs font-medium', ecografia.morfologia_compatible_pmos ? 'text-warning' : 'text-base-content/50')}>
                {interpretacion}
            </p>

            {ecografia.observaciones ? (
                <div className="mt-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-base-content/40">Observaciones</p>
                    <p className="text-sm text-base-content">{ecografia.observaciones}</p>
                </div>
            ) : null}
        </Tarjeta>
    );
}

function Detalle({ etiqueta, valor }: { etiqueta: string; valor?: string | null }) {
    return (
        <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-base-content/40">{etiqueta}</p>
            <p className="text-sm font-medium text-base-content">{valor ?? '-'}</p>
        </div>
    );
}

function formatTipo(tipo?: string | null): string {
    const map: Record<string, string> = { transvaginal: 'Transvaginal', abdominal: 'Abdominal', otra: 'Otra' };
    return map[tipo ?? ''] ?? '-';
}
