import { Head, Link } from '@inertiajs/react';
import { Activity, Apple, BrainCircuit, CalendarCheck, CheckCircle2, ClipboardList, Clock, FileText, HeartPulse, Leaf, LineChart, Recycle, Salad, ShieldCheck, Sparkles, Star, Utensils } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface Props { canLogin: boolean; canRegister: boolean; laravelVersion: string; phpVersion: string }

export default function Welcome({ canLogin, canRegister }: Props) {
    return (
        <>
            <Head title="Nutrigo — Nutrición clínica inteligente" />
            <div className="min-h-screen bg-brand-cream antialiased">

                {/* ═══ NAVBAR ═══ */}
                <header className="sticky top-0 z-50 bg-brand-green-deep">
                    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green text-white">
                                <Leaf size={17} strokeWidth={2.2} />
                            </div>
                            <span className="text-[16px] font-bold text-white">Nutrigo</span>
                        </div>

                        <div className="hidden lg:flex items-center gap-6 text-[11.5px] font-semibold uppercase tracking-wide text-white/70">
                            <a href="#inicio" className="hover:text-white transition-colors">Inicio</a>
                            <a href="#proceso" className="hover:text-white transition-colors">Cómo funciona</a>
                            <a href="#planes" className="hover:text-white transition-colors">Perfiles</a>
                            <a href="#nosotros" className="hover:text-white transition-colors">Nosotros</a>
                            <a href="#diferencia" className="hover:text-white transition-colors">Beneficios</a>
                        </div>

                        <div className="flex items-center gap-2">
                            {canLogin && (
                                <Link href={route('login')} className="text-[11.5px] font-semibold uppercase tracking-wide text-white/80 hover:text-white transition-colors">
                                    Ingresar
                                </Link>
                            )}
                            {canRegister && (
                                <Link href={route('register')} className="rounded-md bg-brand-orange px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-white hover:brightness-105 transition-all">
                                    Empezar
                                </Link>
                            )}
                        </div>
                    </nav>
                </header>

                {/* ═══ HERO ═══ */}
                <section id="inicio" className="bg-brand-green-deep px-4 pb-6 pt-2">
                    <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl">
                        {/* Fondo tipo imagen (gradiente + patrón) */}
                        <div className="relative bg-gradient-to-br from-brand-green-dark via-brand-green-deep to-[#0d2e08] px-6 py-20 md:px-16 md:py-28">
                            <Leaf size={300} className="absolute -right-16 -top-10 text-white/[0.04] rotate-12" />
                            <Leaf size={220} className="absolute left-0 bottom-0 text-white/[0.04] -rotate-45" />
                            <Utensils size={160} className="absolute right-1/4 bottom-4 text-white/[0.03]" />

                            {/* Badge circular */}
                            <div className="absolute right-6 top-6 flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-brand-orange/60 bg-brand-green-deep/60 text-center backdrop-blur">
                                <span className="text-[8px] font-semibold uppercase text-white/70 leading-tight">Basado en</span>
                                <span className="text-[13px] font-extrabold text-brand-orange leading-tight">EVIDENCIA</span>
                                <span className="text-[8px] font-semibold uppercase text-white/70 leading-tight">clínica</span>
                            </div>

                            <div className="relative max-w-2xl">
                                <p className="font-serif italic text-[28px] md:text-[38px] text-brand-green-soft">Nutrición clínica</p>
                                <h1 className="mt-1 text-[52px] md:text-[80px] font-extrabold uppercase leading-[0.9] text-white tracking-tight">
                                    Personalizada
                                </h1>
                                <p className="mt-5 max-w-md text-[13.5px] leading-relaxed text-white/70">
                                    Planes alimentarios diseñados según tu perfil clínico y objetivos. Acompañamiento profesional para el síndrome de ovario poliquístico.
                                </p>
                                {canRegister && (
                                    <Link href={route('register')} className="mt-7 inline-flex items-center gap-2 rounded-lg bg-brand-orange px-7 py-3.5 text-[13px] font-bold uppercase tracking-wide text-white shadow-[0_10px_30px_rgba(255,140,0,0.3)] hover:brightness-105 transition-all">
                                        Crear mi plan
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ TRUE STORIES / RESULTADOS ═══ */}
                <TrueStories />

                {/* ═══ BARRA DE CONFIANZA ═══ */}
                <div className="bg-brand-green-deep py-4">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-2 px-6">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Respaldado por</span>
                        {['Endocrinología', 'Nutrición Clínica', 'Sistema Experto', 'Evidencia Científica'].map(x => (
                            <span key={x} className="text-[12px] font-bold uppercase tracking-wide text-white/60">{x}</span>
                        ))}
                    </div>
                </div>

                {/* ═══ CÓMO FUNCIONA ═══ */}
                <section id="proceso" className="bg-brand-green-mist px-6 py-16 md:py-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <h2 className="text-[34px] md:text-[50px] font-extrabold uppercase text-brand-green-dark leading-none">¿Cómo funciona?</h2>
                            <p className="font-serif italic text-[22px] md:text-[28px] text-brand-orange mt-1">Pasos simples</p>
                        </div>

                        <div className="mt-12 grid items-center gap-10 md:grid-cols-2">
                            <div className="space-y-4">
                                <PasoLinea numero="1" icon={<ClipboardList size={20} />} titulo="Cuéntanos tu perfil" descripcion="Tu profesional registra tu historia clínica, evaluación física y objetivos nutricionales." />
                                <PasoLinea numero="2" icon={<BrainCircuit size={20} />} titulo="Generamos tu plan" descripcion="Nuestro sistema experto crea un plan alimentario personalizado según tu condición." />
                                <PasoLinea numero="3" icon={<HeartPulse size={20} />} titulo="Seguimos tu progreso" descripcion="Registra tu día a día y recibe ajustes basados en tu evolución real." />
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="relative flex h-80 w-80 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-green/15 to-brand-green-soft/40">
                                    <div className="flex h-56 w-56 items-center justify-center rounded-3xl bg-white shadow-[0_20px_50px_rgba(30,138,16,0.15)]">
                                        <Salad size={90} strokeWidth={0.9} className="text-brand-green" />
                                    </div>
                                    <FloatingIcon icon={<Apple size={22} />} className="left-2 top-10 bg-category-fruits/15 text-category-fruits" />
                                    <FloatingIcon icon={<Utensils size={22} />} className="right-2 top-28 bg-brand-orange/15 text-brand-orange" />
                                    <FloatingIcon icon={<Activity size={22} />} className="bottom-10 left-8 bg-info/15 text-info" />
                                    <FloatingIcon icon={<HeartPulse size={22} />} className="bottom-6 right-10 bg-category-dairy/15 text-category-dairy" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ PLANES / PERFILES ═══ */}
                <section id="planes" className="relative overflow-hidden bg-brand-green-deep px-6 py-16 md:py-24">
                    <Leaf size={280} className="absolute -left-20 top-16 text-white/[0.03] rotate-45" />
                    <Leaf size={280} className="absolute -right-20 bottom-0 text-white/[0.03] -rotate-12" />
                    <div className="relative mx-auto max-w-7xl">
                        <div className="text-center">
                            <p className="font-serif italic text-[22px] md:text-[28px] text-brand-orange">Elige tu perfil</p>
                            <h2 className="text-[34px] md:text-[50px] font-extrabold uppercase text-white leading-none">Hecho para ti</h2>
                        </div>

                        <div className="mt-12 grid gap-5 md:grid-cols-3">
                            <PlanCard titulo="Endocrinólogo" subtitulo="Diagnóstico clínico" items={['Perfil clínico completo', 'Diagnóstico PMOS y RI', 'Ecografías y laboratorios', 'Sistema experto de apoyo']} destacado={false} />
                            <PlanCard titulo="Nutricionista" subtitulo="Planificación experta" items={['Planes alimentarios semanales', 'Recomendaciones expertas', 'Seguimiento del paciente', 'Analítica de evolución']} destacado etiqueta="Más completo" />
                            <PlanCard titulo="Paciente" subtitulo="Tu bienestar" items={['Plan alimentario diario', 'Registro de comidas', 'Lista de compras', 'Historial y progreso']} destacado={false} />
                        </div>
                    </div>
                </section>

                {/* ═══ NOSOTROS ═══ */}
                <section id="nosotros" className="bg-brand-cream px-6 py-16 md:py-20">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <p className="font-serif italic text-[20px] md:text-[26px] text-brand-orange">Sobre Nutrigo</p>
                            <h2 className="text-[30px] md:text-[42px] font-extrabold uppercase text-brand-green-dark leading-none">Quiénes somos</h2>
                        </div>
                        <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4 text-center">
                            <FeatureCircle icon={<ClipboardList size={26} />} titulo="Perfil clínico" descripcion="Historia completa del paciente en un solo lugar." color="green" />
                            <FeatureCircle icon={<Utensils size={26} />} titulo="Planes a medida" descripcion="Alimentación adaptada a tu metabolismo." color="orange" />
                            <FeatureCircle icon={<BrainCircuit size={26} />} titulo="Sistema experto" descripcion="Recomendaciones basadas en reglas clínicas." color="purple" />
                            <FeatureCircle icon={<HeartPulse size={26} />} titulo="Seguimiento" descripcion="Ajustes según tu evolución real." color="blue" />
                        </div>
                    </div>
                </section>

                {/* ═══ QUÉ NOS HACE DIFERENTES ═══ */}
                <section id="diferencia" className="bg-brand-green-mist px-6 py-16 md:py-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <h2 className="text-[30px] md:text-[46px] font-extrabold uppercase text-brand-green-dark leading-none">Qué nos hace</h2>
                            <p className="font-serif italic text-[24px] md:text-[32px] text-brand-orange mt-1">¡Diferentes!</p>
                        </div>

                        <div className="mt-12 grid items-center gap-8 lg:grid-cols-3">
                            {/* Columna izquierda */}
                            <div className="space-y-4">
                                <DiferenciaItem icon={<ShieldCheck size={20} />} titulo="Validación clínica" descripcion="Revisado por profesionales de la salud." />
                                <DiferenciaItem icon={<BrainCircuit size={20} />} titulo="Base científica" descripcion="Motor de reglas basado en evidencia." />
                                <DiferenciaItem icon={<FileText size={20} />} titulo="Reportes PDF" descripcion="Descarga tu plan y justificaciones." />
                            </div>
                            {/* Imagen central */}
                            <div className="flex justify-center">
                                <div className="flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-brand-green/20 to-brand-green-soft/50">
                                    <div className="flex h-40 w-40 items-center justify-center rounded-full bg-white shadow-[0_20px_50px_rgba(30,138,16,0.15)]">
                                        <Leaf size={64} strokeWidth={1} className="text-brand-green" />
                                    </div>
                                </div>
                            </div>
                            {/* Columna derecha */}
                            <div className="space-y-4">
                                <DiferenciaItem icon={<Recycle size={20} />} titulo="Lista de compras" descripcion="Generada automáticamente por semana." alineadoDerecha />
                                <DiferenciaItem icon={<Clock size={20} />} titulo="Ahorra tiempo" descripcion="Planificación en minutos, no horas." alineadoDerecha />
                                <DiferenciaItem icon={<LineChart size={20} />} titulo="Analítica" descripcion="Visualiza tu evolución completa." alineadoDerecha />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ CTA FINAL ═══ */}
                <section className="bg-brand-cream px-6 py-16 md:py-20">
                    <div className="mx-auto max-w-4xl">
                        <div className="relative overflow-hidden rounded-3xl bg-brand-green-deep px-8 py-14 text-center md:px-16">
                            <Leaf size={180} className="absolute -right-10 -top-10 text-white/[0.04] rotate-12" />
                            <div className="relative">
                                <h2 className="text-[26px] md:text-[38px] font-extrabold uppercase text-white leading-tight">Empieza hoy tu cambio</h2>
                                <p className="mx-auto mt-3 max-w-lg text-[14px] text-white/70">
                                    Únete a Nutrigo y accede a un acompañamiento nutricional profesional respaldado por tecnología.
                                </p>
                                {canRegister && (
                                    <Link href={route('register')} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-orange px-8 py-4 text-[14px] font-bold uppercase tracking-wide text-white shadow-[0_10px_30px_rgba(255,140,0,0.3)] hover:brightness-105 transition-all">
                                        Crear mi cuenta <Sparkles size={17} />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ FOOTER ═══ */}
                <footer className="bg-brand-green-deep px-6 py-8">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green text-white">
                                <Leaf size={16} />
                            </div>
                            <span className="text-[15px] font-bold text-white">Nutrigo</span>
                        </div>
                        <p className="text-[11px] text-white/50">Sistema clínico de nutrición · Síndrome de ovario poliquístico</p>
                        <p className="text-[11px] text-white/50">© {new Date().getFullYear()} Nutrigo</p>
                    </div>
                </footer>
            </div>
        </>
    );
}

/* ═══ True Stories con filtros ═══ */
function TrueStories() {
    const [filtro, setFiltro] = useState('Todos');
    const filtros = ['Todos', 'Pérdida de peso', 'Más energía', 'Masa muscular', 'Mejor enfoque'];
    const testimonios = [
        { nombre: 'Sofía', meta: 'Bajó 6 kg en 3 meses', texto: 'Los planes son increíbles y prácticos. Por fin logré mis objetivos sin sacrificar comidas.', etiqueta: 'Pérdida de peso', color: 'green' },
        { nombre: 'Lucía', meta: 'Ganó masa muscular', texto: 'El balance de proteínas es perfecto. Mi rendimiento en el gym nunca ha sido mejor.', etiqueta: 'Masa muscular', color: 'orange' },
        { nombre: 'Ana', meta: 'Más energía a diario', texto: 'Me siento más enfocada y con energía durante todo el día. Cambió mi rutina.', etiqueta: 'Más energía', color: 'purple' },
    ];
    const visibles = filtro === 'Todos' ? testimonios : testimonios.filter(t => t.etiqueta === filtro);

    return (
        <section className="bg-brand-cream px-6 py-16 md:py-20">
            <div className="mx-auto max-w-7xl text-center">
                <h2 className="text-[36px] md:text-[54px] font-extrabold uppercase text-brand-green-dark leading-none">Historias reales</h2>
                <p className="font-serif italic text-[24px] md:text-[32px] text-brand-orange mt-1">Resultados reales</p>

                {/* Filtros */}
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                    {filtros.map(f => (
                        <button key={f} type="button" onClick={() => setFiltro(f)}
                            className={clsx('rounded-full border px-4 py-1.5 text-[11px] font-semibold transition-all',
                                filtro === f ? 'border-brand-green bg-brand-green text-white' : 'border-brand-green/20 text-brand-green-dark hover:border-brand-green/40')}>
                            {f}
                        </button>
                    ))}
                </div>

                {/* Testimonios */}
                <div className="mt-10 grid gap-5 md:grid-cols-3">
                    {(visibles.length ? visibles : testimonios).map(t => (
                        <Testimonio key={t.nombre} {...t} />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══ Auxiliares ═══ */
function FloatingIcon({ icon, className }: { icon: React.ReactNode; className: string }) {
    return <div className={`absolute flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg ${className}`}>{icon}</div>;
}

const chipColors: Record<string, string> = {
    green: 'bg-brand-green/15 text-brand-green-dark',
    orange: 'bg-brand-orange/15 text-brand-orange',
    purple: 'bg-category-dairy/15 text-category-dairy',
    blue: 'bg-info/15 text-info',
};

function Testimonio({ nombre, meta, texto, etiqueta, color }: { nombre: string; meta: string; texto: string; etiqueta: string; color: string }) {
    return (
        <div className="rounded-2xl border border-surface-border bg-white p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full font-bold ${chipColors[color]}`}>{nombre.charAt(0)}</div>
                <div>
                    <p className="text-[14px] font-bold uppercase text-ink">{nombre}</p>
                    <p className="text-[10.5px] text-ink-muted">{meta}</p>
                </div>
            </div>
            <div className="mt-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} className="fill-brand-orange text-brand-orange" />)}
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-ink-muted italic">"{texto}"</p>
            <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-[10.5px] font-bold ${chipColors[color]}`}>{etiqueta}</span>
        </div>
    );
}

function PasoLinea({ numero, icon, titulo, descripcion }: { numero: string; icon: React.ReactNode; titulo: string; descripcion: string }) {
    return (
        <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-green text-white">{icon}</div>
            <div>
                <p className="text-[13.5px] font-bold text-ink"><span className="text-brand-green-dark">{numero}.</span> {titulo}</p>
                <p className="mt-0.5 text-[12px] text-ink-muted leading-relaxed">{descripcion}</p>
            </div>
        </div>
    );
}

function PlanCard({ titulo, subtitulo, items, destacado, etiqueta }: { titulo: string; subtitulo: string; items: string[]; destacado: boolean; etiqueta?: string }) {
    return (
        <div className={clsx('relative rounded-2xl p-6', destacado ? 'bg-brand-green scale-[1.03] shadow-[0_20px_50px_rgba(47,174,30,0.3)]' : 'bg-white/5 border border-white/10')}>
            {etiqueta && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-orange px-3 py-0.5 text-[9px] font-bold uppercase text-white">{etiqueta}</span>
            )}
            <h3 className="text-[18px] font-bold uppercase text-white">{titulo}</h3>
            <p className={clsx('text-[11.5px]', destacado ? 'text-white/80' : 'text-white/50')}>{subtitulo}</p>
            <ul className="mt-5 space-y-2.5">
                {items.map(item => (
                    <li key={item} className={clsx('flex items-center gap-2 text-[12.5px]', destacado ? 'text-white' : 'text-white/70')}>
                        <CheckCircle2 size={15} className={destacado ? 'text-white' : 'text-brand-green'} />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function FeatureCircle({ icon, titulo, descripcion, color }: { icon: React.ReactNode; titulo: string; descripcion: string; color: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full ${chipColors[color]}`}>{icon}</div>
            <h3 className="mt-4 text-[14px] font-bold text-ink">{titulo}</h3>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">{descripcion}</p>
        </div>
    );
}

function DiferenciaItem({ icon, titulo, descripcion, alineadoDerecha }: { icon: React.ReactNode; titulo: string; descripcion: string; alineadoDerecha?: boolean }) {
    return (
        <div className={clsx('flex items-start gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)]', alineadoDerecha && 'sm:flex-row-reverse sm:text-right')}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark">{icon}</div>
            <div>
                <p className="text-[13px] font-bold text-ink">{titulo}</p>
                <p className="mt-0.5 text-[11px] text-ink-muted leading-relaxed">{descripcion}</p>
            </div>
        </div>
    );
}
