import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return Response.json({ error: "No token" });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return Response.json({ error: "User not found" });
    }

    const { course } = await req.json();

    const { data, error } = await supabase
      .from("purchases")
      .select("*")
      .eq("user_id", user.id)
      .eq("course", course)
      .single();

    if (error || !data) {
      return Response.json({ error: "Not purchased ❌" });
    }

    const { data: file } = await supabase.storage
      .from("courses")
      .createSignedUrl("course/courses.zip", 60);

    return Response.json({ url: file.signedUrl });

  } catch (err) {
    console.log(err);
    return Response.json({ error: "Server error" });
  }
}