import { createContext, useEffect, useMemo, useState } from "react";
import { obtenerUrlImagen } from "../utils/obtenerImagen.js";
import { useAuth } from "../hooks/useAuth.js";
import * as carritoService from "../services/carritoService.js";

export const CarritoContext = createContext(null);

const normalizar = (carrito) =>
  (carrito?.items || []).map((i) => ({
    productoId: i.productoId?._id || i.productoId,
    nombre: i.productoId?.nombre || "Producto",
    precio: Number(i.precioUnitario),
    imagen: obtenerUrlImagen(i.productoId?.imagenes?.[0]),
    cantidad: i.cantidad,
  }));

export function CarritoProvider({ children }) {
  const { usuario } = useAuth();
  const [items, setItems] = useState([]);
  const [cargandoCarrito, setCargandoCarrito] = useState(false);
  const usuarioId = usuario?._id || usuario?.id;

  useEffect(() => {
    if (!usuarioId) return;
    let activo = true;
    (async () => {
      setCargandoCarrito(true);
      try {
        const locales = [...items];
        if (locales.length) {
          for (const i of locales)
            await carritoService.agregarItem(usuarioId, i.productoId, i.cantidad);
        }
        const c = await carritoService.obtenerCarrito(usuarioId);
        if (activo) setItems(normalizar(c));
      } catch (e) {
        console.error("No se pudo sincronizar el carrito", e);
      } finally {
        if (activo) setCargandoCarrito(false);
      }
    })();
    return () => {
      activo = false;
    };
    
  }, [usuarioId]);

  const refrescar = async () => {
    if (!usuarioId) return;
    const c = await carritoService.obtenerCarrito(usuarioId);
    setItems(normalizar(c));
  };

  const agregarItem = async (producto, cantidad = 1) => {
    if (!usuarioId) {
      setItems((a) => {
        const x = a.find((i) => i.productoId === producto._id);
        return x
          ? a.map((i) =>
              i.productoId === producto._id
                ? { ...i, cantidad: i.cantidad + cantidad }
                : i
            )
          : [
              ...a,
              {
                productoId: producto._id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen: obtenerUrlImagen(producto.imagenes?.[0]),
                cantidad,
              },
            ];
      });
      return;
    }
    await carritoService.agregarItem(usuarioId, producto._id, cantidad);
    await refrescar();
  };

  const actualizarCantidad = async (productoId, cantidad) => {
    if (cantidad <= 0) return eliminarItem(productoId);
    if (!usuarioId) {
      setItems((a) =>
        a.map((i) => (i.productoId === productoId ? { ...i, cantidad } : i))
      );
      return;
    }
    await carritoService.actualizarCantidad(usuarioId, productoId, Number(cantidad));
    await refrescar();
  };

  const eliminarItem = async (productoId) => {
    if (!usuarioId) {
      setItems((a) => a.filter((i) => i.productoId !== productoId));
      return;
    }
    await carritoService.eliminarItem(usuarioId, productoId);
    await refrescar();
  };

  const vaciarCarrito = async () => {
    if (usuarioId) await carritoService.vaciarCarrito(usuarioId);
    setItems([]);
  };

  const cantidadTotal = useMemo(
    () => items.reduce((t, i) => t + i.cantidad, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((t, i) => t + i.precio * i.cantidad, 0),
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
        cargandoCarrito,
        refrescar,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}