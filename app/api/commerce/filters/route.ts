import { NextResponse } from "next/server";
import { getCommerceClient } from "@/lib/commerce-client";
import { queryFromSearchParams } from "@/lib/commerce-query";

export async function GET(request: Request) {
  try {
    const { category } = queryFromSearchParams(
      new URL(request.url).searchParams,
    );
    return NextResponse.json(await getCommerceClient().filters(category), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Filter options are unavailable" },
      { status: 503 },
    );
  }
}
