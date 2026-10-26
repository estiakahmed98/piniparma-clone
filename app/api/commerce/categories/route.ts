import { NextResponse } from "next/server";
import { getCategories } from "@/lib/commerce-client";

export async function GET() {
  try {
    return NextResponse.json(await getCategories(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Categories are unavailable" },
      { status: 503 },
    );
  }
}
