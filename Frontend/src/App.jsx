import AppRoutes from "./routes/AppRoutes.jsx";
import { CarritoProvider } from "./context/CarritoContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./styles/reset.css";
import "./styles/variables.css";
import "./styles/global.css";
import "./App.css";

// App.jsx ya no arma la pantalla a mano: todo el "qué se ve dónde" vive en
// AppRoutes.jsx (y en ClienteLayout.jsx, que pone Navbar/Footer).
// AuthProvider va por fuera de CarritoProvider porque, a futuro, el
// carrito podría necesitar saber quién es el usuario (para sincronizar
// contra carritoService); no es indispensable ahora, pero es el orden que
// menos hay que tocar después.
function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <AppRoutes />
      </CarritoProvider>
    </AuthProvider>
  );
}

export default App;
