/* ─── PANEL VENDEDOR (pantalla más detallada) ─── */
import React, { useEffect, useState } from 'react';
import { apiCatalogo, apiVentas } from '../../api';
import { useAuth } from '../../auth';
import { colors, roles, fonts, radius, shadow } from '../../theme';
import PanelLayout from '../../components/PanelLayout';
import { ProductCard, CartRow, Button, Card, Toast, Skeleton } from '../../components/ui';

const ACCENT = roles.VENDEDOR.accent;

/* Emojis para productos según índice */
const PRODUCT_EMOJIS = ['🧴', '👟', '📱', '🎧', '🧢', '🕶️', '💡', '📒', '🖊️', '🎒', '⌚', '🧤', '🧦', '🎮', '🖥️', '📦'];

export default function Vendedor() {
  const { auth } = useAuth();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  useEffect(() => {
    apiCatalogo
      .get('/catalogo/productos')
      .then((r) => {
        const withEmoji = r.data.map((p, i) => ({
          ...p,
          emoji: PRODUCT_EMOJIS[i % PRODUCT_EMOJIS.length],
        }));
        setProductos(withEmoji);
      })
      .catch(() => {
        setProductos([
          { id_producto: 1, nombre: 'Auriculares BT', precio_lista: 89900, emoji: '🎧' },
          { id_producto: 2, nombre: 'Termo Acero', precio_lista: 45000, emoji: '🧴' },
          { id_producto: 3, nombre: 'Mochila Urban', precio_lista: 120000, emoji: '🎒' },
          { id_producto: 4, nombre: 'Cargador Rápido', precio_lista: 35000, emoji: '⚡' },
          { id_producto: 5, nombre: 'Mouse Ergo', precio_lista: 67000, emoji: '🖱️' },
          { id_producto: 6, nombre: 'Libreta A5', precio_lista: 18000, emoji: '📒' },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ─── Carrito ─── */
  const addToCart = (product) => {
    setCarrito((prev) => {
      const existing = prev.find((i) => i.id_producto === product.id_producto);
      if (existing) {
        return prev.map((i) =>
          i.id_producto === product.id_producto ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { ...product, cantidad: 1, precio_unitario: product.precio_lista }];
    });
  };

  const increase = (id) => {
    setCarrito((prev) =>
      prev.map((i) => (i.id_producto === id ? { ...i, cantidad: i.cantidad + 1 } : i))
    );
  };

  const decrease = (id) => {
    setCarrito((prev) =>
      prev
        .map((i) => (i.id_producto === id ? { ...i, cantidad: i.cantidad - 1 } : i))
        .filter((i) => i.cantidad > 0)
    );
  };

  const total = carrito.reduce((s, i) => s + i.precio_unitario * i.cantidad, 0);

  /* ─── Confirmar venta ─── */
  const confirmarVenta = async () => {
    try {
      const items = carrito.map((i) => ({
        id_producto: i.id_producto,
        cantidad: i.cantidad,
        precio_unitario: i.precio_unitario,
      }));

      const { data: pedido } = await apiVentas.post('/ventas/pedidos', {
        id_sede: 1,
        id_almacen: 1,
        id_cliente: 1,
        id_empleado: 4,
        items,
      });

      await apiVentas.post(`/ventas/confirmar/${pedido.id_pedido}`);

      showToast('🎉 Venta confirmada', 'success');
      setCarrito([]);
    } catch (e) {
      showToast(e.response?.data?.error || '❌ Error al crear la venta', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  /* ─── Responsive: detect mobile ─── */
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <PanelLayout rol="VENDEDOR">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 360px',
          gap: '28px',
          alignItems: 'start',
        }}
      >
        {/* ─── COLUMNA IZQUIERDA: Catálogo ─── */}
        <div>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontWeight: 600,
              fontSize: '22px',
              color: colors.textPrimary,
              marginBottom: '20px',
            }}
          >
            🛒 Catálogo
          </h2>

          {loading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '16px',
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  style={{
                    background: colors.card,
                    borderRadius: radius.card,
                    overflow: 'hidden',
                    boxShadow: shadow.card,
                  }}
                >
                  <Skeleton height="120px" borderRadius="0" />
                  <div style={{ padding: '16px' }}>
                    <Skeleton width="70%" height="16px" style={{ marginBottom: '8px' }} />
                    <Skeleton width="40%" height="22px" style={{ marginBottom: '12px' }} />
                    <Skeleton height="38px" borderRadius={radius.button} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '16px',
              }}
            >
              {productos.map((p) => (
                <ProductCard key={p.id_producto} product={p} accent={ACCENT} onAdd={addToCart} />
              ))}
            </div>
          )}
        </div>

        {/* ─── COLUMNA DERECHA: Carrito ─── */}
        <div>
          <Card style={{ position: isMobile ? 'static' : 'sticky', top: '88px' }}>
            <h3
              style={{
                fontFamily: fonts.heading,
                fontWeight: 600,
                fontSize: '18px',
                color: colors.textPrimary,
                marginBottom: '16px',
              }}
            >
              Tu pedido
            </h3>

            {carrito.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🧺</div>
                <p
                  style={{
                    fontFamily: fonts.body,
                    color: colors.textSecondary,
                    fontSize: '14px',
                  }}
                >
                  Todavía está vacío
                </p>
              </div>
            ) : (
              <>
                <div style={{ maxHeight: '340px', overflowY: 'auto', marginBottom: '16px' }}>
                  {carrito.map((item) => (
                    <CartRow
                      key={item.id_producto}
                      item={item}
                      accent={ACCENT}
                      onIncrease={() => increase(item.id_producto)}
                      onDecrease={() => decrease(item.id_producto)}
                    />
                  ))}
                </div>

                {/* Total */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 0 0',
                    borderTop: `2px solid ${colors.border}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: fonts.body,
                      fontWeight: 700,
                      color: colors.textSecondary,
                      fontSize: '14px',
                    }}
                  >
                    Total
                  </span>
                  <span
                    style={{
                      fontFamily: fonts.heading,
                      fontWeight: 600,
                      fontSize: '24px',
                      color: ACCENT,
                    }}
                  >
                    ${total.toLocaleString('es-CO')}
                  </span>
                </div>

                <Button
                  accent={ACCENT}
                  fullWidth
                  onClick={confirmarVenta}
                  style={{ marginTop: '16px', fontSize: '16px' }}
                >
                  Confirmar venta ✨
                </Button>
              </>
            )}
          </Card>
        </div>
      </div>

      <Toast {...toast} />
    </PanelLayout>
  );
}
