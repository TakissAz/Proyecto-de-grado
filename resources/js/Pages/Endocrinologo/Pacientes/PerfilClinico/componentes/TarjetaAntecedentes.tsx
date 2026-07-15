import clsx from 'clsx';
import { Link } from '@inertiajs/react';
import { Stethoscope, Edit, Plus, History } from 'lucide-react';
import { Tarjeta } from '@/Components/ui/tarjeta';
import { Badge } from '@/Components/ui/badge';
import type { AntecedentesData } from '../tipos';

interface Props {
    antecedentes: AntecedentesData | null;
    idPaciente: number;
    onRegistrar: () => void;
    onEditar: () => void;
}

export default function TarjetaAntecedentes({ antecedentes, idPaciente, onRegistrar, onEditar }: Props) {
    if (!antecedentes) {
        return (
            <Tarjeta>
                <div className="flex items-center gap-2 mb-2">
                    <Stethoscope size={18} className="text-base-content/30" />
                    <h3 className="font-bold text-base-content text-sm">Antecedentes endocrino-metabólicos</h3>
                    <Badge>Pendiente</Badge>
                </div>
                <p className="text-xs text-base-content/60 mb-3">
                    No se han registrado los antecedentes endocrino-metabólicos. Estos datos son necesarios para evaluar riesgo metabólico y cardiovascular.
                </p>
                <button onClick={onRegistrar} className="btn btn-primary btn-sm gap-1.5">
                    <Plus size={14} /> Registrar antecedentes
                </button>
            </Tarjeta>
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
        antecedentes.diabetes_familiar && 'Diabetes familiar',
        antecedentes.hipertension_familiar && 'Hipertensión familiar',
        antecedentes.dislipidemia_familiar && 'Dislipidemia familiar',
    ].filter(Boolean) as string[];

    const medicamentos = [
        antecedentes.uso_metformina && 'Metformina',
        antecedentes.uso_anticonceptivos && 'Anticonceptivos',
        antecedentes.uso_corticoides && 'Corticoides',
    ].filter(Boolean) as string[];

    const tieneHallazgos = personales.length > 0 || familiares.length > 0;

    const interpretacion = tieneHallazgos
        ? 'Existen antecedentes endocrino-metabólicos relevantes.'
        : 'Sin antecedentes endocrino-metabólicos relevantes registrados.';

    return (
        <Tarjeta>
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <Stethoscope size={18} className={tieneHallazgos ? 'text-warning' : 'text-success'} />
                    <h3 className="font-bold text-base-content text-sm">Antecedentes endocrino-metabólicos</h3>
                    <Badge variante={tieneHallazgos ? 'warning' : 'success'}>
                        {tieneHallazgos ? 'Antecedentes relevantes' : 'Sin antecedentes relevantes'}
                    </Badge>
                </div>
                <div className="flex items-center gap-1.5">
                    <Link href={`/endocrinologo/pacientes/${idPaciente}/antecedentes/historial`} className="btn btn-ghost btn-xs gap-1 text-base-content/60">
                        <History size={13} /> Historial
                    </Link>
                    <button onClick={onEditar} className="btn btn-outline btn-primary btn-xs gap-1">
                        <Edit size={13} /> Editar
                    </button>
                </div>
            </div>

            <div className="border-b border-base-300 mb-3" />

            {/* Personales */}
            {personales.length > 0 ? (
                <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-base-content/40 mb-1.5">Antecedentes personales</p>
                    <div className="flex flex-wrap gap-1.5">
                        {personales.map((p) => <Badge key={p} variante="warning">{p}</Badge>)}
                    </div>
                </div>
            ) : null}

            {/* Familiares */}
            {familiares.length > 0 ? (
                <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-base-content/40 mb-1.5">Antecedentes familiares</p>
                    <div className="flex flex-wrap gap-1.5">
                        {familiares.map((f) => <Badge key={f}>{f}</Badge>)}
                    </div>
                </div>
            ) : null}

            {/* Medicamentos */}
            {medicamentos.length > 0 ? (
                <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-base-content/40 mb-1.5">Medicamentos en uso</p>
                    <div className="flex flex-wrap gap-1.5">
                        {medicamentos.map((m) => <Badge key={m} variante="info">{m}</Badge>)}
                    </div>
                </div>
            ) : null}

            {/* Interpretación */}
            <p className={clsx('text-xs font-medium', tieneHallazgos ? 'text-warning' : 'text-base-content/50')}>
                {interpretacion}
            </p>

            {antecedentes.otros_medicamentos ? (
                <div className="mt-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-base-content/40">Otros medicamentos</p>
                    <p className="text-sm text-base-content">{antecedentes.otros_medicamentos}</p>
                </div>
            ) : null}

            {antecedentes.observaciones ? (
                <div className="mt-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-base-content/40">Observaciones</p>
                    <p className="text-sm text-base-content">{antecedentes.observaciones}</p>
                </div>
            ) : null}
        </Tarjeta>
    );
}
