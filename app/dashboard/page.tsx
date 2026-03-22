"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const fetchForms = async () => {
    const { data, error } = await supabase
      .from("user Form data")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setForms([]);
    } else {
      setForms(data || []);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      setUser(session.user);
      await fetchForms();
      setLoading(false);
    };

    init();

    const channel = supabase
      .channel("public:user Form data")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user Form data" },
        () => fetchForms()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "18px",
        color: "#111",
        fontWeight: "600"
      }}>
        Loading Dashboard...
      </div>
    );
  }

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "#f9fafb",
      padding: "32px 16px",
      fontFamily: "system-ui",
      color: "#111" // 🔥 global dark text
    }}>
      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{
          padding: "28px 32px",
          background: "linear-gradient(135deg, #111 0%, #333 100%)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "800",
            margin: 0,
            letterSpacing: "0.5px"
          }}>
            HuntingCoder Dashboard
          </h1>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            style={{
              padding: "10px 24px",
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "32px" }}>
          <p style={{
            fontSize: "16px",
            marginBottom: "20px",
            fontWeight: "500"
          }}>
            Logged in as: <strong>{user?.email}</strong>
          </p>

          {/* Stats */}
          <div style={{
            backgroundColor: "#111",
            color: "white",
            borderRadius: "12px",
            padding: "18px",
            marginBottom: "30px",
            fontWeight: "700",
            fontSize: "18px"
          }}>
            Total Submissions: {forms.length}
          </div>

          {forms.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: "0 10px",
                fontSize: "15px",
              }}>
                <thead>
                  <tr>
                    {["Name", "Email", "Phone", "Skill", "Message", "Date"].map((header) => (
                      <th
                        key={header}
                        style={{
                          textAlign: "left",
                          padding: "14px",
                          backgroundColor: "#111",
                          color: "#fff",
                          fontWeight: "700",
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {forms.map((f) => (
                    <tr
                      key={f.id}
                      style={{
                        backgroundColor: "#fff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontWeight: "500"
                      }}
                    >
                      <td style={{ padding: "14px", fontWeight: "600" }}>{f.name}</td>
                      <td style={{ padding: "14px" }}>{f.email}</td>
                      <td style={{ padding: "14px" }}>{f.phone}</td>

                      <td style={{ padding: "14px" }}>
                        <span style={{
                          padding: "6px 12px",
                          backgroundColor: "#000",
                          color: "#fff",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: "600"
                        }}>
                          {f.skill}
                        </span>
                      </td>

                      <td style={{ padding: "14px" }}>{f.message}</td>

                      <td style={{ padding: "14px", color: "#333" }}>
                        {new Date(f.created_at).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              textAlign: "center",
              padding: "50px",
              fontWeight: "600",
              color: "#444"
            }}>
              Abhi koi submission nahi hai...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}