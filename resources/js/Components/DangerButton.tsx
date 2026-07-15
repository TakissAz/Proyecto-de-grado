import { ButtonHTMLAttributes } from 'react';

export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-full border border-transparent bg-error px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-error-content transition duration-150 ease-in-out hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-error/25 active:brightness-90 ${
                    disabled ? 'opacity-40' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
