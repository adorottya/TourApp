import { useEffect, useState } from 'react';
import { checkout, getCart, removeFromCart } from '../../api/cart';
import { PageShell } from '../../components/layout/PageShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import type { Cart, TourPurchaseToken } from '../../types/cart';
import './CartPage.css';

export function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [tokens, setTokens] = useState<TourPurchaseToken[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCart().then(setCart).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  async function handleRemove(tourId: string) {
    try { const updated = await removeFromCart(tourId); setCart(updated); } catch { /* ignore */ }
  }

  async function handleCheckout() {
    setCheckingOut(true);
    setError('');
    try {
      const result = await checkout();
      setTokens(result);
      setCart(null);
      localStorage.setItem('purchaseTokens', JSON.stringify(result));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  }

  if (loading) return <PageShell><Spinner /></PageShell>;

  if (tokens) {
    return (
      <PageShell title="Purchase Complete">
        <Card style={{ maxWidth: 560 }}>
          <p style={{ color: 'var(--primary)', marginBottom: 16 }}>✓ Payment successful! Your tokens:</p>
          {tokens.map(t => (
            <div key={t.id} className="token-row">
              <div>
                <strong>{t.tourName}</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Token: {t.id}</p>
              </div>
              <span className="token-price">${t.price.toFixed(2)}</span>
            </div>
          ))}
          <p style={{ marginTop: 16, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Use these token IDs on the Execution page to start a tour.
          </p>
        </Card>
      </PageShell>
    );
  }

  const items = cart?.items ?? [];
  const total = items.reduce((s, i) => s + i.price, 0);

  return (
    <PageShell title="Shopping Cart">
      {error && <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{error}</p>}
      {items.length === 0 ? (
        <Card style={{ maxWidth: 400, textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Your cart is empty.</p>
        </Card>
      ) : (
        <Card style={{ maxWidth: 560 }}>
          {items.map(item => (
            <div key={item.tourId} className="cart-row">
              <div>
                <strong>{item.tourName}</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.tourId}</p>
              </div>
              <div className="cart-row__right">
                <span className="cart-price">{item.price === 0 ? 'Free' : `$${item.price.toFixed(2)}`}</span>
                <Button variant="secondary" size="sm" onClick={() => handleRemove(item.tourId)}>Remove</Button>
              </div>
            </div>
          ))}
          <div className="cart-total">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <Button onClick={handleCheckout} disabled={checkingOut} style={{ width: '100%', marginTop: 16 }}>
            {checkingOut ? 'Processing…' : 'Checkout'}
          </Button>
        </Card>
      )}
    </PageShell>
  );
}
