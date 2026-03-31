import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ server only
);

export async function POST(req) {
  const body = await req.json();

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    course,
    email,
  } = body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest("hex");

  if (expectedSign === razorpay_signature) {

    // ✅ SAVE PAYMENT
    await supabase.from("payments").insert([
      {
        user_email: email,
        course: course,
        payment_id: razorpay_payment_id,
      },
    ]);

    return Response.json({ success: true });

  } else {
    return Response.json({ success: false });
  }
}