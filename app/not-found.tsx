
import Image from "next/image";

export default function NotFound() {
  return (
    <div style={container}>
      <Image
        src="/pagenotfound.jpeg"
        alt="Page Not Found"
        fill
        style={{ objectFit: "cover" }} // 👈 full screen cover
        priority
      />
    </div>
  );
}

const container: React.CSSProperties = {
  width: "100vw",
  height: "100vh",
  position: "relative", // 👈 IMPORTANT (Image fill ke liye)
  margin: 0,
  padding: 0,
  overflow: "hidden",
};