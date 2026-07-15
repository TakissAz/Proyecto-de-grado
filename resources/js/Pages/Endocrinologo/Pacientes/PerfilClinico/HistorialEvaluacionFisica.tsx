import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import { Tarjeta } from '@/Components/ui/tarjeta';
import { Badge } from '@/Components/ui/badge';
import { EstadoVacio } from '@/Components/ui/estado-vacio';
import type { PageProps } from '@/types';
import type { EvaluacionFisicaData } from './tipos';

interface RegistroHistorial extends EvaluacionFisicaData {
    estado?: string;
    created_at?: string | null;
    updated_at?: string | null;
}

interface Props extends PageProps {
    paciente: { id_paciente: number; nombre_completo: string; ci: string };
    registros: RegistroHistorial[];
}

export default function HistorialEvaluacionFisica({ paciente, registros }: Props) {
    const id = paciente.id_paciente;

    return (
        <AuthenticatedLayout header={<h2>Historial evaluación física</h2>}>
            <Head title={`Historial evaluación física: ${paciente.nombre_completo}`} />

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

                <h3 className="text-base font-bold text-base-content">Historial de evaluación física endocrina</h3>

                {registros.length === 0 ? (
                    <Tarjeta>
                        <EstadoVacio mensaje="No existen registros de evaluación física endocrina para esta paciente." />
                    </Tarjeta>
                ) : (
                    <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table table-sm">
                                <thead>
                                    <tr className="text-base-content/50">
                                        <th>Fecha</th>
                                        <th>Peso</th>
                                        <th>Talla</th>
                                        <th>IMC</th>
                                        <th>Cintura</th>
                                        <th>ICC</th>
                                        <th>PA</th>
                                        <th>Hallazgos</th>
                                        <th>Observaciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registros.map((r) => {
                                        const hallazgos: string[] = [];
                                        if (r.acantosis_nigricans) hallazgos.push('Acantosis');
                                        if (r.skin_tags) hallazgos.push('Acrocordones');
                                        if (r.galactorrea) hallazgos.push('Galactorrea');
                                        if (r.hirsutismo_visible) hallazgos.push('Hirsutismo');
                                        if (r.acne_visible) hallazgos.push('Acné');
                                        if (r.alopecia_visible) hallazgos.push('Alopecia');

                                        return (
                                            <tr key={r.id_evaluacion_fisica} className="hover">
                                                <td>
                                                    <p className="font-medium text-xs">{r.created_at ?? '-'}</p>
                                                    {r.updated_at && r.updated_at !== r.created_at ? (
                                                        <p className="text-[10px] text-base-content/40">Act: {r.updated_at}</p>
                                                    ) : null}
                                                </td>
                                                <td className="text-xs">{r.peso != null ? `${r.peso} kg` : '-'}</td>
                                                <td className="text-xs">{r.talla != null ? `${r.talla} m` : '-'}</td>
                                                <td>
                                                    {r.imc != null ? (
                                                        <Badge variante={r.imc >= 25 ? 'warning' : 'ghost'}>{r.imc}</Badge>
                                                    ) : '-'}
                                                </td>
                                                <td>
                                                    {r.circunferencia_cintura != null ? (
                                                        <Badge variante={r.circunferencia_cintura >= 80 ? 'warning' : 'ghost'}>{r.circunferencia_cintura} cm</Badge>
                                                    ) : '-'}
                                                </td>
                                                <td>
                                                    {r.indice_cintura_cadera != null ? (
                                                        <Badge variante={r.indice_cintura_cadera >= 0.85 ? 'warning' : 'ghost'}>{r.indice_cintura_cadera}</Badge>
                                                    ) : '-'}
                                                </td>
                                                <td className="text-xs">
                                                    {r.presion_sistolica != null || r.presion_diastolica != null
                                                        ? `${r.presion_sistolica ?? '-'}/${r.presion_diastolica ?? '-'}`
                                                        : '-'}
                                                </td>
                                                <td>
                                                    <div className="flex flex-wrap gap-1">
                                                        {hallazgos.length > 0 ? hallazgos.map(h => <Badge key={h} variante="warning">{h}</Badge>) : <span className="text-[10px] text-base-content/40">Ninguno</span>}
                                                    </div>
                                                </td>
                                                <td className="text-xs max-w-[120px] truncate">{r.observaciones ?? '-'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
