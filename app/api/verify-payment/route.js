import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import Razorpay from "razorpay";

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

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return Response.json({ success: false, error: "User not found" });
    }

    // ✅ Signature verify
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.razorpay_order_id + "|" + body.razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== body.razorpay_signature) {
      return Response.json({ success: false, error: "Invalid signature" });
    }

    // 🔥 EXTRA SECURITY: Verify payment from Razorpay server
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const payment = await razorpay.payments.fetch(
      body.razorpay_payment_id
    );

    // ✅ Amount check (VERY IMPORTANT)
    if (payment.amount !== 100) {
      return Response.json({ success: false, error: "Amount mismatch" });
    }

    // ❌ Duplicate payment check
    const { data: existing } = await supabase
      .from("purchases")
      .select("*")
      .eq("payment_id", body.razorpay_payment_id);

    if (existing.length > 0) {
      return Response.json({ success: false, error: "Already recorded" });
    }

    // ✅ Insert purchase
    const { error: insertError } = await supabase.from("purchases").insert({
      user_email: user.email,
      course: body.course,
      payment_id: body.razorpay_payment_id,
    });

    if (insertError) {
      return Response.json({ success: false, error: insertError.message });
    }

    return Response.json({ success: true });

  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}