import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Tarjeta } from '@/Components/ui/tarjeta';
import { Badge } from '@/Components/ui/badge';
import { EstadoVacio } from '@/Components/ui/estado-vacio';
import type { PageProps } from '@/types';
import type { AntecedentesData } from './tipos';

interface RegistroHistorial extends AntecedentesData {
    estado?: string;
    created_at?: string | null;
    updated_at?: string | null;
}

interface Props extends PageProps {
    paciente: { id_paciente: number; nombre_completo: string; ci: string };
    registros: RegistroHistorial[];
}

export default function HistorialAntecedentes({ paciente, registros }: Props) {
    const id = paciente.id_paciente;

    return (
        <AuthenticatedLayout header={<h2>Historial de antecedentes</h2>}>
            <Head title={`Historial antecedentes: ${paciente.nombre_completo}`} />

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

                <h3 className="text-base font-bold text-base-content">Historial de antecedentes endocrino-metabólicos</h3>

                {registros.length === 0 ? (
                    <Tarjeta>
                        <EstadoVacio mensaje="No existen registros de antecedentes endocrino-metabólicos para esta paciente." />
                    </Tarjeta>
                ) : (
                    <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table table-sm">
                                <thead>
                                    <tr className="text-base-content/50">
                                        <th>Fecha</th>
                                        <th>Personales</th>
                                        <th>Familiares</th>
                                        <th>Medicamentos</th>
                                        <th>Otros med.</th>
                                        <th>Observaciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registros.map((r) => {
                                        const personales = [
                                            r.diabetes_personal && 'DM',
                                            r.hipertension_personal && 'HTA',
                                            r.dislipidemia_personal && 'Dislip.',
                                            r.enfermedad_tiroidea && 'Tiroides',
                                            r.hiperprolactinemia_previa && 'Hiperprol.',
                                        ].filter(Boolean) as string[];

                                        const familiares = [
                                            r.diabetes_familiar && 'DM fam.',
                                            r.hipertension_familiar && 'HTA fam.',
                                            r.dislipidemia_familiar && 'Dislip. fam.',
                                        ].filter(Boolean) as string[];

                                        const meds = [
                                            r.uso_metformina && 'Metformina',
                                            r.uso_anticonceptivos && 'ACOs',
                                            r.uso_corticoides && 'Corticoides',
                                        ].filter(Boolean) as string[];

                                        return (
                                            <tr key={r.id_antecedente} className="hover">
                                                <td>
                                                    <p className="font-medium text-xs">{r.created_at ?? '-'}</p>
                                                    {r.updated_at && r.updated_at !== r.created_at ? (
                                                        <p className="text-[10px] text-base-content/40">Act: {r.updated_at}</p>
                                                    ) : null}
                                                </td>
                                                <td>
                                                    <div className="flex flex-wrap gap-1">
                                                        {personales.length > 0 ? personales.map(p => <Badge key={p} variante="warning">{p}</Badge>) : <span className="text-[10px] text-base-content/40">Ninguno</span>}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex flex-wrap gap-1">
                                                        {familiares.length > 0 ? familiares.map(f => <Badge key={f}>{f}</Badge>) : <span className="text-[10px] text-base-content/40">Ninguno</span>}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex flex-wrap gap-1">
                                                        {meds.length > 0 ? meds.map(m => <Badge key={m} variante="info">{m}</Badge>) : <span className="text-[10px] text-base-content/40">Ninguno</span>}
                                                    </div>
                                                </td>
                                                <td className="text-xs max-w-[120px] truncate">{r.otros_medicamentos ?? '-'}</td>
                                                <td className="text-xs max-w-[150px] truncate">{r.observaciones ?? '-'}</td>
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
