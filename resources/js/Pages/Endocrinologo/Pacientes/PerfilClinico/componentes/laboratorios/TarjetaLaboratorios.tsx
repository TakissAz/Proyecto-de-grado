import { useState } from 'react';
import clsx from 'clsx';
import { Link } from '@inertiajs/react';
import { FlaskConical, Plus, Edit, History, CheckCircle2, Circle, Calendar } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Boton } from '@/Components/ui/boton';
import { VistaPerfilAndrogenico } from './perfil-androgenico';
import { VistaPerfilGonadotropo } from './perfil-gonadotropo';
import { VistaDiferenciales } from './diferenciales';
import { VistaGlucosaInsulina } from './glucosa-insulina';
import { VistaPerfilLipidico } from './perfil-lipidico';
import type { LaboratoriosData } from '../../tipos';

interface Props {
    laboratorios: LaboratoriosData;
    idPaciente: number;
    onRegistrarPerfilAndrogenico: () => void;
    onEditarPerfilAndrogenico: () => void;
    onRegistrarPerfilGonadotropo: () => void;
    onEditarPerfilGonadotropo: () => void;
    onRegistrarDiferenciales: () => void;
    onEditarDiferenciales: () => void;
    onRegistrarGlucosaInsulina: () => void;
    onEditarGlucosaInsulina: () => void;
    onRegistrarPerfilLipidico: () => void;
    onEditarPerfilLipidico: () => void;
}

export default function TarjetaLaboratorios({ laboratorios, idPaciente, ...acciones }: Props) {
    const [tab, setTab] = useState(0);

    const paneles = [
        { label: 'Andrógenos', datos: laboratorios.perfil_androgenico, onReg: acciones.onRegistrarPerfilAndrogenico, onEdit: acciones.onEditarPerfilAndrogenico, color: 'text-category-fruits' },
        { label: 'Gonadotropo', datos: laboratorios.perfil_gonadotropo, onReg: acciones.onRegistrarPerfilGonadotropo, onEdit: acciones.onEditarPerfilGonadotropo, color: 'text-brand-orange' },
        { label: 'Diferenciales', datos: laboratorios.diferencial_endocrino, onReg: acciones.onRegistrarDiferenciales, onEdit: acciones.onEditarDiferenciales, color: 'text-category-dairy' },
        { label: 'Glucosa', datos: laboratorios.glucosa_insulina, onReg: acciones.onRegistrarGlucosaInsulina, onEdit: acciones.onEditarGlucosaInsulina, color: 'text-brand-green-dark dark:text-brand-green' },
        { label: 'Lípidos', datos: laboratorios.perfil_lipidico, onReg: acciones.onRegistrarPerfilLipidico, onEdit: acciones.onEditarPerfilLipidico, color: 'text-category-others' },
    ];

    const completados = paneles.filter(p => p.datos != null).length;
    const panelActivo = paneles[tab];

    return (
        <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                    <div className={clsx('flex h-8 w-8 items-center justify-center rounded-xl', completados > 0 ? 'bg-brand-green/15' : 'bg-black/[0.04] dark:bg-white/[0.04]')}>
                        <FlaskConical size={15} strokeWidth={1.8} className={completados > 0 ? 'text-brand-green-dark dark:text-brand-green' : 'text-ink-muted/40 dark:text-ink-muted-dark/40'} />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Laboratorios</h3>
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">{completados}/5 paneles registrados</p>
                    </div>
                </div>
                <Link href={`/endocrinologo/pacientes/${idPaciente}/laboratorios/historial`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[0.03] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.04] dark:hover:text-ink-dark">
                    <History size={12} strokeWidth={1.8} /> Historial
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 rounded-xl bg-black/[0.03] p-1 dark:bg-white/[0.04]">
                {paneles.map((p, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setTab(i)}
                        className={clsx(
                            'flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[10.5px] font-semibold transition-all',
                            tab === i
                                ? 'bg-surface-card shadow-sm text-ink dark:bg-surface-card-dark dark:text-ink-dark'
                                : 'text-ink-muted hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark'
                        )}
                    >
                        {p.datos ? <CheckCircle2 size={11} strokeWidth={2} className="text-brand-green-dark dark:text-brand-green" /> : <Circle size={11} strokeWidth={2} className="text-ink-muted/30 dark:text-ink-muted-dark/30" />}
                        <span className="hidden sm:inline">{p.label}</span>
                    </button>
                ))}
            </div>

            {/* Panel activo */}
            <div className="rounded-xl border border-surface-border p-4 dark:border-surface-border-dark">
                {panelActivo.datos ? (
                    <div>
                        {/* Header del panel */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <p className={clsx('text-[12px] font-bold', panelActivo.color)}>{panelActivo.label}</p>
                                {(panelActivo.datos as any).fecha_resultado && (
                                    <span className="flex items-center gap-1 text-[10px] text-ink-muted dark:text-ink-muted-dark">
                                        <Calendar size={9} strokeWidth={1.8} />
                                        {(panelActivo.datos as any).fecha_resultado}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Boton variante="primary" tamano="xs" onClick={panelActivo.onReg}>
                                    <Plus size={11} strokeWidth={1.8} /> Nuevo
                                </Boton>
                                <button onClick={panelActivo.onEdit} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green-soft dark:text-brand-green dark:hover:bg-brand-green-dark/15">
                                    <Edit size={11} strokeWidth={1.8} /> Editar
                                </button>
                            </div>
                        </div>

                        {/* Datos del panel */}
                        {tab === 0 && laboratorios.perfil_androgenico && <VistaPerfilAndrogenico data={laboratorios.perfil_androgenico} />}
                        {tab === 1 && laboratorios.perfil_gonadotropo && <VistaPerfilGonadotropo data={laboratorios.perfil_gonadotropo} />}
                        {tab === 2 && laboratorios.diferencial_endocrino && <VistaDiferenciales data={laboratorios.diferencial_endocrino} />}
                        {tab === 3 && laboratorios.glucosa_insulina && <VistaGlucosaInsulina data={laboratorios.glucosa_insulina} />}
                        {tab === 4 && laboratorios.perfil_lipidico && <VistaPerfilLipidico data={laboratorios.perfil_lipidico} />}
                    </div>
                ) : (
                    <div className="py-4 text-center">
                        <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark mb-3">No se han registrado resultados de {panelActivo.label.toLowerCase()}</p>
                        <Boton variante="primary" tamano="sm" onClick={panelActivo.onReg}>
                            <Plus size={13} strokeWidth={1.8} /> Registrar {panelActivo.label.toLowerCase()}
                        </Boton>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ═══ Componente de valor ═══ */
function Val({ label, valor, unidad, destacar }: { label: string; valor?: number | null; unidad?: string; destacar?: boolean }) {
    return (
        <div className="rounded-lg bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03]">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">{label}</p>
            <p className={clsx('text-[12.5px] font-bold', destacar ? 'text-brand-orange' : 'text-ink dark:text-ink-dark')}>
                {valor != null ? `${valor}${unidad ? ` ${unidad}` : ''}` : '—'}
            </p>
        </div>
    );
}

/* ═══ Fin paneles externos ═══ */
