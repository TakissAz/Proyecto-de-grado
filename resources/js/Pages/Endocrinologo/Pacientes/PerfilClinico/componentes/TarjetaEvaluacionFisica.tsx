import clsx from 'clsx';
import { Link } from '@inertiajs/react';
import { Activity, Edit, Plus, History } from 'lucide-react';
import { Tarjeta } from '@/Components/ui/tarjeta';
import { Badge } from '@/Components/ui/badge';
import type { EvaluacionFisicaData } from '../tipos';

interface Props {
    evaluacion: EvaluacionFisicaData | null;
    idPaciente: number;
    onRegistrar: () => void;
    onEditar: () => void;
}

export default function TarjetaEvaluacionFisica({ evaluacion, idPaciente, onRegistrar, onEditar }: Props) {
    if (!evaluacion) {
        return (
            <Tarjeta>
                <div className="flex items-center gap-2 mb-2">
                    <Activity size={18} className="text-base-content/30" />
                    <h3 className="font-bold text-base-content text-sm">Evaluación física endocrina</h3>
                    <Badge>Pendiente</Badge>
                </div>
                <p className="text-xs text-base-content/60 mb-3">
                    No se ha registrado la evaluación física endocrina. Estos datos son necesarios para evaluar riesgo metabólico.
                </p>
                <button onClick={onRegistrar} className="btn btn-primary btn-sm gap-1.5">
                    <Plus size={14} /> Registrar evaluación física
                </button>
            </Tarjeta>
        );
    }

    const alertas: string[] = [];
    if (evaluacion.imc != null && evaluacion.imc >= 25) alertas.push(`IMC elevado (${evaluacion.imc})`);
    if (evaluacion.circunferencia_cintura != null && evaluacion.circunferencia_cintura >= 80) alertas.push('Cintura elevada');
    if (evaluacion.indice_cintura_cadera != null && evaluacion.indice_cintura_cadera >= 0.85) alertas.push('ICC elevado');
    if (evaluacion.presion_sistolica != null && evaluacion.presion_sistolica >= 130) alertas.push('PA sistólica elevada');
    if (evaluacion.presion_diastolica != null && evaluacion.presion_diastolica >= 85) alertas.push('PA diastólica elevada');
    if (evaluacion.acantosis_nigricans) alertas.push('Acantosis nigricans');
    if (evaluacion.skin_tags) alertas.push('Acrocordones');
    if (evaluacion.galactorrea) alertas.push('Galactorrea');
    if (evaluacion.hirsutismo_visible) alertas.push('Hirsutismo visible');
    if (evaluacion.puntaje_ferriman_gallwey != null && evaluacion.puntaje_ferriman_gallwey >= 8) alertas.push(`FG elevado (${evaluacion.puntaje_ferriman_gallwey})`);
    if (evaluacion.acne_visible) alertas.push('Acné visible');
    if (evaluacion.alopecia_visible) alertas.push('Alopecia visible');

    const tieneHallazgos = alertas.length > 0;
    const interpretacion = tieneHallazgos
        ? 'Existen hallazgos físicos relevantes para riesgo metabólico.'
        : 'Sin hallazgos físicos relevantes registrados.';

    return (
        <Tarjeta>
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <Activity size={18} className={tieneHallazgos ? 'text-warning' : 'text-success'} />
                    <h3 className="font-bold text-base-content text-sm">Evaluación física endocrina</h3>
                    <Badge variante={tieneHallazgos ? 'warning' : 'success'}>
                        {tieneHallazgos ? 'Hallazgos relevantes' : 'Sin hallazgos relevantes'}
                    </Badge>
                </div>
                <div className="flex items-center gap-1.5">
                    <Link href={`/endocrinologo/pacientes/${idPaciente}/evaluacion-fisica/historial`} className="btn btn-ghost btn-xs gap-1 text-base-content/60">
                        <History size={13} /> Historial
                    </Link>
                    <button onClick={onEditar} className="btn btn-outline btn-primary btn-xs gap-1">
                        <Edit size={13} /> Editar
                    </button>
                </div>
            </div>

            <div className="border-b border-base-300 mb-3" />

            {/* Mediciones */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <Medicion etiqueta="Peso" valor={evaluacion.peso} unidad="kg" />
                <Medicion etiqueta="Talla" valor={evaluacion.talla} unidad="m" />
                <Medicion etiqueta="IMC" valor={evaluacion.imc} alerta={evaluacion.imc != null && evaluacion.imc >= 25} />
                <Medicion etiqueta="ICC" valor={evaluacion.indice_cintura_cadera} alerta={evaluacion.indice_cintura_cadera != null && evaluacion.indice_cintura_cadera >= 0.85} />
                <Medicion etiqueta="Cintura" valor={evaluacion.circunferencia_cintura} unidad="cm" alerta={evaluacion.circunferencia_cintura != null && evaluacion.circunferencia_cintura >= 80} />
                <Medicion etiqueta="Cadera" valor={evaluacion.circunferencia_cadera} unidad="cm" />
                <Medicion etiqueta="PA sist." valor={evaluacion.presion_sistolica} unidad="mmHg" alerta={evaluacion.presion_sistolica != null && evaluacion.presion_sistolica >= 130} />
                <Medicion etiqueta="PA diast." valor={evaluacion.presion_diastolica} unidad="mmHg" alerta={evaluacion.presion_diastolica != null && evaluacion.presion_diastolica >= 85} />
            </div>

            {/* Alertas */}
            {tieneHallazgos ? (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {alertas.map(a => <Badge key={a} variante="warning">{a}</Badge>)}
                </div>
            ) : null}

            {/* Hallazgos al examen */}
            <div className="flex flex-wrap gap-1.5 mb-3">
                <ChipExamen label="Hirsutismo" activo={evaluacion.hirsutismo_visible} />
                <ChipExamen label="Acné" activo={evaluacion.acne_visible} />
                <ChipExamen label="Alopecia" activo={evaluacion.alopecia_visible} />
            </div>

            {/* Interpretación */}
            <p className={clsx('text-xs font-medium', tieneHallazgos ? 'text-warning' : 'text-base-content/50')}>
                {interpretacion}
            </p>

            {evaluacion.observaciones ? (
                <div className="mt-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-base-content/40">Observaciones</p>
                    <p className="text-sm text-base-content">{evaluacion.observaciones}</p>
                </div>
            ) : null}
        </Tarjeta>
    );
}

function Medicion({ etiqueta, valor, unidad, alerta }: { etiqueta: string; valor?: number | null; unidad?: string; alerta?: boolean }) {
    return (
        <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-base-content/40">{etiqueta}</p>
            <p className={clsx('text-sm font-semibold', alerta ? 'text-warning' : 'text-base-content')}>
                {valor != null ? `${valor}${unidad ? ` ${unidad}` : ''}` : '-'}
            </p>
        </div>
    );
}

function ChipExamen({ label, activo }: { label: string; activo: boolean }) {
    return <Badge variante={activo ? 'warning' : 'ghost'}>{label}</Badge>;
}
