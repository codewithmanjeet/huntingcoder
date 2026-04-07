import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    // 🔒 AUTH CHECK
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

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

    // 🔒 COURSE VALIDATION + FILE MAP
    const courseFiles = {
      HTML: "course/html-course.zip",
      // future:
      // CSS: "course/css-course.zip",
      // JS: "course/js-course.zip",
    };

    const filePath = courseFiles[course];

    if (!filePath) {
      return Response.json({ error: "Invalid course" }, { status: 400 });
    }

    // 🔐 PURCHASE CHECK (USE user_id 🔥)
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("course", course)
      .single();

    if (purchaseError || !purchase) {
      return Response.json({ error: "Not purchased ❌" }, { status: 403 });
    }

    // 🔥 SIGNED URL (SHORT EXPIRY)
    const { data: file, error: fileError } = await supabase.storage
      .from("courses")
      .createSignedUrl(filePath, 30); // ⏱️ 30 sec

    if (fileError || !file) {
      return Response.json({ error: "File error" }, { status: 500 });
    }

    return Response.json({ url: file.signedUrl });

  } catch (err) {
    console.log("DOWNLOAD ERROR:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}