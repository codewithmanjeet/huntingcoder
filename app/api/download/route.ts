import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error("Missing Supabase ENV variables");
}

const supabase = createClient(supabaseUrl, serviceKey);

// ✅ NO TYPE ERROR VERSION
export async function POST(req: any) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // 🔐 USER CHECK
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid user" }),
        { status: 401 }
      );
    }

    const body = await req.json();
    const { course } = body;

    if (!course) {
      return new Response(
        JSON.stringify({ error: "Course required" }),
        { status: 400 }
      );
    }

    // ✅ PURCHASE CHECK
    const { data } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_email", user.email)
      .eq("course", course)
      .maybeSingle();

    if (!data) {
      return new Response(
        JSON.stringify({ error: "Not purchased" }),
        { status: 403 }
      );
    }

    // 📦 FILE NAME
    const filePath = `${course}.zip`;

    // 🔐 SIGNED URL (60 sec)
    const { data: urlData, error: urlError } = await supabase.storage
      .from("courses")
      .createSignedUrl(filePath, 60);

    if (urlError || !urlData) {
      return new Response(
        JSON.stringify({ error: "File not found" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ url: urlData.signedUrl }),
      { status: 200 }
    );

  } catch (err) {
    console.error("Download API Error:", err);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );
  }
}