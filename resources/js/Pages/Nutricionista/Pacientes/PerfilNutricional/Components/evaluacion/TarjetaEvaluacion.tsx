import { Scale, Plus, Edit, History, Calendar, Activity, Info, TrendingUp } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Boton } from '@/Components/ui/boton';
import { Badge } from '@/Components/ui/badge';
import clsx from 'clsx';
import type { Registro } from '../../tipos';

interface Props {
    registro: Registro | null;
    onRegistrar: () => void;
    onEditar: () => void;
    bloqueada?: boolean;
    idPaciente?: number;
}

export default function TarjetaEvaluacion({ registro, onRegistrar, onEditar, bloqueada, idPaciente }: Props) {
    if (!registro) {
        return (
            <div className="p-5">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-green/10">
                        <Scale size={15} strokeWidth={1.8} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-semibold text-ink dark:text-ink-dark">Evaluación nutricional</h3>
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Antropometría y composición corporal</p>
                    </div>
                </div>
                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark mb-4 leading-relaxed">
                    No se ha registrado evaluación nutricional. Registra peso, talla y composición corporal del paciente.
                </p>
                <Boton variante="primary" tamano="sm" onClick={onRegistrar} disabled={bloqueada}>
                    <Plus size={13} strokeWidth={1.8} /> Registrar evaluación
                </Boton>
            </div>
        );
    }

    const imc = Number(registro.imc) || 0;
    const imcCategoria = imc < 18.5 ? 'Bajo peso' : imc < 25 ? 'Normal' : imc < 30 ? 'Sobrepeso' : 'Obesidad';
    const imcColor = imc < 18.5 ? 'text-category-others' : imc < 25 ? 'text-brand-green-dark dark:text-brand-green' : imc < 30 ? 'text-brand-orange' : 'text-category-fruits';
    const imcBgColor = imc < 18.5 ? 'bg-category-others' : imc < 25 ? 'bg-brand-green' : imc < 30 ? 'bg-brand-orange' : 'bg-category-fruits';
    const imcPct = Math.min(Math.max(((imc - 15) / 25) * 100, 0), 100);
    const grasa = registro.porcentaje_grasa != null ? Number(registro.porcentaje_grasa) : null;
    const masaMuscular = registro.masa_muscular != null ? Number(registro.masa_muscular) : null;
    const peso = registro.peso != null ? Number(registro.peso) : null;
    const porcentajeMuscular = masaMuscular != null && peso && peso > 0 ? (masaMuscular / peso) * 100 : null;
    const grasaEstado = grasa == null ? null : grasa < 21 ? 'Bajo el rango orientativo' : grasa < 33 ? 'Dentro del rango orientativo' : grasa < 39 ? 'Elevado' : 'Muy elevado';
    const grasaColor = grasa == null ? 'bg-brand-green' : grasa < 21 ? 'bg-category-others' : grasa < 33 ? 'bg-brand-green' : 'bg-brand-orange';

    return (
        <div className="p-5 space-y-4">

            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                    <div className={clsx('flex h-8 w-8 items-center justify-center rounded-xl', imc >= 25 ? 'bg-brand-orange/15' : 'bg-brand-green/15')}>
                        <Scale size={15} strokeWidth={1.8} className={imc >= 25 ? 'text-brand-orange' : 'text-brand-green-dark dark:text-brand-green'} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Evaluación nutricional</h3>
                            <Badge color={imc >= 25 ? 'orange' : 'green'}>{imcCategoria}</Badge>
                        </div>
                        {registro.fecha_evaluacion && (
                            <p className="flex items-center gap-1 text-[10.5px] text-ink-muted dark:text-ink-muted-dark mt-0.5">
                                <Calendar size={10} strokeWidth={1.8} /> {formatearFecha(registro.fecha_evaluacion)}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Boton variante="primary" tamano="xs" onClick={onRegistrar}>
                        <Plus size={11} strokeWidth={1.8} /> Nuevo
                    </Boton>
                    {idPaciente && (
                        <Link href={`/nutricionista/pacientes/${idPaciente}/perfil-nutricional/evaluaciones/historial`}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[0.03] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.04] dark:hover:text-ink-dark">
                            <History size={11} strokeWidth={1.8} /> Historial
                        </Link>
                    )}
                    <button onClick={onEditar} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green-soft dark:text-brand-green dark:hover:bg-brand-green-dark/15">
                        <Edit size={11} strokeWidth={1.8} /> Editar
                    </button>
                </div>
            </div>

            {/* ── IMC visual + Datos ── */}
            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4">

                {/* Mini gráfico IMC */}
                <div className="rounded-xl border border-surface-border bg-black/[0.02] p-3 dark:border-surface-border-dark dark:bg-white/[0.03]">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">IMC</p>
                    <div className="text-center mb-2">
                        <span className={clsx('text-[22px] font-bold', imcColor)}>{imc || '—'}</span>
                        <p className={clsx('text-[10px] font-semibold', imcColor)}>{imcCategoria}</p>
                    </div>
                    {/* Barra */}
                    <div className="relative h-2.5 w-full rounded-full overflow-hidden flex">
                        <div className="h-full bg-category-others/40" style={{ width: '14%' }} />
                        <div className="h-full bg-brand-green/40" style={{ width: '26%' }} />
                        <div className="h-full bg-brand-orange/40" style={{ width: '20%' }} />
                        <div className="h-full bg-category-fruits/40" style={{ width: '40%' }} />
                    </div>
                    <div className="relative h-2 mt-0.5">
                        <div className="absolute top-0 -translate-x-1/2 w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent border-t-ink dark:border-t-ink-dark" style={{ left: `${imcPct}%` }} />
                    </div>
                    <div className="flex justify-between mt-1 text-[7px] text-ink-muted/50 dark:text-ink-muted-dark/50">
                        <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
                    </div>
                </div>

                {/* Datos en grid */}
                <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">
                        <Activity size={10} strokeWidth={2} className="text-brand-green-dark dark:text-brand-green" />
                        Composición corporal
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <DatoItem label="Peso" valor={registro.peso != null ? `${registro.peso} kg` : null} />
                        <DatoItem label="Talla" valor={registro.talla != null ? `${registro.talla} m` : null} />
                        <DatoItem label="Cintura" valor={registro.circunferencia_cintura != null ? `${registro.circunferencia_cintura} cm` : null}
                            destacar={Number(registro.circunferencia_cintura) >= 80} />
                        <DatoItem label="Cadera" valor={registro.circunferencia_cadera != null ? `${registro.circunferencia_cadera} cm` : null} />
                        <DatoItem label="ICC" valor={registro.indice_cintura_cadera != null ? `${registro.indice_cintura_cadera}` : null}
                            destacar={Number(registro.indice_cintura_cadera) >= 0.85} />
                        <DatoItem label="Grasa corporal" valor={registro.porcentaje_grasa != null ? `${registro.porcentaje_grasa}%` : null} />
                        <DatoItem label="Masa muscular" valor={registro.masa_muscular != null ? `${registro.masa_muscular} kg` : null} />
                        {registro.nivel_actividad && (
                            <DatoItem label="Actividad" valor={String(registro.nivel_actividad).replace('_', ' ')} />
                        )}
                    </div>
                </div>
            </div>

            {/* Indicadores interpretables de composición corporal */}
            {(registro.porcentaje_grasa || registro.masa_muscular) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {grasa != null && (
                        <IndicadorComposicion titulo="Grasa corporal estimada" valor={`${grasa.toFixed(1)}%`}
                            estado={grasaEstado ?? ''}
                            descripcion="Referencia orientativa para mujeres adultas: 21–32,9%. Se interpreta junto con edad, cintura, método de medición y evolución individual."
                            porcentaje={Math.min(Math.max((grasa / 45) * 100, 0), 100)} color={grasaColor} />
                    )}
                    {masaMuscular != null && (
                        <IndicadorComposicion titulo="Masa muscular estimada" valor={`${masaMuscular.toFixed(1)} kg`}
                            estado={porcentajeMuscular != null ? `${porcentajeMuscular.toFixed(1)}% del peso registrado` : 'Valor basal para seguimiento'}
                            descripcion="No se compara con un límite universal: depende de talla, peso y método utilizado. Su utilidad principal es observar si se conserva o mejora entre controles."
                            porcentaje={porcentajeMuscular != null ? Math.min(porcentajeMuscular * 2, 100) : 0} color="bg-category-dairy" />
                    )}
                </div>
            )}

            <div className="rounded-xl border border-brand-green/20 bg-brand-green/[0.05] px-4 py-3 dark:bg-brand-green/[0.07]">
                <div className="flex items-start gap-2.5">
                    <Info size={15} className="mt-0.5 shrink-0 text-brand-green-dark dark:text-brand-green" />
                    <div>
                        <p className="text-[11px] font-bold text-ink dark:text-ink-dark">¿Por qué se consideran estos indicadores?</p>
                        <p className="mt-1 text-[10.5px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">
                            El IMC describe la relación peso–talla; la cintura y el ICC ayudan a valorar la distribución abdominal; la grasa y la masa muscular permiten vigilar la composición corporal. Juntos fundamentan el objetivo, el ajuste energético y el seguimiento del plan, pero no sustituyen la valoración profesional.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Observaciones ── */}
            {registro.observaciones && (
                <div className="rounded-xl border border-surface-border px-4 py-3 dark:border-surface-border-dark">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">Observaciones</p>
                    <p className="text-[12px] text-ink dark:text-ink-dark leading-relaxed">{String(registro.observaciones)}</p>
                </div>
            )}
        </div>
    );
}

function DatoItem({ label, valor, destacar }: { label: string; valor?: string | null; destacar?: boolean }) {
    return (
        <div className="rounded-xl border border-surface-border bg-black/[0.02] px-3 py-2 dark:border-surface-border-dark dark:bg-white/[0.03]">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">{label}</p>
            <p className={clsx('text-[12.5px] font-bold', destacar ? 'text-brand-orange' : 'text-ink dark:text-ink-dark')}>{valor ?? '—'}</p>
        </div>
    );
}

function IndicadorComposicion({ titulo, valor, estado, descripcion, porcentaje, color }: { titulo: string; valor: string; estado: string; descripcion: string; porcentaje: number; color: string }) {
    return (
        <div className="rounded-xl border border-surface-border bg-black/[0.02] px-4 py-3 dark:border-surface-border-dark dark:bg-white/[0.03]">
            <div className="flex items-start justify-between gap-3">
                <div><span className="text-[9.5px] font-semibold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">{titulo}</span>
                    <p className="mt-1 flex items-center gap-1 text-[9.5px] font-semibold text-brand-green-dark dark:text-brand-green"><TrendingUp size={11}/>{estado}</p></div>
                <span className="text-[16px] font-bold text-ink dark:text-ink-dark">{valor}</span>
            </div>
            <div className="mt-2.5 h-2 w-full rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                <div className={clsx('h-full rounded-full transition-all', color)} style={{ width: `${porcentaje}%` }} />
            </div>
            <p className="mt-2 text-[9.5px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">{descripcion}</p>
        </div>
    );
}

function formatearFecha(fecha: unknown): string {
    if (!fecha) return '—';
    const texto = String(fecha);
    const [anio, mes, dia] = texto.slice(0, 10).split('-');
    return anio && mes && dia ? `${dia}/${mes}/${anio}` : texto;
}
