import { AlertTriangle, Check, ChevronLeft, ChevronRight, Clipboard, Download, ShoppingBasket } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface ItemCompra { nombre: string; cantidad: number; unidad: string; usado_en: string[] }
interface CategoriaCompra { nombre: string; items: ItemCompra[] }
interface IndicacionManual { nombre: string; cantidad: number; unidad: string | null; observaciones: string | null; usado_en: string[] }
export interface ListaCompras { resumen: { total_items: number; total_categorias: number; tiene_indicaciones_manuales: boolean }; categorias: CategoriaCompra[]; indicaciones_manuales: IndicacionManual[] }

const numero = (valor: number) => new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 }).format(valor);
const COLORES = ['bg-brand-green', 'bg-brand-orange', 'bg-category-dairy', 'bg-category-fruits', 'bg-info', 'bg-category-others', 'bg-purple-500'];
const COLORES_TEXT = ['text-brand-green-dark dark:text-brand-green', 'text-brand-orange', 'text-category-dairy', 'text-category-fruits', 'text-info', 'text-category-others', 'text-purple-500'];

export default function ListaComprasPacienteCard({ lista }: { lista: ListaCompras | null }) {
    const [paginaActual, setPaginaActual] = useState(0);
    const [copiado, setCopiado] = useState(false);
    const [marcados, setMarcados] = useState<Set<string>>(new Set());

    if (!lista || lista.categorias.length === 0) return null;

    const totalPaginas = lista.categorias.length;
    const categoria = lista.categorias[paginaActual];
    const texto = lista.categorias.map(c => `${c.nombre}\n${c.items.map(i => `- ${i.nombre}: ${numero(i.cantidad)} ${i.unidad}`).join('\n')}`).join('\n\n');
    const copiar = async () => { await navigator.clipboard.writeText(texto); setCopiado(true); window.setTimeout(() => setCopiado(false), 1800); };
    const toggleItem = (key: string) => setMarcados(prev => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });
    const totalMarcados = marcados.size;
    const pct = lista.resumen.total_items ? Math.round((totalMarcados / lista.resumen.total_items) * 100) : 0;

    return (
        <div className="space-y-4">
            {/* Cuaderno abierto — layout 2 columnas */}
            <div className="relative">
                {/* Hojas apiladas detrás */}
                <div className="absolute inset-x-3 top-3 bottom-0 rounded-3xl bg-[#F0EBE1] dark:bg-[#252830]" />
                <div className="absolute inset-x-1.5 top-1.5 bottom-0 rounded-3xl bg-[#F5F0E6] dark:bg-[#222530]" />

                {/* Cuaderno principal */}
                <div className="relative rounded-3xl bg-[#FEFCF8] dark:bg-[#1C1F26] border border-[#E0D9CC] dark:border-[#333740] shadow-[0_12px_48px_rgba(0,0,0,0.1)] dark:shadow-[0_12px_48px_rgba(0,0,0,0.4)] overflow-hidden">

                    {/* Espiral superior */}
                    <div className="flex justify-center gap-5 py-3 bg-[#F5F0E6] dark:bg-[#252830] border-b border-[#E0D9CC] dark:border-[#333740]">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="h-4 w-4 rounded-full border-[2.5px] border-[#B8AD96] dark:border-[#4A4D55] bg-[#FEFCF8] dark:bg-[#1C1F26]" />
                        ))}
                    </div>

                    {/* Encabezado */}
                    <div className="px-8 pt-6 pb-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange/15 text-brand-orange">
                                <ShoppingBasket size={24} strokeWidth={1.8} />
                            </div>
                            <div>
                                <h2 className="text-[22px] font-bold text-[#3D3529] dark:text-ink-dark" style={{ fontFamily: "'Georgia', serif" }}>Mi Lista de Compras</h2>
                                <p className="text-[12px] text-[#8B7D6B] dark:text-ink-muted-dark">{lista.resumen.total_items} productos en {lista.resumen.total_categorias} categorías · Semana actual</p>
                            </div>
                        </div>
                        <div className="flex gap-2 print:hidden">
                            <button type="button" onClick={copiar}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E0D9CC] dark:border-[#333740] px-4 py-2.5 text-[11px] font-semibold text-[#8B7D6B] dark:text-ink-muted-dark hover:bg-[#F5F0E6] dark:hover:bg-[#252830] transition-colors">
                                <Clipboard size={13} /> {copiado ? '✓ Copiada' : 'Copiar todo'}
                            </button>
                            <button type="button" onClick={() => window.print()}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E0D9CC] dark:border-[#333740] px-4 py-2.5 text-[11px] font-semibold text-[#8B7D6B] dark:text-ink-muted-dark hover:bg-[#F5F0E6] dark:hover:bg-[#252830] transition-colors">
                                <Download size={13} /> Descargar PDF
                            </button>
                        </div>
                    </div>

                    {/* Progreso general */}
                    <div className="px-8 pb-5">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-3 rounded-full bg-[#EDE8DF] dark:bg-[#2A2D35] overflow-hidden">
                                <div className="h-full rounded-full bg-brand-green transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-bold text-[#3D3529] dark:text-ink-dark">{totalMarcados}/{lista.resumen.total_items}</span>
                                {pct === 100 && <span className="text-[12px]">🎉</span>}
                            </div>
                        </div>
                    </div>

                    {/* Cuerpo: sidebar categorías + hoja de items */}
                    <div className="flex border-t border-[#E0D9CC] dark:border-[#333740]">
                        {/* Sidebar de categorías (índice del cuaderno) */}
                        <div className="w-48 shrink-0 border-r border-[#E0D9CC] dark:border-[#333740] bg-[#F9F5ED] dark:bg-[#212428] py-3 hidden md:block">
                            {lista.categorias.map((c, i) => {
                                const itemsMarcados = c.items.filter((_, j) => marcados.has(`${c.nombre}-${j}`)).length;
                                const activa = i === paginaActual;
                                return (
                                    <button key={c.nombre} type="button" onClick={() => setPaginaActual(i)}
                                        className={clsx('w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all', activa ? 'bg-[#FEFCF8] dark:bg-[#1C1F26] shadow-sm' : 'hover:bg-[#F5F0E6] dark:hover:bg-[#252830]')}>
                                        <div className={clsx('h-3 w-3 rounded-full shrink-0', COLORES[i % COLORES.length])} />
                                        <div className="flex-1 min-w-0">
                                            <p className={clsx('text-[11.5px] font-semibold truncate', activa ? 'text-[#3D3529] dark:text-ink-dark' : 'text-[#8B7D6B] dark:text-ink-muted-dark')}>{c.nombre}</p>
                                            <p className="text-[9px] text-[#8B7D6B]/60 dark:text-ink-muted-dark/60">{itemsMarcados}/{c.items.length}</p>
                                        </div>
                                        {itemsMarcados === c.items.length && c.items.length > 0 && <Check size={12} className="text-brand-green shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Hoja principal — items */}
                        <div className="flex-1 relative min-h-[420px]" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 39px, rgba(0,0,0,0.04) 39px, rgba(0,0,0,0.04) 40px)', backgroundSize: '100% 40px', backgroundPosition: '0 16px' }}>
                            {/* Margen rojo */}
                            <div className="absolute left-14 top-0 bottom-0 w-[1px] bg-red-400/20 dark:bg-red-400/10" />

                            {/* Título de categoría */}
                            <div className="px-8 pt-5 pb-2 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={clsx('h-4 w-4 rounded-full', COLORES[paginaActual % COLORES.length])} />
                                    <h3 className={clsx('text-[16px] font-bold', COLORES_TEXT[paginaActual % COLORES_TEXT.length])}>{categoria.nombre}</h3>
                                    <span className="text-[11px] text-[#8B7D6B]/60 dark:text-ink-muted-dark/60">({categoria.items.length} items)</span>
                                </div>
                                {/* Navegación móvil */}
                                <div className="flex items-center gap-1 md:hidden">
                                    <button type="button" disabled={paginaActual === 0} onClick={() => setPaginaActual(paginaActual - 1)} className="p-1.5 rounded-lg text-[#8B7D6B] hover:bg-black/[0.04] disabled:opacity-30"><ChevronLeft size={16} /></button>
                                    <span className="text-[10px] text-[#8B7D6B] dark:text-ink-muted-dark px-1">{paginaActual + 1}/{totalPaginas}</span>
                                    <button type="button" disabled={paginaActual === totalPaginas - 1} onClick={() => setPaginaActual(paginaActual + 1)} className="p-1.5 rounded-lg text-[#8B7D6B] hover:bg-black/[0.04] disabled:opacity-30"><ChevronRight size={16} /></button>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="px-8 pb-6">
                                {categoria.items.map((item, i) => {
                                    const key = `${categoria.nombre}-${i}`;
                                    const marcado = marcados.has(key);
                                    return (
                                        <div key={key} onClick={() => toggleItem(key)}
                                            className={clsx('flex items-center gap-4 h-[40px] px-3 -mx-3 rounded-xl cursor-pointer transition-all group', marcado ? 'opacity-50' : 'hover:bg-brand-green/[0.04] dark:hover:bg-brand-green/[0.06]')}>
                                            {/* Checkbox */}
                                            <div className={clsx('flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-md border-2 transition-all', marcado ? 'border-brand-green bg-brand-green' : 'border-[#C4B898] dark:border-[#4A4D55] group-hover:border-brand-green/60')}>
                                                {marcado && <Check size={12} strokeWidth={3} className="text-white" />}
                                            </div>
                                            {/* Producto */}
                                            <span className={clsx('flex-1 text-[14px]', marcado ? 'line-through text-[#8B7D6B]/50 dark:text-ink-muted-dark/50' : 'text-[#3D3529] dark:text-ink-dark font-medium')}>{item.nombre}</span>
                                            {/* Cantidad */}
                                            <span className={clsx('text-[12px] font-semibold tabular-nums px-3 py-1 rounded-lg shrink-0', marcado ? 'text-[#8B7D6B]/30 dark:text-ink-muted-dark/30' : 'bg-[#F5F0E6] dark:bg-[#252830] text-[#3D3529] dark:text-ink-dark')}>{numero(item.cantidad)} {item.unidad}</span>
                                            {/* Para qué comida */}
                                            {item.usado_en.length > 0 && !marcado && (
                                                <span className="text-[9px] text-[#8B7D6B]/50 dark:text-ink-muted-dark/50 max-w-[100px] truncate hidden lg:block">{item.usado_en[0]}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Footer: navegación de hojas (desktop) */}
                    <div className="hidden md:flex items-center justify-between px-8 py-3 bg-[#F9F5ED] dark:bg-[#212428] border-t border-[#E0D9CC] dark:border-[#333740]">
                        <button type="button" disabled={paginaActual === 0} onClick={() => setPaginaActual(paginaActual - 1)}
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8B7D6B] dark:text-ink-muted-dark disabled:opacity-30 hover:text-[#3D3529] dark:hover:text-ink-dark transition-colors">
                            <ChevronLeft size={14} /> Hoja anterior
                        </button>
                        <p className="text-[10px] text-[#8B7D6B]/60 dark:text-ink-muted-dark/60 italic">Compra fresco, come mejor 🌱</p>
                        <button type="button" disabled={paginaActual === totalPaginas - 1} onClick={() => setPaginaActual(paginaActual + 1)}
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8B7D6B] dark:text-ink-muted-dark disabled:opacity-30 hover:text-[#3D3529] dark:hover:text-ink-dark transition-colors">
                            Siguiente hoja <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Indicaciones manuales */}
            {lista.indicaciones_manuales.length > 0 && (
                <div className="rounded-xl border border-brand-orange/20 bg-brand-orange/[0.03] p-5 dark:bg-brand-orange/[0.05]">
                    <div className="flex items-start gap-2.5">
                        <AlertTriangle size={15} className="text-brand-orange shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[12px] font-bold text-ink dark:text-ink-dark">Notas adicionales</p>
                            <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark mt-0.5">Componentes que requieren revisión manual.</p>
                            <ul className="mt-2 space-y-1.5">
                                {lista.indicaciones_manuales.map((item, i) => (
                                    <li key={i} className="text-[11.5px] text-ink dark:text-ink-dark">
                                        • <span className="font-semibold">{item.nombre}</span>
                                        {item.observaciones && <span className="text-ink-muted dark:text-ink-muted-dark"> — {item.observaciones}</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
