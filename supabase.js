import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://jecatujziyybwubikulz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplY2F0dWp6aXl5Ynd1YmlrdWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwNDY4MjksImV4cCI6MjAyMzYyMjgyOX0._Hz16c-LDmguqHINmks8paG7RvPBlXUs_VFOG6h-wCg"
);
