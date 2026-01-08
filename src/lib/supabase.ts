// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Usamos import.meta.env de Astro para leer las variables
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Validación defensiva: Si faltan las llaves, el sitio "chilla" en desarrollo
// en lugar de fallar silenciosamente con errores raros de red.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "❌ Faltan las variables de entorno de Supabase. Revisa tu archivo .env",
  );
}

// Exportamos el cliente instanciado listo para usar
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
