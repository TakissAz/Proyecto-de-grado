import clsx from 'clsx';
import { Link } from '@inertiajs/react';
import { Heart, Edit, Plus, History, Calendar } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Boton } from '@/Components/ui/boton';
import GraficoCicloMenstrual from './GraficoCicloMenstrual';
import DatosCicloMenstrual from './DatosCicloMenstrual';
import HallazgosMenstruales from './HallazgosMenstruales';
import type { HistoriaMenstrualData } from '../../tipos';

interface Props {
    historia: HistoriaMenstrualData | null;
    idPaciente: number;
    onRegistrar: () => void;
    onEditar: () => void;
}

export default function TarjetaHistoriaMenstrual({ historia, idPaciente, onRegistrar, onEditar }: Props) {
    if (!historia) {
        return (
            <div className="p-5">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-green/10">
                        <Heart size={15} strokeWidth={1.8} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-semibold text-ink dark:text-ink-dark">Historia menstrual</h3>
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Pendiente de registro</p>
                    </div>
                </div>
                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark mb-4 leading-relaxed">
                    No se ha registrado la historia menstrual. Este dato es necesario para evaluar alteracion ovulatoria en el diagnostico PMOS.
                </p>
                <Boton variante="primary" tamano="sm" onClick={onRegistrar}>
                    <Plus size={13} strokeWidth={1.8} /> Registrar historia menstrual
                </Boton>
            </div>
        );
    }

    const tieneAlteracion = historia.amenorrea
        || historia.oligomenorrea
        || historia.sospecha_anovulacion
        || historia.confirma_anovulacion_por_progesterona
        || historia.regularidad_ciclo === 'irregular'
        || historia.regularidad_ciclo === 'ausente';

    return (
        <div className="p-5 space-y-4">
            {/* Header con fecha y acciones */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                    <div className={clsx('flex h-8 w-8 items-center justify-center rounded-xl', tieneAlteracion ? 'bg-brand-orange/15' : 'bg-brand-green/15')}>
                        <Heart size={15} strokeWidth={1.8} className={tieneAlteracion ? 'text-brand-orange' : 'text-brand-green-dark dark:text-brand-green'} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Historia menstrual</h3>
                            <Badge color={tieneAlteracion ? 'orange' : 'green'}>
                                {tieneAlteracion ? 'Alteracion ovulatoria' : 'Normal'}
                            </Badge>
                        </div>
                        {historia.created_at && (
                            <p className="flex items-center gap-1 text-[10.5px] text-ink-muted dark:text-ink-muted-dark mt-0.5">
                                <Calendar size={10} strokeWidth={1.8} />
                                Registrado el {historia.created_at}
                                {historia.updated_at && historia.updated_at !== historia.created_at && (
                                    <span className="ml-1">· Actualizado el {historia.updated_at}</span>
                                )}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Boton variante="primary" tamano="xs" onClick={onRegistrar}>
                        <Plus size={12} strokeWidth={1.8} /> Nuevo registro
                    </Boton>
                    <Link
                        href={`/endocrinologo/pacientes/${idPaciente}/historia-menstrual/historial`}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[0.03] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.04] dark:hover:text-ink-dark"
                    >
                        <History size={12} strokeWidth={1.8} /> Historial
                    </Link>
                    <button onClick={onEditar} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green-soft dark:text-brand-green dark:hover:bg-brand-green-dark/15">
                        <Edit size={12} strokeWidth={1.8} /> Editar
                    </button>
                </div>
            </div>

            {/* Grafico visual del ciclo */}
            <GraficoCicloMenstrual historia={historia} />

            {/* Datos del ciclo */}
            <DatosCicloMenstrual historia={historia} />

            {/* Hallazgos clinicos */}
            <HallazgosMenstruales historia={historia} />

            {/* Interpretacion */}
            <p className={clsx('text-[12px] font-medium', tieneAlteracion ? 'text-brand-orange' : 'text-ink-muted dark:text-ink-muted-dark')}>
                {tieneAlteracion ? 'Datos compatibles con alteracion ovulatoria.' : 'Sin alteracion ovulatoria evidente registrada.'}
            </p>

            {/* Observaciones */}
            {historia.observaciones && (
                <div className="rounded-xl border border-surface-border px-4 py-3 dark:border-surface-border-dark">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">Observaciones</p>
                    <p className="text-[12.5px] text-ink dark:text-ink-dark leading-relaxed">{historia.observaciones}</p>
                </div>
            )}
        </div>
    );
}
