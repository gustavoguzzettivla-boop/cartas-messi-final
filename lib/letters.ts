// @ts-nocheck
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { franc } from 'franc';
import { translate } from 'google-translate-api-x';

export const letterSchema = z.object({
  author_name: z.string().trim().min(1, "Tu nombre no puede estar vacío").max(80),
  country: z.string().trim().max(60).optional().or(z.literal("")),
  city: z.string().trim().max(60).optional().or(z.literal("")),
  content: z.string().trim().min(10, "Tu carta es demasiado corta").max(5000),
});

export type LetterInput = z.infer<typeof letterSchema>;

export type Letter = {
  id: string;
  author_name: string;
  country: string | null;
  city: string | null;
  content: string;
  content_es: string | null;
  created_at: string;
  status?: string;
  featured?: boolean;
  nextId?: string | null;
  prevId?: string | null;
};

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
    // Le pasamos "as any" al string para que no valide las columnas
    .select("id, author_name, country, city, content, content_es, created_at, status" as any)
    .eq("status", "approved") 
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  // Doble validación para forzar la conversión
  return (data as any) as Letter[];
}

export async function fetchFeaturedLetters(limit = 3): Promise<Letter[]> {
  const { data, error } = await supabase
    .from("letters")
    .select("id, author_name, country, city, content, content_es, created_at, featured, status" as any)
    .eq("featured", true)
    .eq("status", "approved") 
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as any) as Letter[];
}

export async function fetchLetter(id: string): Promise<Letter | null> {
  const { data: currentLetterData, error } = await supabase
    .from("letters")
    .select("id, author_name, country, city, content, content_es, created_at, status" as any)
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();

  if (error) throw error;
  if (!currentLetterData) return null;

  // Convertimos a any para que no rompa al buscar currentLetter.created_at (líneas 66 y 75)
  const currentLetter = currentLetterData as any;

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
    ...currentLetter,
    nextId: nextData?.id || null,
    prevId: prevData?.id || null,
  } as Letter;
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
    (data ?? []).map((r: any) => (r.country ?? "").trim().toLowerCase()).filter(Boolean),
  );
  return set.size;
}

export async function createLetter(input: LetterInput) {
  const parsed = letterSchema.parse(input);
  let userIp = "unknown";
  let finalStatus = "approved";
  let moderationNotes = "";

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
        moderationNotes = "IP repetida.";
      }
    }

    if (finalStatus === "approved") {
      const contieneLenguajeInadecuado = evaluarFiltroInapropiado(parsed.content);
      if (contieneLenguajeInadecuado) {
        finalStatus = "pending";
        moderationNotes = "Lenguaje inadecuado.";
      }
    }
  } catch (e) {
    console.error(e);
  }

  const payload = { ...parsed, content_es, status: finalStatus, featured: false, user_ip: userIp, moderation_notes: moderationNotes };
  // Insertamos como "any" para que tampoco restrinja las columnas nuevas
  const { error } = await supabase.from("letters").insert(payload as any);
  if (error) throw error;
  return { ok: true, status: finalStatus };
}

function evaluarFiltroInapropiado(texto: string): boolean {
  const malasPalabras = ["insulto1", "insulto2", "casino", "crypto", "bet", "compra"]; 
  return malasPalabras.some(palabra => texto.toLowerCase().includes(palabra));
}

export function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
  } catch { return iso; }
}

export async function incrementarVisitasServidor() {
  if (!supabase) return 1; 
  try {
    const { data, error } = await supabase.rpc("incrementar_visitas");
    if (!error && data !== null) return data;
    const { data: fallbackData } = await supabase.from("visitas").select("contador").eq("id", "global").maybeSingle();
    return fallbackData?.contador || 1;
  } catch (e) {
    console.error(e);
    return 1;
  }
}