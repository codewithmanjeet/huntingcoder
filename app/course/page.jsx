"use client";

export default function Blog() {
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
        {/* ✅ HTML COURSE (AVAILABLE) */}
        <BlogCard
          title="HTML (Available Course)"
          desc="Agar aapko HTML ke basic notes chahiye, to aap ek short amount pay karke HTML ke complete basic notes buy kar sakte ho. Ye beginners ke liye perfect hai."
          date="HTML Basics"
          buttonText="Buy Now 💰"
          available={true}
        />

        {/* ❌ CSS COURSE (COMING SOON) */}
        <BlogCard
          title="CSS (Coming Soon)"
          desc="CSS course abhi development me hai. Jaldi hi aapko advanced styling aur responsive design sikhne ko milega."
          date="CSS Styling"
          buttonText="Coming Soon ⏳"
          available={false}
        />

        {/* ❌ JS COURSE (COMING SOON) */}
        <BlogCard
          title="JavaScript (Coming Soon)"
          desc="JavaScript course bhi jaldi launch hone wala hai jisme aap real-world interactivity aur logic building seekhoge."
          date="JavaScript Power"
          buttonText="Coming Soon ⏳"
          available={false}
        />
      </div>
    </main>
  );
}

function BlogCard({ title, desc, date, buttonText, available }) {
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

      {/* Button */}
      <button
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