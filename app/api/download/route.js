import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return Response.json({ error: "Invalid user" }, { status: 401 });
    }

    const { course } = await req.json();

    // 🔒 payment check
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("user_email", user.email)
      .eq("course", course);

    if (!data || data.length === 0) {
      return Response.json({ error: "Not purchased" }, { status: 403 });
    }

    // 🔥 FIXED SIGNED URL
    const { data: fileData, error } = await supabase.storage
      .from("courses")
      .createSignedUrl("courses.zip", 60); // ✅ FIX

    if (error) {
      return Response.json({ error: "File error" }, { status: 500 });
    }

    return Response.json({
      success: true,
      url: fileData.signedUrl,
    });

  } catch (err) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}