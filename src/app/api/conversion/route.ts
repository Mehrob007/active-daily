import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const xml = await request.text();
    const response = await fetch("http://10.64.1.55:8180/cxf/conversion/v1", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "",
      },
      body: xml,
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error("Error in conversion SOAP proxy:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
