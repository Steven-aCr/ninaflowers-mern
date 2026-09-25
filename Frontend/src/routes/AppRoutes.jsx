import { Routes, Route } from "react-router-dom";
import ClienteLayout from "../layouts/ClienteLayout.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import PrivateRoute from "./PrivateRoutes.jsx";
import AdminRoute from "./AdminRoute.jsx";
import Login from "../pages/cliente/Login.jsx";
import Registro from "../pages/cliente/Registro.jsx";
import Home from "../pages/cliente/Home.jsx";
import Catalogo from "../pages/cliente/Catalogo.jsx";
import DetalleProducto from "../pages/cliente/DetalleProducto.jsx";
import Carrito from "../pages/cliente/Carrito.jsx";
import Checkout from "../pages/cliente/Checkout.jsx";
import MisPedidos from "../pages/cliente/MisPedidos.jsx";
import DetallePedido from "../pages/cliente/DetallePedido.jsx";
import Perfil from "../pages/cliente/Perfil.jsx";
import PagoExitoso from "../pages/cliente/PagoExitoso.jsx";
import PagoCancelado from "../pages/cliente/PagoCancelado.jsx";
import Dashboard from "../pages/admin/Dashboard.jsx";
import Usuario from "../pages/admin/Usuario.jsx";
import Categorias from "../pages/admin/Categorias.jsx";
import Productos from "../pages/admin/Productos.jsx";
import Proveedores from "../pages/admin/Proveedores.jsx";
import Inventario from "../pages/admin/Inventario.jsx";
import MovInventario from "../pages/admin/MovInventario.jsx";
import Pagos from "../pages/admin/pagos.jsx";
import Pedidos from "../pages/admin/Pedidos.jsx";
import Envios from "../pages/admin/Envios.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<ClienteLayout />}>
        <Route path="/" element={<Home productosDestacados={[]} />} />
        <Route path="/catalogo" element={<Catalogo productos={[]} categorias={[]} />} />
        <Route path="/producto/:id" element={<DetalleProducto producto={null} />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        <Route element={<PrivateRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/mis-pedidos" element={<MisPedidos pedidos={[]} />} />
          <Route path="/mis-pedidos/:id" element={<DetallePedido pedido={null} />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/pago/exito" element={<PagoExitoso />} />
          <Route path="/pago/cancelado" element={<PagoCancelado />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="usuarios" element={<Usuario />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="productos" element={<Productos />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="movimientos" element={<MovInventario />} />
          <Route path="pagos" element={<Pagos />} />
          <Route path="envios" element={<Envios />} />
          <Route path="pedidos" element={<Pedidos />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;