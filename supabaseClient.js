import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://ljaatvhjstfdriiqapme.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYWF0dmhqc3RmZHJpaXFhcG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MTc1OTQsImV4cCI6MjA2MDA5MzU5NH0.CbkqsKpgBUCNyFYPx7qGMPXMKjlLPWyYWWEmIDTw8Kc";

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
