// Reemplazo limpio y libre de código de servidor
export const requireSupabaseAuth = ({ next }: any) => {
  // En el cliente (SPA) pasamos de largo sin usar APIs de Node.js
  return typeof next === 'function' ? next() : null;
};