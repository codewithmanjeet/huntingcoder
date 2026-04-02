import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    // 🔐 AUTH CHECK
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return Response.json({ error: "Invalid user" }, { status: 401 });
    }

    // 📦 BODY
    const { course } = await req.json();

    if (!course) {
      return Response.json({ error: "Course required" }, { status: 400 });
    }

    // ✅ PURCHASE CHECK (FIXED)
    const { data, error } = await supabase
      .from("purchases") // ✅ NO SPACE
      .select("id")
      .eq("user_email", user.email)
      .eq("course", course)
      .maybeSingle();

    if (error || !data) {
      return Response.json({ error: "Not purchased" }, { status: 403 });
    }

    // 🔥 DYNAMIC FILE (IMPORTANT)
    const filePath = `${course}.zip`;

    // 🔐 SIGNED URL
    const { data: urlData, error: urlError } = await supabase.storage
      .from("courses")
      .createSignedUrl(filePath, 60);

    if (urlError || !urlData) {
      return Response.json({ error: "File not found" }, { status: 404 });
    }

    return Response.json({
      url: urlData.signedUrl,
    });

  } catch (err) {
    console.error("Download API Error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}