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

    // ✅ Check purchase
    const { data } = await supabase
      .from("purchases")
      .select("*")
      .eq("user_email", user.email)
      .eq("course", course);

    if (!data || data.length === 0) {
      return Response.json({ error: "Not purchased" });
    }

    // 🔥 Dynamic file mapping (more secure)
    const fileMap = {
      html: "html-course.zip",
      css: "css-course.zip",
      js: "js-course.zip",
    };

    const fileName = fileMap[course];

    if (!fileName) {
      return Response.json({ error: "Invalid course" });
    }

    // ✅ Signed URL (short expiry)
    const { data: file } = await supabase.storage
      .from("courses")
      .createSignedUrl(fileName, 30); // 30 sec only

    return Response.json({ url: file.signedUrl });

  } catch (err) {
    return Response.json({ error: err.message });
  }
}