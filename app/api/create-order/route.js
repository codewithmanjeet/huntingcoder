import Razorpay from "razorpay";

export async function POST() {
  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
  });

  const order = await razorpay.orders.create({
    amount: 100, // 🔥 1 rupee = 100 paisa
    currency: "INR",
  });

  return Response.json(order);
}