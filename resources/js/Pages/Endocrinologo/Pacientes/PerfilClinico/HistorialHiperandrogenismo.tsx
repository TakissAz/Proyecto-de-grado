import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Tarjeta } from '@/Components/ui/tarjeta';
import { Badge } from '@/Components/ui/badge';
import { EstadoVacio } from '@/Components/ui/estado-vacio';
import type { PageProps } from '@/types';
import type { HiperandrogenismoData } from './tipos';

interface RegistroHistorial extends HiperandrogenismoData {
    estado?: string;
    created_at?: string | null;
    updated_at?: string | null;
}

interface Props extends PageProps {
    paciente: { id_paciente: number; nombre_completo: string; ci: string };
    registros: RegistroHistorial[];
}

export default function HistorialHiperandrogenismo({ paciente, registros }: Props) {
    const id = paciente.id_paciente;

    return (
        <AuthenticatedLayout header={<h2>Historial de hiperandrogenismo</h2>}>
            <Head title={`Historial hiperandrogenismo: ${paciente.nombre_completo}`} />

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

                <h3 className="text-base font-bold text-base-content">Historial de hiperandrogenismo</h3>

                {registros.length === 0 ? (
                    <Tarjeta>
                        <EstadoVacio mensaje="No existen registros de hiperandrogenismo para esta paciente." />
                    </Tarjeta>
                ) : (
                    <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table table-sm">
                                <thead>
                                    <tr className="text-base-content/50">
                                        <th>Fecha</th>
                                        <th>Signos clínicos</th>
                                        <th>Ferriman-Gallwey</th>
                                        <th>Inicio</th>
                                        <th>Progresión</th>
                                        <th>Observaciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registros.map((r) => (
                                        <tr key={r.id_historia_hiperandrogenica} className="hover">
                                            <td>
                                                <p className="font-medium text-xs">{r.created_at ?? '-'}</p>
                                                {r.updated_at && r.updated_at !== r.created_at ? (
                                                    <p className="text-[10px] text-base-content/40">Act: {r.updated_at}</p>
                                                ) : null}
                                            </td>
                                            <td>
                                                <div className="flex flex-wrap gap-1">
                                                    {r.acne ? <Badge variante={r.acne_grado === 'moderado' || r.acne_grado === 'severo' ? 'warning' : 'ghost'}>Acné {r.acne_grado !== 'no_aplica' ? r.acne_grado : ''}</Badge> : null}
                                                    {r.hirsutismo ? <Badge variante="warning">{r.hirsutismo_zona ? `Hirsutismo (${r.hirsutismo_zona})` : 'Hirsutismo'}</Badge> : null}
                                                    {r.alopecia_androgenica ? <Badge variante="warning">Alopecia</Badge> : null}
                                                    {r.seborrea ? <Badge>Seborrea</Badge> : null}
                                                    {!r.acne && !r.hirsutismo && !r.alopecia_androgenica && !r.seborrea ? (
                                                        <span className="text-[10px] text-base-content/40">Sin signos</span>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td>
                                                {r.puntaje_ferriman_gallwey != null ? (
                                                    <Badge variante={r.puntaje_ferriman_gallwey >= 8 ? 'error' : 'ghost'}>
                                                        {r.puntaje_ferriman_gallwey} pts
                                                    </Badge>
                                                ) : '-'}
                                            </td>
                                            <td className="text-xs">{r.inicio_sintomas ?? '-'}</td>
                                            <td>
                                                {r.progresion_sintomas ? (
                                                    <Badge variante={r.progresion_sintomas === 'progresivo' ? 'error' : 'ghost'}>
                                                        {formatProgresion(r.progresion_sintomas)}
                                                    </Badge>
                                                ) : '-'}
                                            </td>
                                            <td className="text-xs max-w-[150px] truncate">{r.observaciones ?? '-'}</td>
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

function formatProgresion(progresion: string): string {
    const map: Record<string, string> = { estable: 'Estable', progresivo: 'Progresivo', regresivo: 'Regresivo' };
    return map[progresion] ?? progresion;
}
