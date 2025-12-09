import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export function Card({ children, className = '' }: CardProps) {
    return <div className={`card ${className}`}>{children}</div>;
}

export function CardHeader({
    children,
    title,
    action,
}: {
    children?: React.ReactNode;
    title?: string;
    action?: React.ReactNode;
}) {
    if (children) {
        return <div className="card-header">{children}</div>;
    }
    return (
        <div className="card-header">
            <h3 className="card-title">{title}</h3>
            {action}
        </div>
    );
}

export function CardBody({ children, className = '' }: CardProps) {
    return <div className={`card-body ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: CardProps) {
    return <div className={`card-footer ${className}`}>{children}</div>;
}
