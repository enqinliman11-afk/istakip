'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export function Input({ label, error, hint, className = '', ...props }: InputProps) {
    return (
        <div className="form-group">
            {label && <label className="form-label">{label}</label>}
            <input className={`form-input ${className}`} {...props} />
            {error && <p className="form-error">{error}</p>}
            {hint && !error && <p className="form-hint">{hint}</p>}
        </div>
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
    return (
        <div className="form-group">
            {label && <label className="form-label">{label}</label>}
            <select className={`form-input form-select ${className}`} {...props}>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
    return (
        <div className="form-group">
            {label && <label className="form-label">{label}</label>}
            <textarea className={`form-input form-textarea ${className}`} {...props} />
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}
