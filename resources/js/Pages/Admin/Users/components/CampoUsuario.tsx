interface CampoUsuarioProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: 'text' | 'email' | 'password';
    required?: boolean;
    hint?: string;
    autoComplete?: string;
}

export default function CampoUsuario({ label, value, onChange, error, type = 'text', required, hint, autoComplete }: CampoUsuarioProps) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-ink-muted dark:text-ink-muted-dark">{label}{required ? ' *' : ''}</span>
            <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} autoComplete={autoComplete}
                className="w-full rounded-lg border border-surface-border bg-[#FAF9F6] px-3 py-2 text-[12.5px] text-ink outline-none transition-colors placeholder:text-ink-muted/50 focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark dark:placeholder:text-ink-muted-dark/50" />
            {error ? <span className="mt-1 block text-[10.5px] text-category-fruits dark:text-[#FF7468]">{error}</span> : hint ? <span className="mt-1 block text-[10.5px] text-ink-muted/70 dark:text-ink-muted-dark/70">{hint}</span> : null}
        </label>
    );
}
