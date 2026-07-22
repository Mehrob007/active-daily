import { NextResponse } from "next/server";

const PROCESSING_SEARCH_URL = "http://10.64.20.84:5012/api/Transactions/search-transactions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const atmId = searchParams.get("atmId")?.trim();
    const fromDate = searchParams.get("fromDate")?.trim();
    const toDate = searchParams.get("toDate")?.trim();

    if (!atmId || !fromDate || !toDate) {
      return NextResponse.json({ error: "atmId, fromDate and toDate are required" }, { status: 400 });
    }

    const upstream = new URL(PROCESSING_SEARCH_URL);
    upstream.searchParams.set("atmId", atmId);
    upstream.searchParams.set("fromDate", fromDate);
    upstream.searchParams.set("toDate", toDate);

    const response = await fetch(upstream.toString(), {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    const payload = await response.json().catch(() => null);

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Processing service error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
