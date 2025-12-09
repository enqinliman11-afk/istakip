'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
    block?: boolean;
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    block = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const classes = [
        'btn',
        `btn-${variant}`,
        size !== 'md' && `btn-${size}`,
        block && 'btn-block',
        !children && icon && 'btn-icon',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button className={classes} disabled={disabled || isLoading} {...props}>
            {isLoading ? (
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            ) : (
                <>
                    {icon && <span className="btn-icon-wrapper">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
}
