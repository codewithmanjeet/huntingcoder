import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {

  // ✅ 1. Get user (cookie/session)
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return new Response("Login required", { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");

  const { data: userData, error } = await supabase.auth.getUser(token);

  if (!userData?.user) {
    return new Response("Invalid user", { status: 401 });
  }

  const email = userData.user.email;

  // ✅ 2. Check payment
  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("user_email", email)
    .eq("course", "HTML")
    .single();

  if (!payment) {
    return new Response("Payment required", { status: 403 });
  }

  // ✅ 3. Private file path
  const filePath = path.join(
    process.cwd(),
    "private",
    "course.zip"
  );

  // ✅ 4. File read
  const fileBuffer = fs.readFileSync(filePath);

  return new Response(fileBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=course.zip",
    },
  });
}