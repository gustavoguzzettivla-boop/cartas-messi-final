import React, { useState, useEffect } from "react";
import { createRoute } from "@tanstack/react-router";
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

// Vinculamos el componente con el sistema de rutas de TanStack
export const Route = createRoute({
  getParentRoute: () => window.__tanstack_root_route || (globalThis as any).__tanstack_root_route, // fallback dinámico para vincular con la ruta raíz
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
  
  // Controla cuál carta se abre individualmente
  const [expandedLetterId, setExpandedLetterId] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await verifyAdmin({ data: { password } });
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
      const data = await adminListLetters({ data: { password, status: filterStatus } });
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
    setLoading(true);
    try {
      await adminSetStatus({ data: { password, id, status } });
      if (expandedLetterId === id) setExpandedLetterId(null);
      await loadLetters();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturedChange = async (id: string, featured: boolean) => {
    setLoading(true);
    try {
      await adminSetFeatured({ data: { password, id, featured } });
      await loadLetters();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar permanentemente esta carta?")) return;
    setLoading(true);
    try {
      await adminDeleteLetter({ data: { password, id } });
      if (expandedLetterId === id) setExpandedLetterId(null);
      await loadLetters();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedLetterId(expandedLetterId === id ? null : id);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px", fontFamily: "sans-serif", border: "1px solid #ccc", borderRadius: "8px" }}>
        <h2 style={{ textAlign: "center" }}>Panel de Administración</h2>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="password"
            placeholder="Introduce la contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "10px", fontSize: "16px", borderRadius: "4px", border: "1px solid #aaa" }}
          />
          <button type="submit" style={{ padding: "10px", fontSize: "16px", background: "#0070f3", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Ingresar
          </button>
        </form>
        {error && <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
        <h2 style={{ margin: 0 }}>Moderación de Cartas</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          {(["pending", "approved", "rejected", "all"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                cursor: "pointer",
                background: filterStatus === status ? "#222" : "#fff",
                color: filterStatus === status ? "#fff" : "#222",
                fontWeight: filterStatus === status ? "bold" : "normal"
              }}
            >
              {status === "pending" && "Pendientes"}
              {status === "approved" && "Aprobadas"}
              {status === "rejected" && "Rechazadas"}
              {status === "all" && "Todas"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", fontSize: "18px" }}>Cargando cartas...</p>
      ) : letters.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666", padding: "40px", border: "1px dashed #ccc" }}>No hay cartas en este estado.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {letters.map((letter) => {
            const isExpanded = expandedLetterId === letter.id;
            return (
              <div 
                key={letter.id} 
                style={{ 
                  border: "1px solid #e1e1e1", 
                  borderRadius: "6px", 
                  background: isExpanded ? "#f9f9f9" : "#fff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}
              >
                {/* FILA DE UNA LÍNEA */}
                <div 
                  onClick={() => toggleExpand(letter.id)}
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: "12px 16px", 
                    cursor: "pointer",
                    userSelect: "none"
                  }}
                >
                  <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                    <strong style={{ minWidth: "140px" }}>{letter.author_name}</strong>
                    <span style={{ color: "#666", fontSize: "14px" }}>
                      {letter.city ? `${letter.city}, ` : ""}{letter.country || "Pa