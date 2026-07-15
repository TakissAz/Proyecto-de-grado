import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Tarjeta } from '@/Components/ui/tarjeta';
import { Badge } from '@/Components/ui/badge';
import { EstadoVacio } from '@/Components/ui/estado-vacio';
import type { PageProps } from '@/types';
import type { EcografiaData } from './tipos';

interface RegistroHistorial extends EcografiaData {
    estado?: string;
    created_at?: string | null;
    updated_at?: string | null;
}

interface Props extends PageProps {
    paciente: { id_paciente: number; nombre_completo: string; ci: string };
    registros: RegistroHistorial[];
}

export default function HistorialEcografia({ paciente, registros }: Props) {
    const id = paciente.id_paciente;

    return (
        <AuthenticatedLayout header={<h2>Historial ecográfico</h2>}>
            <Head title={`Historial ecografía: ${paciente.nombre_completo}`} />

            <div className="space-y-5">
                <Link href={`/endocrinologo/pacientes/${id}/perfil-clinico`} className="btn btn-ghost btn-xs gap-1">
                    <ArrowLeft size={14} /> Volver al perfil clínico
                </Link>

                <div className="bg-base-100 border border-base-300 rounded-2xl p-4 flex items-center gap-3 flex-wrap">
                    <div>
                        <h2 className="text-lg font-extrabold text-base-content">{paciente.nombre_completo}</h2>
                        <p className="text-xs text-base-content/50">CI: {paciente.ci}</p>
                    </div>
                    <Badge>{registros.length} registro(s)</Badge>
                </div>

                <h3 className="text-base font-bold text-base-content">Historial de evaluación ecográfica</h3>

                {registros.length === 0 ? (
                    <Tarjeta>
                        <EstadoVacio mensaje="No existen registros de evaluación ecográfica para esta paciente." />
                    </Tarjeta>
                ) : (
                    <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table table-sm">
                                <thead>
                                    <tr className="text-base-content/50">
                                        <th>Fecha</th>
                                        <th>Tipo</th>
                                        <th>Vol. OD</th>
                                        <th>Vol. OI</th>
                                        <th>Fol. OD</th>
                                        <th>Fol. OI</th>
                                        <th>Hallazgos</th>
                                        <th>Observaciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registros.map((r) => (
                                        <tr key={r.id_ecografia} className="hover">
                                            <td>
                                                <p className="font-medium text-xs">{r.fecha_ecografia}</p>
                                                <p className="text-[10px] text-base-content/40">{r.created_at}</p>
                                            </td>
                                            <td className="text-xs">{formatTipo(r.tipo_ecografia)}</td>
                                            <td>
                                                {r.volumen_ovario_derecho != null ? (
                                                    <Badge variante={r.volumen_ovario_derecho >= 10 ? 'warning' : 'ghost'}>{r.volumen_ovario_derecho} mL</Badge>
                                                ) : '-'}
                                            </td>
                                            <td>
                                                {r.volumen_ovario_izquierdo != null ? (
                                                    <Badge variante={r.volumen_ovario_izquierdo >= 10 ? 'warning' : 'ghost'}>{r.volumen_ovario_izquierdo} mL</Badge>
                                                ) : '-'}
                                            </td>
                                            <td>
                                                {r.foliculos_ovario_derecho != null ? (
                                                    <Badge variante={r.foliculos_ovario_derecho >= 12 ? 'warning' : 'ghost'}>{r.foliculos_ovario_derecho}</Badge>
                                                ) : '-'}
                                            </td>
                                            <td>
                                                {r.foliculos_ovario_izquierdo != null ? (
                                                    <Badge variante={r.foliculos_ovario_izquierdo >= 12 ? 'warning' : 'ghost'}>{r.foliculos_ovario_izquierdo}</Badge>
                                                ) : '-'}
                                            </td>
                                            <td>
                                                <div className="flex flex-wrap gap-1">
                                                    {r.morfologia_compatible_pmos ? <Badge variante="warning">PMOS</Badge> : null}
                                                    {r.distribucion_periferica ? <Badge>Periférica</Badge> : null}
                                                    {!r.morfologia_compatible_pmos && !r.distribucion_periferica ? (
                                                        <span className="text-[10px] text-base-content/40">Normal</span>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="text-xs max-w-[120px] truncate">{r.observaciones ?? '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

function formatTipo(tipo?: string | null): string {
    const map: Record<string, string> = { transvaginal: 'TV', abdominal: 'Abd.', otra: 'Otra' };
    return map[tipo ?? ''] ?? '-';
}
