import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Circle, ChevronDown, X } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    titulo: string;
    tiene: boolean;
    icono?: React.ReactNode;
    children: React.ReactNode;
    defaultAbierto?: boolean;
    /** Controlado: si se pasa, el estado abierto/cerrado lo maneja el padre */
    abierto?: boolean;
    onToggle?: () => void;
    /** Un clic abre una vista modal y doble clic despliega el contenido en la página. */
    modoModal?: boolean;
    /** Oculta temporalmente la vista rápida mientras otro modal está activo. */
    modalSuspendido?: boolean;
    /** Descripción mostrada en el encabezado de la vista rápida. */
    descripcionModal?: string;
    /** Texto personalizado cuando tiene=true. Por defecto: "Registrado" */
    textoTiene?: string;
    /** Texto personalizado cuando tiene=false. Por defecto: "Pendiente" */
    textoPendiente?: string;
}

export function Desplegable({ titulo, tiene, icono, children, defaultAbierto, abierto: abiertoProp, onToggle, modoModal = false, modalSuspendido = false, descripcionModal = 'Información registrada en el perfil clínico', textoTiene, textoPendiente }: Props) {
    const [abiertoInterno, setAbiertoInterno] = useState(defaultAbierto ?? tiene);
    const [modalAbierto, setModalAbierto] = useState(false);
    const temporizadorClick = useRef<ReturnType<typeof setTimeout> | null>(null);
    const controlado = abiertoProp !== undefined;
    const abierto = controlado ? abiertoProp : abiertoInterno;

    const handleToggle = () => {
        if (controlado) {
            onToggle?.();
        } else {
            setAbiertoInterno(!abiertoInterno);
        }
    };

    useEffect(() => () => {
        if (temporizadorClick.current) clearTimeout(temporizadorClick.current);
    }, []);

    useEffect(() => {
        if (!modalAbierto) return;
        const cerrarConEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setModalAbierto(false);
        };
        document.addEventListener('keydown', cerrarConEscape);
        return () => document.removeEventListener('keydown', cerrarConEscape);
    }, [modalAbierto]);

    // Al lanzar una acción secundaria, cierra la vista rápida. El resultado
    // actualizado se mostrará en el card inline que abre la pantalla padre.
    useEffect(() => {
        if (modalSuspendido) setModalAbierto(false);
    }, [modalSuspendido]);

    const handleClick = () => {
        if (!modoModal) {
            handleToggle();
            return;
        }

        if (temporizadorClick.current) clearTimeout(temporizadorClick.current);
        temporizadorClick.current = setTimeout(() => {
            setModalAbierto(true);
            temporizadorClick.current = null;
        }, 240);
    };

    const handleDoubleClick = () => {
        if (!modoModal) return;
        if (temporizadorClick.current) {
            clearTimeout(temporizadorClick.current);
            temporizadorClick.current = null;
        }
        setModalAbierto(false);
        handleToggle();
    };

    return (
        <div className={clsx('card-elevated overflow-hidden transition-shadow', abierto && 'shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]')}>
            <button
                type="button"
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.02]"
            >
                {/* Indicador */}
                {icono ?? (tiene ? (
                    <CheckCircle2 size={16} strokeWidth={1.8} className="shrink-0 text-brand-green-dark dark:text-brand-green" />
                ) : (
                    <Circle size={16} strokeWidth={1.8} className="shrink-0 text-ink-muted/40 dark:text-ink-muted-dark/40" />
                ))}

                {/* Título + estado */}
                <div className="flex-1">
                    <span className="text-[13px] font-semibold text-ink dark:text-ink-dark">{titulo}</span>
                    {tiene ? (
                        <span className="ml-2 text-[10.5px] font-medium text-brand-green-dark dark:text-brand-green">✓ {textoTiene ?? 'Registrado'}</span>
                    ) : (
                        <span className="ml-2 text-[10.5px] font-medium text-ink-muted/70 dark:text-ink-muted-dark/70">{textoPendiente ?? 'Pendiente'}</span>
                    )}
                    {modoModal && <span className="mt-0.5 block text-[9px] font-normal text-ink-muted/75 dark:text-ink-muted-dark/75">Un clic: vista rápida · Doble clic: desplegar</span>}
                </div>

                {/* Flecha */}
                <ChevronDown
                    size={15}
                    strokeWidth={1.8}
                    className={clsx('shrink-0 text-ink-muted transition-transform duration-200 dark:text-ink-muted-dark', abierto && 'rotate-180')}
                />
            </button>

            {/* Contenido */}
            <div className={clsx('transition-all duration-200 overflow-hidden', abierto ? 'max-h-[4000px] opacity-100' : 'max-h-0 opacity-0')}>
                <div className="border-t border-surface-border dark:border-surface-border-dark">
                    {children}
                </div>
            </div>

            {modoModal && modalAbierto && !modalSuspendido && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" onMouseDown={() => setModalAbierto(false)}>
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-label={titulo}
                        className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <header className="flex items-center justify-between gap-4 border-b border-surface-border px-5 py-4 dark:border-surface-border-dark">
                            <div>
                                <h2 className="text-base font-bold text-ink dark:text-ink-dark">{titulo}</h2>
                                <p className="mt-0.5 text-[10px] text-ink-muted dark:text-ink-muted-dark">{descripcionModal}</p>
                            </div>
                            <button type="button" aria-label="Cerrar" onClick={() => setModalAbierto(false)} className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-border text-ink-muted transition-colors hover:bg-black/5 dark:border-surface-border-dark dark:text-ink-muted-dark dark:hover:bg-white/5">
                                <X size={17} />
                            </button>
                        </header>
                        <div className="max-h-[calc(90vh-73px)] overflow-y-auto">{children}</div>
                    </section>
                </div>,
                document.body,
            )}
        </div>
    );
}
