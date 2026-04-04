"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DownloadPage() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);

    // 🔥 GET TOKEN
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token;

    if (!token) {
      alert("Please login first");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`, // 🔥 IMPORTANT
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course: "html-course",
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        setLoading(false);
        return;
      }

      // 🔥 OPEN ALL IMAGES
      data.files.forEach((url: string) => {
        window.open(url, "_blank");
      });

    } catch (err) {
      console.error(err);
      alert("Download failed");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>Download Course</h1>

      <button
        onClick={handleDownload}
        style={{
          padding: "10px 20px",
          background: "black",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Downloading..." : "Download Course"}
      </button>
    </div>
  );
}