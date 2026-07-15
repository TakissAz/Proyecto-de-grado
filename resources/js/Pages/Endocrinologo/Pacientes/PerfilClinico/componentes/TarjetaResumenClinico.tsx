import { Heart } from 'lucide-react';
import Tarjeta from '@/Components/ui/tarjeta';
import { Badge } from '@/Components/ui/badge';
import type { ResumenClinico } from '../tipos';

interface Props {
    resumen: ResumenClinico;
}

export default function TarjetaResumenClinico({ resumen }: Props) {
    return (
        <Tarjeta>
            <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green-dark dark:bg-brand-green-dark/20 dark:text-brand-green">
                    <Heart size={14} strokeWidth={1.8} />
                </div>
                <h3 className="text-[14px] font-semibold text-ink dark:text-ink-dark">Resumen clínico</h3>
            </div>

            <div className="border-b border-surface-border dark:border-surface-border-dark mb-3" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Detalle etiqueta="Consultas registradas" valor={String(resumen.total_consultas)} />
                <Detalle etiqueta="Última consulta" valor={resumen.ultima_consulta ?? 'Sin consultas'} />

                {resumen.diagnostico_pmos ? (
                    <>
                        <div>
                            <p className="text-[10.5px] uppercase tracking-wide font-semibold text-ink-muted dark:text-ink-muted-dark">PMOS</p>
                            <div className="mt-1">
                                <Badge color={resumen.diagnostico_pmos.confirmado ? 'red' : 'orange'}>
                                    {resumen.diagnostico_pmos.confirmado ? 'Confirmado' : 'En evaluación'}
                                </Badge>
                            </div>
                        </div>
                        {resumen.diagnostico_pmos.fenotipo ? (
                            <Detalle etiqueta="Fenotipo" valor={resumen.diagnostico_pmos.fenotipo.replace(/_/g, ' ')} />
                        ) : null}
                    </>
                ) : (
                    <Detalle etiqueta="PMOS" valor="Sin diagnóstico" />
                )}

                {resumen.diagnostico_resistencia_insulina ? (
                    <div>
                        <p className="text-[10.5px] uppercase tracking-wide font-semibold text-ink-muted dark:text-ink-muted-dark">Resistencia a la insulina</p>
                        <div className="mt-1">
                            <Badge color="red">Confirmada</Badge>
                        </div>
                    </div>
                ) : (
                    <Detalle etiqueta="Resistencia a la insulina" valor="Sin diagnóstico" />
                )}
            </div>
        </Tarjeta>
    );
}

function Detalle({ etiqueta, valor }: { etiqueta: string; valor: string }) {
    return (
        <div>
            <p className="text-[10.5px] uppercase tracking-wide font-semibold text-ink-muted dark:text-ink-muted-dark">{etiqueta}</p>
            <p className="text-[13px] font-medium text-ink dark:text-ink-dark">{valor}</p>
        </div>
    );
}
