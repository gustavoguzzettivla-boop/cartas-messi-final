import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { franc } from 'franc';
import { translate } from 'google-translate-api-x';

export const letterSchema = z.object({
  author_name: z
    .string()
    .trim()
    .min(1, "Tu nombre no puede estar vacío")
    .max(80, "Máximo 80 caracteres"),
  country: z.string().trim().max(60).optional().or(z.literal("")),
  city: z.string().trim().max(60).optional().or(z.literal("")),
  content: z
    .string()
    .trim()
    .min(10, "Tu carta es demasiado corta (mínimo 10 caracteres)")
    .max(5000, "Tu carta es demasiado larga (máximo 5000 caracteres)"),
});

export type LetterInput = z.infer<typeof letterSchema>;

export type Letter = {
  id: string;
  author_name: string;
  country: string | null;
  city: string | null;
  content: string;
  content_es: string | null; // Nuevo campo agregado
  created_at: string;
  status?: string;
  featured?: boolean;
  nextId?: string | null;
  prevId?: string | null;
};

// Función interna de traducción
async function traducirTexto(texto: string): Promise<string> {
  try {
    const res = await translate(texto, { from: 'auto', to: 'es' });
    return res.text;
  } catch (err) {
    console.error("Error al traducir:", err);
    return texto; 
  }
}

export async function fetchLetters(limit = 50): Promise<Letter[]> {
  const { data, error } = await supabase
    .from("letters")
    .select("id, author_name, country, city, content, content_es, created_at, status")
    .eq("status", "approved") 
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Letter[];
}

export async function fetchFeaturedLetters(limit = 3): Promise<Letter[]> {
  const { data, error } = await supabase
    .from("letters")
    .select("id, author_name, country, city, content, content_es, created_at, featured, status")
    .eq("featured", true)
    .eq("status", "approved") 
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Letter[];
}

export async function fetchLetter(id: string): Promise<Letter | null> {
  const { data: currentLetter, error } = await supabase
    .from("letters")
    .select("id, author_name, country, city, content, content_es, created_at, status")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();

  if (error) throw error;
  if (!currentLetter) return null;

  const { data: nextData } = await supabase
    .from("letters")
    .select("id")
    .eq("status", "approved")
    .gt("created_at", currentLetter.created_at)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: prevData } = await supabase
    .from("letters")
    .select("id")
    .eq("status", "approved")
    .lt("created_at", currentLetter.created_at)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    ...(currentLetter as Letter),
    nextId: nextData?.id || null,
    prevId: prevData?.id || null,
  };
}

export async function fetchLettersCount(): Promise<number> {
  const { count, error } = await supabase
    .from("letters")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved"); 
  if (error) throw error;
  return count ?? 0;
}

export async function fetchCountriesCount(): Promise<number> {
  const { data, error } = await supabase
    .from("letters")
    .select("country")
    .eq("status", "approved") 
    .not("country", "is", null);
  if (error) throw error;
  const set = new Set(
    (data ?? []).map((r) => (r.country ?? "").trim().toLowerCase()).filter(Boolean),
  );
  return set.size;
}

export async function createLetter(input: LetterInput) {
  const parsed = letterSchema.parse(input);
  
  let userIp = "unknown";
  let finalStatus = "approved";
  let moderationNotes = "";

  // Lógica de traducción automática
  const idioma = franc(parsed.content);
  let content_es = idioma === 'spa' ? null : await traducirTexto(parsed.content);

  try {
    const ipResponse = await fetch("https://api.ipify.org?format=json");
    if (ipResponse.ok) {
      const ipData = await ipResponse.json();
      userIp = ipData.ip;
    }

    if (userIp !== "unknown") {
      const { count, error: countError } = await supabase
        .from("letters")
        .select("*", { count: "exact", head: true })
        .eq("user_ip", userIp);

      if (!countError && count && count > 0) {
        finalStatus = "pending";
        moderationNotes = "IP repetida. Requiere revisión manual.";
      }
    }

    if (finalStatus === "approved") {
      const contieneLenguajeInadecuado = evaluarFiltroInapropiado(parsed.content);
      if (contieneLenguajeInadecuado) {
        finalStatus = "pending";
        moderationNotes = "Lenguaje inadecuado/Sospechoso detectado.";
      }
    }
  } catch (e) {
    console.error("Error en validación automatizada:", e);
  }

  const payload = {
    author_name: parsed.author_name,
    country: parsed.country ? parsed.country : null,
    city: parsed.city ? parsed.city : null,
    content: parsed.content,
    content_es: content_es, // Guardamos la traducción
    status: finalStatus, 
    featured: false,
    user_ip: userIp,
    moderation_notes: moderationNotes
  };

  const { error } = await supabase.from("letters").insert(payload);
  if (error) throw error;
  return { ok: true, status: finalStatus };
}

function evaluarFiltroInapropiado(texto: string): boolean {
  const malasPalabras = ["insulto1", "insulto2", "casino", "crypto", "bet", "compra"]; 
  const contenidoEnMinuscula = texto.toLowerCase();
  return malasPalabras.some(palabra => contenidoEnMinuscula.includes(palabra));
}

export function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export async function incrementarVisitasServidor() {
  if (!supabase) return 1; 
  try {
    const { data, error } = await (supabase as any).rpc("incrementar_visitas");
    if (!error && data !== null) return data;
    const { data: fallbackData } = await supabase
      .from("visitas")
      .select("contador")
      .eq("id", "global")
      .maybeSingle();
    return fallbackData?.contador || 1;
  } catch (e) {
    console.error(e);
    return 1;
  }
}