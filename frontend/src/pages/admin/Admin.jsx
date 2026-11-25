/* ─── PANEL ADMINISTRADOR — Catálogo · Usuarios · Supervisión ─── */
import React, { useEffect, useState, useCallback } from 'react';
import { apiCatalogo, apiIdentidad, apiVentas, apiInventarios } from '../../api';
import { colors, roles, fonts, radius, shadow } from '../../theme';
import PanelLayout from '../../components/PanelLayout';
import { Card, Button, Input, Badge, Table, Toast } from '../../components/ui';

const ACCENT = roles.ADMINISTRADOR.accent;
const PRODUCT_EMOJIS = ['🧴', '👟', '📱', '🎧', '🧢', '🕶️', '💡', '📒', '🖊️', '🎒', '⌚', '📦'];

/* ─── Constantes de roles del sistema ─── */
const ROLES_SISTEMA = [
  { id: 1, nombre: 'ADMINISTRADOR', label: 'Administrador 🧑‍✈️' },
  { id: 2, nombre: 'COMPRADOR',     label: 'Comprador 🛒' },
  { id: 3, nombre: 'BODEGUERO',     label: 'Bodeguero 📦' },
  { id: 4, nombre: 'VENDEDOR',      label: 'Vendedor 🛍️' },
  { id: 5, nombre: 'CAJERO',        label: 'Cajero 💳' },
  { id: 6, nombre: 'AUDITOR',       label: 'Auditor 🔍' },
];

/* ════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ════════════════════════════════════════════════════════════════ */
export default function Admin() {
  const [seccion, setSeccion] = useState('catalogo'); // 'catalogo' | 'usuarios' | 'supervision'
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  };

  return (
    <PanelLayout rol="ADMINISTRADOR">
      {/* ─── Tabs de navegación ─── */}
      <div style={st.tabRow}>
        {[
          { id: 'catalogo',   label: '📚 Catálogo' },
          { id: 'usuarios',   label: '👥 Usuarios' },
          { id: 'supervision',label: '🔭 Supervisión' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSeccion(tab.id)}
            style={{
              ...st.tab,
              background: seccion === tab.id ? ACCENT : 'transparent',
              color: seccion === tab.id ? '#fff' : colors.textSecondary,
              borderColor: seccion === tab.id ? ACCENT : colors.border,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Contenido por sección ─── */}
      {seccion === 'catalogo'    && <SeccionCatalogo    showToast={showToast} />}
      {seccion === 'usuarios'    && <SeccionUsuarios    showToast={showToast} />}
      {seccion === 'supervision' && <SeccionSupervision showToast={showToast} />}

      <Toast {...toast} />
    </PanelLayout>
  );
}

/* ════════════════════════════════════════════════════════════════
   SECCIÓN: CATÁLOGO — listar + crear producto
   ════════════════════════════════════════════════════════════════ */
function SeccionCatalogo({ showToast }) {
  const [productos,   setProductos]   = useState([]);
  const [categorias,  setCategorias]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando,   setGuardando]   = useState(false);
  const [form, setForm] = useState({
    sku: '', nombre: '', id_categoria: '', unidad_medida: 'UNIDAD', precio_lista: '',
  });
  const [errForm, setErrForm] = useState({});

  const cargar = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiCatalogo.get('/catalogo/productos'),
      apiCatalogo.get('/catalogo/categorias'),
    ])
      .then(([pRes, cRes]) => {
        setProductos(pRes.data);
        setCategorias(cRes.data);
      })
      .catch(() => {
        setProductos([
          { id_producto: 1, nombre: 'Auriculares BT', precio_lista: 89900, sku: 'SKU001', unidad_medida: 'UNIDAD' },
          { id_producto: 2, nombre: 'Termo Acero',     precio_lista: 45000, sku: 'SKU002', unidad_medida: 'UNIDAD' },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiar = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validar = () => {
    const e = {};
    if (!form.sku.trim())         e.sku          = 'Requerido';
    if (!form.nombre.trim())      e.nombre       = 'Requerido';
    if (!form.precio_lista || isNaN(form.precio_lista) || Number(form.precio_lista) <= 0)
                                  e.precio_lista = 'Precio válido requerido';
    if (!form.unidad_medida.trim()) e.unidad_medida = 'Requerido';
    setErrForm(e);
    return Object.keys(e).length === 0;
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setGuardando(true);
    try {
      await apiCatalogo.post('/catalogo/productos', {
        sku:           form.sku.trim(),
        nombre:        form.nombre.trim(),
        id_categoria:  form.id_categoria || null,
        unidad_medida: form.unidad_medida.trim(),
        precio_lista:  Number(form.precio_lista),
      });
      showToast('✅ Producto creado');
      setForm({ sku: '', nombre: '', id_categoria: '', unidad_medida: 'UNIDAD', precio_lista: '' });
      setMostrarForm(false);
      cargar();
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.error || 'Error al guardar'), 'error');
    } finally {
      setGuardando(false);
    }
  };

  const columnas = [
    { key: 'emoji', label: '', render: (_, i) => <span style={{ fontSize: '20px' }}>{PRODUCT_EMOJIS[i % PRODUCT_EMOJIS.length]}</span> },
    { key: 'sku',         label: 'SKU' },
    { key: 'nombre',      label: 'Producto', bold: true },
    { key: 'unidad_medida', label: 'Unidad' },
    {
      key: 'precio_lista', label: 'Precio Lista',
      render: row => (
        <span style={{ fontFamily: fonts.heading, fontWeight: 600, color: ACCENT }}>
          ${Number(row.precio_lista).toLocaleString('es-CO')}
        </span>
      ),
    },
  ];

  return (
    <div className="animate-fadeInUp">
      {/* Cabecera de sección */}
      <div style={st.secHead}>
        <div>
          <h2 style={st.secTitle}>📚 Catálogo de productos</h2>
          <p style={st.secSub}>{productos.length} producto{productos.length !== 1 ? 's' : ''} registrado{productos.length !== 1 ? 's' : ''}</p>
        </div>
        <Button
          accent={ACCENT}
          onClick={() => setMostrarForm(v => !v)}
        >
          {mostrarForm ? 'Cancelar' : '+ Nuevo producto'}
        </Button>
      </div>

      {/* Formulario de creación */}
      {mostrarForm && (
        <Card style={{ marginBottom: '24px' }} className="animate-fadeInUp">
          <h3 style={{ ...st.secTitle, fontSize: '17px', marginBottom: '20px' }}>Nuevo producto</h3>
          <form onSubmit={guardar}>
            <div style={st.formGrid}>
              <Input label="SKU *"    value={form.sku}    onChange={e => cambiar('sku', e.target.value)}    error={errForm.sku}           accent={ACCENT} placeholder="Ej: PROD-001" />
              <Input label="Nombre *" value={form.nombre} onChange={e => cambiar('nombre', e.target.value)} error={errForm.nombre}         accent={ACCENT} placeholder="Nombre del producto" />
              <Input label="Unidad de medida *" value={form.unidad_medida} onChange={e => cambiar('unidad_medida', e.target.value)} error={errForm.unidad_medida} accent={ACCENT} placeholder="UNIDAD, KG, LT…" />
              <Input label="Precio de lista *"  value={form.precio_lista}  onChange={e => cambiar('precio_lista', e.target.value)}  error={errForm.precio_lista}  accent={ACCENT} placeholder="Ej: 49900" type="number" min="0" />
            </div>

            {/* Categoría (select) */}
            {categorias.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <label style={st.label}>Categoría (opcional)</label>
                <select
                  value={form.id_categoria}
                  onChange={e => cambiar('id_categoria', e.target.value)}
                  style={st.select}
                >
                  <option value="">Sin categoría</option>
                  {categorias.map(c => (
                    <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            <Button type="submit" accent={ACCENT} disabled={guardando} style={{ marginTop: '8px' }}>
              {guardando ? 'Guardando…' : 'Guardar producto'}
            </Button>
          </form>
        </Card>
      )}

      {/* Tabla */}
      {loading ? (
        <Card><p style={{ color: colors.textSecondary, fontFamily: fonts.body }}>Cargando productos…</p></Card>
      ) : productos.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
          <p style={{ fontFamily: fonts.body, color: colors.textSecondary }}>No hay productos aún. ¡Crea el primero!</p>
        </Card>
      ) : (
        <Table columns={columnas} data={productos} accent={ACCENT} />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SECCIÓN: USUARIOS — listar + crear + asignar rol
   ════════════════════════════════════════════════════════════════ */
function SeccionUsuarios({ showToast }) {
  const [usuarios,    setUsuarios]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando,   setGuardando]   = useState(false);
  const [asignando,   setAsignando]   = useState(null); // id_usuario al que se asigna rol
  const [form, setForm] = useState({ id_empleado: '', nombre_usuario: '', password: '' });
  const [errForm, setErrForm] = useState({});
  const [rolSeleccionado, setRolSeleccionado] = useState({});

  const cargar = useCallback(() => {
    setLoading(true);
    apiIdentidad.get('/usuarios')
      .then(r => setUsuarios(r.data))
      .catch(() => setUsuarios([
        { id_usuario: 1, nombre_usuario: 'admin', estado: 'ACTIVO', fecha_creacion: new Date().toISOString() },
      ]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiar = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validar = () => {
    const e = {};
    if (!form.id_empleado || isNaN(form.id_empleado)) e.id_empleado    = 'ID de empleado requerido';
    if (!form.nombre_usuario.trim())                   e.nombre_usuario = 'Requerido';
    if (form.password.length < 6)                      e.password       = 'Mínimo 6 caracteres';
    setErrForm(e);
    return Object.keys(e).length === 0;
  };

  const crearUsuario = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setGuardando(true);
    try {
      await apiIdentidad.post('/usuarios', {
        id_empleado:    Number(form.id_empleado),
        nombre_usuario: form.nombre_usuario.trim(),
        password:       form.password,
      });
      showToast('✅ Usuario creado');
      setForm({ id_empleado: '', nombre_usuario: '', password: '' });
      setMostrarForm(false);
      cargar();
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.error || 'Error al crear usuario'), 'error');
    } finally {
      setGuardando(false);
    }
  };

  const asignarRol = async (idUsuario) => {
    const idRol = rolSeleccionado[idUsuario];
    if (!idRol) { showToast('Selecciona un rol primero', 'error'); return; }
    setAsignando(idUsuario);
    try {
      await apiIdentidad.post(`/usuarios/${idUsuario}/roles`, { id_rol: Number(idRol) });
      showToast('✅ Rol asignado correctamente');
      setRolSeleccionado(r => ({ ...r, [idUsuario]: '' }));
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.error || 'Error al asignar rol'), 'error');
    } finally {
      setAsignando(null);
    }
  };

  const columnas = [
    { key: 'id_usuario',     label: 'ID' },
    { key: 'id_empleado',    label: 'Empleado' },
    { key: 'nombre_usuario', label: 'Usuario', bold: true },
    {
      key: 'estado',
      label: 'Estado',
      render: row => (
        <Badge color={row.estado === 'ACTIVO' ? colors.success : colors.textSecondary}>
          {row.estado}
        </Badge>
      ),
    },
    {
      key: 'fecha_creacion',
      label: 'Creado',
      render: row => new Date(row.fecha_creacion).toLocaleDateString('es-CO'),
    },
    {
      key: 'acciones',
      label: 'Asignar rol',
      render: row => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={rolSeleccionado[row.id_usuario] || ''}
            onChange={e => setRolSeleccionado(r => ({ ...r, [row.id_usuario]: e.target.value }))}
            style={{ ...st.select, minWidth: '160px', marginBottom: 0, padding: '8px 10px' }}
          >
            <option value="">— Elegir rol —</option>
            {ROLES_SISTEMA.map(r => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
          <Button
            accent={ACCENT}
            variant="small"
            disabled={asignando === row.id_usuario}
            onClick={() => asignarRol(row.id_usuario)}
          >
            {asignando === row.id_usuario ? '…' : 'Asignar'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fadeInUp">
      <div style={st.secHead}>
        <div>
          <h2 style={st.secTitle}>👥 Usuarios del sistema</h2>
          <p style={st.secSub}>{usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}</p>
        </div>
        <Button accent={ACCENT} onClick={() => setMostrarForm(v => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Nuevo usuario'}
        </Button>
      </div>

      {/* Formulario creación */}
      {mostrarForm && (
        <Card style={{ marginBottom: '24px' }}>
          <h3 style={{ ...st.secTitle, fontSize: '17px', marginBottom: '20px' }}>Crear usuario</h3>
          <form onSubmit={crearUsuario}>
            <div style={st.formGrid}>
              <Input label="ID de empleado *"  value={form.id_empleado}    onChange={e => cambiar('id_empleado',    e.target.value)} error={errForm.id_empleado}    accent={ACCENT} placeholder="Ej: 7"         type="number" />
              <Input label="Nombre de usuario *" value={form.nombre_usuario} onChange={e => cambiar('nombre_usuario', e.target.value)} error={errForm.nombre_usuario} accent={ACCENT} placeholder="Ej: juanito"            />
              <Input label="Contraseña *"       value={form.password}       onChange={e => cambiar('password',       e.target.value)} error={errForm.password}       accent={ACCENT} placeholder="Mínimo 6 caracteres" type="password" />
            </div>
            <Button type="submit" accent={ACCENT} disabled={guardando} style={{ marginTop: '8px' }}>
              {guardando ? 'Creando…' : 'Crear usuario'}
            </Button>
          </form>
        </Card>
      )}

      {/* Tabla */}
      {loading ? (
        <Card><p style={{ color: colors.textSecondary, fontFamily: fonts.body }}>Cargando usuarios…</p></Card>
      ) : (
        <Table columns={columnas} data={usuarios} accent={ACCENT} />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SECCIÓN: SUPERVISIÓN — resumen en tiempo real (solo lectura)
   ════════════════════════════════════════════════════════════════ */
function SeccionSupervision() {
  const [pedidos,    setPedidos]    = useState([]);
  const [inventario, setInventario] = useState([]);
  const [productos,  setProductos]  = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      apiVentas.get('/ventas/pedidos'),
      apiInventarios.get('/inventarios'),
      apiCatalogo.get('/catalogo/productos'),
    ]).then(([ped, inv, prod]) => {
      if (ped.status  === 'fulfilled') setPedidos(ped.value.data);
      if (inv.status  === 'fulfilled') setInventario(inv.value.data);
      if (prod.status === 'fulfilled') setProductos(prod.value.data);
    }).finally(() => setLoading(false));
  }, []);

  /* ── métricas derivadas ── */
  const totalVentas     = pedidos.filter(p => p.estado === 'CONFIRMADO').length;
  const pedidosPend     = pedidos.filter(p => p.estado === 'CREADO').length;
  const totalProductos  = productos.length;
  const bajosStock      = inventario.filter(i => Number(i.existencia_actual) < Number(i.stock_minimo || 5)).length;

  const metricas = [
    { label: 'Ventas confirmadas', valor: totalVentas,   emoji: '✅', color: colors.success },
    { label: 'Pedidos pendientes', valor: pedidosPend,   emoji: '⏳', color: '#E08A00' },
    { label: 'Productos en catálogo', valor: totalProductos, emoji: '📦', color: ACCENT },
    { label: 'Items bajo stock mínimo', valor: bajosStock, emoji: '⚠️', color: colors.error },
  ];

  /* ── columnas pedidos recientes ── */
  const colPedidos = [
    { key: 'id_pedido', label: 'ID' },
    {
      key: 'estado',
      label: 'Estado',
      render: row => (
        <Badge color={row.estado === 'CONFIRMADO' ? colors.success : '#E08A00'}>
          {row.estado}
        </Badge>
      ),
    },
    {
      key: 'total_registrado',
      label: 'Total',
      render: row => (
        <span style={{ fontFamily: fonts.heading, fontWeight: 600, color: ACCENT }}>
          ${Number(row.total_registrado || 0).toLocaleString('es-CO')}
        </span>
      ),
    },
  ];

  /* ── columnas inventario ── */
  const colInventario = [
    { key: 'id_producto', label: 'Producto ID' },
    { key: 'id_almacen',  label: 'Almacén ID' },
    { key: 'existencia_actual', label: 'Existencia', bold: true },
    {
      key: 'estado_stock',
      label: 'Estado',
      render: row => {
        const bajo = Number(row.existencia_actual) < Number(row.stock_minimo || 5);
        return <Badge color={bajo ? colors.error : colors.success}>{bajo ? 'Bajo' : 'OK'}</Badge>;
      },
    },
  ];

  if (loading) {
    return (
      <Card style={{ textAlign: 'center', padding: '48px' }}>
        <div style={{ fontSize: '36px', marginBottom: '8px', animation: 'bounce 1.5s ease-in-out infinite' }}>⏳</div>
        <p style={{ fontFamily: fonts.body, color: colors.textSecondary }}>Cargando datos de supervisión…</p>
      </Card>
    );
  }

  return (
    <div className="animate-fadeInUp">
      <h2 style={{ ...st.secTitle, marginBottom: '8px' }}>🔭 Supervisión general</h2>
      <p style={{ ...st.secSub, marginBottom: '24px' }}>Vista de solo lectura en tiempo real</p>

      {/* Tarjetas métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {metricas.map(m => (
          <Card key={m.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{m.emoji}</div>
            <div style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: '32px', color: m.color }}>
              {m.valor}
            </div>
            <div style={{ fontFamily: fonts.body, fontSize: '13px', color: colors.textSecondary, marginTop: '4px' }}>
              {m.label}
            </div>
          </Card>
        ))}
      </div>

      {/* Pedidos recientes */}
      <h3 style={{ ...st.secTitle, fontSize: '17px', marginBottom: '12px' }}>Pedidos recientes</h3>
      {pedidos.length === 0 ? (
        <Card style={{ marginBottom: '24px' }}>
          <p style={{ fontFamily: fonts.body, color: colors.textSecondary }}>No hay pedidos registrados aún.</p>
        </Card>
      ) : (
        <div style={{ marginBottom: '28px' }}>
          <Table
            columns={colPedidos}
            data={pedidos.slice(-10).reverse()}
            accent={ACCENT}
          />
        </div>
      )}

      {/* Inventario */}
      <h3 style={{ ...st.secTitle, fontSize: '17px', marginBottom: '12px' }}>Estado de inventario</h3>
      {inventario.length === 0 ? (
        <Card>
          <p style={{ fontFamily: fonts.body, color: colors.textSecondary }}>No hay registros de inventario aún.</p>
        </Card>
      ) : (
        <Table
          columns={colInventario}
          data={inventario.slice(0, 20)}
          accent={ACCENT}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ESTILOS COMPARTIDOS
   ════════════════════════════════════════════════════════════════ */
const st = {
  tabRow: {
    display:       'flex',
    gap:           '10px',
    marginBottom:  '28px',
    flexWrap:      'wrap',
  },
  tab: {
    fontFamily:    fonts.body,
    fontWeight:    700,
    fontSize:      '14px',
    padding:       '10px 22px',
    borderRadius:  radius.button,
    border:        '2px solid',
    cursor:        'pointer',
    transition:    'all 0.2s ease',
  },
  secHead: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   '20px',
    flexWrap:       'wrap',
    gap:            '12px',
  },
  secTitle: {
    fontFamily:   fonts.heading,
    fontWeight:   600,
    fontSize:     '20px',
    color:        colors.textPrimary,
    marginBottom: '2px',
  },
  secSub: {
    fontFamily: fonts.body,
    fontSize:   '14px',
    color:      colors.textSecondary,
  },
  formGrid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap:                 '0 20px',
  },
  label: {
    fontFamily:    fonts.body,
    fontWeight:    700,
    fontSize:      '13px',
    color:         colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom:  '6px',
    display:       'block',
  },
  select: {
    width:        '100%',
    padding:      '14px 16px',
    fontFamily:   fonts.body,
    fontSize:     '15px',
    color:        colors.textPrimary,
    background:   colors.card,
    border:       `2px solid ${colors.border}`,
    borderRadius: radius.input,
    outline:      'none',
    cursor:       'pointer',
    marginBottom: '16px',
    appearance:   'none',
  },
};
