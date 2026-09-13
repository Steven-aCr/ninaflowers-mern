import { useEffect, useState } from "react";

// Retrasa la actualización de un valor hasta que el usuario deja de escribir
// durante "delay" ms. Se usa en el buscador del catálogo para no re-filtrar
// en cada tecla presionada.
export function useDebounce(valor, delay = 400) {
  const [valorDebounced, setValorDebounced] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setValorDebounced(valor);
    }, delay);

    // Si "valor" cambia antes de que se cumpla el delay, se cancela
    // el temporizador anterior (por eso no se filtra en cada letra).
    return () => clearTimeout(temporizador);
  }, [valor, delay]);

  return valorDebounced;
}
