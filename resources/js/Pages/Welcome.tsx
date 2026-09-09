import { Head, Link } from '@inertiajs/react';
import {
    Leaf, Menu, X, ArrowRight, Star, Phone, Clock, Mail, MapPin,
    Brain, Scale, Utensils, HeartPulse, ClipboardList,
    BrainCircuit, ShieldCheck, LineChart, CheckCircle2, Send,
    CalendarCheck, Share2, AtSign, MessageCircle,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import clsx from 'clsx';

interface Props { canLogin: boolean; canRegister: boolean; laravelVersion: string; phpVersion: string }

const NAV = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Nosotros', href: '#nosotros' },
    { label: 'Servicios', href: '#servicios' },
    { label: 'Perfiles', href: '#perfiles' },
    { label: 'Historias', href: '#historias' },
    { label: 'Contacto', href: '#contacto' },
];

export default function Welcome({ canLogin, canRegister }: Props) {
    const [menuAbierto, setMenuAbierto] = useState(false);

    // El landing siempre se muestra en tema claro (como la referencia),
    // sin importar la preferencia dark del panel. Restaura el estado al salir.
    useEffect(() => {
        const html = document.documentElement;
        const estabaDark = html.classList.contains('dark');
        html.classList.remove('dark');
        return () => {
            if (estabaDark) html.classList.add('dark');
        };
    }, []);

    return (
        <>
            <Head title="Almendra Nutrición — Nutrición clínica inteligente" />
            <div className="min-h-screen scroll-smooth bg-white font-sans antialiased">

                {/* ═══════════ NAVBAR ═══════════ */}
                <header className="sticky top-0 z-50 border-b border-surface-border/70 bg-brand-cream/95 backdrop-blur">
                    <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
                        <a href="#inicio" className="flex items-center gap-2">
                            <img src="/images/logo.png" alt="Nutrigo" className="h-9 w-auto" />
                        </a>

                        <div className="hidden items-center gap-7 lg:flex">
                            {NAV.map((n) => (
                                <a key={n.href} href={n.href} className="text-[13px] font-semibold text-ink/70 transition-colors hover:text-brand-green-dark">
                                    {n.label}
                                </a>
                            ))}
                        </div>

                        <div className="hidden items-center gap-2.5 lg:flex">
                            {canLogin && (
                                <Link href={route('login')} className="text-[13px] font-semibold text-ink/70 transition-colors hover:text-brand-green-dark">
                                    Ingresar
                                </Link>
                            )}
                            {canRegister && (
                                <Link href={route('register')} className="inline-flex items-center gap-1.5 rounded-full bg-brand-green px-5 py-2.5 text-[12.5px] font-bold text-white shadow-[0_8px_20px_rgba(47,174,30,0.3)] transition-all hover:bg-brand-green-dark">
                                    <CalendarCheck size={15} strokeWidth={2} /> Comenzar ahora
                                </Link>
                            )}
                        </div>

                        <button type="button" onClick={() => setMenuAbierto((v) => !v)} className="flex h-10 w-10 items-center justify-center rounded-lg text-brand-green-deep lg:hidden">
                            {menuAbierto ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </nav>

                    {/* Menú móvil */}
                    {menuAbierto && (
                        <div className="border-t border-surface-border/70 bg-brand-cream px-5 py-4 lg:hidden">
                            <div className="flex flex-col gap-1">
                                {NAV.map((n) => (
                                    <a key={n.href} href={n.href} onClick={() => setMenuAbierto(false)} className="rounded-lg px-3 py-2 text-[13.5px] font-semibold text-ink/75 hover:bg-brand-green-soft/40">
                                        {n.label}
                                    </a>
                                ))}
                                <div className="mt-2 flex gap-2">
                                    {canLogin && <Link href={route('login')} className="flex-1 rounded-full border border-brand-green/30 py-2.5 text-center text-[12.5px] font-bold text-brand-green-dark">Ingresar</Link>}
                                    {canRegister && <Link href={route('register')} className="flex-1 rounded-full bg-brand-green py-2.5 text-center text-[12.5px] font-bold text-white">Comenzar</Link>}
                                </div>
                            </div>
                        </div>
                    )}
                </header>

                {/* ═══════════ HERO ═══════════ */}
                <section id="inicio" className="relative overflow-hidden">
                    {/* "Foto" de comida simulada con gradiente cálido + patrón */}
                    <FoodBackdrop variante="hero" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />

                    <div className="relative mx-auto flex min-h-[560px] max-w-7xl flex-col justify-center px-5 py-24 lg:px-8">
                        <p className="mb-3 flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.2em] text-brand-green-soft">
                            <span className="h-px w-8 bg-brand-green" /> BIENVENIDA A ALMENDRA NUTRICIÓN
                        </p>
                        <h1 className="max-w-3xl text-[44px] font-extrabold leading-[1.05] text-white sm:text-[58px] lg:text-[68px]">
                            Nutrición clínica <span className="text-brand-green">personalizada</span> para tu bienestar
                        </h1>
                        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/80">
                            Profesionales certificados diseñan planes alimentarios según tu perfil clínico y objetivos. Acompañamiento experto para el síndrome de ovario poliquístico.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            {canRegister && (
                                <Link href={route('register')} className="inline-flex items-center gap-2 rounded-full bg-brand-green px-7 py-4 text-[14px] font-bold text-white shadow-[0_12px_30px_rgba(47,174,30,0.4)] transition-all hover:bg-brand-green-dark">
                                    Explorar planes <ArrowRight size={17} strokeWidth={2.2} />
                                </Link>
                            )}
                            <a href="#servicios" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-7 py-4 text-[14px] font-bold text-white backdrop-blur transition-all hover:bg-white/15">
                                Conocer más
                            </a>
                        </div>

                        {/* Chips de confianza */}
                        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
                            {['Basado en evidencia', 'Validación clínica', 'Sistema experto'].map((x) => (
                                <span key={x} className="flex items-center gap-1.5 text-[12px] font-semibold text-white/70">
                                    <CheckCircle2 size={15} className="text-brand-green" /> {x}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════ ABOUT US ═══════════ */}
                <section id="nosotros" className="bg-brand-cream px-5 py-20 lg:px-8 lg:py-28">
                    <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
                        {/* Imagen + badge */}
                        <div className="relative">
                            <div className="absolute -left-4 -top-4 hidden h-full w-full rounded-3xl bg-brand-green-deep/90 lg:block" />
                            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-[0_24px_60px_rgba(20,64,12,0.2)]">
                                <FoodBackdrop variante="about" />
                            </div>
                            <div className="absolute -bottom-5 left-6 rounded-2xl bg-brand-green px-6 py-4 text-center text-white shadow-[0_14px_30px_rgba(47,174,30,0.4)]">
                                <p className="text-[26px] font-extrabold leading-none">+5</p>
                                <p className="mt-1 text-[10.5px] font-semibold uppercase tracking-wide">años de bienestar</p>
                            </div>
                        </div>

                        {/* Texto */}
                        <div>
                            <p className="mb-2 flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.18em] text-brand-green-dark">
                                <span className="h-px w-8 bg-brand-green" /> Sobre nosotros
                            </p>
                            <h2 className="text-[34px] font-extrabold leading-tight text-ink sm:text-[42px]">
                                Te acompañamos hacia una <span className="text-brand-green-dark">vida saludable</span>
                            </h2>
                            <p className="mt-5 text-[14px] leading-relaxed text-ink-muted">
                                Almendra Nutrición ofrece guía nutricional basada en ciencia, planificación de comidas personalizada y apoyo integral diseñado para mejorar tu salud de forma natural y sostenible.
                            </p>
                            <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
                                Desde el diagnóstico endocrinológico hasta el seguimiento diario, reunimos profesionales expertos y un sistema de reglas clínicas para ayudarte a construir hábitos duraderos.
                            </p>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                {[
                                    { icon: <ShieldCheck size={17} />, t: 'Validación profesional' },
                                    { icon: <BrainCircuit size={17} />, t: 'Motor basado en evidencia' },
                                    { icon: <LineChart size={17} />, t: 'Seguimiento de tu evolución' },
                                    { icon: <ClipboardList size={17} />, t: 'Historia clínica completa' },
                                ].map((f) => (
                                    <div key={f.t} className="flex items-center gap-2.5">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-green/12 text-brand-green-dark">{f.icon}</span>
                                        <span className="text-[13px] font-semibold text-ink">{f.t}</span>
                                    </div>
                                ))}
                            </div>

                            {canRegister && (
                                <Link href={route('register')} className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-green px-7 py-3.5 text-[13.5px] font-bold text-white shadow-[0_10px_26px_rgba(47,174,30,0.32)] transition-all hover:bg-brand-green-dark">
                                    Explorar servicios <ArrowRight size={16} strokeWidth={2.2} />
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* ═══════════ SERVICES ═══════════ */}
                <section id="servicios" className="bg-white px-5 py-20 lg:px-8 lg:py-28">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.18em] text-brand-green-dark">Qué ofrecemos</p>
                            <h2 className="text-[34px] font-extrabold text-ink sm:text-[44px]">Nuestros servicios</h2>
                            <p className="mx-auto mt-3 max-w-xl text-[14px] text-ink-muted">Todo lo que necesitas para transformar tu salud, en un solo lugar.</p>
                        </div>

                        <div className="mt-14 grid gap-8 md:grid-cols-3">
                            <ServiceCard
                                icon={<Brain size={22} />}
                                tono="verde"
                                titulo="Salud metabólica"
                                descripcion="Diagnóstico de PMOS y resistencia a la insulina con apoyo del sistema experto clínico."
                                imagen="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80"
                            />
                            <ServiceCard
                                icon={<Utensils size={22} />}
                                tono="naranja"
                                titulo="Planes de comida"
                                descripcion="Planes alimentarios semanales adaptados a tu metabolismo, gustos y restricciones."
                                imagen="https://images.unsplash.com/photo-1512852939750-1305098529bf?auto=format&fit=crop&w=400&q=80"
                            />
                            <ServiceCard
                                icon={<Scale size={22} />}
                                tono="azul"
                                titulo="Control de peso"
                                descripcion="Estrategias seguras y efectivas para alcanzar tus objetivos manteniendo tu energía."
                                imagen="https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=400&q=80"
                            />
                        </div>
                    </div>
                </section>

                {/* ═══════════ PERFILES / PLANES ═══════════ */}
                <section id="perfiles" className="relative overflow-hidden bg-brand-green-deep px-5 py-20 lg:px-8 lg:py-28">
                    <Leaf size={320} className="absolute -left-24 top-10 rotate-45 text-white/[0.035]" />
                    <Leaf size={320} className="absolute -right-24 bottom-0 -rotate-12 text-white/[0.035]" />
                    <div className="relative mx-auto max-w-7xl">
                        <div className="text-center">
                            <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.18em] text-brand-green-soft">Elige tu perfil</p>
                            <h2 className="text-[34px] font-extrabold text-white sm:text-[44px]">Hecho para cada rol</h2>
                        </div>

                        <div className="mt-14 grid gap-6 md:grid-cols-3">
                            <PlanCard titulo="Endocrinólogo" subtitulo="Diagnóstico clínico" items={['Perfil clínico completo', 'Diagnóstico PMOS y RI', 'Ecografías y laboratorios', 'Sistema experto de apoyo']} />
                            <PlanCard titulo="Nutricionista" subtitulo="Planificación experta" items={['Planes alimentarios semanales', 'Recomendaciones expertas', 'Seguimiento del paciente', 'Analítica de evolución']} destacado etiqueta="Más completo" />
                            <PlanCard titulo="Paciente" subtitulo="Tu bienestar" items={['Plan alimentario diario', 'Registro de comidas', 'Lista de compras', 'Historial y progreso']} />
                        </div>
                    </div>
                </section>

                {/* ═══════════ HISTORIAS ═══════════ */}
                <TrueStories />

                {/* ═══════════ CONTACTO ═══════════ */}
                <section id="contacto" className="relative overflow-hidden px-5 py-20 lg:px-8 lg:py-24">
                    <FoodBackdrop variante="contact" />
                    <div className="absolute inset-0 bg-brand-green-deep/90" />
                    <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
                        {/* Formulario */}
                        <div>
                            <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.18em] text-brand-green-soft">Nos encantará escucharte</p>
                            <h2 className="text-[32px] font-extrabold leading-tight text-white sm:text-[40px]">Envíanos un mensaje</h2>
                            <form className="mt-7 space-y-3.5" onSubmit={(e) => e.preventDefault()}>
                                <ContactInput icon={<CheckCircle2 size={15} />} placeholder="Nombre completo" />
                                <ContactInput icon={<Mail size={15} />} placeholder="Correo electrónico" type="email" />
                                <ContactInput icon={<Phone size={15} />} placeholder="Teléfono" />
                                <div className="flex items-start gap-2 rounded-xl border border-white/25 bg-white/5 px-3.5 py-3 backdrop-blur focus-within:border-brand-green">
                                    <Send size={15} className="mt-1 text-white/50" />
                                    <textarea rows={3} placeholder="Tu mensaje" className="w-full resize-none bg-transparent text-[13px] text-white placeholder:text-white/50 outline-none" />
                                </div>
                                <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-brand-green px-7 py-3.5 text-[13.5px] font-bold text-white shadow-[0_10px_26px_rgba(47,174,30,0.4)] transition-all hover:bg-brand-green-dark">
                                    Enviar mensaje <Send size={15} strokeWidth={2} />
                                </button>
                            </form>
                        </div>

                        {/* Info */}
                        <div className="lg:pl-8">
                            <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.18em] text-brand-green-soft">Cómo contactarnos</p>
                            <h2 className="text-[32px] font-extrabold leading-tight text-white sm:text-[40px]">Información de contacto</h2>
                            <div className="mt-7 space-y-5">
                                <ContactInfo icon={<Phone size={17} />} titulo="Llámanos" lineas={['+591 700-00000', '+591 700-11111']} />
                                <ContactInfo icon={<Clock size={17} />} titulo="Horario de atención" lineas={['Lun – Sáb: 09:00 – 19:00', 'Domingo: cerrado']} />
                                <ContactInfo icon={<Mail size={17} />} titulo="Escríbenos" lineas={['soporte@almendra.test', 'info@almendra.test']} />
                                <ContactInfo icon={<MapPin size={17} />} titulo="Ubicación" lineas={['Centro Almendra Nutrición', 'Av. Bienestar, Bolivia']} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════ FOOTER ═══════════ */}
                <footer className="bg-brand-green-deep px-5 py-14 lg:px-8">
                    <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <img src="/images/logo.png" alt="Nutrigo" className="h-9 w-auto brightness-0 invert" />
                            <p className="mt-4 text-[12.5px] leading-relaxed text-white/60">
                                Impulsamos a las personas a alcanzar una nutrición óptima con guía experta y planes alimentarios personalizados.
                            </p>
                            <div className="mt-5 flex gap-2">
                                {[<Share2 size={15} key="f" />, <AtSign size={15} key="i" />, <MessageCircle size={15} key="t" />].map((ic, i) => (
                                    <span key={i} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand-green">{ic}</span>
                                ))}
                            </div>
                        </div>

                        <FooterCol titulo="Enlaces" items={[['Nosotros', '#nosotros'], ['Servicios', '#servicios'], ['Perfiles', '#perfiles'], ['Historias', '#historias'], ['Contacto', '#contacto']]} />

                        <div>
                            <FooterHeading>Horario</FooterHeading>
                            <p className="mt-4 text-[12.5px] text-white/60">Lun – Sáb</p>
                            <p className="text-[13px] font-semibold text-brand-green-soft">09:00 – 19:00</p>
                            <p className="mt-3 text-[12.5px] text-white/60">Domingo</p>
                            <p className="text-[13px] font-semibold text-white/80">Cerrado</p>
                        </div>

                        <div>
                            <FooterHeading>Contacto</FooterHeading>
                            <ul className="mt-4 space-y-2.5 text-[12.5px] text-white/70">
                                <li className="flex items-center gap-2"><MapPin size={14} className="text-brand-green" /> Av. Bienestar, Bolivia</li>
                                <li className="flex items-center gap-2"><Phone size={14} className="text-brand-green" /> +591 700-00000</li>
                                <li className="flex items-center gap-2"><Mail size={14} className="text-brand-green" /> info@almendra.test</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-6 text-center">
                        <p className="text-[11.5px] text-white/50">© {new Date().getFullYear()} Almendra Nutrición · Sistema clínico de nutrición para el síndrome de ovario poliquístico</p>
                    </div>
                </footer>
            </div>
        </>
    );
}

/* ═══════════ Fotos reales de comida (Unsplash, estilo referencia) ═══════════ */
const FOOD_IMG = {
    // Ensalada / bowl saludable sobre madera oscura (hero)
    hero: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1600&q=80',
    // Bowl de frutas variadas (about)
    about: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
    // Verduras frescas sobre fondo oscuro (contacto)
    contact: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1600&q=80',
} as const;

function FoodBackdrop({ variante }: { variante: 'hero' | 'about' | 'contact' }) {
    return (
        <img
            src={FOOD_IMG[variante]}
            alt=""
            aria-hidden
            loading={variante === 'hero' ? 'eager' : 'lazy'}
            className="absolute inset-0 h-full w-full object-cover"
        />
    );
}

/* ═══════════ Service Card (foto circular + icono flotante, estilo referencia) ═══════════ */
function ServiceCard({ icon, titulo, descripcion, tono, imagen }: { icon: ReactNode; titulo: string; descripcion: string; tono: 'verde' | 'naranja' | 'azul'; imagen: string }) {
    const badge: Record<string, string> = {
        verde: 'bg-brand-green',
        naranja: 'bg-brand-orange',
        azul: 'bg-category-others',
    };
    return (
        <div className="group relative rounded-3xl border border-surface-border bg-brand-cream/50 p-6 pt-16 text-center shadow-[0_6px_24px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.1)]">
            {/* Foto circular real */}
            <div className="relative mx-auto -mt-24 h-32 w-32 overflow-hidden rounded-full ring-8 ring-white shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
                <img src={imagen} alt={titulo} loading="lazy" className="h-full w-full object-cover" />
                {/* Icono flotante */}
                <span className={clsx('absolute -bottom-1 left-1/2 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-white', badge[tono])}>
                    {icon}
                </span>
            </div>
            <h3 className="mt-6 text-[19px] font-extrabold text-ink">{titulo}</h3>
            <p className="mt-2.5 text-[13px] leading-relaxed text-ink-muted">{descripcion}</p>
            <div className="mx-auto mt-5 h-1 w-10 rounded-full bg-brand-green/30 transition-all group-hover:w-16 group-hover:bg-brand-green" />
        </div>
    );
}

/* ═══════════ Plan Card ═══════════ */
function PlanCard({ titulo, subtitulo, items, destacado, etiqueta }: { titulo: string; subtitulo: string; items: string[]; destacado?: boolean; etiqueta?: string }) {
    return (
        <div className={clsx('relative rounded-3xl p-7 transition-all', destacado ? 'bg-brand-green shadow-[0_24px_50px_rgba(47,174,30,0.35)] lg:-translate-y-3' : 'border border-white/10 bg-white/[0.04] hover:bg-white/[0.07]')}>
            {etiqueta && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-orange px-4 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg">{etiqueta}</span>
            )}
            <h3 className="text-[20px] font-extrabold text-white">{titulo}</h3>
            <p className={clsx('text-[12px] font-medium', destacado ? 'text-white/85' : 'text-white/50')}>{subtitulo}</p>
            <ul className="mt-6 space-y-3">
                {items.map((item) => (
                    <li key={item} className={clsx('flex items-center gap-2.5 text-[13px]', destacado ? 'text-white' : 'text-white/75')}>
                        <CheckCircle2 size={16} className={destacado ? 'text-white' : 'text-brand-green'} /> {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* ═══════════ Historias reales con filtros ═══════════ */
function TrueStories() {
    const [filtro, setFiltro] = useState('Todos');
    const filtros = ['Todos', 'Pérdida de peso', 'Más energía', 'Mejor enfoque'];
    const testimonios = [
        { nombre: 'Sofía', meta: 'Bajó 6 kg en 3 meses', texto: 'Los planes son prácticos y sostenibles. Por fin logré mis objetivos sin sacrificar mis comidas favoritas.', etiqueta: 'Pérdida de peso', color: 'green' },
        { nombre: 'Lucía', meta: 'Ciclos más regulares', texto: 'El acompañamiento clínico marcó la diferencia. Mi cuerpo respondió y me siento en control.', etiqueta: 'Mejor enfoque', color: 'orange' },
        { nombre: 'Ana', meta: 'Más energía a diario', texto: 'Me siento enfocada y con energía todo el día. La lista de compras me ahorra muchísimo tiempo.', etiqueta: 'Más energía', color: 'purple' },
    ];
    const visibles = filtro === 'Todos' ? testimonios : testimonios.filter((t) => t.etiqueta === filtro);

    return (
        <section id="historias" className="bg-brand-cream px-5 py-20 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-7xl text-center">
                <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.18em] text-brand-green-dark">Historias de clientes</p>
                <h2 className="text-[34px] font-extrabold text-ink sm:text-[44px]">Resultados reales</h2>

                <div className="mt-8 flex flex-wrap justify-center gap-2">
                    {filtros.map((f) => (
                        <button key={f} type="button" onClick={() => setFiltro(f)}
                            className={clsx('rounded-full border px-4 py-2 text-[12px] font-semibold transition-all',
                                filtro === f ? 'border-brand-green bg-brand-green text-white' : 'border-brand-green/25 text-brand-green-dark hover:border-brand-green/50')}>
                            {f}
                        </button>
                    ))}
                </div>

                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {(visibles.length ? visibles : testimonios).map((t) => <Testimonio key={t.nombre} {...t} />)}
                </div>
            </div>
        </section>
    );
}

const chipColors: Record<string, string> = {
    green: 'bg-brand-green/15 text-brand-green-dark',
    orange: 'bg-brand-orange/15 text-brand-orange',
    purple: 'bg-category-dairy/15 text-category-dairy',
    blue: 'bg-category-others/15 text-category-others',
};

function Testimonio({ nombre, meta, texto, etiqueta, color }: { nombre: string; meta: string; texto: string; etiqueta: string; color: string }) {
    return (
        <div className="rounded-3xl border border-surface-border bg-white p-7 text-left shadow-[0_6px_24px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.09)]">
            <div className="flex items-center gap-3">
                <div className={clsx('flex h-12 w-12 items-center justify-center rounded-full text-[16px] font-extrabold', chipColors[color])}>{nombre.charAt(0)}</div>
                <div>
                    <p className="text-[15px] font-bold text-ink">{nombre}</p>
                    <p className="text-[11px] text-ink-muted">{meta}</p>
                </div>
            </div>
            <div className="mt-3.5 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className="fill-brand-orange text-brand-orange" />)}
            </div>
            <p className="mt-3 text-[13px] italic leading-relaxed text-ink-muted">"{texto}"</p>
            <span className={clsx('mt-4 inline-flex rounded-full px-3 py-1 text-[10.5px] font-bold', chipColors[color])}>{etiqueta}</span>
        </div>
    );
}

/* ═══════════ Contacto ═══════════ */
function ContactInput({ icon, placeholder, type = 'text' }: { icon: ReactNode; placeholder: string; type?: string }) {
    return (
        <div className="flex items-center gap-2.5 rounded-xl border border-white/25 bg-white/5 px-3.5 py-3 backdrop-blur transition-colors focus-within:border-brand-green">
            <span className="text-white/50">{icon}</span>
            <input type={type} placeholder={placeholder} className="w-full bg-transparent text-[13px] text-white placeholder:text-white/50 outline-none" />
        </div>
    );
}

function ContactInfo({ icon, titulo, lineas }: { icon: ReactNode; titulo: string; lineas: string[] }) {
    return (
        <div className="flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green text-white shadow-[0_8px_18px_rgba(47,174,30,0.3)]">{icon}</span>
            <div>
                <p className="text-[14px] font-bold text-white">{titulo}</p>
                {lineas.map((l) => <p key={l} className="text-[12.5px] text-white/70">{l}</p>)}
            </div>
        </div>
    );
}

/* ═══════════ Footer helpers ═══════════ */
function FooterHeading({ children }: { children: ReactNode }) {
    return (
        <h4 className="relative inline-block pb-2 text-[15px] font-bold text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-8 after:rounded-full after:bg-brand-green">
            {children}
        </h4>
    );
}

function FooterCol({ titulo, items }: { titulo: string; items: [string, string][] }) {
    return (
        <div>
            <FooterHeading>{titulo}</FooterHeading>
            <ul className="mt-4 space-y-2.5">
                {items.map(([label, href]) => (
                    <li key={href}>
                        <a href={href} className="flex items-center gap-2 text-[12.5px] text-white/70 transition-colors hover:text-brand-green-soft">
                            <Leaf size={12} className="text-brand-green" /> {label}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
