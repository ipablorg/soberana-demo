import { useEffect } from 'react';

/**
 * ForceLightTheme — obliga al `<html>` a estar en `light` mientras el
 * hijo esté montado. Al desmontar restaura la clase de tema previa.
 *
 * No persiste en `localStorage` (no queremos sobreescribir la
 * preferencia del usuario): solo manipula la clase del documento
 * durante la vida del árbol que envuelve. Funciona en concierto con
 * `ThemeProvider` — si el usuario toggle-a el tema mientras está aquí,
 * `ThemeProvider` ganará en el próximo render; el dashboard es una
 * superficie "locked-light" por diseño (la VirtualCard, la Dynamic
 * Island y el gradient fueron calibrados para light mode), así que el
 * trade-off es aceptado: el usuario puede toggler pero el efecto solo
 * se verá al salir de la ruta.
 */
export function ForceLightTheme({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const root = window.document.documentElement;
    const hadDark = root.classList.contains('dark');
    root.classList.remove('dark');
    root.classList.add('light');
    return () => {
      root.classList.remove('light');
      if (hadDark) root.classList.add('dark');
    };
  }, []);
  return <>{children}</>;
}
