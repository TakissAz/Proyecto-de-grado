import { router } from '@inertiajs/react';
import { Calculator, CheckCircle2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { etiqueta, type Registro, type RequerimientoNutricional } from '../tipos';

interface Props {
    pacienteId: number;
    requerimiento: RequerimientoNutricional | null;
    evaluacion: Registro | null;
    objetivo: Registro | null;
}

const numero = (valor: number, decimales = 2) =>
    new Intl.NumberFormat('es-BO', {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales,
    }).format(valor);

const fecha = (valor: string) => {
    const partes = valor.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : valor;
};

export default function TarjetaRequerimientoNutricional({ pacienteId, requerimiento, evaluacion, objetivo }: Props) {
    const [procesando, setProcesando] = useState(false);
    const faltaEvaluacion = !evaluacion;
    const faltaPesoTalla = Boolean(evaluacion && (
        evaluacion.peso === null || evaluacion.peso === '' ||
        evaluacion.talla === null || evaluacion.talla === ''
    ));

    const calcular = () => {
        if (faltaEvaluacion || faltaPesoTalla) return;

        router.post(
            `/nutricionista/pacientes/${pacienteId}/perfil-nutricional/requerimientos/calcular`,
            {},
            {
                preserveScroll: true,
                onStart: () => setProcesando(true),
                onFinish: () => setProcesando(false),
            },
        );
    };

    return (
        <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body gap-5 p-4 sm:p-6">
                <div className="flex flex-col items-start justify-between gap-3 min-[400px]:flex-row">
                    <div className="flex gap-3">
                        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                            <Calculator size={21} />
                        </span>
                        <div>
                            <h3 className="font-bold">Requerimientos nutricionales</h3>
                            <p className="mt-1 text-xs text-base-content/60">
                                Estimación energética y distribución diaria de macronutrientes.
                            </p>
                        </div>
                    </div>
                    <span className={`badge gap-1 ${requerimiento ? 'badge-success badge-outline' : 'badge-ghost'}`}>
                        {requerimiento && <CheckCircle2 size={12} />}
                        {requerimiento ? 'Registrado' : 'Pendiente'}
                    </span>
                </div>

                {faltaEvaluacion && <div className="alert alert-warning py-3 text-sm">Debe registrar una evaluación nutricional antes de calcular requerimientos.</div>}
                {faltaPesoTalla && <div className="alert alert-warning py-3 text-sm">Peso y talla son necesarios para calcular requerimientos.</div>}
                {!objetivo && <div className="alert border border-info/20 bg-info/10 py-3 text-sm text-base-content">No existe objetivo nutricional registrado; se calculará sin ajuste calórico.</div>}

                {!requerimiento ? (
                    <div className="rounded-xl border border-dashed border-base-300 bg-base-200/40 p-4 text-sm text-base-content/60">
                        Aún no se calcularon los requerimientos nutricionales.
                    </div>
                ) : (
                    <>
                        <div className="rounded-2xl bg-primary/10 p-5 text-center">
                            <p className="text-xs font-semibold uppercase tracking-wider text-base-content/60">Calorías objetivo</p>
                            <p className="mt-1 text-3xl font-black text-primary sm:text-4xl">
                                {numero(requerimiento.calorias_objetivo, 0)}
                                <span className="ml-1 text-base font-semibold">kcal/día</span>
                            </p>
                            <p className="mt-2 text-xs text-base-content/60">Calculado el {fecha(requerimiento.fecha_calculo)}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Dato label="TMB" valor={`${numero(requerimiento.tmb)} kcal`} />
                            <Dato label="GET" valor={`${numero(requerimiento.get)} kcal`} />
                            <Dato label="Ajuste calórico" valor={`${requerimiento.ajuste_calorico > 0 ? '+' : ''}${numero(requerimiento.ajuste_calorico, 0)} kcal`} />
                            <Dato label="Factor de actividad" valor={numero(requerimiento.factor_actividad, 3)} />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <Macro label="Proteínas" gramos={requerimiento.proteinas_diarias} porcentaje={requerimiento.porcentaje_proteinas} />
                            <Macro label="Carbohidratos" gramos={requerimiento.carbohidratos_diarios} porcentaje={requerimiento.porcentaje_carbohidratos} />
                            <Macro label="Grasas" gramos={requerimiento.grasas_diarias} porcentaje={requerimiento.porcentaje_grasas} />
                            <Macro label="Fibra" gramos={requerimiento.fibra_diaria} />
                        </div>

                        <dl className="grid gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                            <Dato label="Peso de referencia" valor={`${numero(requerimiento.peso_referencia)} kg`} />
                            <Dato label="Talla de referencia" valor={`${numero(requerimiento.talla_referencia)} m`} />
                            <Dato label="Edad de referencia" valor={requerimiento.edad_referencia === null ? '—' : `${requerimiento.edad_referencia} años`} />
                        </dl>

                        <div className="flex flex-wrap gap-2">
                            <span className="badge badge-outline badge-primary capitalize">{etiqueta(requerimiento.metodo_calculo)}</span>
                            <span className="badge badge-outline capitalize">{etiqueta(requerimiento.nivel_actividad)}</span>
                        </div>
                    </>
                )}

                <div className="card-actions justify-stretch sm:justify-end">
                    <button type="button" className="btn btn-primary btn-sm w-full gap-2 sm:w-auto" onClick={calcular} disabled={procesando}>
                        {procesando ? <span className="loading loading-spinner loading-xs" /> : requerimiento ? <RefreshCw size={14} /> : <Calculator size={14} />}
                        {procesando ? 'Calculando…' : requerimiento ? 'Recalcular requerimientos' : 'Calcular requerimientos'}
                    </button>
                </div>
            </div>
        </section>
    );
}

function Dato({ label, valor }: { label: string; valor: string }) {
    return <div className="min-w-0 rounded-xl border border-base-300 bg-base-200/40 p-3">
        <dt className="text-[11px] font-semibold uppercase tracking-wide text-base-content/50">{label}</dt>
        <dd className="mt-1 break-words text-sm font-semibold">{valor}</dd>
    </div>;
}

function Macro({ label, gramos, porcentaje }: { label: string; gramos: number; porcentaje?: number }) {
    return <div className="rounded-xl border border-base-300 bg-base-200/40 p-4">
        <p className="text-xs font-semibold text-base-content/60">{label}</p>
        <p className="mt-1 text-xl font-bold">{numero(gramos)} g/día</p>
        {porcentaje !== undefined && <p className="mt-1 text-xs text-base-content/60">{numero(porcentaje, 0)}% del total</p>}
    </div>;
}
