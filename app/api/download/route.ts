import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: Request): Promise<Response> {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "please login first" }), {
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // 🔐 USER CHECK
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "please login first" }), {
        status: 401,
      });
    }

    const { course } = await req.json();

    // ✅ PURCHASE CHECK
    const { data } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_email", user.email)
      .eq("course", course)
      .maybeSingle();

    if (!data) {
      return new Response(JSON.stringify({ error: "Not purchased" }), {
        status: 403,
      });
    }

    // 🔥 FILE LIST (images)
    const files = [
      "course/html1.jpeg",
      "course/html2.jpeg",
      "course/html3.jpeg",
      "course/html4.jpeg",
    ];

    const urls: string[] = [];

    for (const file of files) {
      const { data: urlData } = await supabase.storage
        .from("courses")
        .createSignedUrl(file, 60);

      if (urlData?.signedUrl) {
        urls.push(urlData.signedUrl);
      }
    }

    return new Response(JSON.stringify({ files: urls }), {
      status: 200,
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "server error" }), {
      status: 500,
    });
  }
}