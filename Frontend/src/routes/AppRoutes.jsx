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

// Todavía sin datos reales: Home, Catalogo, DetalleProducto, MisPedidos y
// DetallePedido siguen recibiendo props vacías/null hasta que conectemos
// productoService/categoriaService/pedidoService. Cuando eso pase, cada
// página hará su propio fetch en un useEffect (ya leen su :id con
// useParams donde corresponde).
//
// Checkout, MisPedidos, DetallePedido y Perfil exigen sesión (van dentro
// de <PrivateRoute />) — como el login todavía no está conectado al
// backend, hoy son inalcanzables hasta pasar por /login o /registro en la
// misma sesión del navegador. AdminRoute se agrega junto con el módulo de
// administrador, que todavía no existe.
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
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
