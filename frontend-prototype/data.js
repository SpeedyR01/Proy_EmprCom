/* Datos del prototipo: roles y catálogo demo */
const ROLES = {
  admin:      { key: "admin",     clase: "role-admin",     nombre: "Administrador", mascota: "🧑‍✈️", color: "#6C5CE7", tagline: "El timón del negocio", frase: "Todo en orden por aquí" },
  comprador:  { key: "comprador", clase: "role-comprador", nombre: "Comprador",     mascota: "🛒",   color: "#0FA3B1", tagline: "Abasteciendo con cabeza", frase: "Buenas compras, mejor negocio" },
  bodeguero:  { key: "bodeguero", clase: "role-bodeguero", nombre: "Bodeguero",     mascota: "📦",   color: "#E08A00", tagline: "Cada cosa en su lugar", frase: "El inventario al día" },
  vendedor:   { key: "vendedor",  clase: "role-vendedor",  nombre: "Vendedor",      mascota: "🛍️",   color: "#FF7A59", tagline: "Hoy se vende con una sonrisa", frase: "¡A vender se ha dicho!" },
  cajero:     { key: "cajero",    clase: "role-cajero",    nombre: "Cajero",        mascota: "💳",   color: "#2FB67C", tagline: "Cada pago, un gracias", frase: "Caja lista y cuadrada" },
  auditor:    { key: "auditor",   clase: "role-auditor",   nombre: "Auditor",       mascota: "🔍",   color: "#4C6EF5", tagline: "La lupa que cuida todo", frase: "Mirando los números con calma" },
};

const PRODUCTOS = [
  { id: 1,  emoji: "☕", nombre: "Café de origen 250g", precio: 18500 },
  { id: 2,  emoji: "🍫", nombre: "Chocolate artesanal", precio: 12000 },
  { id: 3,  emoji: "🫖", nombre: "Té de frutos rojos",  precio: 9800  },
  { id: 4,  emoji: "🍪", nombre: "Galletas de avena",   precio: 7500  },
  { id: 5,  emoji: "🧃", nombre: "Jugo natural 1L",     precio: 6400  },
  { id: 6,  emoji: "🥐", nombre: "Croissant mantequilla", precio: 4200 },
  { id: 7,  emoji: "🍯", nombre: "Miel orgánica 500g",  precio: 21000 },
  { id: 8,  emoji: "🧀", nombre: "Queso madurado",      precio: 16900 },
  { id: 9,  emoji: "🥖", nombre: "Pan de masa madre",   precio: 8800  },
];

const money = (n) => "$" + n.toLocaleString("es-CO");
