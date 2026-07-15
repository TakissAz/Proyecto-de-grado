import clsx from 'clsx';
import { Link } from '@inertiajs/react';
import { AlertTriangle, Edit, Plus, History } from 'lucide-react';
import { Tarjeta } from '@/Components/ui/tarjeta';
import { Badge } from '@/Components/ui/badge';
import type { HiperandrogenismoData } from '../tipos';

interface Props {
    hiperandrogenismo: HiperandrogenismoData | null;
    idPaciente: number;
    onRegistrar: () => void;
    onEditar: () => void;
}

export default function TarjetaHiperandrogenismo({ hiperandrogenismo, idPaciente, onRegistrar, onEditar }: Props) {
    if (!hiperandrogenismo) {
        return (
            <Tarjeta>
                <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={18} className="text-base-content/30" />
                    <h3 className="font-bold text-base-content text-sm">Hiperandrogenismo</h3>
                    <Badge>Pendiente</Badge>
                </div>
                <p className="text-xs text-base-content/60 mb-3">
                    No se ha registrado la evaluación de hiperandrogenismo clínico. Este dato es necesario para el criterio de hiperandrogenismo en el diagnóstico PMOS.
                </p>
                <button onClick={onRegistrar} className="btn btn-primary btn-sm gap-1.5">
                    <Plus size={14} /> Registrar hiperandrogenismo
                </button>
            </Tarjeta>
        );
    }

    const tieneHallazgos = hiperandrogenismo.acne || hiperandrogenismo.hirsutismo || hiperandrogenismo.alopecia_androgenica || hiperandrogenismo.seborrea;
    const ferrimanAlto = (hiperandrogenismo.puntaje_ferriman_gallwey ?? 0) >= 8;
    const acneRelevante = hiperandrogenismo.acne && (hiperandrogenismo.acne_grado === 'moderado' || hiperandrogenismo.acne_grado === 'severo');
    const tieneHA = hiperandrogenismo.hirsutismo || hiperandrogenismo.alopecia_androgenica || acneRelevante || ferrimanAlto;

    const interpretacion = tieneHA
        ? 'Datos compatibles con hiperandrogenismo clínico.'
        : 'Sin signos clínicos relevantes registrados.';

    return (
        <Tarjeta>
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className={tieneHA ? 'text-warning' : 'text-success'} />
                    <h3 className="font-bold text-base-content text-sm">Hiperandrogenismo</h3>
                    <Badge variante={tieneHA ? 'warning' : tieneHallazgos ? 'ghost' : 'success'}>
                        {tieneHA ? 'Hiperandrogenismo clínico' : tieneHallazgos ? 'Hallazgos leves' : 'Sin signos relevantes'}
                    </Badge>
                </div>
                <div className="flex items-center gap-1.5">
                    <Link href={`/endocrinologo/pacientes/${idPaciente}/hiperandrogenismo/historial`} className="btn btn-ghost btn-xs gap-1 text-base-content/60">
                        <History size={13} /> Historial
                    </Link>
                    <button onClick={onEditar} className="btn btn-outline btn-primary btn-xs gap-1">
                        <Edit size={13} /> Editar
                    </button>
                </div>
            </div>

            <div className="border-b border-base-300 mb-3" />

            {/* Datos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                {hiperandrogenismo.acne ? <Detalle etiqueta="Acné" valor={`Grado: ${formatGrado(hiperandrogenismo.acne_grado)}`} /> : null}
                {hiperandrogenismo.hirsutismo ? <Detalle etiqueta="Hirsutismo" valor={hiperandrogenismo.hirsutismo_zona ?? 'Presente'} /> : null}
                {hiperandrogenismo.puntaje_ferriman_gallwey != null ? <Detalle etiqueta="Ferriman-Gallwey" valor={`${hiperandrogenismo.puntaje_ferriman_gallwey} pts`} /> : null}
                {hiperandrogenismo.inicio_sintomas ? <Detalle etiqueta="Inicio síntomas" valor={hiperandrogenismo.inicio_sintomas} /> : null}
                {hiperandrogenismo.progresion_sintomas ? <Detalle etiqueta="Progresión" valor={formatProgresion(hiperandrogenismo.progresion_sintomas)} /> : null}
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-1.5 mb-3">
                {acneRelevante ? <Badge variante="warning">Acné {hiperandrogenismo.acne_grado}</Badge> : null}
                {hiperandrogenismo.hirsutismo ? <Badge variante="warning">Hirsutismo</Badge> : null}
                {ferrimanAlto ? <Badge variante="error">FG ≥ 8 ({hiperandrogenismo.puntaje_ferriman_gallwey})</Badge> : null}
                {hiperandrogenismo.alopecia_androgenica ? <Badge variante="warning">Alopecia androgénica</Badge> : null}
                {hiperandrogenismo.seborrea ? <Badge>Seborrea</Badge> : null}
                {hiperandrogenismo.progresion_sintomas === 'progresivo' ? <Badge variante="error">Progresión activa</Badge> : null}
                {!tieneHallazgos ? <Badge variante="success">Sin hallazgos</Badge> : null}
            </div>

            {/* Interpretación */}
            <p className={clsx('text-xs font-medium', tieneHA ? 'text-warning' : 'text-base-content/50')}>
                {interpretacion}
            </p>

            {hiperandrogenismo.observaciones ? (
                <div className="mt-2">
                    <Detalle etiqueta="Observaciones" valor={hiperandrogenismo.observaciones} />
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

function formatGrado(grado: string): string {
    const map: Record<string, string> = { no_aplica: 'No aplica', leve: 'Leve', moderado: 'Moderado', severo: 'Severo' };
    return map[grado] ?? grado;
}

function formatProgresion(progresion: string): string {
    const map: Record<string, string> = { estable: 'Estable', progresivo: 'Progresivo', regresivo: 'Regresivo' };
    return map[progresion] ?? progresion;
}
