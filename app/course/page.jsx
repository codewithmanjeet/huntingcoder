"use client";

export default function Blog() {
  // ✅ Payment Function
  const handlePayment = async () => {
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
      });

      const data = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: data.amount,
        currency: "INR",
        order_id: data.id,

        handler: async function (response) {
          const verify = await fetch("/api/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...response,
              course: "HTML",
            }),
          });

          const result = await verify.json();

          if (result.success) {
            alert("Payment Successful ✅");
            window.location.href = "/download";
          } else {
            alert("Payment Failed ❌");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.log(err);
      alert("Something went wrong ❌");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        padding: "60px 40px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <h1
          style={{
            fontSize: "44px",
            fontWeight: "700",
            color: "#111827",
            marginBottom: "10px",
          }}
        >
          Web Development Courses
        </h1>
        <p style={{ fontSize: "16px", color: "#6b7280" }}>
          Start learning and upgrade your skills 🚀
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "30px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* ✅ HTML COURSE */}
        <BlogCard
          title="HTML (Available Course)"
          desc="Agar aapko HTML ke basic notes chahiye, to aap ek short amount pay karke HTML ke complete basic notes buy kar sakte ho."
          date="HTML Basics"
          buttonText="Buy Now 💰"
          available={true}
          onClick={handlePayment} // ✅ yaha connect kiya
        />

        {/* ❌ CSS */}
        <BlogCard
          title="CSS (Coming Soon)"
          desc="CSS course abhi development me hai."
          date="CSS Styling"
          buttonText="Coming Soon ⏳"
          available={false}
        />

        {/* ❌ JS */}
        <BlogCard
          title="JavaScript (Coming Soon)"
          desc="JavaScript course bhi jaldi launch hone wala hai."
          date="JavaScript Power"
          buttonText="Coming Soon ⏳"
          available={false}
        />
      </div>
    </main>
  );
}

// ✅ Blog Card Component
function BlogCard({ title, desc, date, buttonText, available, onClick }) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "28px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      className="card"
    >
      <p style={{ fontSize: "14px", color: "#6366f1", marginBottom: "8px" }}>
        {date}
      </p>

      <h2
        style={{
          fontSize: "22px",
          fontWeight: "600",
          color: "#111827",
          marginBottom: "12px",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          fontSize: "16px",
          color: "#4b5563",
          lineHeight: "1.7",
        }}
      >
        {desc}
      </p>

      {/* ✅ Button */}
      <button
        onClick={available ? onClick : null} // 👈 important
        disabled={!available}
        style={{
          marginTop: "auto",
          padding: "10px 18px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: available ? "#6366f1" : "#9ca3af",
          color: "#ffffff",
          fontSize: "14px",
          cursor: available ? "pointer" : "not-allowed",
          opacity: available ? 1 : 0.7,
        }}
      >
        {buttonText}
      </button>

      <style jsx>{`
        .card:hover {
          transform: translateY(-8px);
        }
      `}</style>
    </div>
  );
}