import { ButtonHTMLAttributes } from 'react';

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center justify-center rounded-full border border-base-300 bg-base-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-base-content/70 shadow-sm transition duration-150 ease-in-out hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 disabled:opacity-40 ${
                    disabled ? 'opacity-40' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
