import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-full border border-transparent bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary-content transition duration-150 ease-in-out hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/30 active:brightness-90 ${
                    disabled ? 'opacity-40' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
