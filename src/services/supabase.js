import { createClient } from "@supabase/supabase-js";

// Browser client: anon key only. Used for admin sign-in; all other data goes through the Express API.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || ""
);
