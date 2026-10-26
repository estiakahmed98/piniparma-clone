import { NextResponse } from "next/server";
import { getCommerceClient } from "@/lib/commerce-client";
import { queryFromSearchParams } from "@/lib/commerce-query";
import { ZodError } from "zod";

export async function GET(request: Request) {
  try {
    const query = queryFromSearchParams(new URL(request.url).searchParams);
    const result = await getCommerceClient().listProducts(query);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof ZodError
            ? "Invalid catalogue filters"
            : "The catalogue service is unavailable",
      },
      {
        status: error instanceof ZodError ? 400 : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
