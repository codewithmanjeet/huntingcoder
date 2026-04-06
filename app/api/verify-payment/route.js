import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const body = await req.json();

  const token = req.headers.get("authorization")?.split(" ")[1];

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
    .update(body.razorpay_order_id + "|" + body.razorpay_payment_id)
    .digest("hex");

  if (generated_signature !== body.razorpay_signature) {
    return Response.json({ success: false });
  }

  await supabase.from("purchases").insert({
    user_id: user.id,
    course: body.course,
    payment_id: body.razorpay_payment_id,
  });

  return Response.json({ success: true });
}