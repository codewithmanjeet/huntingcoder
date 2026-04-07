import crypto from "crypto";
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
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return Response.json({ success: false, error: "Invalid user" }, { status: 401 });
    }

    // 📦 BODY
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
      return Response.json({ success: false, error: "Invalid data" }, { status: 400 });
    }

    // 🔒 COURSE + PRICE VALIDATION
    const courses = {
      HTML: 100,
      // future:
      // CSS: 200,
      // JS: 300
    };

    const expectedAmount = courses[course];

    if (!expectedAmount) {
      return Response.json({ success: false, error: "Invalid course" }, { status: 400 });
    }

    // 🔐 SIGNATURE VERIFY
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return Response.json({
        success: false,
        error: "Signature mismatch ❌",
      });
    }

    // 🚫 DUPLICATE PAYMENT CHECK
    const { data: existingPayment } = await supabase
      .from("purchases")
      .select("id")
      .eq("payment_id", razorpay_payment_id);

    if (existingPayment && existingPayment.length > 0) {
      return Response.json({ success: true, message: "Already processed" });
    }

    // 🚫 ALREADY PURCHASED CHECK
    const { data: alreadyBought } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("course", course);

    if (alreadyBought && alreadyBought.length > 0) {
      return Response.json({
        success: true,
        message: "Course already purchased",
      });
    }

    // 💾 SAVE (USE user_id 🔥)
    const { error: insertError } = await supabase
      .from("purchases")
      .insert({
        user_id: user.id,
        course: course,
        payment_id: razorpay_payment_id,
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
    return Response.json({ success: false, error: "Server error" });
  }
}