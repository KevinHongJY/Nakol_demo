import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { name, email, phone, city, dietaryNeeds } = await request.json();

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      (city !== undefined && typeof city !== "string") ||
      (dietaryNeeds !== undefined && typeof dietaryNeeds !== "string")
    ) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanCity = typeof city === "string" ? city.trim() : "";
    const cleanDietaryNeeds = typeof dietaryNeeds === "string" ? dietaryNeeds.trim() : "";

    if (!cleanName || !cleanEmail || !cleanPhone || !cleanCity || !emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: "Enter valid details in all fields." }, { status: 400 });
    }

    const insertAttempts: Array<Record<string, string>> = [
      {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        city: cleanCity,
        dietary_needs: cleanDietaryNeeds
      },
      {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        city: cleanCity
      },
      {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone
      },
      {
        name: cleanName,
        email: cleanEmail
      }
    ];

    let lastErrorCode: string | undefined;
    for (const payload of insertAttempts) {
      const { error } = await supabaseAdmin.from("users").insert(payload);
      if (!error) return NextResponse.json({ ok: true });

      if (error.code === "23505") {
        return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
      }

      if (error.code === "42501") {
        return NextResponse.json(
          { error: "Permission error. Check SUPABASE_SERVICE_ROLE_KEY in Vercel Production." },
          { status: 500 }
        );
      }

      lastErrorCode = error.code;
      if (error.code !== "42703") break;
    }

    if (lastErrorCode === "42703") {
      return NextResponse.json(
        { error: "Database schema is outdated. Re-run latest supabase/schema.sql." },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: "Database error." }, { status: 500 });
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
