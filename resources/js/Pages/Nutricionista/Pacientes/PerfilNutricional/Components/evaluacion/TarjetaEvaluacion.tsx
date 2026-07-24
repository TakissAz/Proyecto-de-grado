import { Scale, Plus, Edit, History, Calendar } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Boton } from '@/Components/ui/boton';
import clsx from 'clsx';
import type { Registro } from '../../tipos';
import { etiqueta } from '../../tipos';

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

    const datos: [string, string, string?][] = [
        ['Peso', registro.peso != null ? `${registro.peso} kg` : '—'],
        ['Talla', registro.talla != null ? `${registro.talla} m` : '—'],
        ['IMC', registro.imc != null ? `${registro.imc}` : '—', imc_color(Number(registro.imc))],
        ['Cintura', registro.circunferencia_cintura != null ? `${registro.circunferencia_cintura} cm` : '—'],
        ['Cadera', registro.circunferencia_cadera != null ? `${registro.circunferencia_cadera} cm` : '—'],
        ['ICC', registro.indice_cintura_cadera != null ? `${registro.indice_cintura_cadera}` : '—'],
        ['Grasa corporal', registro.porcentaje_grasa != null ? `${registro.porcentaje_grasa}%` : '—'],
        ['Masa muscular', registro.masa_muscular != null ? `${registro.masa_muscular} kg` : '—'],
    ];

    return (
        <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-green/15">
                        <Scale size={15} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Evaluación nutricional</h3>
                        {registro.fecha_evaluacion && (
                            <p className="flex items-center gap-1 text-[10.5px] text-ink-muted dark:text-ink-muted-dark">
                                <Calendar size={10} strokeWidth={1.8} /> {String(registro.fecha_evaluacion)}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Boton variante="primary" tamano="xs" onClick={onRegistrar}>
                        <Plus size={11} strokeWidth={1.8} /> Nuevo
                    </Boton>
                    {idPaciente && (
                        <Link href={`/nutricionista/pacientes/${idPaciente}/perfil-nutricional/evaluaciones/historial`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[0.03] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.04] dark:hover:text-ink-dark">
                            <History size={11} strokeWidth={1.8} /> Historial
                        </Link>
                    )}
                    <button onClick={onEditar} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green-soft dark:text-brand-green dark:hover:bg-brand-green-dark/15">
                        <Edit size={11} strokeWidth={1.8} /> Editar
                    </button>
                </div>
            </div>

            {/* Datos en grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {datos.map(([label, valor, colorExtra]) => (
                    <div key={label} className="rounded-lg bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03]">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">{label}</p>
                        <p className={clsx('text-[12.5px] font-bold', colorExtra ?? 'text-ink dark:text-ink-dark')}>{valor}</p>
                    </div>
                ))}
            </div>

            {/* Nivel de actividad */}
            {registro.nivel_actividad && (
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark">Actividad:</span>
                    <span className="pill bg-brand-green/15 text-brand-green-dark dark:bg-brand-green/20 dark:text-brand-green capitalize">
                        {String(registro.nivel_actividad).replace('_', ' ')}
                    </span>
                </div>
            )}

            {/* Observaciones */}
            {registro.observaciones && (
                <div className="rounded-xl border border-surface-border px-4 py-3 dark:border-surface-border-dark">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">Observaciones</p>
                    <p className="text-[12px] text-ink dark:text-ink-dark leading-relaxed">{String(registro.observaciones)}</p>
                </div>
            )}
        </div>
    );
}

function imc_color(imc: number): string {
    if (!imc || isNaN(imc)) return 'text-ink dark:text-ink-dark';
    if (imc < 18.5) return 'text-category-others';
    if (imc < 25) return 'text-brand-green-dark dark:text-brand-green';
    if (imc < 30) return 'text-brand-orange';
    return 'text-category-fruits';
}
