import clsx from 'clsx';
import { Link } from '@inertiajs/react';
import {
    HeartPulse, Edit, Plus, History, Calendar,
    User, Users, Pill, AlertTriangle, CheckCircle2,
    ShieldAlert,
} from 'lucide-react';
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

function formatParentesco(p: string): string {
    const map: Record<string, string> = {
        madre: 'Madre', padre: 'Padre', hermana: 'Hermana', hermano: 'Hermano',
        abuela_materna: 'Abuela materna', abuelo_materno: 'Abuelo materno',
        abuela_paterna: 'Abuela paterna', abuelo_paterno: 'Abuelo paterno',
        tia: 'Tía', tio: 'Tío', otro: 'Otro', no_especificado: 'No especificado',
    };
    return map[p] ?? p.replaceAll('_', ' ');
}

/* ── Chip de antecedente ─────────────────────────────────── */
function ChipAntecedente({
    texto, subtexto, tipo,
}: { texto: string; subtexto?: string; tipo: 'personal' | 'familiar' | 'medicamento' }) {
    const estilos = {
        personal:    'border-brand-orange/25 bg-brand-orange/[.07] dark:bg-brand-orange/[.05]',
        familiar:    'border-category-dairy/25 bg-category-dairy/[.07] dark:bg-category-dairy/[.05]',
        medicamento: 'border-info/20 bg-info/[.06] dark:bg-info/[.04]',
    };
    const textColor = {
        personal:    'text-brand-orange',
        familiar:    'text-category-dairy',
        medicamento: 'text-info',
    };

    return (
        <div className={clsx('rounded-xl border px-3 py-2.5', estilos[tipo])}>
            {subtexto && (
                <p className={clsx('text-[8.5px] font-bold uppercase tracking-wider mb-0.5', textColor[tipo])}>
                    {subtexto}
                </p>
            )}
            <p className="text-[12px] font-bold text-ink dark:text-ink-dark leading-snug">{texto}</p>
        </div>
    );
}

/* ── Stat del resumen ────────────────────────────────────── */
function ResumenStat({
    icono: Icono, label, count, colorIcon, colorBar,
}: { icono: React.ElementType; label: string; count: number; colorIcon: string; colorBar: string }) {
    return (
        <div className="flex items-center gap-2.5">
            <div className={clsx('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', colorIcon)}>
                <Icono size={13} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium text-ink-muted dark:text-ink-muted-dark truncate">{label}</span>
                    <span className={clsx('text-[11px] font-bold ml-1 shrink-0', count > 0 ? colorIcon.replace(/bg-\S+/, '').trim() : 'text-ink-muted/50')}>
                        {count}
                    </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-black/[.06] dark:bg-white/[.06] overflow-hidden">
                    <div
                        className={clsx('h-full rounded-full transition-all duration-500', count > 0 ? colorBar : '')}
                        style={{ width: count > 0 ? `${Math.min(count * 30, 100)}%` : '0%' }}
                    />
                </div>
            </div>
        </div>
    );
}

export default function TarjetaAntecedentes({ antecedentes, idPaciente, onRegistrar, onEditar }: Props) {

    /* ── Estado vacío ── */
    if (!antecedentes) {
        return (
            <div className="p-5">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange/10">
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

            {/* ══ HEADER ════════════════════════════════════════════ */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                    <div className={clsx(
                        'flex h-9 w-9 items-center justify-center rounded-xl',
                        tieneHallazgos ? 'bg-brand-orange/15' : 'bg-brand-green/15',
                    )}>
                        <HeartPulse
                            size={16} strokeWidth={1.8}
                            className={tieneHallazgos ? 'text-brand-orange' : 'text-brand-green-dark dark:text-brand-green'}
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Antecedentes</h3>
                            <Badge color={tieneHallazgos ? 'orange' : 'green'}>
                                {tieneHallazgos ? 'Relevantes' : 'Sin hallazgos'}
                            </Badge>
                        </div>
                        {antecedentes.created_at && (
                            <p className="flex items-center gap-1 text-[10px] text-ink-muted dark:text-ink-muted-dark mt-0.5">
                                <Calendar size={9} strokeWidth={1.8} />
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
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[.03] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[.04] dark:hover:text-ink-dark"
                    >
                        <History size={11} strokeWidth={1.8} /> Historial
                    </Link>
                    <button
                        onClick={onEditar}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-brand-orange transition-colors hover:bg-brand-orange/[.06] dark:hover:bg-brand-orange/[.04]"
                    >
                        <Edit size={11} strokeWidth={1.8} /> Editar
                    </button>
                </div>
            </div>

            {/* ══ BANNER DE RIESGO ════════════════════════════════== */}
            {tieneHallazgos ? (
                <div className="flex items-center gap-3 rounded-2xl border border-brand-orange/25 bg-brand-orange/[.06] px-4 py-3 dark:bg-brand-orange/[.04]">
                    <ShieldAlert size={16} strokeWidth={1.8} className="text-brand-orange shrink-0" />
                    <p className="text-[11.5px] font-semibold text-brand-orange">
                        Existen antecedentes endocrino-metabólicos relevantes que requieren consideración clínica.
                    </p>
                </div>
            ) : (
                <div className="flex items-center gap-3 rounded-2xl border border-brand-green/20 bg-brand-green/[.05] px-4 py-3 dark:bg-brand-green/[.04]">
                    <CheckCircle2 size={15} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green shrink-0" />
                    <p className="text-[11.5px] font-semibold text-brand-green-dark dark:text-brand-green">
                        Sin antecedentes endocrino-metabólicos relevantes registrados.
                    </p>
                </div>
            )}

            {/* ══ LAYOUT: resumen + datos ════════════════════════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-[190px_1fr] gap-4">

                {/* ── Resumen numérico ── */}
                <div className="rounded-2xl border border-surface-border bg-black/[.02] p-4 dark:border-surface-border-dark dark:bg-white/[.025] space-y-3.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                        Resumen clínico
                    </p>
                    <ResumenStat
                        icono={User}
                        label="Personales"
                        count={personales.length}
                        colorIcon="bg-brand-orange/15 text-brand-orange"
                        colorBar="bg-brand-orange"
                    />
                    <ResumenStat
                        icono={Users}
                        label="Familiares"
                        count={familiares.length}
                        colorIcon="bg-category-dairy/15 text-category-dairy"
                        colorBar="bg-category-dairy"
                    />
                    <ResumenStat
                        icono={Pill}
                        label="Medicamentos"
                        count={medicamentos.length}
                        colorIcon="bg-info/15 text-info"
                        colorBar="bg-info"
                    />
                </div>

                {/* ── Datos en columna ── */}
                <div className="space-y-4">

                    {/* Personales */}
                    {personales.length > 0 && (
                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <User size={11} strokeWidth={2} className="text-brand-orange" />
                                <p className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                                    Personales
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {personales.map((p, i) => (
                                    <ChipAntecedente
                                        key={`personal-${i}`}
                                        tipo="personal"
                                        subtexto={p.fecha_diagnostico ?? 'Sin fecha'}
                                        texto={p.antecedente}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Familiares */}
                    {familiares.length > 0 && (
                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <Users size={11} strokeWidth={2} className="text-category-dairy" />
                                <p className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                                    Familiares
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {familiares.map((f, i) => (
                                    <ChipAntecedente
                                        key={`familiar-${i}`}
                                        tipo="familiar"
                                        subtexto={formatParentesco(f.parentesco)}
                                        texto={f.antecedente}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Medicamentos */}
                    {medicamentos.length > 0 && (
                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <Pill size={11} strokeWidth={2} className="text-info" />
                                <p className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                                    Medicamentos
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {medicamentos.map((m, i) => (
                                    <ChipAntecedente
                                        key={`med-${i}`}
                                        tipo="medicamento"
                                        subtexto={[m.dosis, m.frecuencia].filter(Boolean).join(' · ') || 'Según prescripción'}
                                        texto={m.nombre}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ningún dato registrado en ninguna categoría */}
                    {personales.length === 0 && familiares.length === 0 && medicamentos.length === 0 && (
                        <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark italic py-2">
                            No se registraron antecedentes personales, familiares ni medicamentos.
                        </p>
                    )}
                </div>
            </div>

            {/* ══ CHIPS RESUMEN RÁPIDO ═══════════════════════════════ */}
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

            {/* ══ OBSERVACIONES ═════════════════════════════════════ */}
            {antecedentes.observaciones && (
                <div className="rounded-xl border border-surface-border px-4 py-3 dark:border-surface-border-dark">
                    <p className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1.5">
                        Observaciones
                    </p>
                    <p className="text-[12px] text-ink dark:text-ink-dark leading-relaxed">
                        {antecedentes.observaciones}
                    </p>
                </div>
            )}
        </div>
    );
}
