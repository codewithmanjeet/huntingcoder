import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const body = await req.json();

    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return Response.json({ success: false, error: "No token" });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // ✅ GET USER
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return Response.json({ success: false, error: "User not found" });
    }

    // ✅ SIGNATURE VERIFY
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(body.razorpay_order_id + "|" + body.razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== body.razorpay_signature) {
      return Response.json({ success: false, error: "Invalid signature" });
    }

    // ✅ INSERT (UPDATED ACCORDING TO YOUR TABLE)
    const { error: insertError } = await supabase.from("purchases").insert({
      user_email: user.email, // 🔥 IMPORTANT CHANGE
      course: body.course,
      payment_id: body.razorpay_payment_id,
    });

    if (insertError) {
      return Response.json({ success: false, error: insertError.message });
    }

    return Response.json({ success: true });

  } catch (err) {
    console.log(err);
    return Response.json({ success: false, error: err.message });
  }
}