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
    } = await supabase.auth.getUser(token);

    if (!user) {
      return Response.json({ error: "User not found" });
    }

    const { course } = await req.json();

    // ✅ CHECK PURCHASE USING EMAIL
    const { data } = await supabase
      .from("purchases")
      .select("*")
      .eq("user_email", user.email) // 🔥 IMPORTANT CHANGE
      .eq("course", course)
      .single();

    if (!data) {
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