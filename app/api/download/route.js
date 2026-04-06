import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const token = req.headers.get("authorization")?.split(" ")[1];

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  const { course } = await req.json();

  const { data } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", user.id)
    .eq("course", course)
    .single();

  if (!data) {
    return Response.json({ error: "Not purchased ❌" });
  }

  const { data: file } = await supabase.storage
    .from("courses")
    .createSignedUrl("course/courses.zip", 60);

  return Response.json({ url: file.signedUrl });
}