import { router } from '@inertiajs/react';
import {
    CheckCheck,
    Clock3,
    Eye,
    EyeOff,
    MessageSquareText,
    Send,
    X,
    ChevronDown,
    Sparkles,
    Lock,
} from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

/* ── Tipos ───────────────────────────────────────────────────── */
export interface RetroalimentacionHistorial {
    id_retroalimentacion_paciente: number;
    tipo_retroalimentacion: string;
    rol_emisor: string;
    prioridad: string;
    mensaje: string;
    visible_para_paciente: boolean;
    leido_por_paciente: boolean;
    fecha_lectura_paciente: string | null;
    created_at: string | null;
    profesional: string | null;
    estado: string;
}

/* ── Helpers ─────────────────────────────────────────────────── */
const TIPOS: Record<string, string> = {
    comida: 'Comidas',
    sintomas: 'Síntomas',
    adherencia: 'Adherencia',
    recomendacion_general: 'Recomendación',
    ajuste_plan: 'Ajuste del plan',
    recordatorio: 'Recordatorio',
    malestar: 'Malestar reportado',
    consulta: 'Consulta',
    ingredientes: 'Ingrediente no disponible',
    otro: 'Mensaje',
};

const AYUDAS: Record<string, string> = {
    comida: 'Comenta aceptación, porciones o preparación.',
    sintomas: 'Orienta sobre los síntomas registrados.',
    adherencia: 'Reconoce avances o refuerza el cumplimiento.',
    recomendacion_general: 'Envía una orientación nutricional general.',
    ajuste_plan: 'Explica un cambio realizado en el plan.',
    recordatorio: 'Recuerda una acción concreta a la paciente.',
};

const PRIORIDAD_COLOR: Record<string, string> = {
    alta: 'bg-category-fruits/15 text-category-fruits border-category-fruits/25',
    normal: 'bg-brand-orange/10 text-brand-orange border-brand-orange/25',
    baja: 'bg-black/[0.05] text-ink-muted border-surface-border dark:bg-white/[0.05] dark:text-ink-muted-dark dark:border-surface-border-dark',
};

function fechaBO(f: string | null) {
    if (!f) return 'Sin fecha';
    return new Intl.DateTimeFormat('es-BO', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'America/La_Paz',
    }).format(new Date(f));
}

function fechaCorta(f: string | null) {
    if (!f) return '';
    return new Intl.DateTimeFormat('es-BO', {
        day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'America/La_Paz',
    }).format(new Date(f));
}

/* ── Burbuja de mensaje ──────────────────────────────────────── */
function Burbuja({ item }: { item: RetroalimentacionHistorial }) {
    const prioClass = PRIORIDAD_COLOR[item.prioridad] ?? PRIORIDAD_COLOR.baja;
    const esPaciente = item.rol_emisor === 'paciente';

    return (
        <div className={clsx('flex items-end gap-2 group', esPaciente && 'flex-row-reverse')}>
            {/* Avatar nutricionista */}
            <div className={clsx('shrink-0 flex h-7 w-7 items-center justify-center rounded-full', esPaciente ? 'bg-category-dairy/15 text-category-dairy' : 'bg-brand-green/20 text-brand-green-dark dark:bg-brand-green/15 dark:text-brand-green')}>
                {esPaciente ? <MessageSquareText size={13} strokeWidth={2} /> : <Sparkles size={13} strokeWidth={2} />}
            </div>

            <div className={clsx('flex-1 space-y-1', esPaciente && 'flex flex-col items-end')}>
                {/* Chips tipo + prioridad */}
                <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[9px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                        {esPaciente ? 'Paciente' : (item.profesional ?? 'Nutricionista')}
                    </span>
                    <span className={clsx(
                        'inline-flex items-center rounded-full border px-1.5 py-0 text-[8.5px] font-bold',
                        prioClass,
                    )}>
                        {item.prioridad}
                    </span>
                    <span className="rounded-full bg-black/[0.04] dark:bg-white/[0.05] px-1.5 py-0 text-[8.5px] text-ink-muted dark:text-ink-muted-dark">
                        {TIPOS[item.tipo_retroalimentacion] ?? item.tipo_retroalimentacion}
                    </span>
                    {!item.visible_para_paciente && !esPaciente && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.05] px-1.5 py-0 text-[8.5px] text-ink-muted dark:text-ink-muted-dark">
                            <Lock size={8} strokeWidth={2} /> Interna
                        </span>
                    )}
                </div>

                {/* Burbuja del mensaje */}
                <div className={clsx('max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm', esPaciente ? 'rounded-br-sm bg-category-dairy/10 border border-category-dairy/20' : 'rounded-bl-sm bg-surface-card border border-surface-border dark:bg-surface-card-dark dark:border-surface-border-dark')}>
                    <p className="text-[12px] leading-relaxed text-ink dark:text-ink-dark whitespace-pre-wrap">
                        {item.mensaje}
                    </p>
                </div>

                {/* Meta: fecha + estado lectura */}
                <div className="flex items-center gap-2">
                    <span className="text-[9px] text-ink-muted/60 dark:text-ink-muted-dark/60">
                        {fechaCorta(item.created_at)}
                    </span>
                    {esPaciente ? <span className="text-[9px] text-category-dairy">Recibido desde el portal</span> : item.visible_para_paciente ? (
                        item.leido_por_paciente ? (
                            <span className="flex items-center gap-0.5 text-[9px] font-semibold text-brand-green-dark dark:text-brand-green">
                                <CheckCheck size={10} strokeWidth={2} /> Leído
                            </span>
                        ) : (
                            <span className="flex items-center gap-0.5 text-[9px] font-semibold text-brand-orange">
                                <Clock3 size={9} strokeWidth={2} /> Sin leer
                            </span>
                        )
                    ) : (
                        <span className="flex items-center gap-0.5 text-[9px] text-ink-muted/50 dark:text-ink-muted-dark/50">
                            <EyeOff size={9} strokeWidth={2} /> Solo profesionales
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Panel de chat flotante ──────────────────────────────────── */
function ChatPanel({
    abierto, cerrar, pacienteId, planId, historial,
}: {
    abierto: boolean;
    cerrar: () => void;
    pacienteId: number;
    planId?: number | null;
    historial: RetroalimentacionHistorial[];
}) {
    const [tipo, setTipo] = useState('recomendacion_general');
    const [prioridad, setPrioridad] = useState('normal');
    const [mensaje, setMensaje] = useState('');
    const [visible, setVisible] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandirOpciones, setExpandirOpciones] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const burbujasFin = useRef<HTMLDivElement>(null);

    // Scroll al fondo al abrir o recibir nuevos mensajes
    useEffect(() => {
        if (abierto) {
            setTimeout(() => burbujasFin.current?.scrollIntoView({ behavior: 'smooth' }), 80);
        }
    }, [abierto, historial.length]);

    const enviar = async (e: FormEvent) => {
        e.preventDefault();
        if (!mensaje.trim()) return;
        setEnviando(true);
        setError(null);
        try {
            const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
            const r = await fetch(`/nutricionista/pacientes/${pacienteId}/retroalimentaciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': token },
                body: JSON.stringify({
                    tipo_retroalimentacion: tipo,
                    prioridad,
                    mensaje,
                    visible_para_paciente: visible,
                    id_plan_alimentario: planId ?? null,
                }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(r.status === 422 ? 'Revisa los datos.' : d.message ?? 'No se pudo enviar.');
            setMensaje('');
            setExpandirOpciones(false);
            router.reload({ only: ['retroalimentacionesPaciente'] });
        } catch (x) {
            setError(x instanceof Error ? x.message : 'No se pudo enviar.');
        } finally {
            setEnviando(false);
        }
    };

    // Auto-resize del textarea
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMensaje(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
    };

    if (!abierto) return null;

    return (
        <div className="flex flex-col w-[360px] max-h-[560px] rounded-2xl border border-surface-border bg-surface-card shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark overflow-hidden">

            {/* ── Cabecera ── */}
            <div className="flex items-center gap-3 border-b border-surface-border px-4 py-3 dark:border-surface-border-dark bg-brand-green/[0.04] dark:bg-brand-green/[0.03]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green/20 text-brand-green-dark dark:bg-brand-green/15 dark:text-brand-green">
                    <MessageSquareText size={15} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-bold text-ink dark:text-ink-dark">Retroalimentación</p>
                    <p className="text-[9.5px] text-ink-muted dark:text-ink-muted-dark truncate">
                        {historial.length} mensaje{historial.length !== 1 ? 's' : ''} · Canal profesional
                    </p>
                </div>
                <button
                    type="button"
                    onClick={cerrar}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-ink-muted hover:bg-black/[0.05] dark:text-ink-muted-dark dark:hover:bg-white/[0.05]"
                >
                    <X size={14} strokeWidth={2} />
                </button>
            </div>

            {/* ── Lista de burbujas ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
                {historial.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 py-10 text-center">
                        <MessageSquareText size={28} strokeWidth={1.2} className="text-ink-muted/25 dark:text-ink-muted-dark/25" />
                        <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                            Aún no hay mensajes.<br />Envía la primera orientación.
                        </p>
                    </div>
                ) : (
                    /* historial viene del más reciente al más antiguo — invertimos para mostrar cronológico */
                    [...historial].reverse().map(item => (
                        <Burbuja key={item.id_retroalimentacion_paciente} item={item} />
                    ))
                )}
                <div ref={burbujasFin} />
            </div>

            {/* ── Opciones de tipo / prioridad / visibilidad (colapsable) ── */}
            <div className="border-t border-surface-border dark:border-surface-border-dark">
                <button
                    type="button"
                    onClick={() => setExpandirOpciones(v => !v)}
                    className="flex w-full items-center gap-1.5 px-4 py-2 text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                >
                    <ChevronDown size={11} strokeWidth={2} className={clsx('transition-transform', expandirOpciones && 'rotate-180')} />
                    {TIPOS[tipo]} · {prioridad} · {visible ? 'Visible' : 'Interna'}
                </button>

                {expandirOpciones && (
                    <div className="px-4 pb-3 space-y-3">

                        {/* ── Motivo: píldoras ── */}
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1.5">Motivo</p>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(TIPOS).map(([v, n]) => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => setTipo(v)}
                                        className={clsx(
                                            'rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all',
                                            tipo === v
                                                ? 'border-brand-green/40 bg-brand-green/[0.12] text-brand-green-dark dark:bg-brand-green/[0.10] dark:text-brand-green'
                                                : 'border-surface-border bg-black/[0.02] text-ink-muted hover:border-brand-green/20 hover:text-ink dark:border-surface-border-dark dark:bg-white/[0.02] dark:text-ink-muted-dark dark:hover:text-ink-dark',
                                        )}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Prioridad: 3 botones ── */}
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1.5">Prioridad</p>
                            <div className="flex gap-1">
                                {([
                                    { v: 'baja',   label: 'Baja',   active: 'border-surface-border bg-black/[0.06] text-ink dark:bg-white/[0.08] dark:text-ink-dark' },
                                    { v: 'normal', label: 'Normal', active: 'border-brand-orange/40 bg-brand-orange/[0.10] text-brand-orange' },
                                    { v: 'alta',   label: 'Alta',   active: 'border-category-fruits/40 bg-category-fruits/[0.10] text-category-fruits' },
                                ] as const).map(({ v, label, active }) => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => setPrioridad(v)}
                                        className={clsx(
                                            'flex-1 rounded-lg border px-2 py-1.5 text-[10px] font-bold transition-all',
                                            prioridad === v
                                                ? active
                                                : 'border-surface-border bg-black/[0.02] text-ink-muted hover:bg-black/[0.04] dark:border-surface-border-dark dark:bg-white/[0.02] dark:text-ink-muted-dark dark:hover:bg-white/[0.04]',
                                        )}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Visibilidad: toggle ── */}
                        <button
                            type="button"
                            onClick={() => setVisible(v => !v)}
                            className={clsx(
                                'flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-[10.5px] font-semibold transition-all',
                                visible
                                    ? 'border-brand-green/25 bg-brand-green/[0.06] text-brand-green-dark dark:bg-brand-green/[0.05] dark:text-brand-green'
                                    : 'border-surface-border bg-black/[0.03] text-ink-muted dark:border-surface-border-dark dark:bg-white/[0.02] dark:text-ink-muted-dark',
                            )}
                        >
                            {visible ? <Eye size={12} strokeWidth={2} /> : <EyeOff size={12} strokeWidth={2} />}
                            {visible ? 'Visible para la paciente' : 'Nota interna · solo profesionales'}
                        </button>

                        <p className="text-[9px] text-ink-muted/60 dark:text-ink-muted-dark/60 italic">{AYUDAS[tipo]}</p>
                    </div>
                )}
            </div>

            {/* ── Input de mensaje ── */}
            <form
                onSubmit={enviar}
                className="border-t border-surface-border dark:border-surface-border-dark px-3 py-3 flex items-end gap-2"
            >
                <textarea
                    ref={textareaRef}
                    rows={1}
                    required
                    maxLength={1500}
                    value={mensaje}
                    onChange={handleChange}
                    placeholder="Escribe una orientación..."
                    className="flex-1 resize-none rounded-xl border border-surface-border bg-black/[0.02] px-3 py-2 text-[12px] text-ink outline-none transition placeholder:text-ink-muted/40 focus:border-brand-green/40 focus:ring-1 focus:ring-brand-green/10 dark:border-surface-border-dark dark:bg-white/[0.03] dark:text-ink-dark dark:placeholder:text-ink-muted-dark/40 min-h-[38px] max-h-[120px]"
                    style={{ height: '38px' }}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(e as any); }
                    }}
                />
                <button
                    type="submit"
                    disabled={enviando || !mensaje.trim()}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-green text-white shadow-sm transition hover:bg-brand-green-dark disabled:opacity-50"
                >
                    {enviando
                        ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        : <Send size={14} strokeWidth={2} />
                    }
                </button>
            </form>

            {/* Error */}
            {error && (
                <div className="px-4 pb-3 text-[10.5px] text-category-fruits">{error}</div>
            )}
        </div>
    );
}

/* ── Botón flotante + panel ──────────────────────────────────── */
export default function RetroalimentacionPacientePanel({
    pacienteId,
    planId,
    historial,
}: {
    pacienteId: number;
    planId?: number | null;
    historial: RetroalimentacionHistorial[];
}) {
    const [abierto, setAbierto] = useState(false);
    const sinLeer = historial.filter(h => h.visible_para_paciente && !h.leido_por_paciente).length;

    return typeof document !== 'undefined' ? createPortal(
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-3">
            {/* Panel de chat */}
            <ChatPanel
                abierto={abierto}
                cerrar={() => setAbierto(false)}
                pacienteId={pacienteId}
                planId={planId}
                historial={historial}
            />

            {/* Botón flotante */}
            <button
                type="button"
                onClick={() => setAbierto(v => !v)}
                className={clsx(
                    'relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-200',
                    abierto
                        ? 'bg-brand-green-dark text-white scale-95'
                        : 'bg-brand-green text-white hover:bg-brand-green-dark hover:scale-105',
                )}
                title="Retroalimentación profesional"
            >
                {abierto
                    ? <X size={20} strokeWidth={2.5} />
                    : <MessageSquareText size={22} strokeWidth={2} />
                }
                {/* Badge de mensajes sin leer */}
                {!abierto && sinLeer > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-category-fruits text-[9px] font-black text-white shadow">
                        {sinLeer}
                    </span>
                )}
                {/* Pulso cuando hay sin leer */}
                {!abierto && sinLeer > 0 && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-brand-green/40" />
                )}
            </button>
        </div>,
        document.body,
    ) : null;
}
