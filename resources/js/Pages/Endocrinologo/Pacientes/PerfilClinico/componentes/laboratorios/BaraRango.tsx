/**
 * BaraRango — barra de rango de laboratorio con color único por parámetro.
 *
 * Cuando el valor está DENTRO del rango → usa el color propio del parámetro (identifier).
 * Cuando está FUERA del rango → usa naranja (alerta moderada) o rojo (alerta alta).
 */
import clsx from 'clsx';

/* ── Paleta de colores por parámetro ─────────────────────── */
export type ParamColor =
    | 'violet'    // Testosterona total → morado
    | 'rose'      // Testosterona libre → rosa
    | 'cyan'      // SHBG              → cian
    | 'amber'     // DHEA-S            → ámbar
    | 'indigo'    // Androstenediona   → índigo
    | 'teal'      // LH                → verde azulado
    | 'sky'       // FSH               → celeste
    | 'purple'    // LH/FSH            → púrpura
    | 'pink'      // Estradiol         → rosa fuerte
    | 'lime'      // Progesterona      → verde lima
    | 'orange'    // TSH               → naranja
    | 'blue'      // T4 libre          → azul
    | 'fuchsia'   // Prolactina        → fucsia
    | 'emerald'   // 17-OH Prog.       → esmeralda
    | 'yellow'    // Cortisol          → amarillo
    | 'green'     // Glucosa           → verde
    | 'red'       // Insulina          → rojo
    | 'teal2'     // HbA1c             → teal 2
    | 'indigo2'   // Colesterol        → índigo 2
    | 'mint'      // HDL               → menta
    | 'coral'     // LDL               → coral
    | 'grape'     // Triglicéridos     → uva
    | 'steel'     // VLDL              → acero
    ;

/* Clases de color: bar normal, text normal, zone */
const COLORES: Record<ParamColor, { bar: string; text: string; zone: string }> = {
    violet:   { bar: 'bg-category-dairy',           text: 'text-category-dairy',            zone: 'bg-category-dairy/10 dark:bg-category-dairy/[.06]' },
    rose:     { bar: 'bg-brand-peach',              text: 'text-brand-peach',               zone: 'bg-brand-peach/10 dark:bg-brand-peach/[.06]' },
    cyan:     { bar: 'bg-info',                     text: 'text-info',                      zone: 'bg-info/10 dark:bg-info/[.06]' },
    amber:    { bar: 'bg-category-others',          text: 'text-category-others',           zone: 'bg-category-others/10 dark:bg-category-others/[.06]' },
    indigo:   { bar: 'bg-[#6366f1]',               text: 'text-[#6366f1]',                 zone: 'bg-[#6366f1]/10 dark:bg-[#6366f1]/[.06]' },
    teal:     { bar: 'bg-[#14b8a6]',               text: 'text-[#14b8a6]',                 zone: 'bg-[#14b8a6]/10 dark:bg-[#14b8a6]/[.06]' },
    sky:      { bar: 'bg-[#0ea5e9]',               text: 'text-[#0ea5e9]',                 zone: 'bg-[#0ea5e9]/10 dark:bg-[#0ea5e9]/[.06]' },
    purple:   { bar: 'bg-[#a855f7]',               text: 'text-[#a855f7]',                 zone: 'bg-[#a855f7]/10 dark:bg-[#a855f7]/[.06]' },
    pink:     { bar: 'bg-[#ec4899]',               text: 'text-[#ec4899]',                 zone: 'bg-[#ec4899]/10 dark:bg-[#ec4899]/[.06]' },
    lime:     { bar: 'bg-[#84cc16]',               text: 'text-[#84cc16]',                 zone: 'bg-[#84cc16]/10 dark:bg-[#84cc16]/[.06]' },
    orange:   { bar: 'bg-brand-orange',             text: 'text-brand-orange',              zone: 'bg-brand-orange/10 dark:bg-brand-orange/[.06]' },
    blue:     { bar: 'bg-[#3b82f6]',               text: 'text-[#3b82f6]',                 zone: 'bg-[#3b82f6]/10 dark:bg-[#3b82f6]/[.06]' },
    fuchsia:  { bar: 'bg-[#d946ef]',               text: 'text-[#d946ef]',                 zone: 'bg-[#d946ef]/10 dark:bg-[#d946ef]/[.06]' },
    emerald:  { bar: 'bg-brand-green-dark',         text: 'text-brand-green-dark dark:text-brand-green', zone: 'bg-brand-green/10 dark:bg-brand-green/[.06]' },
    yellow:   { bar: 'bg-[#eab308]',               text: 'text-[#eab308]',                 zone: 'bg-[#eab308]/10 dark:bg-[#eab308]/[.06]' },
    green:    { bar: 'bg-brand-green',              text: 'text-brand-green-dark dark:text-brand-green', zone: 'bg-brand-green/10 dark:bg-brand-green/[.06]' },
    red:      { bar: 'bg-[#ef4444]',               text: 'text-[#ef4444]',                 zone: 'bg-[#ef4444]/10 dark:bg-[#ef4444]/[.06]' },
    teal2:    { bar: 'bg-[#2dd4bf]',               text: 'text-[#2dd4bf]',                 zone: 'bg-[#2dd4bf]/10 dark:bg-[#2dd4bf]/[.06]' },
    indigo2:  { bar: 'bg-[#818cf8]',               text: 'text-[#818cf8]',                 zone: 'bg-[#818cf8]/10 dark:bg-[#818cf8]/[.06]' },
    mint:     { bar: 'bg-[#34d399]',               text: 'text-[#34d399]',                 zone: 'bg-[#34d399]/10 dark:bg-[#34d399]/[.06]' },
    coral:    { bar: 'bg-[#f87171]',               text: 'text-[#f87171]',                 zone: 'bg-[#f87171]/10 dark:bg-[#f87171]/[.06]' },
    grape:    { bar: 'bg-[#c084fc]',               text: 'text-[#c084fc]',                 zone: 'bg-[#c084fc]/10 dark:bg-[#c084fc]/[.06]' },
    steel:    { bar: 'bg-[#94a3b8]',               text: 'text-[#94a3b8]',                 zone: 'bg-[#94a3b8]/10 dark:bg-[#94a3b8]/[.06]' },
};

interface Props {
    label: string;
    valor: number;
    unidad: string;
    min: number;
    max: number;
    /** Escala visual máxima (por defecto max * 1.5) */
    maxEscala?: number;
    /** Si la barra con valor BAJO es la alerta (ej. HDL) */
    bajoEsAlerta?: boolean;
    /** Si invertido=true, alerta cuando valor < min */
    invertido?: boolean;
    /** Color propio de este parámetro cuando está en rango */
    color: ParamColor;
    /** Texto extra cuando está fuera de rango */
    textoAlerta?: string;
}

export function BaraRango({
    label, valor, unidad, min, max,
    maxEscala: maxEscalaCustom,
    bajoEsAlerta = false,
    invertido = false,
    color,
    textoAlerta,
}: Props) {
    const maxEscala = maxEscalaCustom ?? max * 1.5;
    const pct     = Math.min((valor / maxEscala) * 100, 100);
    const pctMin  = (min / maxEscala) * 100;
    const pctMax  = (max / maxEscala) * 100;

    const fueraRango = invertido
        ? valor < min
        : bajoEsAlerta
            ? valor < min
            : (valor < min || valor > max);

    const c = COLORES[color];

    // Color de la barra: propio si normal, naranja si alerta moderada, rojo si muy alto
    const barColor = fueraRango
        ? (valor > max * 1.5 || (bajoEsAlerta && valor < min * 0.6) ? 'bg-category-fruits' : 'bg-brand-orange')
        : c.bar;

    const textColor = fueraRango
        ? (valor > max * 1.5 || (bajoEsAlerta && valor < min * 0.6) ? 'text-category-fruits' : 'text-brand-orange')
        : c.text;

    const etiquetaFuera = textoAlerta ?? (fueraRango ? (bajoEsAlerta || invertido ? '— Bajo' : '— Fuera de rango') : '');

    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10.5px] font-semibold text-ink dark:text-ink-dark">{label}</span>
                <span className={clsx('text-[10.5px] font-bold', textColor)}>
                    {valor} {unidad}{fueraRango ? ` ${etiquetaFuera}` : ''}
                </span>
            </div>
            <div className="relative h-3 w-full rounded-full bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden">
                {/* Zona normal sombreada */}
                <div
                    className={clsx('absolute top-0 h-full', c.zone)}
                    style={{ left: `${pctMin}%`, width: `${pctMax - pctMin}%` }}
                />
                {/* Barra del valor */}
                <div
                    className={clsx('absolute top-0.5 bottom-0.5 rounded-full transition-all duration-500', barColor)}
                    style={{ left: 0, width: `${pct}%` }}
                />
            </div>
            <div className="flex justify-between mt-0.5 text-[8px] text-ink-muted/50 dark:text-ink-muted-dark/50">
                <span>{min}</span>
                <span>{min}–{max} normal</span>
                <span>{max}</span>
            </div>
        </div>
    );
}
