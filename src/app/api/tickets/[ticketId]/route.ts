import { NextRequest, NextResponse } from "next/server";
import { getDataProvider } from "@/lib/data-provider";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  try {
    const provider = getDataProvider();
    const ticket = await provider.getTicket(params.ticketId);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    return NextResponse.json(ticket);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
