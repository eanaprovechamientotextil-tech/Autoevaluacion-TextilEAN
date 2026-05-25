import { createClient } from "@/lib/supabase/server";

export default async function TestSupabasePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("companies").select("*").limit(5);

  return (
    <main className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Prueba Supabase</h1>

      {error && (
        <pre className="rounded-md bg-red-100 p-4 text-red-700">
          {error.message}
        </pre>
      )}

      {!error && (
        <pre className="rounded-md bg-muted p-4">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  );
}