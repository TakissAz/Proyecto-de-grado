import clsx from 'clsx';
import { Link } from '@inertiajs/react';
import { Heart, Edit, Plus, History, Calendar } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Boton } from '@/Components/ui/boton';
import GraficoCicloMenstrual from './GraficoCicloMenstrual';
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

    const sangradoFueraDeRango = historia.duracion_ciclo_dias != null && (historia.duracion_ciclo_dias < 3 || historia.duracion_ciclo_dias > 7);
    const intervaloFueraDeRango = historia.intervalo_entre_ciclos_dias != null && (historia.intervalo_entre_ciclos_dias < 21 || historia.intervalo_entre_ciclos_dias > 35);
    const progesteronaBaja = historia.progesterona_lutea != null && historia.progesterona_lutea < 10;
    const tieneAlteracion = historia.amenorrea
        || historia.oligomenorrea
        || historia.sospecha_anovulacion
        || historia.confirma_anovulacion_por_progesterona
        || historia.sangrado_abundante
        || sangradoFueraDeRango
        || intervaloFueraDeRango
        || progesteronaBaja
        || historia.regularidad_ciclo === 'irregular'
        || historia.regularidad_ciclo === 'ausente';
    const senales = [
        historia.amenorrea && 'amenorrea',
        historia.oligomenorrea && 'oligomenorrea',
        historia.sangrado_abundante && 'sangrado abundante',
        historia.dolor_menstrual && 'dolor menstrual',
        historia.sospecha_anovulacion && 'sospecha de anovulación',
        historia.confirma_anovulacion_por_progesterona && 'anovulación confirmada por progesterona',
        sangradoFueraDeRango && `duracion del sangrado de ${historia.duracion_ciclo_dias} dias`,
        intervaloFueraDeRango && `intervalo entre ciclos de ${historia.intervalo_entre_ciclos_dias} dias`,
        progesteronaBaja && `progesterona lutea baja (${historia.progesterona_lutea} ng/mL)`,
    ].filter(Boolean) as string[];

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

            {/* Contexto que no está representado en las barras */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <DatoContexto label="Regularidad" valor={formatRegularidad(historia.regularidad_ciclo)} alerta={historia.regularidad_ciclo !== 'regular'} />
                <DatoContexto label="Edad de menarquía" valor={historia.edad_menarquia != null ? `${historia.edad_menarquia} años` : 'No registrada'} />
                <DatoContexto label="Última menstruación" valor={historia.fecha_ultima_menstruacion || 'No registrada'} />
            </div>

            {/* Interpretación consolidada, sin repetir tarjetas ni badges */}
            <div className={clsx('rounded-xl border px-4 py-3', tieneAlteracion ? 'border-brand-orange/25 bg-brand-orange/[0.06]' : 'border-brand-green/20 bg-brand-green/[0.05]')}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Interpretación del registro</p>
                    <span className={clsx('rounded-full px-2 py-1 text-[9.5px] font-bold', tieneAlteracion ? 'bg-brand-orange/15 text-brand-orange' : 'bg-brand-green/15 text-brand-green-dark dark:text-brand-green')}>
                        {senales.length} señal(es) clínica(s)
                    </span>
                </div>
                <p className={clsx('mt-1 text-[12.5px] font-bold', tieneAlteracion ? 'text-brand-orange' : 'text-brand-green-dark dark:text-brand-green')}>
                    {tieneAlteracion ? 'Patrón compatible con alteración ovulatoria' : 'Sin alteración ovulatoria evidente'}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">
                    {senales.length > 0
                        ? `La conclusión se sustenta en ${senales.join(', ')}.`
                        : 'No se registraron amenorrea, oligomenorrea ni evidencia clínica o bioquímica de anovulación.'}
                </p>
            </div>

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

function DatoContexto({ label, valor, alerta = false }: { label: string; valor: string; alerta?: boolean }) {
    return <div className="rounded-xl border border-surface-border px-3 py-2.5 dark:border-surface-border-dark"><p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{label}</p><p className={clsx('mt-0.5 text-[12px] font-bold', alerta ? 'text-brand-orange' : 'text-ink dark:text-ink-dark')}>{valor}</p></div>;
}

function formatRegularidad(valor?: string | null): string {
    return ({ regular: 'Regular', irregular: 'Irregular', ausente: 'Ausente' } as Record<string, string>)[valor ?? ''] ?? 'No registrada';
}
