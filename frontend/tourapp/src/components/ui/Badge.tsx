import type { HTMLAttributes } from 'react';
import './Badge.css';

interface Props extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'accent' | 'danger' | 'muted';
}

export function Badge({ variant = 'default', className = '', children, ...props }: Props) {
  return <span className={`badge badge--${variant} ${className}`} {...props}>{children}</span>;
}
