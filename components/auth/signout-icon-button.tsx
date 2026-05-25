"use client";

import { createClient } from "@/lib/supabase/client";
import { APP_ROUTES } from "@/src/constants/routes";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function SignoutIconButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(APP_ROUTES.login);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      aria-label="Cerrar sesión"
      title="Cerrar sesión"
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--outline)] bg-white text-slate-700 transition hover:bg-slate-50"
    >
      <LogOutIcon className="h-4 w-4" />
    </button>
  );
}
