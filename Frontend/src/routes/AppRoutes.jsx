import { Routes, Route } from "react-router-dom";
import Home from "../pages/cliente/Home.jsx";
import Catalogo from "../pages/cliente/Catalogo.jsx";
import DetalleProducto from "../pages/cliente/DetalleProducto.jsx";

// Aquí centralizamos todas las rutas del cliente.
// Cada vez que construyamos una página nueva (Login, Carrito, etc.)
// solo agregamos un <Route /> más — no tocamos App.jsx de nuevo.
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home productosDestacados={[]} />} />

      <Route path="/catalogo" element={<Catalogo productos={[]} categorias={[]} />} />

      <Route
        path="/producto/:id"
        element={
          <DetalleProducto
            producto={{
              _id: "1",
              nombre: "Arreglo Floral Magnolia & Peonías Rosas",
              descripcion: "Una composición botánica armónica y distinguida, creada con peonías rosadas, follaje de eucalipto fresco y detalles de flores silvestres.",
              precio: 68,
              imagenes: [],
              componentes: [],
            }}
            categoriaNombre="Arreglos Florales"
            onAgregarCarrito={(producto, cantidad) => console.log(producto, cantidad)}
          />
        }
      />
    </Routes>
  );
}

export default AppRoutes;