import { NextResponse } from "next/server";

const STATEMENT_URL = "http://10.64.1.10/services/stmnt.php";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const acc = searchParams.get("acc")?.trim();
    const dt1 = searchParams.get("dt1")?.trim();
    const dt2 = searchParams.get("dt2")?.trim();

    if (!acc || !dt1 || !dt2) {
      return NextResponse.json({ error: "acc, dt1 and dt2 are required" }, { status: 400 });
    }

    const upstream = new URL(STATEMENT_URL);
    upstream.searchParams.set("acc", acc);
    upstream.searchParams.set("dt1", dt1);
    upstream.searchParams.set("dt2", dt2);

    const response = await fetch(upstream.toString(), { cache: "no-store" });
    const text = await response.text();

    try {
      return NextResponse.json(JSON.parse(text), { status: response.status });
    } catch {
      return new NextResponse(text, {
        status: response.status,
        headers: { "Content-Type": response.headers.get("Content-Type") || "text/plain; charset=utf-8" },
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Statement service error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
