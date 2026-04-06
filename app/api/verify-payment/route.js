import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const body = await req.json();

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return Response.json({ success: false, error: "No token" });
    }

    const token = authHeader.split(" ")[1];

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // ✅ USER GET
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return Response.json({ success: false, error: "User not found" });
    }

    // ✅ SIGNATURE VERIFY
    const sign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(body.razorpay_order_id + "|" + body.razorpay_payment_id)
      .digest("hex");

    if (sign !== body.razorpay_signature) {
      return Response.json({ success: false, error: "Invalid signature" });
    }

    // ✅ INSERT
    const { error: insertError } = await supabase
      .from("purchases")
      .insert({
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