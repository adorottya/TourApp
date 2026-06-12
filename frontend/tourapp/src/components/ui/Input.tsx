import type { InputHTMLAttributes } from 'react';
import './Input.css';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, ...props }: Props) {
  return (
    <div className="input-group">
      {label && <label className="input-label" htmlFor={id}>{label}</label>}
      <input id={id} className={`input-field ${error ? 'input-field--error' : ''}`} {...props} />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}
