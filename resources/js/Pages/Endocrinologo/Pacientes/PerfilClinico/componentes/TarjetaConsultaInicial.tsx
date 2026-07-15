import { FileText, Edit, Plus } from 'lucide-react';
import Tarjeta from '@/Components/ui/tarjeta';
import { Badge } from '@/Components/ui/badge';
import { Boton } from '@/Components/ui/boton';
import type { ConsultaInicial } from '../tipos';

interface Props {
    consulta: ConsultaInicial | null;
    idPaciente: number;
    onRegistrar: () => void;
    onEditar: () => void;
}

export default function TarjetaConsultaInicial({ consulta, idPaciente, onRegistrar, onEditar }: Props) {
    if (!consulta) {
        return (
            <Tarjeta>
                <div className="flex items-center gap-2 mb-2">
                    <FileText size={16} strokeWidth={1.8} className="text-ink-muted dark:text-ink-muted-dark" />
                    <h3 className="text-[14px] font-semibold text-ink dark:text-ink-dark">Consulta inicial</h3>
                    <Badge color="gray">Pendiente</Badge>
                </div>
                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark mb-3">
                    No se ha registrado la consulta inicial. Registra el motivo de consulta y las sospechas clínicas.
                </p>
                <Boton variante="primary" tamano="sm" onClick={onRegistrar}>
                    <Plus size={14} strokeWidth={1.8} /> Registrar consulta inicial
                </Boton>
            </Tarjeta>
        );
    }

    return (
        <Tarjeta>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green-dark dark:bg-brand-green-dark/20 dark:text-brand-green">
                        <FileText size={14} strokeWidth={1.8} />
                    </div>
                    <h3 className="text-[14px] font-semibold text-ink dark:text-ink-dark">Consulta inicial</h3>
                    <Badge color="green">Registrada</Badge>
                </div>
                <Boton variante="outline" tamano="xs" onClick={onEditar}>
                    <Edit size={12} strokeWidth={1.8} /> Editar
                </Boton>
            </div>

            <div className="border-b border-surface-border dark:border-surface-border-dark mb-3" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <Detalle etiqueta="Fecha de consulta" valor={consulta.fecha_consulta} />
                <Detalle etiqueta="Profesional" valor={consulta.profesional?.nombre ?? 'No registrado'} />
                <div className="sm:col-span-2">
                    <Detalle etiqueta="Motivo de consulta" valor={consulta.motivo_consulta} />
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge color={consulta.sospecha_pmos ? 'orange' : 'gray'}>
                    {consulta.sospecha_pmos ? 'Sospecha PMOS' : 'Sin sospecha PMOS'}
                </Badge>
                <Badge color={consulta.sospecha_resistencia_insulina ? 'orange' : 'gray'}>
                    {consulta.sospecha_resistencia_insulina ? 'Sospecha RI' : 'Sin sospecha RI'}
                </Badge>
            </div>

            {consulta.observaciones_generales ? (
                <Detalle etiqueta="Observaciones" valor={consulta.observaciones_generales} />
            ) : null}
        </Tarjeta>
    );
}

function Detalle({ etiqueta, valor }: { etiqueta: string; valor?: string | null }) {
    return (
        <div>
            <p className="text-[10.5px] uppercase tracking-wide font-semibold text-ink-muted dark:text-ink-muted-dark">{etiqueta}</p>
            <p className="text-[13px] font-medium text-ink dark:text-ink-dark">{valor ?? '—'}</p>
        </div>
    );
}
