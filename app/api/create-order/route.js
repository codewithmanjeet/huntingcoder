import Razorpay from "razorpay";

export async function POST() {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  const order = await razorpay.orders.create({
    amount: 10 * 100,
    currency: "INR",
  });

  return Response.json(order);
}