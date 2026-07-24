import clsx from 'clsx';
import { Link } from '@inertiajs/react';
import { Stethoscope, Edit, Plus, History, Calendar, User, Users, Pill } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Boton } from '@/Components/ui/boton';
import type { AntecedentesData } from '../../tipos';

interface Props {
    antecedentes: AntecedentesData | null;
    idPaciente: number;
    onRegistrar: () => void;
    onEditar: () => void;
}

export default function TarjetaAntecedentes({ antecedentes, idPaciente, onRegistrar, onEditar }: Props) {
    if (!antecedentes) {
        return (
            <div className="p-5">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-category-dairy/10">
                        <Stethoscope size={15} strokeWidth={1.8} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-semibold text-ink dark:text-ink-dark">Antecedentes endocrino-metabólicos</h3>
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Pendiente de registro</p>
                    </div>
                </div>
                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark mb-4 leading-relaxed">
                    No se han registrado los antecedentes. Estos datos son necesarios para evaluar riesgo metabólico y cardiovascular.
                </p>
                <Boton variante="primary" tamano="sm" onClick={onRegistrar}>
                    <Plus size={13} strokeWidth={1.8} /> Registrar antecedentes
                </Boton>
            </div>
        );
    }

    const personales = [
        antecedentes.diabetes_personal && 'Diabetes',
        antecedentes.hipertension_personal && 'Hipertensión',
        antecedentes.dislipidemia_personal && 'Dislipidemia',
        antecedentes.enfermedad_tiroidea && 'Enf. tiroidea',
        antecedentes.hiperprolactinemia_previa && 'Hiperprolactinemia',
    ].filter(Boolean) as string[];

    const familiares = [
        antecedentes.diabetes_familiar && 'Diabetes',
        antecedentes.hipertension_familiar && 'Hipertensión',
        antecedentes.dislipidemia_familiar && 'Dislipidemia',
    ].filter(Boolean) as string[];

    const medicamentos = [
        antecedentes.uso_metformina && 'Metformina',
        antecedentes.uso_anticonceptivos && 'Anticonceptivos',
        antecedentes.uso_corticoides && 'Corticoides',
    ].filter(Boolean) as string[];

    const tieneHallazgos = personales.length > 0 || familiares.length > 0;

    return (
        <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                    <div className={clsx('flex h-8 w-8 items-center justify-center rounded-xl', tieneHallazgos ? 'bg-brand-orange/15' : 'bg-brand-green/15')}>
                        <Stethoscope size={15} strokeWidth={1.8} className={tieneHallazgos ? 'text-brand-orange' : 'text-brand-green-dark dark:text-brand-green'} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Antecedentes</h3>
                            <Badge color={tieneHallazgos ? 'orange' : 'green'}>
                                {tieneHallazgos ? 'Relevantes' : 'Sin hallazgos'}
                            </Badge>
                        </div>
                        {antecedentes.created_at && (
                            <p className="flex items-center gap-1 text-[10.5px] text-ink-muted dark:text-ink-muted-dark mt-0.5">
                                <Calendar size={10} strokeWidth={1.8} />
                                Registrado el {antecedentes.created_at}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Boton variante="primary" tamano="xs" onClick={onRegistrar}>
                        <Plus size={12} strokeWidth={1.8} /> Nuevo registro
                    </Boton>
                    <Link
                        href={`/endocrinologo/pacientes/${idPaciente}/antecedentes/historial`}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[0.03] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.04] dark:hover:text-ink-dark"
                    >
                        <History size={12} strokeWidth={1.8} /> Historial
                    </Link>
                    <button onClick={onEditar} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green-soft dark:text-brand-green dark:hover:bg-brand-green-dark/15">
                        <Edit size={12} strokeWidth={1.8} /> Editar
                    </button>
                </div>
            </div>

            {/* Antecedentes personales */}
            {personales.length > 0 && (
                <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">
                        <User size={10} strokeWidth={2} className="text-category-fruits" />
                        Personales
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {personales.map((p) => <Badge key={p} color="orange">{p}</Badge>)}
                    </div>
                </div>
            )}

            {/* Antecedentes familiares */}
            {familiares.length > 0 && (
                <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">
                        <Users size={10} strokeWidth={2} className="text-category-dairy" />
                        Familiares
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {familiares.map((f) => <Badge key={f} color="purple">{f}</Badge>)}
                    </div>
                </div>
            )}

            {/* Medicamentos */}
            {medicamentos.length > 0 && (
                <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">
                        <Pill size={10} strokeWidth={2} className="text-category-others" />
                        Medicamentos en uso
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {medicamentos.map((m) => <Badge key={m} color="blue">{m}</Badge>)}
                    </div>
                </div>
            )}

            {/* Otros medicamentos */}
            {antecedentes.otros_medicamentos && (
                <div className="rounded-xl border border-surface-border px-4 py-3 dark:border-surface-border-dark">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">Otros medicamentos</p>
                    <p className="text-[12.5px] text-ink dark:text-ink-dark">{antecedentes.otros_medicamentos}</p>
                </div>
            )}

            {/* Interpretación */}
            <p className={clsx('text-[12px] font-medium', tieneHallazgos ? 'text-brand-orange' : 'text-ink-muted dark:text-ink-muted-dark')}>
                {tieneHallazgos ? 'Existen antecedentes endocrino-metabólicos relevantes.' : 'Sin antecedentes relevantes registrados.'}
            </p>

            {/* Observaciones */}
            {antecedentes.observaciones && (
                <div className="rounded-xl border border-surface-border px-4 py-3 dark:border-surface-border-dark">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">Observaciones</p>
                    <p className="text-[12.5px] text-ink dark:text-ink-dark leading-relaxed">{antecedentes.observaciones}</p>
                </div>
            )}
        </div>
    );
}
