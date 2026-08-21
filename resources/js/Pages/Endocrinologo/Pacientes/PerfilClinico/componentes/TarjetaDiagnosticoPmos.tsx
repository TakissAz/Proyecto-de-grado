import { router } from '@inertiajs/react';
import { ChevronDown, Download, Edit, Heart, Plus } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import FormularioEditarDiagnosticoPmos from '@/Components/diagnosticos/FormularioEditarDiagnosticoPmos';
import BotonEjecutarSistemaExperto from '@/Components/sistema-experto/BotonEjecutarSistemaExperto';
import TrazabilidadExpertaCard from '@/Components/sistema-experto/TrazabilidadExpertaCard';
import ValidacionResultadoExperto from '@/Components/sistema-experto/ValidacionResultadoExperto';
import { Badge } from '@/Components/ui/badge';
import { Boton } from '@/Components/ui/boton';
import { PanelSugerenciaPmos } from './pmos/PanelSugerenciaPmos';
import { PanelConfirmacionPmos } from './pmos/PanelConfirmacionPmos';
import type { DiagnosticoPmosData, EvaluacionPmosData } from '../tipos';

interface Props {
    evaluacion: EvaluacionPmosData;
    diagnostico: DiagnosticoPmosData | null;
    idPaciente: number;
    onRegistrar: () => void;
    onEditar: () => void;
}

export default function TarjetaDiagnosticoPmos({ evaluacion, diagnostico, idPaciente, onRegistrar }: Props) {
    const [editandoClinico, setEditandoClinico] = useState(false);
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const tieneAnalisis = Boolean(diagnostico && (diagnostico.generado_por_motor_experto === true || diagnostico.confianza_experta != null));
    const validacionResuelta = diagnostico ? ['aprobado', 'validado', 'rechazado'].includes(diagnostico.estado_validacion_experta ?? '') : false;

    return (
        <div className="p-5 space-y-4">

            {/* ── Header ── */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                    <div className={clsx(
                        'flex h-8 w-8 items-center justify-center rounded-xl',
                        diagnostico?.diagnostico_confirmado ? 'bg-category-fruits/15' : 'bg-brand-green/15',
                    )}>
                        <Heart
                            size={15}
                            strokeWidth={1.8}
                            className={diagnostico?.diagnostico_confirmado ? 'text-category-fruits' : 'text-ink-muted/40 dark:text-ink-muted-dark/40'}
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Diagnóstico PMOS</h3>
                            {diagnostico ? (
                                <Badge color={diagnostico.diagnostico_confirmado ? 'red' : 'gray'}>
                                    {diagnostico.diagnostico_confirmado ? 'Confirmado' : 'No confirmado'}
                                </Badge>
                            ) : (
                                <Badge color="gray">Pendiente</Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Acciones */}
                {diagnostico ? (
                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href={`/endocrinologo/pacientes/${idPaciente}/diagnostico/pmos/reporte-pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[0.03] hover:text-ink dark:border-surface-border-dark dark:text-ink-muted-dark dark:hover:bg-white/[0.04] dark:hover:text-ink-dark"
                        >
                            <Download size={12} strokeWidth={1.8} /> Descargar PDF
                        </a>
                        <button
                            onClick={() => setEditandoClinico(true)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green/10 dark:text-brand-green dark:hover:bg-brand-green-dark/15"
                        >
                            <Edit size={12} strokeWidth={1.8} /> Editar diagnóstico
                        </button>
                    </div>
                ) : (
                    <Boton variante="primary" tamano="sm" onClick={onRegistrar}>
                        <Plus size={13} strokeWidth={1.8} /> Registrar diagnóstico
                    </Boton>
                )}
            </div>

            {/* ── Sugerencia del motor ── */}
            <PanelSugerenciaPmos evaluacion={evaluacion} />

            {/* ── Panel de confirmación (diagnóstico registrado) ── */}
            {diagnostico && (
                <>
                    <div className="border-t border-surface-border dark:border-surface-border-dark" />
                    <PanelConfirmacionPmos diagnostico={diagnostico} />

                    <div className="border-t border-surface-border dark:border-surface-border-dark" />

                    {/* ── Sistema experto ── */}
                    <div className="space-y-3">
                        {validacionResuelta ? (
                            <div className="flex items-center gap-2 rounded-xl border border-brand-green/20 bg-brand-green/5 px-4 py-2.5 dark:bg-brand-green/[0.06]">
                                <span className="text-[11.5px] text-ink dark:text-ink-dark">La valoración asistida ya fue revisada por el especialista.</span>
                            </div>
                        ) : !tieneAnalisis ? (
                            <BotonEjecutarSistemaExperto
                                url={`/endocrinologo/sistema-experto/pmos/${diagnostico.id_diagnostico_pmos}/ejecutar`}
                                label="Generar análisis clínico PMOS"
                                successMessage="El análisis clínico PMOS fue generado correctamente."
                                onSuccess={() => router.reload({ only: ['perfil'] })}
                            />
                        ) : null}

                        {tieneAnalisis && (
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2 text-[12px] font-semibold text-ink transition-colors hover:bg-black/[0.03] dark:border-surface-border-dark dark:text-ink-dark dark:hover:bg-white/[0.04]"
                                onClick={() => setMostrarResultados((actual) => !actual)}
                            >
                                {mostrarResultados ? 'Ocultar resultados finales' : 'Ver resultados finales'}
                                <ChevronDown size={14} className={clsx('transition-transform', mostrarResultados && 'rotate-180')} />
                            </button>
                        )}

                        {tieneAnalisis && mostrarResultados && (
                            <div className="space-y-3 rounded-xl border border-surface-border p-4 dark:border-surface-border-dark">
                                <TrazabilidadExpertaCard trazabilidad={diagnostico} />
                                <ValidacionResultadoExperto
                                    url={`/endocrinologo/sistema-experto/pmos/${diagnostico.id_diagnostico_pmos}/validar`}
                                    estadoActual={diagnostico.estado_validacion_experta}
                                    validadoPor={diagnostico.validado_por}
                                    fechaValidacion={diagnostico.fecha_validacion}
                                    observacionActual={diagnostico.observacion_validacion}
                                    onRejected={() => setEditandoClinico(true)}
                                    onSuccess={(data) => {
                                        const estado = (data as { estado_validacion_experta?: string } | undefined)?.estado_validacion_experta;
                                        if (estado !== 'rechazado') router.reload({ only: ['perfil'] });
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Modal de edición */}
            {diagnostico && (
                <FormularioEditarDiagnosticoPmos
                    abierto={editandoClinico}
                    diagnostico={diagnostico}
                    evaluacion={evaluacion}
                    onCerrar={() => setEditandoClinico(false)}
                    onSuccess={() => router.reload({ only: ['perfil'] })}
                />
            )}
        </div>
    );
}
