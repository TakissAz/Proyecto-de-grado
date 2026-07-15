import type { InputHTMLAttributes, PropsWithChildren, SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

const inputBase =
  'w-full rounded-lg border bg-[#FAF9F6] px-3 py-2 text-[12.5px] text-ink outline-none transition-colors ' +
  'focus:border-brand-green/50 dark:bg-[#20232B] dark:text-ink-dark ' +
  'border-surface-border dark:border-surface-border-dark';

interface CampoWrapperProps {
  label: string;
  error?: string;
  className?: string;
}

function CampoWrapper({ label, error, className, children }: PropsWithChildren<CampoWrapperProps>) {
  return (
    <label className={clsx('block', className)}>
      <span className="mb-1.5 block text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-[11px] text-category-fruits">{error}</span>}
    </label>
  );
}

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  wrapperClassName?: string;
}

export function Campo({ label, error, wrapperClassName, className, ...rest }: CampoProps) {
  return (
    <CampoWrapper label={label} error={error} className={wrapperClassName}>
      <input className={clsx(inputBase, error && 'border-category-fruits', className)} {...rest} />
    </CampoWrapper>
  );
}

interface CampoSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  wrapperClassName?: string;
}

export function CampoSelect({
  label,
  error,
  wrapperClassName,
  className,
  children,
  ...rest
}: PropsWithChildren<CampoSelectProps>) {
  return (
    <CampoWrapper label={label} error={error} className={wrapperClassName}>
      <select className={clsx(inputBase, error && 'border-category-fruits', className)} {...rest}>
        {children}
      </select>
    </CampoWrapper>
  );
}
