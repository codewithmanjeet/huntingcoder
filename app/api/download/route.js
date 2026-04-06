import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return Response.json({ error: "No token" });
    }

    const token = authHeader.split(" ")[1];

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return Response.json({ error: "User not found" });
    }

    const { course } = await req.json();

    const { data } = await supabase
      .from("purchases")
      .select("*")
      .eq("user_email", user.email)
      .eq("course", course)
      .single();

    if (!data) {
      return Response.json({ error: "Not purchased" });
    }

    const { data: file } = await supabase.storage
      .from("courses")
      .createSignedUrl("course/html-course.zip", 60);

    return Response.json({ url: file.signedUrl });

  } catch (err) {
    console.log("DOWNLOAD ERROR:", err);
    return Response.json({ error: "Server error" });
  }
}