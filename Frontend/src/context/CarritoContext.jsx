import { createContext, useMemo, useState } from "react";
import { obtenerUrlImagen } from "../utils/obtenerImagen.js";

export const CarritoContext = createContext(null);

// NOTA IMPORTANTE (leer antes de conectar carritoService real):
// El carrito vive en memoria (useState) por ahora — se pierde al recargar.
// Cada función ya tiene la forma final que va a tener cuando conectemos la
// API (mismo nombre, mismos parámetros), para que conectar carritoService
// más adelante sea cambiar el CUERPO de estas funciones (agregar los
// "await carritoService...."), no su forma de uso en el resto de la app.
//
// "items" usa la forma de ItemCarrito de tu modelo: { productoId, nombre,
// precio, cantidad, imagen }. Guardamos "nombre"/"imagen" además del id
// para no tener que ir a buscar el producto cada vez que se pinta el ícono
// del carrito o la página de Carrito.
export function CarritoProvider({ children }) {
  const [items, setItems] = useState([]);

  const agregarItem = (producto, cantidad = 1) => {
    setItems((actuales) => {
      const existente = actuales.find((item) => item.productoId === producto._id);

      if (existente) {
        return actuales.map((item) =>
          item.productoId === producto._id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }

      return [
        ...actuales,
        {
          productoId: producto._id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: obtenerUrlImagen(producto.imagenes?.[0]),
          cantidad,
        },
      ];
    });
  };

  const actualizarCantidad = (productoId, cantidad) => {
    if (cantidad <= 0) {
      eliminarItem(productoId);
      return;
    }
    setItems((actuales) =>
      actuales.map((item) => (item.productoId === productoId ? { ...item, cantidad } : item))
    );
  };

  const eliminarItem = (productoId) => {
    setItems((actuales) => actuales.filter((item) => item.productoId !== productoId));
  };

  const vaciarCarrito = () => {
    setItems([]);
  };

  const cantidadTotal = useMemo(
    () => items.reduce((total, item) => total + item.cantidad, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.precio * item.cantidad, 0),
    [items]
  );

  return (
    <CarritoContext.Provider
      value={{
        items,
        agregarItem,
        actualizarCantidad,
        eliminarItem,
        vaciarCarrito,
        cantidadTotal,
        subtotal,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}
