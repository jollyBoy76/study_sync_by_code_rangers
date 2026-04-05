import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase.server";

// ─── Root Page ────────────────────────────────────────────────────────────────
//
//  "/" has no UI of its own. We check the session server-side and send the
//  user to the right place immediately:
//
//    authenticated  →  /dashboard
//    unauthenticated →  /login
//
//  This avoids a client-side flash where the user briefly sees a blank page
//  or the wrong route before auth state is known.
// ─────────────────────────────────────────────────────────────────────────────

export default async function RootPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}