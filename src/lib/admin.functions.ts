import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

// 👇 misma validación de password pero en cliente
const passwordSchema = z.object({ password: z.string().min(1) });

function checkPassword(password: string) {
  const expected = import.meta.env.VITE_ADMIN_PASSWORD || "gusvalen2026";
  if (password !== expected) throw new Error("Clave incorrecta");
}

// -------------------------
// VERIFY ADMIN
// -------------------------
export async function verifyAdmin(input: unknown) {
  const data = passwordSchema.parse(input);
  checkPassword(data.password);
  return { ok: true };
}

// -------------------------
// LIST LETTERS
// -------------------------
export async function adminListLetters(input: unknown) {
  const schema = passwordSchema.extend({
    status: z.enum(["pending", "approved", "rejected", "all"]).default("pending"),
  });

  const data = schema.parse(input);
  checkPassword(data.password);

  let query = supabase
    .from("letters")
    .select("id, author_name, country, city, content, created_at, status, featured")
    .order("created_at", { ascending: false });

  if (data.status !== "all") {
    query = query.eq("status", data.status);
  }

  const { data: rows, error } = await query;

  if (error) throw new Error(error.message);
  return rows ?? [];
}

// -------------------------
// SET STATUS
// -------------------------
export async function adminSetStatus(input: unknown) {
  const schema = passwordSchema.extend({
    id: z.string().uuid(),
    status: z.enum(["pending", "approved", "rejected"]),
  });

  const data = schema.parse(input);
  checkPassword(data.password);

  const { error } = await supabase
    .from("letters")
    .update({ status: data.status })
    .eq("id", data.id);

  if (error) throw new Error(error.message);

  return { ok: true };
}

// -------------------------
// SET FEATURED
// -------------------------
export async function adminSetFeatured(input: unknown) {
  const schema = passwordSchema.extend({
    id: z.string().uuid(),
    featured: z.boolean(),
  });

  const data = schema.parse(input);
  checkPassword(data.password);

  const { error } = await supabase
    .from("letters")
    .update({ featured: data.featured })
    .eq("id", data.id);

  if (error) throw new Error(error.message);

  return { ok: true };
}

// -------------------------
// DELETE LETTER
// -------------------------
export async function adminDeleteLetter(input: unknown) {
  const schema = passwordSchema.extend({
    id: z.string().uuid(),
  });

  const data = schema.parse(input);
  checkPassword(data.password);

  const { error } = await supabase
    .from("letters")
    .delete()
    .eq("id", data.id);

  if (error) throw new Error(error.message);

  return { ok: true };
}   