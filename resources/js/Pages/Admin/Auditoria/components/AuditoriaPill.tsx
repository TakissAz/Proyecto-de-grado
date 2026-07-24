import clsx from 'clsx';
const tonos = {
    verde: 'bg-brand-green-soft text-brand-green-dark dark:bg-brand-green-dark/20 dark:text-brand-green',
    naranja: 'bg-brand-orange/10 text-[#B25F00] dark:bg-brand-orange/15 dark:text-brand-orange',
    azul: 'bg-category-others/10 text-category-others dark:bg-category-others/15 dark:text-[#83B9E2]',
    neutro: 'bg-black/[0.04] text-ink-muted dark:bg-white/[0.06] dark:text-ink-muted-dark',
};
export default function AuditoriaPill({ texto, tono = 'neutro' }: { texto?: string | null; tono?: keyof typeof tonos }) {
    const legible = texto ? texto.replaceAll('_', ' ') : 'Sin registro';
    return <span className={clsx('inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize', tonos[tono])}>{legible}</span>;
}
