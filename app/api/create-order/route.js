import Razorpay from "razorpay";
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
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return Response.json({ error: "Invalid user" }, { status: 401 });
    }

    // 📦 BODY DATA
    const { course } = await req.json();

    // 🔒 COURSE + PRICE CONTROL (SERVER SIDE)
    const courses = {
      HTML: 100, // ₹1 = 100 paise
      // future:
      // CSS: 200,
      // JS: 300
    };

    const amount = courses[course];

    if (!amount) {
      return Response.json({ error: "Invalid course" }, { status: 400 });
    }

    // 🔥 RAZORPAY INIT (SECRET SAFE)
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID, // ❗ NOT NEXT_PUBLIC
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // 🧾 CREATE ORDER
    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: `receipt_${user.id}_${Date.now()}`, // 🔥 tracking
    });

    return Response.json(order);

  } catch (err) {
    console.log(err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}