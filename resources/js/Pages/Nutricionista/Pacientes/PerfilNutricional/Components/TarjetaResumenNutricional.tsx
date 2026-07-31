import { Activity, CheckCircle2, Ruler, Scale } from 'lucide-react';
import clsx from 'clsx';
import type { Registro } from '../tipos';

export default function TarjetaResumenNutricional({ evaluacion, completadas }: { evaluacion: Registro | null; completadas: number }) {
    const items: [string, string, React.ReactNode, string][] = [
        ['Peso', evaluacion?.peso ? `${evaluacion.peso} kg` : '—', <Scale size={16} strokeWidth={1.8} />, 'text-brand-green-dark dark:text-brand-green'],
        ['IMC', evaluacion?.imc ? String(evaluacion.imc) : '—', <Activity size={16} strokeWidth={1.8} />, imcColor(Number(evaluacion?.imc))],
        ['ICC', evaluacion?.indice_cintura_cadera ? String(evaluacion.indice_cintura_cadera) : '—', <Ruler size={16} strokeWidth={1.8} />, 'text-brand-orange'],
        ['Secciones', `${completadas}/6`, <CheckCircle2 size={16} strokeWidth={1.8} />, 'text-brand-green-dark dark:text-brand-green'],
    ];

    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {items.map(([label, value, icon, color]) => (
                <div key={label} className="card-elevated flex items-center gap-3 p-4">
                    <div className={clsx('flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/10 dark:bg-brand-green/[0.06]', color)}>
                        {icon}
                    </div>
                    <div>
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">{label}</p>
                        <p className={clsx('text-[18px] font-bold', color)}>{value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function imcColor(imc: number): string {
    if (!imc || isNaN(imc)) return 'text-ink dark:text-ink-dark';
    if (imc < 18.5) return 'text-category-others';
    if (imc < 25) return 'text-brand-green-dark dark:text-brand-green';
    if (imc < 30) return 'text-brand-orange';
    return 'text-category-fruits';
}
