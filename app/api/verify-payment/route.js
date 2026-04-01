import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return Response.json({ error: "Invalid user" }, { status: 401 });
    }

    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      course,
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !course
    ) {
      return Response.json({ error: "Invalid data" }, { status: 400 });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return Response.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // 🔒 duplicate payment check
    const { data: existing, error: existingError } = await supabase
      .from("payments")
      .select("id")
      .eq("payment_id", razorpay_payment_id);

    if (existingError) {
      return Response.json({ error: "DB error" }, { status: 500 });
    }

    if (existing && existing.length > 0) {
      return Response.json({ success: true, message: "Already saved" });
    }

    // 🔥 already purchased check
    const { data: alreadyBought, error: alreadyError } = await supabase
      .from("payments")
      .select("id")
      .eq("user_email", user.email)
      .eq("course", course);

    if (alreadyError) {
      return Response.json({ error: "DB error" }, { status: 500 });
    }

    if (alreadyBought && alreadyBought.length > 0) {
      return Response.json({
        success: true,
        message: "Course already purchased",
      });
    }

    // 💾 save
    const { error: insertError } = await supabase.from("payments").insert([
      {
        user_email: user.email,
        course,
        payment_id: razorpay_payment_id,
      },
    ]);

    if (insertError) {
      return Response.json({ error: "Save failed" }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: "Payment verified & saved",
    });

  } catch (err) {
    console.error(err); // 🔥 DEBUG
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}