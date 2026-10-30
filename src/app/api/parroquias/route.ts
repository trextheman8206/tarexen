import { NextResponse, type NextRequest } from "next/server";
import { listParishes } from "@/lib/repo";

export async function GET(req: NextRequest) {
  const canton = req.nextUrl.searchParams.get("canton") ?? "";
  if (!/^\d{4}$/.test(canton)) return NextResponse.json({ error: "canton inválido" }, { status: 400 });
  try {
    const parishes = await listParishes(canton);
    return NextResponse.json(
      parishes.map((p) => ({ id: p.id, name: p.name, kind: p.kind })),
      { headers: { "Cache-Control": "public, max-age=3600" } },
    );
  } catch (err) {
    console.error("[parroquias]", err);
    return NextResponse.json({ error: "error interno" }, { status: 500 });
  }
}
