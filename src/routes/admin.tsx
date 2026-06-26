import React, { useState, useEffect } from "react";
import { createRoute, createRootRoute } from "@tanstack/react-router";
import { 
  adminListLetters, 
  adminSetStatus, 
  adminSetFeatured, 
  adminDeleteLetter,
  verifyAdmin 
} from "@/lib/admin.functions";

type Letter = {
  id: string;
  author_name: string;
  country: string | null;
  city: string | null;
  content: string;
  created_at: string;
  status: string;
  featured: boolean;
};

// Definición segura de la ruta raíz para evitar errores de importación
const rootRoute = createRootRoute();

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminRoute,
});

function AdminRoute() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [filterStatus, setFilterStatus] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedLetterId, setExpandedLetterId] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      // Corrección: Pasamos el objeto directamente sin envolverlo en 'data'
      const res = await verifyAdmin({ password });
      if (res.ok) {
        setIsAuthenticated(true);
        loadLetters();
      }
    } catch (err: any) {
      setError(err.message || "Contraseña incorrecta");
    }
  };

  const loadLetters = async () => {
    setLoading(true);
    try {
      // Corrección: Quitamos el envoltorio 'data'
      const data = await adminListLetters({ password, status: filterStatus });
      setLetters(data as Letter[]);
    } catch (err: any) {
      setError(err.message || "Error al cargar cartas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadLetters();
    }
  }, [filterStatus, isAuthenticated]);

  const handleStatusChange = async (id: string, status: "pending" | "approved" | "rejected") => {
    try {
      // Corrección: Quitamos el envoltorio 'data'
      await adminSetStatus({ password, id, status });
      if (expandedLetterId === id) setExpandedLetterId(null);
      loadLetters();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleFeaturedChange = async (id: string, featured: boolean) => {
    try {
      // Corrección: Quitamos el envoltorio 'data'
      await adminSetFeatured({ password, id, featured });
      loadLetters();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar permanentemente esta carta?")) return;
    try {
      // Corrección: Quitamos el envoltorio 'data'
      await adminDeleteLetter({ password, id });
      if (expandedLetterId === id) setExpandedLetterId(null);
      loadLetters();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedLetterId(expandedLetterId === id ? null : id);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px", fontFamily: "sans-serif", border: "1px solid #ccc", borderRadius: "8px", position: "relative", zIndex: 20, backgroundColor: "white" }}>
        <h2 style={{ textAlign: "center" }}>Panel de Administración</h2>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: "10px", fontSize: "16px", borderRadius: "4px", border: "1px solid #aaa" }} />
          <button type="submit" style={{ padding: "10px", fontSize: "16px", background: "#0070f3", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Ingresar</button>
        </form>
        {error && <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px", fontFamily: "sans-serif", position: "relative", zIndex: 20, backgroundColor: "white", borderRadius: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
        <h2 style={{ margin: 0 }}>Moderación de Cartas</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          {(["pending", "approved", "rejected", "all"] as const).map((status) => (
            <button key={status} onClick={() => setFilterStatus(status)} style={{ padding: "8px 12px", borderRadius: "4px", border: "1px solid #ccc", cursor: "pointer", background: filterStatus === status ? "#222" : "#fff", color: filterStatus === status ? "#fff" : "#222" }}>
              {status === "pending" ? "Pendientes" : status === "approved" ? "Aprobadas" : status === "rejected" ? "Rechazadas" : "Todas"}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p style={{ textAlign: "center" }}>Cargando...</p> : letters.length === 0 ? <p>No hay cartas.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {letters.map((letter) => (
            <div key={letter.id} style={{ border: "1px solid #e1e1e1", borderRadius: "6px" }}>
              <div onClick={() => toggleExpand(letter.id)} style={{ padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                <strong>{letter.author_name}</strong>
                <span>{expandedLetterId === letter.id ? "▲ Cerrar" : "▼ Ver"}</span>
              </div>
              {expandedLetterId === letter.id && (
                <div style={{ padding: "16px", borderTop: "1px solid #eee" }}>
                  <p style={{ whiteSpace: "pre-wrap" }}>{letter.content}</p>
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button onClick={() => handleStatusChange(letter.id, "approved")} style={{ padding: "6px 12px", cursor: "pointer", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px" }}>Aprobar</button>
                    <button onClick={() => handleStatusChange(letter.id, "rejected")} style={{ padding: "6px 12px", cursor: "pointer", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px" }}>Rechazar</button>
                    <button onClick={() => handleDelete(letter.id)} style={{ padding: "6px 12px", cursor: "pointer", backgroundColor: "#343a40", color: "white", border: "none", borderRadius: "4px" }}>Eliminar</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}