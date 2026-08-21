import clsx from 'clsx';
import { Link } from '@inertiajs/react';
import { ScanSearch, Edit, Plus, History, Calendar } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Boton } from '@/Components/ui/boton';
import type { EcografiaData } from '../../tipos';

interface Props {
    ecografia: EcografiaData | null;
    idPaciente: number;
    onRegistrar: () => void;
    onEditar: () => void;
}

export default function TarjetaEcografia({ ecografia, idPaciente, onRegistrar, onEditar }: Props) {
    if (!ecografia) {
        return (
            <div className="p-5">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-green/10">
                        <ScanSearch size={15} strokeWidth={1.8} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-semibold text-ink dark:text-ink-dark">Evaluación ecográfica</h3>
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Pendiente de registro</p>
                    </div>
                </div>
                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark mb-4 leading-relaxed">
                    No se ha registrado evaluación ecográfica. Necesaria para evaluar morfología ovárica en el diagnóstico PMOS.
                </p>
                <Boton variante="primary" tamano="sm" onClick={onRegistrar}>
                    <Plus size={13} strokeWidth={1.8} /> Registrar ecografía
                </Boton>
            </div>
        );
    }

    const compatible = ecografia.morfologia_compatible_pmos;

    return (
        <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                    <div className={clsx('flex h-8 w-8 items-center justify-center rounded-xl', compatible ? 'bg-brand-orange/15' : 'bg-brand-green/15')}>
                        <ScanSearch size={15} strokeWidth={1.8} className={compatible ? 'text-brand-orange' : 'text-brand-green-dark dark:text-brand-green'} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Evaluación ecográfica</h3>
                            <Badge color={compatible ? 'orange' : 'green'}>
                                {compatible ? 'Compatible PMOS' : 'Sin hallazgos'}
                            </Badge>
                        </div>
                        {(ecografia as any).created_at && (
                            <p className="flex items-center gap-1 text-[10.5px] text-ink-muted dark:text-ink-muted-dark mt-0.5">
                                <Calendar size={10} strokeWidth={1.8} />
                                Registrado el {(ecografia as any).created_at}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Boton variante="primary" tamano="xs" onClick={onRegistrar}>
                        <Plus size={12} strokeWidth={1.8} /> Nuevo registro
                    </Boton>
                    <Link href={`/endocrinologo/pacientes/${idPaciente}/ecografia/historial`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[0.03] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.04] dark:hover:text-ink-dark">
                        <History size={12} strokeWidth={1.8} /> Historial
                    </Link>
                    <button onClick={onEditar} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green-soft dark:text-brand-green dark:hover:bg-brand-green-dark/15">
                        <Edit size={12} strokeWidth={1.8} /> Editar
                    </button>
                </div>
            </div>

            {/* Datos + Gráfico ovárico */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-4">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">Datos clínicos</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <DatoItem label="Fecha" valor={ecografia.fecha_ecografia} />
                        <DatoItem label="Tipo" valor={formatTipo(ecografia.tipo_ecografia)} />
                        <DatoItem label="Vol. ovario derecho" valor={ecografia.volumen_ovario_derecho != null ? `${ecografia.volumen_ovario_derecho} mL` : null} destacar={ecografia.volumen_ovario_derecho != null && ecografia.volumen_ovario_derecho >= 10} />
                        <DatoItem label="Vol. ovario izquierdo" valor={ecografia.volumen_ovario_izquierdo != null ? `${ecografia.volumen_ovario_izquierdo} mL` : null} destacar={ecografia.volumen_ovario_izquierdo != null && ecografia.volumen_ovario_izquierdo >= 10} />
                        <DatoItem label="Folículos OD" valor={ecografia.foliculos_ovario_derecho?.toString() ?? '—'} destacar={ecografia.foliculos_ovario_derecho != null && ecografia.foliculos_ovario_derecho >= 12} />
                        <DatoItem label="Folículos OI" valor={ecografia.foliculos_ovario_izquierdo?.toString() ?? '—'} destacar={ecografia.foliculos_ovario_izquierdo != null && ecografia.foliculos_ovario_izquierdo >= 12} />
                    </div>
                </div>

                {/* Gráfico comparativo de ovarios (siempre visible) */}
                <GraficoOvarios
                    volOD={ecografia.volumen_ovario_derecho}
                    volOI={ecografia.volumen_ovario_izquierdo}
                    folOD={ecografia.foliculos_ovario_derecho}
                    folOI={ecografia.foliculos_ovario_izquierdo}
                />
            </div>

            {/* Imagen de ecografía */}
            {ecografia.imagen_url && (
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">Imagen ecográfica</p>
                    <a href={ecografia.imagen_url} target="_blank" rel="noopener noreferrer" className="block">
                        <img
                            src={ecografia.imagen_url}
                            alt="Ecografía"
                            className="w-full max-h-56 object-contain rounded-xl border border-surface-border dark:border-surface-border-dark cursor-zoom-in hover:opacity-90 transition-opacity"
                        />
                    </a>
                </div>
            )}

            {/* Hallazgos */}
            <div className="flex flex-wrap gap-1.5">
                {compatible && <Badge color="orange">Morfología compatible PMOS</Badge>}
                {ecografia.distribucion_periferica && <Badge color="orange">Distribución periférica</Badge>}
                {ecografia.volumen_ovario_derecho != null && ecografia.volumen_ovario_derecho >= 10 && <Badge color="orange">Vol. OD ≥ 10 mL</Badge>}
                {ecografia.volumen_ovario_izquierdo != null && ecografia.volumen_ovario_izquierdo >= 10 && <Badge color="orange">Vol. OI ≥ 10 mL</Badge>}
                {ecografia.foliculos_ovario_derecho != null && ecografia.foliculos_ovario_derecho >= 12 && <Badge color="red">Folículos OD ≥ 12</Badge>}
                {ecografia.foliculos_ovario_izquierdo != null && ecografia.foliculos_ovario_izquierdo >= 12 && <Badge color="red">Folículos OI ≥ 12</Badge>}
                {!compatible && !ecografia.distribucion_periferica && <Badge color="green">Sin hallazgos compatibles</Badge>}
            </div>

            {/* Interpretación */}
            <p className={clsx('text-[12px] font-medium', compatible ? 'text-brand-orange' : 'text-ink-muted dark:text-ink-muted-dark')}>
                {compatible ? 'Hallazgos ecográficos compatibles con morfología ovárica PMOS.' : 'Sin hallazgos ecográficos compatibles registrados.'}
            </p>

            {ecografia.observaciones && (
                <div className="rounded-xl border border-surface-border px-4 py-3 dark:border-surface-border-dark">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">Observaciones</p>
                    <p className="text-[12.5px] text-ink dark:text-ink-dark leading-relaxed">{ecografia.observaciones}</p>
                </div>
            )}
        </div>
    );
}

function GraficoOvarios({ volOD, volOI, folOD, folOI }: { volOD?: number | null; volOI?: number | null; folOD?: number | null; folOI?: number | null }) {
    const maxVol = Math.max(volOD ?? 0, volOI ?? 0, 10) * 1.2;
    return (
        <div className="rounded-xl border border-surface-border p-3 dark:border-surface-border-dark">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2.5">Comparativa ovárica</p>
            <div className="space-y-2.5">
                {(volOD != null || volOI != null) && (
                    <div>
                        <p className="text-[9px] text-ink-muted dark:text-ink-muted-dark mb-1">Volumen (mL)</p>
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[9px] w-6 text-ink-muted dark:text-ink-muted-dark">OD</span>
                            <div className="flex-1 h-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden">
                                <div className={clsx('h-full rounded-full', (volOD ?? 0) >= 10 ? 'bg-brand-orange' : 'bg-brand-green')} style={{ width: `${Math.min(((volOD ?? 0) / maxVol) * 100, 100)}%` }} />
                            </div>
                            <span className="text-[9px] font-bold w-8 text-right text-ink dark:text-ink-dark">{volOD ?? '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[9px] w-6 text-ink-muted dark:text-ink-muted-dark">OI</span>
                            <div className="flex-1 h-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden">
                                <div className={clsx('h-full rounded-full', (volOI ?? 0) >= 10 ? 'bg-brand-orange' : 'bg-category-dairy')} style={{ width: `${Math.min(((volOI ?? 0) / maxVol) * 100, 100)}%` }} />
                            </div>
                            <span className="text-[9px] font-bold w-8 text-right text-ink dark:text-ink-dark">{volOI ?? '—'}</span>
                        </div>
                        <p className="text-[8px] text-ink-muted/50 dark:text-ink-muted-dark/50 mt-0.5">≥10 mL = elevado</p>
                    </div>
                )}
                {(folOD != null || folOI != null) && (
                    <div>
                        <p className="text-[9px] text-ink-muted dark:text-ink-muted-dark mb-1">Folículos</p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 text-center rounded-lg py-1.5 bg-black/[0.02] dark:bg-white/[0.03]">
                                <p className={clsx('text-[14px] font-bold', (folOD ?? 0) >= 12 ? 'text-category-fruits' : 'text-ink dark:text-ink-dark')}>{folOD ?? '—'}</p>
                                <p className="text-[8px] text-ink-muted dark:text-ink-muted-dark">OD</p>
                            </div>
                            <div className="flex-1 text-center rounded-lg py-1.5 bg-black/[0.02] dark:bg-white/[0.03]">
                                <p className={clsx('text-[14px] font-bold', (folOI ?? 0) >= 12 ? 'text-category-fruits' : 'text-ink dark:text-ink-dark')}>{folOI ?? '—'}</p>
                                <p className="text-[8px] text-ink-muted dark:text-ink-muted-dark">OI</p>
                            </div>
                        </div>
                        <p className="text-[8px] text-ink-muted/50 dark:text-ink-muted-dark/50 mt-0.5">≥12 folículos = criterio PMOS</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function DatoItem({ label, valor, destacar }: { label: string; valor?: string | null; destacar?: boolean }) {
    return (
        <div className="rounded-lg bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03]">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">{label}</p>
            <p className={clsx('text-[12.5px] font-bold', destacar ? 'text-brand-orange' : 'text-ink dark:text-ink-dark')}>{valor ?? '—'}</p>
        </div>
    );
}

function formatTipo(tipo?: string | null): string {
    const map: Record<string, string> = { transvaginal: 'Transvaginal', abdominal: 'Abdominal', otra: 'Otra' };
    return map[tipo ?? ''] ?? '—';
}
