import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const token = req.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  if (!user) {
    return Response.json({ error: "Invalid user" }, { status: 401 });
  }

  const { course } = await req.json();

  // 🔥 CHECK PURCHASE
  const { data } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", user.id)
    .eq("course", course)
    .single();

  if (!data) {
    return Response.json({ error: "You have not purchased this course ❌" });
  }

  // 🔥 SECURE DOWNLOAD LINK (EXPIRES)
  const { data: file } = await supabase.storage
    .from("courses")
    .createSignedUrl("course/courses.zip", 60); // 🔥 60 sec valid

  return Response.json({ url: file.signedUrl });
}