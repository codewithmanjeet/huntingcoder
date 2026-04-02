import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // 🔥 server only
);

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // ✅ user verify
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return Response.json({ error: "Invalid user" }, { status: 401 });
    }

    const { course } = await req.json();

    if (!course) {
      return Response.json({ error: "Course required" }, { status: 400 });
    }

    // ✅ check purchase
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_email", user.email)
      .eq("course", course)
      .single();

    if (error || !data) {
      return Response.json(
        { error: "You have not purchased this course" },
        { status: 403 }
      );
    }

    // 🔥 signed URL generate (SECURE)
    const { data: signedUrlData, error: urlError } =
      await supabase.storage
        .from("courses")
        .createSignedUrl("course.zip", 60); // 60 sec valid

    if (urlError) {
      return Response.json({ error: "URL error" }, { status: 500 });
    }

    return Response.json({
      success: true,
      url: signedUrlData.signedUrl,
    });

  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}