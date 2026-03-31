"use client";

export default function Download() {
  const downloadFile = () => {
    window.location.href = "/api/download";
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Payment Successful ✅</h1>
      <button onClick={downloadFile}>Download Course</button>
    </div>
  );
}