import Razorpay from "razorpay";

export async function POST(req) {
  try {
    const { course } = await req.json();

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    // 🔥 Course based pricing (secure)
    const prices = {
      html: 100,
      css: 100,
      js: 100,
    };

    const amount = prices[course];

    if (!amount) {
      return Response.json({ error: "Invalid course" });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
    });

    return Response.json(order);

  } catch (err) {
    return Response.json({ error: err.message });
  }
}