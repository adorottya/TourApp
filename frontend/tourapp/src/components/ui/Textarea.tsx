import type { TextareaHTMLAttributes } from 'react';
import './Textarea.css';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, id, ...props }: Props) {
  return (
    <div className="input-group">
      {label && <label className="input-label" htmlFor={id}>{label}</label>}
      <textarea id={id} className={`textarea-field ${error ? 'input-field--error' : ''}`} {...props} />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}
