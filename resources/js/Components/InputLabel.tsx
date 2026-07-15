import { LabelHTMLAttributes } from 'react';

export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string }) {
    return (
        <label
            {...props}
            className={
                `mb-1 block text-sm font-semibold text-base-content/70 ` + className
            }
        >
            {value ? value : children}
        </label>
    );
}
