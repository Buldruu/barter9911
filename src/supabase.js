import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://lmukbaozrjtbgoliqwjg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdWtiYW96cmp0YmdvbGlxd2pnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzEzNDU3NCwiZXhwIjoyMDg4NzEwNTc0fQ.18niDu3sJ7fi7WAVh6o4jKAJVP6WNjXl4afy7gu4lcs",
);
