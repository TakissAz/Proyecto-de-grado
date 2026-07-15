import clsx from 'clsx';
import { Link } from '@inertiajs/react';
import { Heart, Edit, Plus, History } from 'lucide-react';
import { Tarjeta } from '@/Components/ui/tarjeta';
import { Badge } from '@/Components/ui/badge';
import type { HistoriaMenstrualData } from '../tipos';

interface Props {
    historia: HistoriaMenstrualData | null;
    idPaciente: number;
    onRegistrar: () => void;
    onEditar: () => void;
}

export default function TarjetaHistoriaMenstrual({ historia, idPaciente, onRegistrar, onEditar }: Props) {
    if (!historia) {
        return (
            <Tarjeta>
                <div className="flex items-center gap-2 mb-2">
                    <Heart size={18} className="text-base-content/30" />
                    <h3 className="font-bold text-base-content text-sm">Historia menstrual</h3>
                    <Badge>Pendiente</Badge>
                </div>
                <p className="text-xs text-base-content/60 mb-3">
                    No se ha registrado la historia menstrual de esta paciente. Este dato es necesario para evaluar alteración ovulatoria en el diagnóstico PMOS.
                </p>
                <button onClick={onRegistrar} className="btn btn-primary btn-sm gap-1.5">
                    <Plus size={14} /> Registrar historia menstrual
                </button>
            </Tarjeta>
        );
    }

    const tieneAlteracion = historia.amenorrea
        || historia.oligomenorrea
        || historia.sospecha_anovulacion
        || historia.confirma_anovulacion_por_progesterona
        || historia.regularidad_ciclo === 'irregular'
        || historia.regularidad_ciclo === 'ausente';

    const interpretacion = tieneAlteracion
        ? 'Datos compatibles con alteración ovulatoria.'
        : 'Sin alteración ovulatoria evidente registrada.';

    return (
        <Tarjeta>
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <Heart size={18} className={tieneAlteracion ? 'text-warning' : 'text-success'} />
                    <h3 className="font-bold text-base-content text-sm">Historia menstrual</h3>
                    <Badge variante={tieneAlteracion ? 'warning' : 'success'}>
                        {tieneAlteracion ? 'Alteración ovulatoria' : 'Registrada'}
                    </Badge>
                </div>
                <div className="flex items-center gap-1.5">
                    <Link
                        href={`/endocrinologo/pacientes/${idPaciente}/historia-menstrual/historial`}
                        className="btn btn-ghost btn-xs gap-1 text-base-content/60"
                    >
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
                <Detalle etiqueta="Regularidad" valor={formatRegularidad(historia.regularidad_ciclo)} />
                <Detalle etiqueta="Duración del ciclo" valor={historia.duracion_ciclo_dias ? `${historia.duracion_ciclo_dias} días` : null} />
                <Detalle etiqueta="Intervalo entre ciclos" valor={historia.intervalo_entre_ciclos_dias ? `${historia.intervalo_entre_ciclos_dias} días` : null} />
                <Detalle etiqueta="Edad menarquía" valor={historia.edad_menarquia ? `${historia.edad_menarquia} años` : null} />
                <Detalle etiqueta="Última menstruación" valor={historia.fecha_ultima_menstruacion} />
                <Detalle etiqueta="Progesterona lútea" valor={historia.progesterona_lutea ? `${historia.progesterona_lutea} ng/mL` : null} />
            </div>

            {/* Chips hallazgos */}
            <div className="flex flex-wrap gap-1.5 mb-3">
                <ChipHallazgo label="Amenorrea" activo={historia.amenorrea} />
                <ChipHallazgo label="Oligomenorrea" activo={historia.oligomenorrea} />
                <ChipHallazgo label="Sangrado abundante" activo={historia.sangrado_abundante} />
                <ChipHallazgo label="Dolor menstrual" activo={historia.dolor_menstrual} />
                <ChipHallazgo label="Sospecha anovulación" activo={historia.sospecha_anovulacion} />
                <ChipHallazgo label="Anovulación confirmada" activo={historia.confirma_anovulacion_por_progesterona} />
            </div>

            {/* Interpretación */}
            <p className={clsx('text-xs font-medium', tieneAlteracion ? 'text-warning' : 'text-base-content/50')}>
                {interpretacion}
            </p>

            {historia.observaciones ? (
                <div className="mt-2">
                    <Detalle etiqueta="Observaciones" valor={historia.observaciones} />
                </div>
            ) : null}
        </Tarjeta>
    );
}

function Detalle({ etiqueta, valor }: { etiqueta: string; valor?: string | number | null }) {
    return (
        <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-base-content/40">{etiqueta}</p>
            <p className="text-sm font-medium text-base-content">{valor ?? '-'}</p>
        </div>
    );
}

function ChipHallazgo({ label, activo }: { label: string; activo: boolean }) {
    return (
        <span className={clsx(
            'badge badge-sm font-semibold',
            activo ? 'badge-warning' : 'badge-ghost'
        )}>
            {label}
        </span>
    );
}

function formatRegularidad(valor?: string | null): string {
    const map: Record<string, string> = { regular: 'Regular', irregular: 'Irregular', ausente: 'Ausente' };
    return map[valor ?? ''] ?? 'No registrada';
}
