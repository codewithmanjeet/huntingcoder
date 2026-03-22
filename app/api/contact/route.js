import { createClient } from "@supabase/supabase-js";

// ✅ Create Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ✅ POST API
export async function POST(req) {
  try {
    const body = await req.json();

    const { name, email, phone, message, skill } = body;

    // ✅ Basic validation (backend safety)
    if (!name || !email || !phone || !message || !skill) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400 }
      );
    }

    // ✅ Insert into DB
    const { data, error } = await supabase
      .from("user Form data") // 👈 your table name
      .insert([
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
          skill: skill.trim(),
        },
      ])
      .select(); // 👈 return inserted data

    if (error) {
      console.error("Supabase Error:", error);

      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    }

    // ✅ Success Response
    return new Response(
      JSON.stringify({
        success: true,
        message: "✅ Data saved successfully",
        data,
      }),
      { status: 200 }
    );

  } catch (err) {
    console.error("Server Error:", err);

    return new Response(
      JSON.stringify({ error: "❌ Server Error" }),
      { status: 500 }
    );
  }
}