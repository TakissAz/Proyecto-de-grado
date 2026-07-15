import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import AvatarIniciales from '@/Components/ui/avatar-iniciales';
import type { PageProps } from '@/types';
import type { HistoriaMenstrualData } from './tipos';

interface RegistroHistorial extends HistoriaMenstrualData {
    estado?: string;
    created_at?: string | null;
    updated_at?: string | null;
}

interface Props extends PageProps {
    paciente: { id_paciente: number; nombre_completo: string; ci: string };
    registros: RegistroHistorial[];
}

export default function HistorialMenstrual({ paciente, registros }: Props) {
    const id = paciente.id_paciente;

    return (
        <AuthenticatedLayout title="Historial menstrual">
            <Head title={`Historial menstrual: ${paciente.nombre_completo}`} />

            <div className="space-y-5">
                {/* Cabecera tipo perfil compacta */}
                <div className="card-elevated overflow-hidden">
                    <div className="relative h-16 bg-[#F7F5F0] dark:bg-[#1E2124]">
                        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand-green/[0.06]" />
                        <Link
                            href={`/endocrinologo/pacientes/${id}/perfil-clinico`}
                            className="absolute left-4 top-4 flex items-center gap-1.5 rounded-lg bg-white/70 px-2.5 py-1.5 text-[11px] font-semibold text-ink backdrop-blur-sm hover:bg-white dark:bg-black/30 dark:text-ink-dark dark:hover:bg-black/50"
                        >
                            <ArrowLeft size={12} strokeWidth={1.8} /> Perfil clínico
                        </Link>
                    </div>

                    <div className="px-5 pb-4">
                        <div className="-mt-6 flex items-end gap-3">
                            <div className="rounded-full border-3 border-surface-card dark:border-surface-card-dark">
                                <AvatarIniciales nombre={paciente.nombre_completo} size={48} />
                            </div>
                            <div className="pb-1">
                                <h1 className="text-[15px] font-bold text-ink dark:text-ink-dark">{paciente.nombre_completo}</h1>
                                <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">CI: {paciente.ci} · Historia menstrual</p>
                            </div>
                            <div className="ml-auto pb-1">
                                <Badge color="green">{registros.length} registro{registros.length !== 1 ? 's' : ''}</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla */}
                <div className="card-elevated overflow-hidden">
                    <div className="px-5 py-4 border-b border-surface-border dark:border-surface-border-dark">
                        <h3 className="text-[14px] font-semibold text-ink dark:text-ink-dark">Registros cronológicos</h3>
                        <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark mt-0.5">Historial completo de evaluaciones menstruales</p>
                    </div>

                    {registros.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
                            <Calendar size={28} strokeWidth={1.2} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
                            <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark">No existen registros</p>
                            <p className="text-[11px] text-ink-muted/60 dark:text-ink-muted-dark/60">Aún no se ha registrado historia menstrual para esta paciente</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] border-collapse">
                                <thead>
                                    <tr className="border-b border-surface-border text-left text-[11px] font-semibold text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark">
                                        <th className="px-5 py-2.5">Fecha</th>
                                        <th className="px-3 py-2.5">Regularidad</th>
                                        <th className="px-3 py-2.5">Duración</th>
                                        <th className="px-3 py-2.5">Intervalo</th>
                                        <th className="px-3 py-2.5">Última menstruación</th>
                                        <th className="px-3 py-2.5">Hallazgos</th>
                                        <th className="px-3 py-2.5">Progesterona</th>
                                        <th className="px-5 py-2.5">Observaciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registros.map((r, idx) => (
                                        <tr
                                            key={r.id_historia_menstrual}
                                            className={`border-b border-[#F5F2EB] dark:border-[#262A32] ${idx % 2 !== 0 ? 'bg-[#FDFCFA] dark:bg-[#1A1D24]' : ''}`}
                                        >
                                            <td className="px-5 py-2.5">
                                                <p className="text-[12px] font-medium text-ink dark:text-ink-dark">{r.created_at ?? '—'}</p>
                                                {r.updated_at && r.updated_at !== r.created_at ? (
                                                    <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark">Act: {r.updated_at}</p>
                                                ) : null}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <Badge color={r.regularidad_ciclo === 'irregular' || r.regularidad_ciclo === 'ausente' ? 'orange' : 'green'}>
                                                    {formatRegularidad(r.regularidad_ciclo)}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-2.5 text-[12px] text-ink dark:text-ink-dark">{r.duracion_ciclo_dias ? `${r.duracion_ciclo_dias} d` : '—'}</td>
                                            <td className="px-3 py-2.5 text-[12px] text-ink dark:text-ink-dark">{r.intervalo_entre_ciclos_dias ? `${r.intervalo_entre_ciclos_dias} d` : '—'}</td>
                                            <td className="px-3 py-2.5 text-[12px] text-ink dark:text-ink-dark">{r.fecha_ultima_menstruacion ?? '—'}</td>
                                            <td className="px-3 py-2.5">
                                                <div className="flex flex-wrap gap-1">
                                                    {r.amenorrea ? <Badge color="orange">Amenorrea</Badge> : null}
                                                    {r.oligomenorrea ? <Badge color="orange">Oligomenorrea</Badge> : null}
                                                    {r.sospecha_anovulacion ? <Badge color="orange">Anovulación</Badge> : null}
                                                    {r.confirma_anovulacion_por_progesterona ? <Badge color="red">Anov. confirmada</Badge> : null}
                                                    {r.sangrado_abundante ? <Badge color="gray">Sangrado</Badge> : null}
                                                    {r.dolor_menstrual ? <Badge color="gray">Dolor</Badge> : null}
                                                    {!r.amenorrea && !r.oligomenorrea && !r.sospecha_anovulacion && !r.confirma_anovulacion_por_progesterona ? (
                                                        <span className="text-[10px] text-ink-muted/60 dark:text-ink-muted-dark/60">Sin hallazgos</span>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 text-[12px] text-ink dark:text-ink-dark">{r.progesterona_lutea ? `${r.progesterona_lutea} ng/mL` : '—'}</td>
                                            <td className="px-5 py-2.5 text-[12px] text-ink-muted dark:text-ink-muted-dark max-w-[150px] truncate">{r.observaciones ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function formatRegularidad(valor?: string | null): string {
    const map: Record<string, string> = { regular: 'Regular', irregular: 'Irregular', ausente: 'Ausente' };
    return map[valor ?? ''] ?? '—';
}
