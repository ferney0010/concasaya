import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm";

const supabaseUrl = "https://ljaatvhjstfdriiqapme.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYWF0dmhqc3RmZHJpaXFhcG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MTc1OTQsImV4cCI6MjA2MDA5MzU5NH0.CbkqsKpgBUCNyFYPx7qGMPXMKjlLPWyYWWEmIDTw8Kc";

let supabase;

try {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Faltan las credenciales de Supabase");
  }
  
  if (typeof createClient !== 'function') {
    throw new Error("createClient no está disponible. El módulo de Supabase no se cargó correctamente.");
  }
  
  supabase = createClient(supabaseUrl, supabaseKey);
  
  if (!supabase) {
    throw new Error("createClient devolvió null o undefined");
  }
  
  if (!supabase.auth) {
    throw new Error("El cliente de Supabase no tiene la propiedad 'auth'");
  }
  
  console.log("Supabase inicializado correctamente");
} catch (error) {
  console.error("Error al inicializar Supabase:", error);
  // Crear un objeto mock para evitar errores en cascada
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: error }),
      signInWithPassword: () => Promise.resolve({ error: error }),
      signOut: () => Promise.resolve({ error: error })
    },
    from: () => ({ select: () => ({ order: () => Promise.resolve({ data: null, error: error }) }) }),
    storage: { from: () => ({ upload: () => Promise.resolve({ error: error }) }) }
  };
}

export { supabase };
