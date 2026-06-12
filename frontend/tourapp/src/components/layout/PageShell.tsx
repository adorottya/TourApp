import type { ReactNode } from 'react';
import './PageShell.css';

interface Props {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageShell({ title, actions, children }: Props) {
  return (
    <main className="page-shell">
      {(title || actions) && (
        <div className="page-shell__header">
          {title && <h1>{title}</h1>}
          {actions && <div className="page-shell__actions">{actions}</div>}
        </div>
      )}
      {children}
    </main>
  );
}
