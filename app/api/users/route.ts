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

    const insertPayload: {
      name: string;
      email: string;
      phone: string;
      city?: string;
      dietary_needs?: string;
    } = {
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone
    };

    if (cleanCity) insertPayload.city = cleanCity;
    if (cleanDietaryNeeds) insertPayload.dietary_needs = cleanDietaryNeeds;

    const { error } = await supabaseAdmin.from("users").insert(insertPayload);

    if (error) {
      // Map common unique index failure to a user-friendly response.
      if (error.code === "23505") {
        return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
      }
      // If optional columns were not migrated yet, still store required waitlist details.
      if (error.code === "42703") {
        const { error: fallbackError } = await supabaseAdmin.from("users").insert({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone
        });
        if (!fallbackError) return NextResponse.json({ ok: true });
        if (fallbackError.code === "23505") {
          return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
        }
      }
      return NextResponse.json({ error: "Database error." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
