import clsx from 'clsx';
import { Link } from '@inertiajs/react';
import { HeartPulse, Edit, Plus, History, Calendar, User, Users, Pill } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Boton } from '@/Components/ui/boton';
import type {
    AntecedenteFamiliarDetalle,
    AntecedentePersonalDetalle,
    AntecedentesData,
    MedicamentoDetalle,
} from '../../tipos';

interface Props {
    antecedentes: AntecedentesData | null;
    idPaciente: number;
    onRegistrar: () => void;
    onEditar: () => void;
}

/* ── DatoItem: igual al de hiperandrogenismo ── */
function DatoItem({ label, valor, destacar }: { label: string; valor?: string | null; destacar?: boolean }) {
    return (
        <div className="rounded-xl border border-surface-border bg-black/[0.02] px-3 py-2 dark:border-surface-border-dark dark:bg-white/[0.03]">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">{label}</p>
            <p className={clsx('text-[12.5px] font-bold', destacar ? 'text-brand-orange' : 'text-ink dark:text-ink-dark')}>
                {valor ?? '—'}
            </p>
        </div>
    );
}

function formatParentesco(p: string): string {
    const map: Record<string, string> = {
        madre: 'Madre', padre: 'Padre', hermana: 'Hermana', hermano: 'Hermano',
        abuela_materna: 'Abuela materna', abuelo_materno: 'Abuelo materno',
        abuela_paterna: 'Abuela paterna', abuelo_paterno: 'Abuelo paterno',
        tia: 'Tía', tio: 'Tío', otro: 'Otro', no_especificado: 'No especificado',
    };
    return map[p] ?? p.replaceAll('_', ' ');
}

export default function TarjetaAntecedentes({ antecedentes, idPaciente, onRegistrar, onEditar }: Props) {

    /* ── Estado vacío ── */
    if (!antecedentes) {
        return (
            <div className="p-5">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-green/10">
                        <HeartPulse size={15} strokeWidth={1.8} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-semibold text-ink dark:text-ink-dark">Antecedentes endocrino-metabólicos</h3>
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Pendiente de registro</p>
                    </div>
                </div>
                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark mb-4 leading-relaxed">
                    No se han registrado los antecedentes. Estos datos son necesarios para evaluar el riesgo metabólico y cardiovascular.
                </p>
                <Boton variante="primary" tamano="sm" onClick={onRegistrar}>
                    <Plus size={13} strokeWidth={1.8} /> Registrar antecedentes
                </Boton>
            </div>
        );
    }

    /* ── Compatibilidad con datos legados (booleanos) ── */
    const personalesLegado = [
        antecedentes.diabetes_personal && 'Diabetes mellitus',
        antecedentes.hipertension_personal && 'Hipertensión arterial',
        antecedentes.dislipidemia_personal && 'Dislipidemia',
        antecedentes.enfermedad_tiroidea && 'Enfermedad tiroidea',
        antecedentes.hiperprolactinemia_previa && 'Hiperprolactinemia',
    ].filter(Boolean) as string[];

    const familiaresLegado = [
        antecedentes.diabetes_familiar && 'Diabetes mellitus',
        antecedentes.hipertension_familiar && 'Hipertensión arterial',
        antecedentes.dislipidemia_familiar && 'Dislipidemia',
    ].filter(Boolean) as string[];

    const medicamentosLegado = [
        antecedentes.uso_metformina && 'Metformina',
        antecedentes.uso_anticonceptivos && 'Anticonceptivos',
        antecedentes.uso_corticoides && 'Corticoides',
    ].filter(Boolean) as string[];

    const personales: AntecedentePersonalDetalle[] =
        antecedentes.antecedentes_personales_detalle?.length
            ? antecedentes.antecedentes_personales_detalle
            : personalesLegado.map((a) => ({ antecedente: a }));

    const familiares: AntecedenteFamiliarDetalle[] =
        antecedentes.antecedentes_familiares_detalle?.length
            ? antecedentes.antecedentes_familiares_detalle
            : familiaresLegado.map((a) => ({ antecedente: a, parentesco: 'no_especificado' }));

    const medicamentos: MedicamentoDetalle[] =
        antecedentes.medicamentos_detalle?.length
            ? antecedentes.medicamentos_detalle
            : medicamentosLegado.map((n) => ({ nombre: n }));

    const tieneHallazgos = personales.length > 0 || familiares.length > 0;

    return (
        <div className="p-5 space-y-4">

            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                    <div className={clsx(
                        'flex h-8 w-8 items-center justify-center rounded-xl',
                        tieneHallazgos ? 'bg-brand-orange/15' : 'bg-brand-green/15',
                    )}>
                        <HeartPulse size={15} strokeWidth={1.8}
                            className={tieneHallazgos ? 'text-brand-orange' : 'text-brand-green-dark dark:text-brand-green'} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Antecedentes</h3>
                            <Badge color={tieneHallazgos ? 'orange' : 'green'}>
                                {tieneHallazgos ? 'Relevantes' : 'Sin hallazgos'}
                            </Badge>
                        </div>
                        {antecedentes.created_at && (
                            <p className="flex items-center gap-1 text-[10.5px] text-ink-muted dark:text-ink-muted-dark mt-0.5">
                                <Calendar size={10} strokeWidth={1.8} />
                                Registrado el {antecedentes.created_at}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Boton variante="primary" tamano="xs" onClick={onRegistrar}>
                        <Plus size={12} strokeWidth={1.8} /> Nuevo registro
                    </Boton>
                    <Link
                        href={`/endocrinologo/pacientes/${idPaciente}/antecedentes/historial`}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[0.03] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.04] dark:hover:text-ink-dark"
                    >
                        <History size={12} strokeWidth={1.8} /> Historial
                    </Link>
                    <button onClick={onEditar}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green-soft dark:text-brand-green dark:hover:bg-brand-green-dark/15">
                        <Edit size={12} strokeWidth={1.8} /> Editar
                    </button>
                </div>
            </div>

            {/* ── Layout dos columnas: gráfico / datos (igual que hiperandrogenismo) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4">

                {/* Columna izquierda: resumen numérico */}
                <div className="rounded-xl border border-surface-border bg-black/[0.02] p-4 dark:border-surface-border-dark dark:bg-white/[0.03] space-y-3">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                        Resumen clínico
                    </p>

                    <ResumenItem
                        label="Antecedentes personales"
                        count={personales.length}
                        color="text-brand-orange"
                        activo={personales.length > 0}
                    />
                    <ResumenItem
                        label="Antecedentes familiares"
                        count={familiares.length}
                        color="text-category-dairy"
                        activo={familiares.length > 0}
                    />
                    <ResumenItem
                        label="Medicamentos"
                        count={medicamentos.length}
                        color="text-info"
                        activo={medicamentos.length > 0}
                    />
                </div>

                {/* Columna derecha: datos en grid */}
                <div className="space-y-3">

                    {/* Personales */}
                    {personales.length > 0 && (
                        <div>
                            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">
                                <User size={10} strokeWidth={2} className="text-brand-orange" />
                                Personales
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {personales.map((p, i) => (
                                    <DatoItem
                                        key={`personal-${i}`}
                                        label={p.fecha_diagnostico ?? 'Sin fecha'}
                                        valor={p.antecedente}
                                        destacar
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Familiares */}
                    {familiares.length > 0 && (
                        <div>
                            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">
                                <Users size={10} strokeWidth={2} className="text-category-dairy" />
                                Familiares
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {familiares.map((f, i) => (
                                    <DatoItem
                                        key={`familiar-${i}`}
                                        label={formatParentesco(f.parentesco)}
                                        valor={f.antecedente}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Medicamentos */}
                    {medicamentos.length > 0 && (
                        <div>
                            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">
                                <Pill size={10} strokeWidth={2} className="text-info" />
                                Medicamentos
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {medicamentos.map((m, i) => (
                                    <DatoItem
                                        key={`med-${i}`}
                                        label={[m.dosis, m.frecuencia].filter(Boolean).join(' · ') || 'Medicamento'}
                                        valor={m.nombre}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Badges de hallazgos (igual que hiperandrogenismo) ── */}
            {(personales.length > 0 || familiares.length > 0 || medicamentos.length > 0) && (
                <div className="flex flex-wrap gap-1.5">
                    {personales.map((p, i) => (
                        <Badge key={`badge-p-${i}`} color="orange">{p.antecedente}</Badge>
                    ))}
                    {familiares.map((f, i) => (
                        <Badge key={`badge-f-${i}`} color="purple">
                            {f.antecedente} · {formatParentesco(f.parentesco)}
                        </Badge>
                    ))}
                    {medicamentos.map((m, i) => (
                        <Badge key={`badge-m-${i}`} color="gray">{m.nombre}</Badge>
                    ))}
                </div>
            )}

            {/* ── Interpretación ── */}
            <p className={clsx('text-[12px] font-medium',
                tieneHallazgos ? 'text-brand-orange' : 'text-ink-muted dark:text-ink-muted-dark')}>
                {tieneHallazgos
                    ? 'Existen antecedentes endocrino-metabólicos relevantes.'
                    : 'Sin antecedentes relevantes registrados.'}
            </p>

            {/* ── Observaciones ── */}
            {antecedentes.observaciones && (
                <div className="rounded-xl border border-surface-border px-4 py-3 dark:border-surface-border-dark">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">Observaciones</p>
                    <p className="text-[12.5px] text-ink dark:text-ink-dark leading-relaxed">{antecedentes.observaciones}</p>
                </div>
            )}
        </div>
    );
}

/* ── Ítem del resumen lateral ── */
function ResumenItem({ label, count, color, activo }: { label: string; count: number; color: string; activo: boolean }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">{label}</span>
                <span className={clsx('text-[12px] font-bold', activo ? color : 'text-ink-muted dark:text-ink-muted-dark')}>
                    {count}
                </span>
            </div>
            {/* barra de progreso visual */}
            <div className="h-1.5 w-full rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                <div
                    className={clsx('h-full rounded-full transition-all', activo ? `bg-current ${color}` : 'bg-ink-muted/20')}
                    style={{ width: activo ? `${Math.min(count * 25, 100)}%` : '0%' }}
                />
            </div>
        </div>
    );
}
