import { router } from '@inertiajs/react';
import { Activity, ChevronDown, Download, Edit, Plus } from 'lucide-react';
import { useState } from 'react';
import FormularioEditarDiagnosticoRi from '@/Components/diagnosticos/FormularioEditarDiagnosticoRi';
import BotonEjecutarSistemaExperto from '@/Components/sistema-experto/BotonEjecutarSistemaExperto';
import TrazabilidadExpertaCard from '@/Components/sistema-experto/TrazabilidadExpertaCard';
import ValidacionResultadoExperto from '@/Components/sistema-experto/ValidacionResultadoExperto';
import { Tarjeta } from '@/Components/ui/tarjeta';
import { Badge } from '@/Components/ui/badge';
import { PanelSugerenciaRi } from './ri/PanelSugerenciaRi';
import { PanelConfirmacionRi } from './ri/PanelConfirmacionRi';
import type { DiagnosticoRiData, EvaluacionRiData } from '../tipos';

interface Props { evaluacion: EvaluacionRiData; diagnostico: DiagnosticoRiData | null; idPaciente: number; onRegistrar: () => void; onEditar: () => void; }

export default function TarjetaDiagnosticoRi({ evaluacion, diagnostico, idPaciente, onRegistrar }: Props) {
    const [editandoClinico, setEditandoClinico] = useState(false);
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const tieneAnalisis = Boolean(diagnostico && (diagnostico.generado_por_motor_experto === true || diagnostico.confianza_experta != null));
    const validacionResuelta = diagnostico ? ['aprobado', 'validado', 'rechazado'].includes(diagnostico.estado_validacion_experta ?? '') : false;

    return <Tarjeta>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
                <Activity size={18} className={diagnostico?.resistencia_confirmada ? 'text-error' : 'text-base-content/30'} />
                <h3 className="text-sm font-bold text-base-content">Resistencia a la insulina</h3>
                {diagnostico ? <Badge variante={diagnostico.resistencia_confirmada ? 'error' : 'ghost'}>{diagnostico.resistencia_confirmada ? 'Confirmada' : 'Registrada'}</Badge> : <Badge>Pendiente de evaluación</Badge>}
            </div>
            {diagnostico ? <div className="flex flex-wrap gap-2">
                <a href={`/endocrinologo/pacientes/${idPaciente}/diagnostico/resistencia-insulina/reporte-pdf`} target="_blank" rel="noreferrer" className="btn btn-outline btn-secondary btn-xs gap-1"><Download size={13} /> Descargar PDF RI</a>
                <button onClick={() => setEditandoClinico(true)} className="btn btn-outline btn-primary btn-xs gap-1"><Edit size={13} /> Editar diagnóstico clínico</button>
            </div> : <button onClick={onRegistrar} className="btn btn-primary btn-sm gap-1.5"><Plus size={14} /> Registrar diagnóstico</button>}
        </div>
        <div className="mb-3 border-b border-base-300" />
        <PanelSugerenciaRi evaluacion={evaluacion} />
        {diagnostico && <>
            <div className="my-3 border-b border-base-300" />
            <PanelConfirmacionRi diagnostico={diagnostico} />
            <div className="my-3 border-b border-base-300" />
            <div className="space-y-3">
                {validacionResuelta ? <div className="alert alert-info py-2 text-xs"><span>La valoración asistida ya fue revisada por el especialista.</span></div> : !tieneAnalisis ? <BotonEjecutarSistemaExperto url={`/endocrinologo/sistema-experto/resistencia-insulina/${diagnostico.id_diagnostico_ri}/ejecutar`} label="Generar análisis metabólico asistido" successMessage="El análisis metabólico fue generado correctamente." onSuccess={() => router.reload({ only: ['perfil'] })} /> : null}
                {tieneAnalisis && <button type="button" className="btn btn-primary btn-sm w-full justify-between sm:w-auto" onClick={() => setMostrarResultados((actual) => !actual)}>
                    {mostrarResultados ? 'Ocultar resultados finales' : 'Ver resultados finales'}
                    <ChevronDown size={16} className={`transition-transform ${mostrarResultados ? 'rotate-180' : ''}`} />
                </button>}
                {tieneAnalisis && mostrarResultados && <div className="space-y-3 rounded-2xl border border-primary/15 bg-base-200/30 p-3">
                    <TrazabilidadExpertaCard trazabilidad={diagnostico} />
                    <ValidacionResultadoExperto url={`/endocrinologo/sistema-experto/resistencia-insulina/${diagnostico.id_diagnostico_ri}/validar`} estadoActual={diagnostico.estado_validacion_experta} validadoPor={diagnostico.validado_por} fechaValidacion={diagnostico.fecha_validacion} observacionActual={diagnostico.observacion_validacion} onRejected={() => setEditandoClinico(true)} onSuccess={(data) => { const estado = (data as { estado_validacion_experta?: string } | undefined)?.estado_validacion_experta; if (estado !== 'rechazado') router.reload({ only: ['perfil'] }); }} />
                </div>}
            </div>
        </>}
        {diagnostico && <FormularioEditarDiagnosticoRi abierto={editandoClinico} diagnostico={diagnostico} evaluacion={evaluacion} onCerrar={() => setEditandoClinico(false)} onSuccess={() => router.reload({ only: ['perfil'] })} />}
    </Tarjeta>;
}
