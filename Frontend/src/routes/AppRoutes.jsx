import { Routes, Route } from "react-router-dom";
import ClienteLayout from "../layouts/ClienteLayout.jsx";
import PrivateRoute from "./PrivateRoutes.jsx";
import Home from "../pages/cliente/Home.jsx";
import Catalogo from "../pages/cliente/Catalogo.jsx";
import DetalleProducto from "../pages/cliente/DetalleProducto.jsx";
import Carrito from "../pages/cliente/Carrito.jsx";
import Checkout from "../pages/cliente/Checkout.jsx";
import MisPedidos from "../pages/cliente/MisPedidos.jsx";
import DetallePedido from "../pages/cliente/DetallePedido.jsx";
import Login from "../pages/cliente/Login.jsx";
import Registro from "../pages/cliente/Registro.jsx";
import Perfil from "../pages/cliente/Perfil.jsx";

import AdminRoute from "./AdminRoute.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import Dashboard from "../pages/admin/Dashboard.jsx";
import Productos from "../pages/admin/Productos.jsx";
import Categorias from "../pages/admin/Categorias.jsx";
import Proveedores from "../pages/admin/Proveedores.jsx";
import Inventario from "../pages/admin/Inventario.jsx";
import MovInventario from "../pages/admin/MovInventario.jsx";
import Pedidos from "../pages/admin/Pedidos.jsx";
import Pagos from "../pages/admin/pagos.jsx";
import Envios from "../pages/admin/Envios.jsx";
import Usuario from "../pages/admin/Usuario.jsx";

// Catalogo y DetalleProducto ya cargan sus propios datos desde la API
// (productoService / categoriaService), por eso ya no reciben props.
// Todavía sin datos reales: Home, MisPedidos y DetallePedido siguen
// recibiendo props vacías/null hasta que conectemos productoService/
// pedidoService. Cuando eso pase, cada página hará su propio fetch en un
// useEffect (ya leen su :id con useParams donde corresponde).
//
// Checkout, MisPedidos, DetallePedido y Perfil exigen sesión (van dentro
// de <PrivateRoute />).
//
// El bloque /admin exige sesión + rol administrador (AdminRoute) y monta
// AdminLayout (Sidebar + Topbar) para todas sus rutas hijas. Las páginas
// admin (Productos, Inventario, etc.) todavía no tienen datos reales;
// eso se conecta módulo por módulo.
function AppRoutes() {
  return (
    <Routes>
      <Route element={<ClienteLayout />}>
        <Route path="/" element={<Home productosDestacados={[]} />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/producto/:id" element={<DetalleProducto />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        <Route element={<PrivateRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/mis-pedidos" element={<MisPedidos />} />
          <Route path="/mis-pedidos/:id" element={<DetallePedido />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/productos" element={<Productos />} />
          <Route path="/admin/categorias" element={<Categorias />} />
          <Route path="/admin/proveedores" element={<Proveedores />} />
          <Route path="/admin/inventario" element={<Inventario />} />
          <Route path="/admin/movimientos" element={<MovInventario />} />
          <Route path="/admin/pedidos" element={<Pedidos />} />
          <Route path="/admin/pagos" element={<Pagos />} />
          <Route path="/admin/envios" element={<Envios />} />
          <Route path="/admin/usuarios" element={<Usuario />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;