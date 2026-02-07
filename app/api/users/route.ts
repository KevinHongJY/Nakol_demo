import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { name, email, phone } = await request.json();

    if (typeof name !== "string" || typeof email !== "string" || typeof phone !== "string") {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanEmail || !cleanPhone || !emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: "Enter valid details in all fields." }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("users").insert({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone
    });

    if (error) {
      // Map common unique index failure to a user-friendly response.
      if (error.code === "23505") {
        return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
      }
      return NextResponse.json({ error: "Database error." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
