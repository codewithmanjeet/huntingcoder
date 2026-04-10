import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("BODY:", body);

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return Response.json({ success: false, error: "No token" });
    }

    const token = authHeader.split(" ")[1];

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return Response.json({ success: false, error: "User not found" });
    }

    // 🔥 IMPORTANT FIX (ENV NAME CHANGE)
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET) // ✅ FIXED
      .update(body.razorpay_order_id + "|" + body.razorpay_payment_id)
      .digest("hex");

    console.log("GENERATED:", generated_signature);
    console.log("RECEIVED:", body.razorpay_signature);

    if (generated_signature !== body.razorpay_signature) {
      return Response.json({
        success: false,
        error: "Signature mismatch ❌",
      });
    }

    const { error: insertError } = await supabase.from("purchases").insert({
      user_email: user.email,
      course: body.course,
      payment_id: body.razorpay_payment_id,
    });

    if (insertError) {
      return Response.json({
        success: false,
        error: insertError.message,
      });
    }

    return Response.json({ success: true });

  } catch (err) {
    console.log("VERIFY ERROR:", err);
    return Response.json({ success: false, error: err.message });
  }
}