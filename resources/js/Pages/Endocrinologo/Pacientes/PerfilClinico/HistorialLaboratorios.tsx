import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, FlaskConical, TrendingUp, ChevronDown } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import AvatarIniciales from '@/Components/ui/avatar-iniciales';
import clsx from 'clsx';
import type { PageProps } from '@/types';

/* ═══ Tipos ═══ */
interface PerfilAndrogenicoHistorial {
    id: number; fecha_resultado: string;
    testosterona_total?: number | null; testosterona_libre?: number | null;
    shbg?: number | null; indice_androgenico_libre?: number | null;
    dhea_s?: number | null; androstenediona?: number | null;
    hiperandrogenismo_bioquimico: boolean; interpretacion?: string | null;
    created_at?: string | null; updated_at?: string | null;
}
interface PerfilGonadotropoHistorial {
    id: number; fecha_resultado: string;
    lh?: number | null; fsh?: number | null; relacion_lh_fsh?: number | null;
    estradiol?: number | null; progesterona?: number | null;
    progesterona_dia_ciclo?: number | null; progesterona_fase_ciclo?: string | null;
    interpretacion?: string | null; created_at?: string | null;
}
interface DiferencialHistorial {
    id: number; fecha_resultado: string;
    tsh?: number | null; t3_libre?: number | null; t4_libre?: number | null;
    prolactina?: number | null; diecisiete_oh_progesterona?: number | null; cortisol?: number | null;
    alteracion_tiroidea_descartada: boolean; hiperprolactinemia_descartada: boolean;
    hiperplasia_suprarrenal_descartada: boolean; cushing_descartado: boolean;
    interpretacion?: string | null; created_at?: string | null;
}
interface GlucosaHistorial {
    id: number; fecha_resultado: string;
    glucosa_ayunas?: number | null; insulina_ayunas?: number | null;
    homa_ir?: number | null; hemoglobina_glicosilada?: number | null;
    glucosa_2h_ogtt?: number | null; insulina_2h_ogtt?: number | null;
    hiperinsulinemia: boolean; resistencia_insulina_sugerida: boolean;
    interpretacion?: string | null; created_at?: string | null;
}
interface LipidicoHistorial {
    id: number; fecha_resultado: string;
    colesterol_total?: number | null; hdl?: number | null; ldl?: number | null;
    vldl?: number | null; trigliceridos?: number | null; colesterol_no_hdl?: number | null;
    dislipidemia_sugerida: boolean; interpretacion?: string | null; created_at?: string | null;
}

interface HistorialData {
    perfil_androgenico: PerfilAndrogenicoHistorial[];
    perfil_gonadotropo: PerfilGonadotropoHistorial[];
    diferencial_endocrino: DiferencialHistorial[];
    glucosa_insulina: GlucosaHistorial[];
    perfil_lipidico: LipidicoHistorial[];
}

interface Props extends PageProps {
    paciente: { id_paciente: number; nombre_completo: string; ci: string };
    historial: HistorialData;
}

const PANELES = [
    { key: 'perfil_androgenico', label: 'Andrógenos', color: 'text-category-fruits', bgColor: 'bg-category-fruits/10' },
    { key: 'perfil_gonadotropo', label: 'Gonadotropo', color: 'text-brand-orange', bgColor: 'bg-brand-orange/10' },
    { key: 'diferencial_endocrino', label: 'Diferenciales', color: 'text-category-dairy', bgColor: 'bg-category-dairy/10' },
    { key: 'glucosa_insulina', label: 'Glucosa/Insulina', color: 'text-brand-green-dark dark:text-brand-green', bgColor: 'bg-brand-green/10' },
    { key: 'perfil_lipidico', label: 'Lípidos', color: 'text-category-others', bgColor: 'bg-category-others/10' },
] as const;

export default function HistorialLaboratorios({ paciente, historial }: Props) {
    const id = paciente.id_paciente;
    const [tabActivo, setTabActivo] = useState(0);
    const totalRegistros = Object.values(historial).reduce((acc, arr) => acc + arr.length, 0);

    return (
        <AuthenticatedLayout title="Historial de laboratorios">
            <Head title={`Historial Labs: ${paciente.nombre_completo}`} />

            <div className="space-y-5">
                {/* Cabecera */}
                <div className="card-elevated overflow-hidden">
                    <div className="relative h-20 bg-gradient-to-r from-brand-green/10 via-brand-green/5 to-transparent dark:from-brand-green/[0.08] dark:via-brand-green/[0.03] dark:to-transparent">
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-green/[0.06]" />
                        <div className="absolute right-20 -bottom-5 h-16 w-16 rounded-full bg-brand-green/[0.04]" />
                        <Link
                            href={`/endocrinologo/pacientes/${id}/perfil-clinico`}
                            className="absolute left-5 top-5 flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-ink backdrop-blur-sm transition-colors hover:bg-white dark:bg-black/40 dark:text-ink-dark dark:hover:bg-black/60"
                        >
                            <ArrowLeft size={12} strokeWidth={1.8} /> Perfil clínico
                        </Link>
                    </div>
                    <div className="px-5 pb-5 -mt-7">
                        <div className="flex items-end gap-4">
                            <div className="rounded-full border-[3px] border-surface-card shadow-md dark:border-surface-card-dark">
                                <AvatarIniciales nombre={paciente.nombre_completo} size={56} />
                            </div>
                            <div className="flex-1 pb-1">
                                <h1 className="text-[18px] font-bold text-ink dark:text-ink-dark leading-tight">{paciente.nombre_completo}</h1>
                                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark mt-0.5">CI: {paciente.ci}</p>
                            </div>
                            <div className="pb-1 flex items-center gap-2">
                                <div className="flex items-center gap-1.5 rounded-lg bg-brand-green/10 px-3 py-1.5 dark:bg-brand-green/[0.08]">
                                    <FlaskConical size={12} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" />
                                    <span className="text-[11px] font-semibold text-brand-green-dark dark:text-brand-green">
                                        {totalRegistros} resultado{totalRegistros !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-surface-border dark:border-surface-border-dark">
                            <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark">
                                Historial completo de resultados de laboratorio con gráficos de evolución por panel.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs de paneles */}
                <div className="card-elevated p-2">
                    <div className="flex gap-1 flex-wrap">
                        {PANELES.map((panel, i) => {
                            const count = historial[panel.key].length;
                            return (
                                <button
                                    key={panel.key}
                                    type="button"
                                    onClick={() => setTabActivo(i)}
                                    className={clsx(
                                        'flex-1 min-w-[120px] flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-semibold transition-all',
                                        tabActivo === i
                                            ? 'bg-brand-green-soft text-brand-green-dark dark:bg-brand-green-dark/20 dark:text-brand-green shadow-sm'
                                            : 'text-ink-muted hover:bg-black/[0.02] dark:text-ink-muted-dark dark:hover:bg-white/[0.02]'
                                    )}
                                >
                                    <span className={clsx(tabActivo === i && panel.color)}>{panel.label}</span>
                                    <span className={clsx(
                                        'flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold',
                                        tabActivo === i ? 'bg-brand-green text-white' : 'bg-black/[0.05] text-ink-muted dark:bg-white/[0.06] dark:text-ink-muted-dark'
                                    )}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Contenido del panel activo */}
                <PanelContent
                    panelKey={PANELES[tabActivo].key}
                    historial={historial}
                    panelConfig={PANELES[tabActivo]}
                />
            </div>
        </AuthenticatedLayout>
    );
}

/* ═══ Panel Content ═══ */
function PanelContent({ panelKey, historial, panelConfig }: { panelKey: string; historial: HistorialData; panelConfig: typeof PANELES[number] }) {
    const registros = historial[panelKey as keyof HistorialData];

    if (registros.length === 0) {
        return (
            <div className="card-elevated flex flex-col items-center gap-2 px-5 py-14 text-center">
                <FlaskConical size={28} strokeWidth={1.2} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
                <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark">No existen registros de {panelConfig.label.toLowerCase()}</p>
                <p className="text-[11px] text-ink-muted/60 dark:text-ink-muted-dark/60">Aún no se han registrado resultados para este panel</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4">
            {/* Listado */}
            <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-[12px] font-semibold text-ink dark:text-ink-dark">Registros de {panelConfig.label}</p>
                    <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">{registros.length} resultado{registros.length !== 1 ? 's' : ''}</p>
                </div>
                {panelKey === 'perfil_androgenico' && (registros as PerfilAndrogenicoHistorial[]).map((r, i) => <CardAndrogenico key={r.id} r={r} num={registros.length - i} />)}
                {panelKey === 'perfil_gonadotropo' && (registros as PerfilGonadotropoHistorial[]).map((r, i) => <CardGonadotropo key={r.id} r={r} num={registros.length - i} />)}
                {panelKey === 'diferencial_endocrino' && (registros as DiferencialHistorial[]).map((r, i) => <CardDiferencial key={r.id} r={r} num={registros.length - i} />)}
                {panelKey === 'glucosa_insulina' && (registros as GlucosaHistorial[]).map((r, i) => <CardGlucosa key={r.id} r={r} num={registros.length - i} />)}
                {panelKey === 'perfil_lipidico' && (registros as LipidicoHistorial[]).map((r, i) => <CardLipidico key={r.id} r={r} num={registros.length - i} />)}
            </div>

            {/* Gráficos de evolución */}
            {registros.length >= 2 && (
                <aside className="lg:sticky lg:top-20 lg:self-start">
                    <GraficosPanel panelKey={panelKey} registros={registros} panelConfig={panelConfig} />
                </aside>
            )}
        </div>
    );
}

/* ═══ Cards individuales ═══ */
function CardAndrogenico({ r, num }: { r: PerfilAndrogenicoHistorial; num: number }) {
    return (
        <div className="card-elevated overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-border dark:border-surface-border-dark">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-category-fruits/10 text-[9px] font-bold text-category-fruits">{num}</div>
                    <p className="text-[11.5px] font-semibold text-ink dark:text-ink-dark">Resultado #{num}</p>
                    <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{r.fecha_resultado}</span>
                </div>
                {r.hiperandrogenismo_bioquimico && <Badge color="orange">Hiperandrogenismo</Badge>}
            </div>
            <div className="px-4 py-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    <DatoCompacto label="T. Total" valor={r.testosterona_total != null ? `${r.testosterona_total} ng/dL` : '—'} />
                    <DatoCompacto label="T. Libre" valor={r.testosterona_libre != null ? `${r.testosterona_libre} pg/mL` : '—'} />
                    <DatoCompacto label="SHBG" valor={r.shbg != null ? `${r.shbg} nmol/L` : '—'} />
                    <DatoCompacto label="IAL" valor={r.indice_androgenico_libre != null ? `${r.indice_androgenico_libre}` : '—'} />
                    <DatoCompacto label="DHEA-S" valor={r.dhea_s != null ? `${r.dhea_s} µg/dL` : '—'} />
                    <DatoCompacto label="Androst." valor={r.androstenediona != null ? `${r.androstenediona} ng/mL` : '—'} />
                </div>
            </div>
            {r.interpretacion && <InterpretacionBloque texto={r.interpretacion} />}
        </div>
    );
}

function CardGonadotropo({ r, num }: { r: PerfilGonadotropoHistorial; num: number }) {
    return (
        <div className="card-elevated overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-border dark:border-surface-border-dark">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-orange/10 text-[9px] font-bold text-brand-orange">{num}</div>
                    <p className="text-[11.5px] font-semibold text-ink dark:text-ink-dark">Resultado #{num}</p>
                    <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{r.fecha_resultado}</span>
                </div>
                {r.relacion_lh_fsh != null && r.relacion_lh_fsh > 2 && <Badge color="orange">LH/FSH {'>'} 2</Badge>}
            </div>
            <div className="px-4 py-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    <DatoCompacto label="LH" valor={r.lh != null ? `${r.lh} mUI/mL` : '—'} />
                    <DatoCompacto label="FSH" valor={r.fsh != null ? `${r.fsh} mUI/mL` : '—'} />
                    <DatoCompacto label="LH/FSH" valor={r.relacion_lh_fsh != null ? `${r.relacion_lh_fsh}` : '—'} />
                    <DatoCompacto label="Estradiol" valor={r.estradiol != null ? `${r.estradiol} pg/mL` : '—'} />
                    <DatoCompacto label="Progest." valor={r.progesterona != null ? `${r.progesterona} ng/mL` : '—'} />
                </div>
            </div>
            {r.interpretacion && <InterpretacionBloque texto={r.interpretacion} />}
        </div>
    );
}

function CardDiferencial({ r, num }: { r: DiferencialHistorial; num: number }) {
    const descartados = [r.alteracion_tiroidea_descartada, r.hiperprolactinemia_descartada, r.hiperplasia_suprarrenal_descartada, r.cushing_descartado].filter(Boolean).length;
    return (
        <div className="card-elevated overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-border dark:border-surface-border-dark">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-category-dairy/10 text-[9px] font-bold text-category-dairy">{num}</div>
                    <p className="text-[11.5px] font-semibold text-ink dark:text-ink-dark">Resultado #{num}</p>
                    <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{r.fecha_resultado}</span>
                </div>
                <Badge color={descartados === 4 ? 'green' : 'orange'}>{descartados}/4 descartados</Badge>
            </div>
            <div className="px-4 py-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    <DatoCompacto label="TSH" valor={r.tsh != null ? `${r.tsh} mUI/L` : '—'} />
                    <DatoCompacto label="T3 Libre" valor={r.t3_libre != null ? `${r.t3_libre} pg/mL` : '—'} />
                    <DatoCompacto label="T4 Libre" valor={r.t4_libre != null ? `${r.t4_libre} ng/dL` : '—'} />
                    <DatoCompacto label="Prolactina" valor={r.prolactina != null ? `${r.prolactina} ng/mL` : '—'} />
                    <DatoCompacto label="17-OH Prog" valor={r.diecisiete_oh_progesterona != null ? `${r.diecisiete_oh_progesterona} ng/mL` : '—'} />
                    <DatoCompacto label="Cortisol" valor={r.cortisol != null ? `${r.cortisol} µg/dL` : '—'} />
                </div>
            </div>
            {r.interpretacion && <InterpretacionBloque texto={r.interpretacion} />}
        </div>
    );
}

function CardGlucosa({ r, num }: { r: GlucosaHistorial; num: number }) {
    return (
        <div className="card-elevated overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-border dark:border-surface-border-dark">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-green/10 text-[9px] font-bold text-brand-green-dark dark:text-brand-green">{num}</div>
                    <p className="text-[11.5px] font-semibold text-ink dark:text-ink-dark">Resultado #{num}</p>
                    <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{r.fecha_resultado}</span>
                </div>
                <div className="flex items-center gap-1">
                    {r.resistencia_insulina_sugerida && <Badge color="red">RI sugerida</Badge>}
                    {r.hiperinsulinemia && <Badge color="orange">Hiperinsulinemia</Badge>}
                </div>
            </div>
            <div className="px-4 py-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    <DatoCompacto label="Glucosa" valor={r.glucosa_ayunas != null ? `${r.glucosa_ayunas} mg/dL` : '—'} />
                    <DatoCompacto label="Insulina" valor={r.insulina_ayunas != null ? `${r.insulina_ayunas} µU/mL` : '—'} />
                    <DatoCompacto label="HOMA-IR" valor={r.homa_ir != null ? `${r.homa_ir}` : '—'} destacar={r.homa_ir != null && r.homa_ir >= 2.5} />
                    <DatoCompacto label="HbA1c" valor={r.hemoglobina_glicosilada != null ? `${r.hemoglobina_glicosilada}%` : '—'} />
                    <DatoCompacto label="Gluc. 2h" valor={r.glucosa_2h_ogtt != null ? `${r.glucosa_2h_ogtt} mg/dL` : '—'} />
                    <DatoCompacto label="Ins. 2h" valor={r.insulina_2h_ogtt != null ? `${r.insulina_2h_ogtt} µU/mL` : '—'} />
                </div>
            </div>
            {r.interpretacion && <InterpretacionBloque texto={r.interpretacion} />}
        </div>
    );
}

function CardLipidico({ r, num }: { r: LipidicoHistorial; num: number }) {
    return (
        <div className="card-elevated overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-border dark:border-surface-border-dark">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-category-others/10 text-[9px] font-bold text-category-others">{num}</div>
                    <p className="text-[11.5px] font-semibold text-ink dark:text-ink-dark">Resultado #{num}</p>
                    <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{r.fecha_resultado}</span>
                </div>
                {r.dislipidemia_sugerida && <Badge color="orange">Dislipidemia</Badge>}
            </div>
            <div className="px-4 py-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    <DatoCompacto label="Col. Total" valor={r.colesterol_total != null ? `${r.colesterol_total} mg/dL` : '—'} destacar={r.colesterol_total != null && r.colesterol_total >= 200} />
                    <DatoCompacto label="HDL" valor={r.hdl != null ? `${r.hdl} mg/dL` : '—'} destacar={r.hdl != null && r.hdl < 50} />
                    <DatoCompacto label="LDL" valor={r.ldl != null ? `${r.ldl} mg/dL` : '—'} destacar={r.ldl != null && r.ldl >= 130} />
                    <DatoCompacto label="VLDL" valor={r.vldl != null ? `${r.vldl} mg/dL` : '—'} />
                    <DatoCompacto label="Triglicéridos" valor={r.trigliceridos != null ? `${r.trigliceridos} mg/dL` : '—'} destacar={r.trigliceridos != null && r.trigliceridos >= 150} />
                    <DatoCompacto label="Col. no-HDL" valor={r.colesterol_no_hdl != null ? `${r.colesterol_no_hdl} mg/dL` : '—'} />
                </div>
            </div>
            {r.interpretacion && <InterpretacionBloque texto={r.interpretacion} />}
        </div>
    );
}

/* ═══ Componentes auxiliares ═══ */
function DatoCompacto({ label, valor, destacar }: { label: string; valor: string; destacar?: boolean }) {
    return (
        <div className="rounded-lg bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03]">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">{label}</p>
            <p className={clsx('text-[12.5px] font-bold', destacar ? 'text-brand-orange' : 'text-ink dark:text-ink-dark')}>{valor}</p>
        </div>
    );
}

function InterpretacionBloque({ texto }: { texto: string }) {
    return (
        <div className="px-4 pb-2.5 pt-0">
            <div className="rounded-md bg-black/[0.02] px-2.5 py-1.5 dark:bg-white/[0.02]">
                <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark leading-relaxed">{texto}</p>
            </div>
        </div>
    );
}

/* ═══ Gráficos de evolución por panel ═══ */
function GraficosPanel({ panelKey, registros, panelConfig }: { panelKey: string; registros: any[]; panelConfig: typeof PANELES[number] }) {
    const ordenados = [...registros].reverse(); // del más antiguo al más reciente
    const fechas = ordenados.map((r: any) => r.fecha_resultado ?? r.created_at ?? '—');

    const configs: Record<string, { label: string; campo: string; unidad: string; rangoMin: number; rangoMax: number; colorLinea: string; colorPunto: string }[]> = {
        perfil_androgenico: [
            { label: 'Testosterona Total', campo: 'testosterona_total', unidad: 'ng/dL', rangoMin: 15, rangoMax: 70, colorLinea: '#D42213', colorPunto: '#9B1B0F' },
            { label: 'Testosterona Libre', campo: 'testosterona_libre', unidad: 'pg/mL', rangoMin: 0.5, rangoMax: 4.1, colorLinea: '#F5401A', colorPunto: '#C03012' },
            { label: 'SHBG', campo: 'shbg', unidad: 'nmol/L', rangoMin: 18, rangoMax: 144, colorLinea: '#FF8C00', colorPunto: '#CC7000' },
            { label: 'DHEA-S', campo: 'dhea_s', unidad: 'µg/dL', rangoMin: 35, rangoMax: 430, colorLinea: '#B341D6', colorPunto: '#8A2FA8' },
        ],
        perfil_gonadotropo: [
            { label: 'LH', campo: 'lh', unidad: 'mUI/mL', rangoMin: 1, rangoMax: 12, colorLinea: '#FF8C00', colorPunto: '#CC7000' },
            { label: 'FSH', campo: 'fsh', unidad: 'mUI/mL', rangoMin: 3, rangoMax: 10, colorLinea: '#F2621A', colorPunto: '#C04D14' },
            { label: 'Relación LH/FSH', campo: 'relacion_lh_fsh', unidad: '', rangoMin: 0.5, rangoMax: 2, colorLinea: '#D42213', colorPunto: '#9B1B0F' },
            { label: 'Estradiol', campo: 'estradiol', unidad: 'pg/mL', rangoMin: 12, rangoMax: 150, colorLinea: '#B341D6', colorPunto: '#8A2FA8' },
        ],
        diferencial_endocrino: [
            { label: 'TSH', campo: 'tsh', unidad: 'mUI/L', rangoMin: 0.4, rangoMax: 4, colorLinea: '#B341D6', colorPunto: '#8A2FA8' },
            { label: 'T4 Libre', campo: 't4_libre', unidad: 'ng/dL', rangoMin: 0.8, rangoMax: 1.8, colorLinea: '#5C8FB8', colorPunto: '#3D6A8C' },
            { label: 'Prolactina', campo: 'prolactina', unidad: 'ng/mL', rangoMin: 2, rangoMax: 25, colorLinea: '#FF8C00', colorPunto: '#CC7000' },
        ],
        glucosa_insulina: [
            { label: 'Glucosa ayunas', campo: 'glucosa_ayunas', unidad: 'mg/dL', rangoMin: 70, rangoMax: 100, colorLinea: '#4CAF50', colorPunto: '#2E7D32' },
            { label: 'Insulina ayunas', campo: 'insulina_ayunas', unidad: 'µU/mL', rangoMin: 2, rangoMax: 20, colorLinea: '#FF8C00', colorPunto: '#CC7000' },
            { label: 'HOMA-IR', campo: 'homa_ir', unidad: '', rangoMin: 0, rangoMax: 2.5, colorLinea: '#D42213', colorPunto: '#9B1B0F' },
            { label: 'HbA1c', campo: 'hemoglobina_glicosilada', unidad: '%', rangoMin: 4, rangoMax: 5.7, colorLinea: '#B341D6', colorPunto: '#8A2FA8' },
        ],
        perfil_lipidico: [
            { label: 'Colesterol Total', campo: 'colesterol_total', unidad: 'mg/dL', rangoMin: 0, rangoMax: 200, colorLinea: '#5C8FB8', colorPunto: '#3D6A8C' },
            { label: 'HDL', campo: 'hdl', unidad: 'mg/dL', rangoMin: 50, rangoMax: 100, colorLinea: '#4CAF50', colorPunto: '#2E7D32' },
            { label: 'LDL', campo: 'ldl', unidad: 'mg/dL', rangoMin: 0, rangoMax: 130, colorLinea: '#FF8C00', colorPunto: '#CC7000' },
            { label: 'Triglicéridos', campo: 'trigliceridos', unidad: 'mg/dL', rangoMin: 0, rangoMax: 150, colorLinea: '#D42213', colorPunto: '#9B1B0F' },
        ],
    };

    const graficos = configs[panelKey] ?? [];

    return (
        <div className="card-elevated p-5">
            <p className="flex items-center gap-2 text-[13px] font-bold text-ink dark:text-ink-dark mb-5">
                <TrendingUp size={15} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" />
                Evolución — {panelConfig.label}
            </p>
            <div className="grid grid-cols-1 gap-4">
                {graficos.map((cfg) => {
                    const valores = ordenados.map((r: any) => r[cfg.campo] ?? null);
                    return (
                        <GraficoLinea
                            key={cfg.campo}
                            label={cfg.label}
                            unidad={cfg.unidad}
                            valores={valores}
                            fechas={fechas}
                            rangoMin={cfg.rangoMin}
                            rangoMax={cfg.rangoMax}
                            colorLinea={cfg.colorLinea}
                            colorPunto={cfg.colorPunto}
                        />
                    );
                })}
            </div>
        </div>
    );
}

/* ═══ Gráfico de línea SVG ═══ */
function GraficoLinea({ label, unidad, valores, fechas, rangoMin, rangoMax, colorLinea, colorPunto }: {
    label: string; unidad: string; valores: (number | null)[]; fechas: string[];
    rangoMin: number; rangoMax: number; colorLinea: string; colorPunto: string;
}) {
    const valoresValidos = valores.map((v, i) => v !== null ? { valor: v, idx: i } : null).filter(Boolean) as { valor: number; idx: number }[];
    if (valoresValidos.length < 2) return null;

    const maxVal = Math.max(...valoresValidos.map(v => v.valor), rangoMax) * 1.15;
    const minVal = 0;
    const rango = maxVal - minVal || 1;

    const W = 380;
    const H = 160;
    const padL = 35;
    const padR = 15;
    const padT = 22;
    const padB = 28;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const puntos = valoresValidos.map((v, i) => {
        const x = padL + (i / (valoresValidos.length - 1)) * chartW;
        const y = padT + chartH - ((v.valor - minVal) / rango) * chartH;
        return { x, y, valor: v.valor, fecha: fechas[v.idx] };
    });

    const polyline = puntos.map(p => `${p.x},${p.y}`).join(' ');
    const yTop = padT + chartH - ((rangoMax - minVal) / rango) * chartH;
    const yBot = padT + chartH - ((rangoMin - minVal) / rango) * chartH;

    const numLineas = 4;
    const lineas = Array.from({ length: numLineas + 1 }, (_, i) => {
        const val = minVal + (rango / numLineas) * i;
        const y = padT + chartH - ((val - minVal) / rango) * chartH;
        return { y, val: Math.round(val * 10) / 10 };
    });

    return (
        <div className="group/chart cursor-pointer transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10.5px] font-semibold text-ink dark:text-ink-dark">{label}</p>
                <p className="text-[9px] rounded bg-brand-green/10 px-1.5 py-0.5 text-brand-green-dark dark:bg-brand-green/5 dark:text-brand-green font-medium">
                    {rangoMin}–{rangoMax} {unidad}
                </p>
            </div>
            <div className="rounded-xl border border-surface-border bg-[#FDFCFA] p-2.5 transition-all group-hover/chart:border-brand-green/40 group-hover/chart:shadow-lg group-hover/chart:shadow-brand-green/5 dark:border-surface-border-dark dark:bg-[#1A1D24] dark:group-hover/chart:border-brand-green/30">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[150px]">
                    {lineas.map((l, i) => (
                        <g key={i}>
                            <line x1={padL} y1={l.y} x2={W - padR} y2={l.y} stroke="currentColor" className="text-surface-border dark:text-surface-border-dark" strokeWidth="0.5" />
                            <text x={padL - 6} y={l.y + 3} textAnchor="end" className="fill-ink-muted dark:fill-ink-muted-dark" fontSize="7.5" fontWeight="500">{l.val}</text>
                        </g>
                    ))}
                    <rect x={padL} y={Math.min(yTop, yBot)} width={chartW} height={Math.abs(yBot - yTop)} fill={colorLinea} opacity="0.06" rx="3" />
                    <line x1={padL} y1={yTop} x2={W - padR} y2={yTop} stroke={colorLinea} strokeWidth="0.5" strokeDasharray="4,3" opacity="0.4" />
                    <line x1={padL} y1={yBot} x2={W - padR} y2={yBot} stroke={colorLinea} strokeWidth="0.5" strokeDasharray="4,3" opacity="0.4" />
                    <polyline points={polyline} fill="none" stroke={colorLinea} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {puntos.map((p, i) => {
                        const enRango = p.valor >= rangoMin && p.valor <= rangoMax;
                        return (
                            <g key={i}>
                                <line x1={p.x} y1={p.y} x2={p.x} y2={padT + chartH} stroke={colorLinea} strokeWidth="0.5" opacity="0.2" strokeDasharray="2,2" />
                                <circle cx={p.x} cy={p.y} r="4" fill={colorPunto} stroke="white" strokeWidth="1.5" />
                                <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="8" fontWeight="700" fill={enRango ? colorPunto : '#E65100'}>
                                    {p.valor}
                                </text>
                                <text x={p.x} y={H - 4} textAnchor="middle" fontSize="7" className="fill-ink-muted dark:fill-ink-muted-dark" fontWeight="500">
                                    {p.fecha?.slice(5) ?? ''}
                                </text>
                            </g>
                        );
                    })}
                </svg>
                <div className="mt-2 flex items-center justify-between px-1">
                    <span className="text-[9px] text-ink-muted dark:text-ink-muted-dark">Último:</span>
                    <span className={clsx('text-[11px] font-bold', valoresValidos[valoresValidos.length - 1].valor >= rangoMin && valoresValidos[valoresValidos.length - 1].valor <= rangoMax ? 'text-brand-green-dark dark:text-brand-green' : 'text-brand-orange')}>
                        {valoresValidos[valoresValidos.length - 1].valor} {unidad}
                    </span>
                </div>
            </div>
        </div>
    );
}
